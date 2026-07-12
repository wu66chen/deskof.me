import { useState, useCallback, useEffect } from 'react';

/**
 * 管理员认证系统
 * - 首次访问：设置密码即成为管理员
 * - 后续访问：输入密码登录
 * - 密码 SHA-256 哈希存储
 */
const STORAGE_KEY = 'deskofme_auth';
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

  // 初始化：检查是否有已存储的管理员密码
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsInitialized(true);
    if (!stored) {
      setNeedsSetup(true); // 首次访问，需要设置密码
    } else {
      setNeedsLogin(true); // 已有管理员，需要登录
    }
  }, []);

  // 首次设置管理员密码
  const setupAdmin = useCallback(async (password) => {
    if (password.length < 4) return { success: false, error: '密码至少4位' };
    const hash = await hashPassword(password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash, createdAt: Date.now() }));
    setIsAdmin(true);
    setNeedsSetup(false);
    setNeedsLogin(false);
    return { success: true };
  }, []);

  // 登录
  const login = useCallback(async (password) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { success: false, error: '未设置管理员密码' };
    try {
      const { hash } = JSON.parse(stored);
      const inputHash = await hashPassword(password);
      if (inputHash === hash) {
        setIsAdmin(true);
        setNeedsLogin(false);
        return { success: true };
      }
      return { success: false, error: '密码错误' };
    } catch (e) {
      return { success: false, error: '数据损坏，请清除浏览器数据后重试' };
    }
  }, []);

  // 退出登录（回到访客模式）
  const logout = useCallback(() => {
    setIsAdmin(false);
    setNeedsLogin(true);
  }, []);

  // 切换编辑模式（管理员专属）
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setEditMode(prev => !prev);
  }, [isAdmin]);

  return {
    isAdmin,
    isInitialized,
    needsSetup,
    needsLogin,
    editMode,
    setupAdmin,
    login,
    logout,
    toggleEditMode,
  };
}
