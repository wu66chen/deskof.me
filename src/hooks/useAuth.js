import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'deskofme_auth';
const SESSION_KEY = 'deskofme_session';
const SALT = 'deskofme_salt_2026';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false); // 主动触发
  const [needsLogin, setNeedsLogin] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const session = localStorage.getItem(SESSION_KEY);
    setAdminExists(!!stored);
    setIsInitialized(true);

    if (session === 'admin') {
      // 记住的登录 → 直接管理员
      setIsAdmin(true);
    }
    // 无论是否有密码存储，都不弹窗。访客直接看桌面
  }, []);

  const setupAdmin = useCallback(async (password) => {
    if (password.length < 4) return { success: false, error: '密码至少4位' };
    const hash = await hashPassword(password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash, createdAt: Date.now() }));
    localStorage.setItem(SESSION_KEY, 'admin');
    setAdminExists(true);
    setIsAdmin(true);
    setNeedsSetup(false);
    return { success: true };
  }, []);

  const login = useCallback(async (password) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { success: false, error: '未设置管理员密码，请先注册' };
    try {
      const { hash } = JSON.parse(stored);
      const inputHash = await hashPassword(password);
      if (inputHash === hash) {
        localStorage.setItem(SESSION_KEY, 'admin');
        setIsAdmin(true);
        setNeedsLogin(false);
        return { success: true };
      }
      return { success: false, error: '密码错误' };
    } catch (e) {
      return { success: false, error: '数据损坏' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  }, []);

  const showLogin = useCallback(() => setNeedsLogin(true), []);
  const hideLogin = useCallback(() => setNeedsLogin(false), []);
  const showSetup = useCallback(() => setNeedsSetup(true), []);
  const hideSetup = useCallback(() => setNeedsSetup(false), []);

  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setEditMode(prev => !prev);
  }, [isAdmin]);

  return {
    isAdmin, isInitialized, needsSetup, needsLogin, adminExists,
    editMode, setupAdmin, login, logout,
    showLogin, hideLogin, showSetup, hideSetup, toggleEditMode,
  };
}
