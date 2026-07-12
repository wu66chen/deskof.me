import { useState, useCallback } from 'react';
import { loadDesktopItems, saveDesktopItems } from '../config/desktopItems';

/**
 * 桌面数据 CRUD
 * 读取时合并 localStorage + 默认数据
 * 修改时保存到 localStorage
 */
export function useDesktopData() {
  const [items, setItems] = useState(() => loadDesktopItems());
  const [selectedId, setSelectedId] = useState(null);

  const persist = useCallback((newItems) => {
    setItems(newItems);
    saveDesktopItems(newItems);
  }, []);

  // 添加新项目
  const addItem = useCallback((newItem) => {
    setItems(prev => {
      const updated = [...prev, {
        ...newItem,
        id: `${newItem.type}-${Date.now()}`,
        position: newItem.position || { x: 40, y: 40 },
        icon: newItem.icon || null,
      }];
      saveDesktopItems(updated);
      return updated;
    });
  }, []);

  // 删除项目
  const removeItem = useCallback((id) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveDesktopItems(updated);
      return updated;
    });
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  // 重命名
  const renameItem = useCallback((id, newName) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, name: newName } : item
      );
      saveDesktopItems(updated);
      return updated;
    });
  }, []);

  // 移动位置
  const moveItem = useCallback((id, x, y) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, position: { x, y } } : item
      );
      saveDesktopItems(updated);
      return updated;
    });
  }, []);

  // 更新图标
  const updateIcon = useCallback((id, iconUrl) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, icon: iconUrl || null } : item
      );
      saveDesktopItems(updated);
      return updated;
    });
  }, []);

  // 更新项目内容（Markdown、URL 等）
  const updateItemContent = useCallback((id, updates) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      saveDesktopItems(updated);
      return updated;
    });
  }, []);

  // 递归查找项目
  const findItem = useCallback((id, list = null) => {
    const searchList = list || items;
    for (const item of searchList) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(id, item.children);
        if (found) return found;
      }
    }
    return null;
  }, [items]);

  // 在文件夹中添加子项目
  const addChildItem = useCallback((folderId, childItem) => {
    setItems(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const addToFolder = (list) => {
        for (const item of list) {
          if (item.id === folderId) {
            if (!item.children) item.children = [];
            item.children.push({
              ...childItem,
              id: `${childItem.type}-${Date.now()}`,
              position: { x: 0, y: 0 },
            });
            return true;
          }
          if (item.children && addToFolder(item.children)) return true;
        }
        return false;
      };
      addToFolder(updated);
      saveDesktopItems(updated);
      return updated;
    });
  }, []);

  return {
    items,
    selectedId,
    setSelectedId,
    addItem,
    removeItem,
    renameItem,
    moveItem,
    updateIcon,
    updateItemContent,
    findItem,
    addChildItem,
  };
}
