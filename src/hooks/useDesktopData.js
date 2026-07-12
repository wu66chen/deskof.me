import { useState, useCallback } from 'react';
import { loadDesktopItems, saveDesktopItems } from '../config/desktopItems';
import { loadSiteConfig } from '../config/siteConfig';

export function useDesktopData() {
  const [items, setItems] = useState(() => loadDesktopItems());
  const [selectedId, setSelectedId] = useState(null);

  const addItem = useCallback((newItem) => {
    setItems(prev => { const u = [...prev,{...newItem,id:`${newItem.type}-${Date.now()}`,position:newItem.position||{x:40,y:40},icon:newItem.icon||null}]; saveDesktopItems(u); return u; });
  }, []);
  const removeItem = useCallback((id) => {
    setItems(prev => { const u = prev.filter(i=>i.id!==id); saveDesktopItems(u); return u; });
    if (selectedId===id) setSelectedId(null);
  }, [selectedId]);
  const renameItem = useCallback((id, name) => {
    setItems(prev => { const u = prev.map(i=>i.id===id?{...i,name}:i); saveDesktopItems(u); return u; });
  }, []);
  const moveItem = useCallback((id, x, y) => {
    setItems(prev => { const u = prev.map(i=>i.id===id?{...i,position:{x,y}}:i); saveDesktopItems(u); return u; });
  }, []);
  const updateIcon = useCallback((id, iconUrl) => {
    setItems(prev => { const u = prev.map(i=>i.id===id?{...i,icon:iconUrl||null}:i); saveDesktopItems(u); return u; });
  }, []);
  const updateItemContent = useCallback((id, updates) => {
    const rec = (list) => { for (let i=0;i<list.length;i++) { if (list[i].id===id) { list[i]={...list[i],...updates}; return true; } if (list[i].children&&rec(list[i].children)) return true; } return false; };
    setItems(prev => { const c=JSON.parse(JSON.stringify(prev)); rec(c); saveDesktopItems(c); return c; });
  }, []);
  const moveItemOutOfFolder = useCallback((childId, folderId, tx, ty) => {
    setItems(prev => { const c=JSON.parse(JSON.stringify(prev));
      const rf = (list) => { for (let i=0;i<list.length;i++) { if (list[i].id===folderId&&list[i].children) { const idx=list[i].children.findIndex(x=>x.id===childId); if(idx>=0) { const [m]=list[i].children.splice(idx,1); m.position={x:Math.max(0,tx),y:Math.max(0,ty)}; c.push(m); return true; } } if (list[i].children&&rf(list[i].children)) return true; } return false; };
      rf(c); saveDesktopItems(c); return c; });
  }, []);
  const moveItemIntoFolder = useCallback((itemId, folderId) => {
    setItems(prev => { const c=JSON.parse(JSON.stringify(prev)); const idx=c.findIndex(i=>i.id===itemId); if(idx<0) return prev; const [m]=c.splice(idx,1); m.position={x:0,y:0};
      const af = (list) => { for (const i of list) { if (i.id===folderId) { if(!i.children)i.children=[]; i.children.push(m); return true; } if(i.children&&af(i.children)) return true; } return false; };
      af(c); saveDesktopItems(c); return c; });
  }, []);

  const publishToGitHub = useCallback(async (token, newVersion) => {
    const siteConfig = loadSiteConfig();
    const items = loadDesktopItems();
    const publishConfig = { ...siteConfig, githubToken: null, dataVersion: newVersion };

    const itemsCode = `export const defaultDesktopItems = ${JSON.stringify(items,null,2)};\n\nexport function loadDesktopItems() {\n  try { const s=localStorage.getItem('deskofme_desktopItems'); if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length>0)return p;} } catch(e){}\n  return JSON.parse(JSON.stringify(defaultDesktopItems));\n}\nexport function saveDesktopItems(items){try{localStorage.setItem('deskofme_desktopItems',JSON.stringify(items));return true}catch(e){return false}}`;
    
    const siteConfigTemplate = readSiteConfigTemplate();
    const configCode = siteConfigTemplate.replace('REPLACE_CONFIG', JSON.stringify(publishConfig, null, 2));

    const owner='wu66chen', repo='deskof.me';
    const headers = { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' };
    try {
      const getSha = async (path) => { const r=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,{headers}); if(!r.ok)throw new Error('get failed'); return (await r.json()).sha; };
      const updateFile = async (path, content, sha) => {
        const body = JSON.stringify({ message: '📤 Publish v'+newVersion, content: btoa(unescape(encodeURIComponent(content))), sha, branch: 'main' });
        const r=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,{method:'PUT',headers,body});
        if(!r.ok) throw new Error('update failed: '+(await r.text()).substring(0,100));
      };
      const iSha=await getSha('src/config/desktopItems.js');
      const cSha=await getSha('src/config/siteConfig.js');
      await updateFile('src/config/desktopItems.js', itemsCode, iSha);
      await updateFile('src/config/siteConfig.js', configCode, cSha);
      return { success:true, message:'发布成功！约1分钟后访客可见。' };
    } catch(e) { return { success:false, error: e.message }; }
  }, []);

  return { items, selectedId, setSelectedId, addItem, removeItem, renameItem, moveItem, updateIcon, updateItemContent, moveItemOutOfFolder, moveItemIntoFolder, publishToGitHub };
}

// 读取 siteConfig.js 模板（运行时注入配置）
function readSiteConfigTemplate() {
  return `export const defaultSiteConfig = REPLACE_CONFIG;\n\nexport function loadSiteConfig() {\n  try {\n    const saved = localStorage.getItem('deskofme_siteConfig');\n    const savedVer = saved ? JSON.parse(saved).dataVersion || 0 : -1;\n    const currentVer = defaultSiteConfig.dataVersion;\n    if (savedVer < currentVer) {\n      localStorage.removeItem('deskofme_desktopItems');\n      localStorage.removeItem('deskofme_siteConfig');\n      return JSON.parse(JSON.stringify(defaultSiteConfig));\n    }\n    if (saved) {\n      const p = JSON.parse(saved);\n      return { ...defaultSiteConfig, ...p, customAssets:{...defaultSiteConfig.customAssets,...(p.customAssets||{})}, windowDefaults:{...defaultSiteConfig.windowDefaults,...(p.windowDefaults||{})}, windowDecorations:{...defaultSiteConfig.windowDecorations,...(p.windowDecorations||{})}, decorations:p.decorations||[], startMenuItems:p.startMenuItems||defaultSiteConfig.startMenuItems };\n    }\n  } catch(e) {}\n  return JSON.parse(JSON.stringify(defaultSiteConfig));\n}\n\nexport function saveSiteConfig(config) {\n  try { localStorage.setItem('deskofme_siteConfig', JSON.stringify(config)); return true; } catch(e) { return false; }\n}`;
}
