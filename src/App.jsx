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
import { loadSiteConfig } from './config/siteConfig';
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
    const url = prompt('输入新图标的图片 URL（支持 WebP/GIF/PNG，留空恢复默认）：');
    if (url !== null) desktopData.updateIcon(id, url || null);
  }, [desktopData]);

  const handleAddItem = useCallback((item) => {
    desktopData.addItem({ ...item, position: { x: 40 + Math.random()*400, y: 40 + Math.random()*300 } });
  }, [desktopData]);

  const handleUpdateContent = useCallback((id, updates) => {
    desktopData.updateItemContent(id, updates);
  }, [desktopData]);

  const handleConfigChange = useCallback((newConfig) => setSiteConfig(newConfig), []);

  // 编辑模式切换
  const handleToggleEdit = useCallback(() => {
    if (!auth.isAdmin) { auth.showLogin(); return; }
    auth.toggleEditMode();
  }, [auth]);

  // ===== 渲染 =====
  if (!auth.isInitialized) return null;

  // 主动触发的注册弹窗（仅当此浏览器无管理员时）
  if (auth.needsSetup) {
    return (<><CustomCursor /><SetupScreen onSetup={auth.setupAdmin} onCancel={auth.hideSetup} /></>);
  }

  // 主动触发的登录弹窗
  if (auth.needsLogin) {
    return (<>
      <CustomCursor />
      <LoginScreen onLogin={auth.login} onCancel={auth.hideLogin}
        onSetup={() => { auth.hideLogin(); auth.showSetup(); }}
        adminExists={auth.adminExists} />
    </>);
  }

  // 主桌面（所有用户都走这里）
  return (<>
    <CustomCursor />
    <Desktop items={desktopData.items} wallpaper={siteConfig.wallpaper}
      isEditMode={auth.isAdmin && auth.editMode}
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
      onOpenSettings={() => setShowSettings(true)} />

    <WindowManager windows={windowManager.windows}
      isEditMode={auth.isAdmin && auth.editMode}
      selectedId={desktopData.selectedId}
      renamingId={rename.renamingId} renameValue={rename.renameValue}
      onRenameValueChange={rename.setRenameValue}
      onRenameConfirm={rename.confirmRename} onRenameCancel={rename.cancelRename}
      inputRef={rename.inputRef} onSelect={handleSelect}
      onDoubleClickItem={handleDoubleClick}
      onContextMenu={contextMenu.showContextMenu} onDragStart={() => {}}
      onClose={windowManager.closeWindow} onMinimize={windowManager.toggleMinimize}
      onFocus={windowManager.focusWindow} onUpdateContent={handleUpdateContent}
      onMoveItem={desktopData.moveItem} />

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
        onConfigChange={handleConfigChange} />
    )}
  </>);
}
