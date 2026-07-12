import { useState, useCallback } from 'react';
import './AuthScreens.css';

export function SetupScreen({ onSetup, onCancel }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault(); setError('');
    if (password.length < 4) { setError('密码至少需要4个字符'); return; }
    if (password !== confirm) { setError('两次输入的密码不一致'); return; }
    setLoading(true);
    const result = await onSetup(password);
    setLoading(false);
    if (!result.success) setError(result.error);
  }, [password, confirm, onSetup]);

  return (
    <div className="auth-overlay"><div className="auth-card win98-window">
      <div className="auth-header">
        <span className="auth-icon">🖥️</span><h1>deskof.me</h1><p>首次设置管理员密码</p>
      </div>
      <div className="auth-body">
        <p className="auth-desc">设置密码后，你将成为<strong>唯一管理员</strong>。<br/>其他浏览器的访客可直接浏览桌面。</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-field"><label>设置密码</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="至少4位" className="win98-input" autoFocus /></div>
          <div className="auth-field"><label>确认密码</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="再次输入" className="win98-input" /></div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading}>{loading?'设置中...':'🔐 设为管理员'}</button>
        </form>
        <div className="auth-separator"><span>或者</span></div>
        <button className="auth-btn auth-btn-secondary" onClick={onCancel}>👀 以访客身份浏览</button>
      </div>
    </div></div>
  );
}

export function LoginScreen({ onLogin, onCancel, onSetup, adminExists }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const result = await onLogin(password);
    setLoading(false);
    if (!result.success) setError(result.error);
  }, [password, onLogin]);

  return (
    <div className="auth-overlay"><div className="auth-card win98-window">
      <div className="auth-header">
        <span className="auth-icon">🔑</span><h1>deskof.me</h1><p>管理员登录</p>
      </div>
      <div className="auth-body">
        <form onSubmit={handleSubmit}>
          <div className="auth-field"><label>管理员密码</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="输入密码" className="win98-input" autoFocus /></div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading}>{loading?'验证中...':'🔓 登录'}</button>
        </form>
        <div className="auth-separator"><span>或者</span></div>
        <button className="auth-btn auth-btn-secondary" onClick={onCancel}>👀 返回桌面（访客模式）</button>
        {!adminExists && onSetup && (
          <button className="auth-btn" style={{marginTop:8, background:'#FFE0E0'}} onClick={onSetup}>🆕 首次设置管理员密码</button>
        )}
      </div>
    </div></div>
  );
}
