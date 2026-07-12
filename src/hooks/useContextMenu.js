import { useState, useCallback, useEffect, useRef } from 'react';

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState(null);
  const menuRef = useRef(null);
  menuRef.current = contextMenu;

  const showContextMenu = useCallback((e, type, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, itemId: item?.id, item });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // 点击/右键其他地方关闭菜单（但不阻止新菜单打开）
  useEffect(() => {
    if (!contextMenu) return;
    
    const onClick = (e) => {
      // 如果点击的是右键菜单内部，不关闭
      if (e.target.closest('.context-menu')) return;
      hideContextMenu();
    };
    
    // 延迟添加监听，避免当前事件触发关闭
    const timer = setTimeout(() => {
      document.addEventListener('click', onClick, true);
      document.addEventListener('contextmenu', onClick, true);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('contextmenu', onClick, true);
    };
  }, [contextMenu, hideContextMenu]);

  return { contextMenu, showContextMenu, hideContextMenu };
}
