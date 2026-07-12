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
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const session = localStorage.getItem(SESSION_KEY);
    setIsInitialized(true);

    if (!stored) {
      // 无管理员密码 → 需要首次设置
      setNeedsSetup(true);
    } else if (session === 'admin') {
      // 记住的登录会话 → 直接管理员
      setIsAdmin(true);
    } else {
      // 有管理员但无会话 → 访客模式（不弹登录窗）
      // needsLogin 保持 false，用户通过 Start 菜单手动登录
    }
  }, []);

  const setupAdmin = useCallback(async (password) => {
    if (password.length < 4) return { success: false, error: '密码至少4位' };
    const hash = await hashPassword(password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash, createdAt: Date.now() }));
    localStorage.setItem(SESSION_KEY, 'admin');
    setIsAdmin(true);
    setNeedsSetup(false);
    return { success: true };
  }, []);

  const login = useCallback(async (password) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { success: false, error: '未设置管理员密码' };
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

  // 显示登录窗口（从 Start 菜单触发）
  const showLogin = useCallback(() => {
    setNeedsLogin(true);
  }, []);

  const hideLogin = useCallback(() => {
    setNeedsLogin(false);
  }, []);

  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setEditMode(prev => !prev);
  }, [isAdmin]);

  return { isAdmin, isInitialized, needsSetup, needsLogin, editMode,
    setupAdmin, login, logout, showLogin, hideLogin, toggleEditMode };
}
