import { useState, useCallback } from 'react';
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

export default function App() {
  const auth = useAuth();
  const [siteConfig, setSiteConfig] = useState(() => loadSiteConfig());
  const desktopData = useDesktopData();
  const contextMenu = useContextMenu();
  const windowManager = useWindowManager();
  const rename = useRename(desktopData.renameItem);
  const [showSettings, setShowSettings] = useState(false);

  const handleDoubleClick = useCallback((item) => {
    if (canOpenWindow(item.type)) windowManager.openWindow(item);
  }, [windowManager]);

  const handleSelect = useCallback((id) => {
    desktopData.setSelectedId(id);
    if (rename.renamingId && rename.renamingId !== id) rename.confirmRename();
  }, [desktopData, rename]);

  const handleRenameStart = useCallback((id, name) => rename.startRename(id, name), [rename]);
  
  const handleChangeIcon = useCallback((id) => {
    const url = prompt('输入新图标 URL（支持 WebP/GIF，留空恢复默认）：');
    if (url !== null) desktopData.updateIcon(id, url || null);
  }, [desktopData]);

  const handleAddItem = useCallback((item) => {
    desktopData.addItem({ ...item, position: { x: 40+Math.random()*400, y: 40+Math.random()*300 } });
  }, [desktopData]);

  const handleUpdateContent = useCallback((id, updates) => {
    desktopData.updateItemContent(id, updates);
  }, [desktopData]);

  const handleConfigChange = useCallback((newConfig) => {
    setSiteConfig(newConfig);
  }, []);

  // 装饰管理
  const handleAddDecoration = useCallback((dec) => {
    const newDec = { ...dec, id: `dec-${Date.now()}`, zIndex: 5 };
    const decs = [...(siteConfig.decorations || []), newDec];
    const newConfig = { ...siteConfig, decorations: decs };
    setSiteConfig(newConfig);
    saveSiteConfig(newConfig);
  }, [siteConfig]);

  const handleUpdateDecoration = useCallback((id, updates) => {
    const decs = (siteConfig.decorations || []).map(d => d.id === id ? { ...d, ...updates } : d);
    const newConfig = { ...siteConfig, decorations: decs };
    setSiteConfig(newConfig);
    saveSiteConfig(newConfig);
  }, [siteConfig]);

  const handleDeleteDecoration = useCallback((id) => {
    const decs = (siteConfig.decorations || []).filter(d => d.id !== id);
    const newConfig = { ...siteConfig, decorations: decs };
    setSiteConfig(newConfig);
    saveSiteConfig(newConfig);
  }, [siteConfig]);

  // 保存窗口默认大小
  const handleSaveWindowDefault = useCallback((type, size) => {
    const newConfig = { ...siteConfig, windowDefaults: { ...siteConfig.windowDefaults, [type]: size } };
    setSiteConfig(newConfig);
    saveSiteConfig(newConfig);
  }, [siteConfig]);

  // 发布
  const handlePublish = useCallback(async (token) => {
    return await desktopData.publishToGitHub(token);
  }, [desktopData]);

  // 编辑模式
  const handleToggleEdit = useCallback(() => {
    if (!auth.isAdmin) { auth.showLogin(); return; }
    auth.toggleEditMode();
  }, [auth]);

  const isEditMode = auth.isAdmin && auth.editMode;

  if (!auth.isInitialized) return null;

  if (auth.needsSetup) {
    return (<><CustomCursor /><SetupScreen onSetup={auth.setupAdmin} onCancel={auth.hideSetup} /></>);
  }

  if (auth.needsLogin) {
    return (<><CustomCursor /><LoginScreen onLogin={auth.login} onCancel={auth.hideLogin}
      onSetup={() => { auth.hideLogin(); auth.showSetup(); }} adminExists={auth.adminExists} /></>);
  }

  return (<>
    <CustomCursor />
    <Desktop items={desktopData.items} wallpaper={siteConfig.wallpaper}
      isEditMode={isEditMode}
      selectedId={desktopData.selectedId}
      renamingId={rename.renamingId} renameValue={rename.renameValue}
      onRenameValueChange={rename.setRenameValue}
      onRenameConfirm={rename.confirmRename} onRenameCancel={rename.cancelRename}
      inputRef={rename.inputRef} onSelect={handleSelect}
      onDoubleClickItem={handleDoubleClick} onMoveItem={desktopData.moveItem}
      onAddItem={handleAddItem} onDeleteItem={desktopData.removeItem}
      onRenameStart={handleRenameStart} onChangeIcon={handleChangeIcon}
      contextMenu={contextMenu.contextMenu}
      showContextMenu={contextMenu.showContextMenu}
      hideContextMenu={contextMenu.hideContextMenu}
      isAdmin={auth.isAdmin} onToggleEdit={handleToggleEdit}
      onOpenSettings={() => setShowSettings(true)}
      decorations={siteConfig.decorations}
      onUpdateDecoration={handleUpdateDecoration}
      onDeleteDecoration={handleDeleteDecoration}
      onAddDecoration={handleAddDecoration}
      onMoveItemIntoFolder={desktopData.moveItemIntoFolder} />

    <WindowManager windows={windowManager.windows}
      isEditMode={isEditMode}
      selectedId={desktopData.selectedId}
      renamingId={rename.renamingId} renameValue={rename.renameValue}
      onRenameValueChange={rename.setRenameValue}
      onRenameConfirm={rename.confirmRename} onRenameCancel={rename.cancelRename}
      inputRef={rename.inputRef} onSelect={handleSelect}
      onDoubleClickItem={handleDoubleClick}
      onContextMenu={contextMenu.showContextMenu} onDragStart={() => {}}
      onClose={windowManager.closeWindow} onMinimize={windowManager.toggleMinimize}
      onFocus={windowManager.focusWindow} onUpdateContent={handleUpdateContent}
      onMoveItem={desktopData.moveItem}
      windowDefaults={siteConfig.windowDefaults}
      windowDecorations={siteConfig.windowDecorations}
      onSaveWindowDefault={handleSaveWindowDefault}
      onDragOutOfFolder={desktopData.moveItemOutOfFolder} />

    {siteConfig.showTaskbar !== false && (
      <Taskbar windows={windowManager.windows}
        isAdmin={auth.isAdmin} editMode={auth.editMode}
        onRestoreWindow={windowManager.restoreWindow}
        onToggleEdit={handleToggleEdit}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={auth.logout} onShowLogin={auth.showLogin}
        startMenuItems={siteConfig.startMenuItems} />
    )}

    {showSettings && (
      <ConfigPanel onClose={() => setShowSettings(false)}
        onConfigChange={handleConfigChange}
        onPublish={handlePublish} />
    )}
  </>);
}
