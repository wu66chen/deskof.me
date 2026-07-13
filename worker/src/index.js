const PASSWORD_ITERATIONS = 120_000;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const RATE_WINDOW_SECONDS = 60 * 15;
const RATE_LIMIT = 12;
const encoder = new TextEncoder();
let schemaPromise;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (origin && !cors) return json({ error: '不允许的来源' }, 403);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!env.DB || !env.AUTH_SECRET) {
      return json({ error: '认证服务尚未完成配置' }, 503, cors);
    }

    try {
      await ensureSchema(env.DB);
      const url = new URL(request.url);

      if (request.method === 'GET' && url.pathname === '/health') {
        return json({ ok: true }, 200, cors);
      }
      if (request.method === 'GET' && url.pathname === '/api/admin/status') {
        return status(env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/register') {
        return register(request, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/admin/login') {
        return login(request, env, cors);
      }
      if (request.method === 'GET' && url.pathname === '/api/admin/session') {
        return session(request, env, cors);
      }

      return json({ error: '接口不存在' }, 404, cors);
    } catch (error) {
      console.error('Authentication service error', error);
      return json({ error: '认证服务暂时不可用，请稍后重试' }, 503, cors);
    }
  },
};

function ensureSchema(db) {
  if (!schemaPromise) {
    schemaPromise = db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS admin_identity (
        singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        password_iterations INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS login_attempts (
        rate_key TEXT PRIMARY KEY,
        window_started_at INTEGER NOT NULL,
        attempt_count INTEGER NOT NULL
      )`),
    ]).catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}

async function status(env, cors) {
  const record = await env.DB.prepare(
    'SELECT created_at FROM admin_identity WHERE singleton_id = 1',
  ).first();
  return json({ adminExists: Boolean(record) }, 200, cors);
}

async function register(request, env, cors) {
  const body = await readJson(request);
  const passwordError = validatePassword(body?.password);
  if (passwordError) return json({ error: passwordError }, 400, cors);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(body.password, salt, PASSWORD_ITERATIONS);
  const result = await env.DB.prepare(`
    INSERT INTO admin_identity (
      singleton_id, password_hash, password_salt, password_iterations, created_at
    ) VALUES (1, ?1, ?2, ?3, ?4)
    ON CONFLICT(singleton_id) DO NOTHING
  `).bind(
    toBase64Url(hash),
    toBase64Url(salt),
    PASSWORD_ITERATIONS,
    Date.now(),
  ).run();

  if (result.meta.changes !== 1) {
    return json({
      error: '管理员已存在。本站只允许第一个管理员账号，不能再次创建。',
      code: 'ADMIN_ALREADY_EXISTS',
    }, 409, cors);
  }

  const token = await createSessionToken(env.AUTH_SECRET);
  return json({ ok: true, token, adminExists: true }, 201, cors);
}

async function login(request, env, cors) {
  const body = await readJson(request);
  if (typeof body?.password !== 'string') {
    return json({ error: '请输入管理员密码' }, 400, cors);
  }

  const rateKey = await getRateKey(request, env.AUTH_SECRET);
  if (await isRateLimited(env.DB, rateKey)) {
    return json({ error: '尝试次数过多，请 15 分钟后再试' }, 429, cors);
  }

  const record = await env.DB.prepare(`
    SELECT password_hash, password_salt, password_iterations
    FROM admin_identity WHERE singleton_id = 1
  `).first();

  if (!record) {
    return json({ error: '管理员尚未创建', code: 'ADMIN_NOT_FOUND' }, 404, cors);
  }

  const actual = await derivePasswordHash(
    body.password,
    fromBase64Url(record.password_salt),
    record.password_iterations,
  );
  const expected = fromBase64Url(record.password_hash);

  if (!constantTimeEqual(actual, expected)) {
    await recordFailedAttempt(env.DB, rateKey);
    return json({ error: '密码不正确' }, 401, cors);
  }

  await env.DB.prepare('DELETE FROM login_attempts WHERE rate_key = ?1').bind(rateKey).run();
  const token = await createSessionToken(env.AUTH_SECRET);
  return json({ ok: true, token }, 200, cors);
}

async function session(request, env, cors) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const valid = token && await verifySessionToken(token, env.AUTH_SECRET);
  if (!valid) return json({ authenticated: false }, 401, cors);

  const record = await env.DB.prepare(
    'SELECT singleton_id FROM admin_identity WHERE singleton_id = 1',
  ).first();
  if (!record) return json({ authenticated: false }, 401, cors);
  return json({ authenticated: true }, 200, cors);
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 2048) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validatePassword(password) {
  if (typeof password !== 'string') return '请输入管理员密码';
  if (password.length < 8) return '密码至少需要 8 个字符';
  if (password.length > 128) return '密码不能超过 128 个字符';
  return '';
}

async function derivePasswordHash(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256,
  );
  return new Uint8Array(bits);
}

async function createSessionToken(secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    role: 'admin', issuedAt: now, expiresAt: now + SESSION_TTL_SECONDS, version: 1,
  })));
  const signature = await sign(payload, secret);
  return `${payload}.${toBase64Url(signature)}`;
}

async function verifySessionToken(token, secret) {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const expected = await sign(payload, secret);
  if (!constantTimeEqual(fromBase64Url(signature), expected)) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    const now = Math.floor(Date.now() / 1000);
    return data.role === 'admin' && data.version === 1 && data.expiresAt > now;
  } catch {
    return false;
  }
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

async function getRateKey(request, secret) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'local';
  return toBase64Url(await sign(`login:${ip.split(',')[0].trim()}`, secret));
}

async function isRateLimited(db, rateKey) {
  const now = Math.floor(Date.now() / 1000);
  const result = await db.prepare(
    'SELECT window_started_at, attempt_count FROM login_attempts WHERE rate_key = ?1',
  ).bind(rateKey).first();
  return Boolean(result && now - result.window_started_at < RATE_WINDOW_SECONDS && result.attempt_count >= RATE_LIMIT);
}

async function recordFailedAttempt(db, rateKey) {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    INSERT INTO login_attempts (rate_key, window_started_at, attempt_count)
    VALUES (?1, ?2, 1)
    ON CONFLICT(rate_key) DO UPDATE SET
      window_started_at = CASE
        WHEN ?2 - window_started_at >= ?3 THEN ?2 ELSE window_started_at END,
      attempt_count = CASE
        WHEN ?2 - window_started_at >= ?3 THEN 1 ELSE attempt_count + 1 END
  `).bind(rateKey, now, RATE_WINDOW_SECONDS).run();
}

function constantTimeEqual(left, right) {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array)) return false;
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index % left.length] || 0) ^ (right[index % right.length] || 0);
  }
  return difference === 0;
}

function toBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function corsHeaders(origin, configuredOrigins = '') {
  if (!origin) return {};
  const allowed = configuredOrigins.split(',').map((value) => value.trim()).filter(Boolean);
  if (!allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}
