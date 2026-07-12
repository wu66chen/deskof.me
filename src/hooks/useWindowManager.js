import { useState, useCallback } from 'react';

/**
 * 窗口管理器
 * 管理打开窗口的列表、z-index 层级、最小化状态
 */
const MAX_WINDOWS = 8;

export function useWindowManager() {
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(100);

  // 打开窗口
  const openWindow = useCallback((item, parentId = null) => {
    setWindows(prev => {
      // 如果已打开，聚焦
      const existing = prev.find(w => w.item.id === item.id);
      if (existing) {
        return prev.map(w => ({
          ...w,
          zIndex: w.item.id === item.id ? nextZIndex + 1 : w.zIndex,
          minimized: w.item.id === item.id ? false : w.minimized,
        }));
      }
      // 限制最大窗口数
      if (prev.length >= MAX_WINDOWS) {
        return [...prev.slice(1), {
          id: `${item.id}-${Date.now()}`,
          item,
          parentId,
          zIndex: nextZIndex + 1,
          minimized: false,
          position: { x: 100 + Math.random() * 100, y: 60 + Math.random() * 80 },
        }];
      }
      return [...prev, {
        id: `${item.id}-${Date.now()}`,
        item,
        parentId,
        zIndex: nextZIndex + 1,
        minimized: false,
        position: { x: 100 + Math.random() * 100, y: 60 + Math.random() * 80 },
      }];
    });
    setNextZIndex(z => z + 2);
  }, [nextZIndex]);

  // 关闭窗口
  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  // 聚焦窗口（提升 z-index）
  const focusWindow = useCallback((windowId) => {
    setNextZIndex(z => z + 1);
    setWindows(prev => prev.map(w => ({
      ...w,
      zIndex: w.id === windowId ? nextZIndex + 1 : w.zIndex,
    })));
  }, [nextZIndex]);

  // 最小化/还原
  const toggleMinimize = useCallback((windowId) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      minimized: w.id === windowId ? !w.minimized : w.minimized,
    })));
  }, []);

  // 更新窗口位置
  const moveWindow = useCallback((windowId, x, y) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      position: w.id === windowId ? { x, y } : w.position,
    })));
  }, []);

  // 从任务栏还原
  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      minimized: w.id === windowId ? false : w.minimized,
    })));
    focusWindow(windowId);
  }, [focusWindow]);

  return {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    toggleMinimize,
    moveWindow,
    restoreWindow,
  };
}
