import { useState, useCallback, useEffect, memo } from 'react';
import Desktop from './components/desktop/Desktop';
import WindowManager from './components/window/WindowManager';
import Taskbar from './components/taskbar/Taskbar';
import CustomCursor from './components/common/CustomCursor';
import ConfigPanel from './components/common/ConfigPanel';
import { SetupScreen, LoginScreen } from './components/auth/AuthScreens';
import { useAuth } from './hooks/useAuth';
import { useContextMenu } from './hooks/useContextMenu';
import { useWindowManager } from './hooks/useWindowManager';
import { useDesktopData } from './hooks/useDesktopData';
import { useRename } from './hooks/useRename';
import { loadSiteConfig, saveSiteConfig } from './config/siteConfig';
import { canOpenWindow } from './utils/fileHelpers';
import './styles/theme.css';

const MemoDesktop = memo(Desktop);
const MemoWindowManager = memo(WindowManager);
const MemoTaskbar = memo(Taskbar);

export default function App() {
  const auth = useAuth();
  const [siteConfig, setSiteConfig] = useState(() => loadSiteConfig());
  const desktopData = useDesktopData();
  const contextMenu = useContextMenu();
  const windowManager = useWindowManager();
  const rename = useRename(desktopData.renameItem);
  const [showSettings, setShowSettings] = useState(false);

  // 全局阻止浏览器原生右键菜单
  useEffect(() => {
    const handler = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, []);

  const handleDoubleClick = useCallback((item) => {
    if (canOpenWindow(item.type)) windowManager.openWindow(item);
  }, [windowManager]);
  const handleSelect = useCallback((id) => { desktopData.setSelectedId(id); if (rename.renamingId&&rename.renamingId!==id) rename.confirmRename(); }, [desktopData,rename]);
  const handleRenameStart = useCallback((id,name)=>rename.startRename(id,name),[rename]);
  const handleChangeIcon = useCallback((id)=>{const u=prompt('输入图标URL：');if(u!==null)desktopData.updateIcon(id,u||null)},[desktopData]);
  const handleAddItem = useCallback((item)=>desktopData.addItem({...item,position:{x:40+Math.random()*400,y:40+Math.random()*300}}),[desktopData]);
  const handleUpdateContent = useCallback((id,u)=>desktopData.updateItemContent(id,u),[desktopData]);
  const handleConfigChange = useCallback((c)=>setSiteConfig(c),[]);

  const handleAddDeco = useCallback((dec) => {
    const nd={...dec,id:`dec-${Date.now()}`,zIndex:dec.zIndex||25000};
    const nc={...siteConfig,decorations:[...(siteConfig.decorations||[]),nd]};
    setSiteConfig(nc);saveSiteConfig(nc);
  },[siteConfig]);
  const handleUpdateDeco = useCallback((id,u) => {
    const decs=(siteConfig.decorations||[]).map(d=>d.id===id?{...d,...u}:d);
    const nc={...siteConfig,decorations:decs};
    setSiteConfig(nc);saveSiteConfig(nc);
  },[siteConfig]);
  const handleDeleteDeco = useCallback((id) => {
    const decs=(siteConfig.decorations||[]).filter(d=>d.id!==id);
    const nc={...siteConfig,decorations:decs};
    setSiteConfig(nc);saveSiteConfig(nc);
  },[siteConfig]);

  const handleSaveWinDefault = useCallback((type,size) => {
    const nc={...siteConfig,windowDefaults:{...siteConfig.windowDefaults,[type]:size}};
    setSiteConfig(nc);saveSiteConfig(nc);
  },[siteConfig]);

  const handlePublish = useCallback(async (token, version) => {
    return await desktopData.publishToGitHub(token, version);
  }, [desktopData]);

  const handleToggleEdit = useCallback(() => {
    if (!auth.isAdmin) { auth.showLogin(); return; }
    auth.toggleEditMode();
  }, [auth]);

  if (!auth.isInitialized) return null;
  if (auth.needsSetup) return (<><CustomCursor /><SetupScreen onSetup={auth.setupAdmin} onCancel={auth.hideSetup} /></>);
  if (auth.needsLogin) return (<><CustomCursor /><LoginScreen onLogin={auth.login} onCancel={auth.hideLogin} onSetup={()=>{auth.hideLogin();auth.showSetup()}} adminExists={auth.adminExists} /></>);

  const isEdit = auth.isAdmin && auth.editMode;

  return (<>
    <CustomCursor />
    <MemoDesktop items={desktopData.items} wallpaper={siteConfig.wallpaper}
      isEditMode={isEdit} selectedId={desktopData.selectedId}
      renamingId={rename.renamingId} renameValue={rename.renameValue}
      onRenameValueChange={rename.setRenameValue}
      onRenameConfirm={rename.confirmRename} onRenameCancel={rename.cancelRename}
      inputRef={rename.inputRef} onSelect={handleSelect}
      onDoubleClickItem={handleDoubleClick} onMoveItem={desktopData.moveItem}
      onAddItem={handleAddItem} onDeleteItem={desktopData.removeItem}
      onRenameStart={handleRenameStart} onChangeIcon={handleChangeIcon}
      contextMenu={contextMenu.contextMenu}
      showContextMenu={contextMenu.showContextMenu} hideContextMenu={contextMenu.hideContextMenu}
      isAdmin={auth.isAdmin} onToggleEdit={handleToggleEdit} onOpenSettings={()=>setShowSettings(true)}
      decorations={siteConfig.decorations}
      onUpdateDecoration={handleUpdateDeco} onDeleteDecoration={handleDeleteDeco}
      onAddDecoration={handleAddDeco}
      onMoveItemIntoFolder={desktopData.moveItemIntoFolder}
      iconSize={siteConfig.iconSize} parallaxEnabled={siteConfig.parallaxEnabled!==false}
      parallaxStrength={siteConfig.parallaxStrength||8} />

    <MemoWindowManager windows={windowManager.windows} isEditMode={isEdit}
      selectedId={desktopData.selectedId} renamingId={rename.renamingId}
      renameValue={rename.renameValue} onRenameValueChange={rename.setRenameValue}
      onRenameConfirm={rename.confirmRename} onRenameCancel={rename.cancelRename}
      inputRef={rename.inputRef} onSelect={handleSelect}
      onDoubleClickItem={handleDoubleClick} onContextMenu={contextMenu.showContextMenu}
      onClose={windowManager.closeWindow} onMinimize={windowManager.toggleMinimize}
      onFocus={windowManager.focusWindow} onUpdateContent={handleUpdateContent}
      onMoveItem={desktopData.moveItem}
      onMoveItemOutOfFolder={desktopData.moveItemOutOfFolder}
      onMoveItemIntoFolder={desktopData.moveItemIntoFolder}
      onDragStartFromFolder={desktopData.moveItemOutOfFolder}
      onAddItemToFolder={desktopData.moveItemIntoFolder}
      windowDefaults={siteConfig.windowDefaults}
      windowDecorations={siteConfig.windowDecorations}
      customAssets={siteConfig.customAssets}
      onSaveWindowDefault={handleSaveWinDefault}
      items={desktopData.items} />

    {siteConfig.showTaskbar!==false && (
      <MemoTaskbar windows={windowManager.windows}
        isAdmin={auth.isAdmin} editMode={auth.editMode}
        onRestoreWindow={windowManager.restoreWindow}
        onToggleEdit={handleToggleEdit} onOpenSettings={()=>setShowSettings(true)}
        onLogout={auth.logout} onShowLogin={auth.showLogin}
        startMenuItems={siteConfig.startMenuItems} />
    )}

    {showSettings && (
      <ConfigPanel onClose={()=>setShowSettings(false)}
        onConfigChange={handleConfigChange} onPublish={handlePublish} />
    )}
  </>);
}
