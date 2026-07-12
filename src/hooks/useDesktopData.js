import { useState, useCallback } from 'react';
import { loadDesktopItems, saveDesktopItems } from '../config/desktopItems';
import { loadSiteConfig, saveSiteConfig } from '../config/siteConfig';

export function useDesktopData() {
  const [items, setItems] = useState(() => loadDesktopItems());
  const [selectedId, setSelectedId] = useState(null);

  const addItem = useCallback((newItem) => {
    setItems(prev => {
      const updated = [...prev, { ...newItem, id: `${newItem.type}-${Date.now()}`, position: newItem.position || {x:40,y:40}, icon: newItem.icon || null }];
      saveDesktopItems(updated); return updated;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => { const updated = prev.filter(item => item.id !== id); saveDesktopItems(updated); return updated; });
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const renameItem = useCallback((id, newName) => {
    setItems(prev => { const updated = prev.map(item => item.id===id ? {...item, name:newName} : item); saveDesktopItems(updated); return updated; });
  }, []);

  const moveItem = useCallback((id, x, y) => {
    setItems(prev => { const updated = prev.map(item => item.id===id ? {...item, position:{x,y}} : item); saveDesktopItems(updated); return updated; });
  }, []);

  const updateIcon = useCallback((id, iconUrl) => {
    setItems(prev => { const updated = prev.map(item => item.id===id ? {...item, icon:iconUrl||null} : item); saveDesktopItems(updated); return updated; });
  }, []);

  const updateItemContent = useCallback((id, updates) => {
    // 递归在树中查找并更新
    const updateRecursive = (list) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) { list[i] = { ...list[i], ...updates }; return true; }
        if (list[i].children && updateRecursive(list[i].children)) return true;
      }
      return false;
    };
    setItems(prev => { const copy = JSON.parse(JSON.stringify(prev)); updateRecursive(copy); saveDesktopItems(copy); return copy; });
  }, []);

  // 把文件从一个文件夹移到桌面
  const moveItemOutOfFolder = useCallback((childId, folderId, targetX, targetY) => {
    setItems(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const removeFromFolder = (list) => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === folderId && list[i].children) {
            const idx = list[i].children.findIndex(c => c.id === childId);
            if (idx >= 0) {
              const [moved] = list[i].children.splice(idx, 1);
              moved.position = { x: Math.max(0, targetX), y: Math.max(0, targetY) };
              copy.push(moved);
              return true;
            }
          }
          if (list[i].children && removeFromFolder(list[i].children)) return true;
        }
        return false;
      };
      removeFromFolder(copy);
      saveDesktopItems(copy); return copy;
    });
  }, []);

  // 把桌面文件移入文件夹
  const moveItemIntoFolder = useCallback((itemId, folderId) => {
    setItems(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const idx = copy.findIndex(item => item.id === itemId);
      if (idx < 0) return prev;
      const [moved] = copy.splice(idx, 1);
      moved.position = { x: 0, y: 0 };
      const addToFolder = (list) => {
        for (const item of list) {
          if (item.id === folderId) { if (!item.children) item.children = []; item.children.push(moved); return true; }
          if (item.children && addToFolder(item.children)) return true;
        }
        return false;
      };
      addToFolder(copy);
      saveDesktopItems(copy); return copy;
    });
  }, []);

  // 在文件夹内移动子项
  const moveChildInFolder = useCallback((childId, folderId, newX, newY) => {
    setItems(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const update = (list) => {
        for (const item of list) {
          if (item.id === folderId && item.children) {
            const child = item.children.find(c => c.id === childId);
            if (child) { child.position = { x: Math.max(0, newX), y: Math.max(0, newY) }; return true; }
          }
          if (item.children && update(item.children)) return true;
        }
        return false;
      };
      update(copy);
      saveDesktopItems(copy); return copy;
    });
  }, []);

  // 发布：把当前数据写入 GitHub 源文件
  const publishToGitHub = useCallback(async (token) => {
    const siteConfig = loadSiteConfig();
    const desktopItems = loadDesktopItems();
    
    // 生成更新后的文件内容
    const itemsCode = `export const defaultDesktopItems = ${JSON.stringify(desktopItems, null, 2)};\n\nexport function loadDesktopItems() {\n  try {\n    const saved = localStorage.getItem('deskofme_desktopItems');\n    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length > 0) return p; }\n  } catch (e) {}\n  return JSON.parse(JSON.stringify(defaultDesktopItems));\n}\n\nexport function saveDesktopItems(items) {\n  try { localStorage.setItem('deskofme_desktopItems', JSON.stringify(items)); return true; } catch (e) { return false; }\n}`;
    
    const configCode = `export const defaultSiteConfig = ${JSON.stringify({...siteConfig, githubToken: null}, null, 2)};\n\nexport function loadSiteConfig() { /* ... */ }\nexport function saveSiteConfig(config) { /* ... */ }`;

    const owner = 'wu66chen'; const repo = 'deskof.me';
    const headers = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' };

    try {
      // 获取文件 SHA
      const getSha = async (path) => {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
        if (!res.ok) throw new Error(`Failed to get ${path}`);
        const d = await res.json(); return d.sha;
      };

      // 更新文件
      const updateFile = async (path, content, sha) => {
        const body = JSON.stringify({
          message: '📤 Publish: update site content',
          content: btoa(unescape(encodeURIComponent(content))),
          sha, branch: 'main'
        });
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { method: 'PUT', headers, body });
        if (!res.ok) throw new Error(`Failed to update ${path}`);
        return res.json();
      };

      const itemsSha = await getSha('src/config/desktopItems.js');
      const configSha = await getSha('src/config/siteConfig.js');
      
      await updateFile('src/config/desktopItems.js', itemsCode, itemsSha);
      await updateFile('src/config/siteConfig.js', configCode, configSha);
      
      return { success: true, message: '发布成功！GitHub Pages 将在一分钟内自动更新。' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  return {
    items, selectedId, setSelectedId,
    addItem, removeItem, renameItem, moveItem, updateIcon, updateItemContent,
    moveItemOutOfFolder, moveItemIntoFolder, moveChildInFolder,
    publishToGitHub,
  };
}
