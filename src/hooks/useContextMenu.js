import { useState, useCallback, useEffect, useRef } from 'react';

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState(null);
  const closingRef = useRef(false);

  const showContextMenu = useCallback((e, type, item) => {
    e.preventDefault();
    e.stopPropagation();
    // 标记：正在打开新菜单，阻止文档级 handler 关闭
    closingRef.current = true;
    setContextMenu({ x: e.clientX, y: e.clientY, type, itemId: item?.id, item });
    setTimeout(() => { closingRef.current = false; }, 100);
  }, []);

  const hideContextMenu = useCallback(() => {
    if (closingRef.current) return;
    setContextMenu(null);
  }, []);

  // 点击其他地方关闭
  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e) => {
      if (closingRef.current) return;
      if (e.target.closest('.context-menu')) return;
      setContextMenu(null);
    };
    // 用 setTimeout 避免当前事件触发
    const t = setTimeout(() => {
      document.addEventListener('click', handler);
      document.addEventListener('contextmenu', handler);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', handler);
      document.removeEventListener('contextmenu', handler);
    };
  }, [contextMenu]);

  return { contextMenu, showContextMenu, hideContextMenu };
}
