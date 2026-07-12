import { useState, useCallback, useEffect } from 'react';

/**
 * 右键菜单状态管理
 */
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState(null);
  // { x, y, type: 'desktop' | 'icon', itemId?, item? }

  const showContextMenu = useCallback((e, type, item) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      itemId: item?.id,
      item,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // 点击其他地方关闭菜单
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => hideContextMenu();
    document.addEventListener('click', handler);
    // 右键菜单打开时也监听
    document.addEventListener('contextmenu', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('contextmenu', handler);
    };
  }, [contextMenu, hideContextMenu]);

  return { contextMenu, showContextMenu, hideContextMenu };
}
