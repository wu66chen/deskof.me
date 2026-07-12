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
  // 认证
  const auth = useAuth();

  // 站点配置
  const [siteConfig, setSiteConfig] = useState(() => loadSiteConfig());

  // 桌面数据
  const desktopData = useDesktopData();

  // 右键菜单
  const contextMenu = useContextMenu();

  // 窗口管理
  const windowManager = useWindowManager();

  // 重命名
  const rename = useRename(desktopData.renameItem);

  // 设置面板
  const [showSettings, setShowSettings] = useState(false);

  // ===== 事件处理 =====

  // 双击打开
  const handleDoubleClick = useCallback((item) => {
    if (canOpenWindow(item.type)) {
      windowManager.openWindow(item);
    }
  }, [windowManager]);

  // 图标选中/取消
  const handleSelect = useCallback((id) => {
    desktopData.setSelectedId(id);
    if (rename.renamingId && rename.renamingId !== id) {
      rename.confirmRename();
    }
  }, [desktopData, rename]);

  // 开始重命名
  const handleRenameStart = useCallback((id, name) => {
    rename.startRename(id, name);
  }, [rename]);

  // 更换图标
  const handleChangeIcon = useCallback((id) => {
    const url = prompt('输入新图标的图片 URL（留空恢复默认）：');
    if (url !== null) {
      desktopData.updateIcon(id, url || null);
    }
  }, [desktopData]);

  // 添加新项目
  const handleAddItem = useCallback((item) => {
    // 随机位置
    const x = 40 + Math.random() * 400;
    const y = 40 + Math.random() * 300;
    desktopData.addItem({ ...item, position: { x, y } });
  }, [desktopData]);

  // 更新项目内容
  const handleUpdateContent = useCallback((id, updates) => {
    desktopData.updateItemContent(id, updates);
  }, [desktopData]);

  // 设置变更
  const handleConfigChange = useCallback((newConfig) => {
    setSiteConfig(newConfig);
  }, []);

  // 访客模式
  const handleContinueAsGuest = useCallback(() => {
    window.__guestMode = true;
    window.location.reload();
  }, []);

  // ===== 渲染 =====

  // 首次设置管理员
  if (auth.isInitialized && auth.needsSetup) {
    return (
      <>
        <CustomCursor />
        <SetupScreen onSetup={auth.setupAdmin} />
      </>
    );
  }

  // 需要登录（且非访客绕过）
  if (auth.isInitialized && auth.needsLogin && !window.__guestMode) {
    return (
      <>
        <CustomCursor />
        <LoginScreen
          onLogin={auth.login}
          onContinueAsGuest={() => {
            window.__guestMode = true;
            window.location.reload();
          }}
        />
      </>
    );
  }

  // 主桌面
  return (
    <>
      <CustomCursor />

      <Desktop
        items={desktopData.items}
        wallpaper={siteConfig.wallpaper}
        isEditMode={auth.editMode}
        selectedId={desktopData.selectedId}
        renamingId={rename.renamingId}
        renameValue={rename.renameValue}
        onRenameValueChange={rename.setRenameValue}
        onRenameConfirm={rename.confirmRename}
        onRenameCancel={rename.cancelRename}
        inputRef={rename.inputRef}
        onSelect={handleSelect}
        onDoubleClickItem={handleDoubleClick}
        onMoveItem={desktopData.moveItem}
        onAddItem={handleAddItem}
        onDeleteItem={desktopData.removeItem}
        onRenameStart={handleRenameStart}
        onChangeIcon={handleChangeIcon}
        contextMenu={contextMenu.contextMenu}
        showContextMenu={contextMenu.showContextMenu}
        hideContextMenu={contextMenu.hideContextMenu}
        isAdmin={auth.isAdmin}
        onToggleEdit={auth.toggleEditMode}
        onOpenSettings={() => setShowSettings(true)}
      />

      <WindowManager
        windows={windowManager.windows}
        isEditMode={auth.editMode}
        selectedId={desktopData.selectedId}
        renamingId={rename.renamingId}
        renameValue={rename.renameValue}
        onRenameValueChange={rename.setRenameValue}
        onRenameConfirm={rename.confirmRename}
        onRenameCancel={rename.cancelRename}
        inputRef={rename.inputRef}
        onSelect={handleSelect}
        onDoubleClickItem={handleDoubleClick}
        onContextMenu={contextMenu.showContextMenu}
        onDragStart={() => {}}
        onClose={windowManager.closeWindow}
        onMinimize={windowManager.toggleMinimize}
        onFocus={windowManager.focusWindow}
        onUpdateContent={handleUpdateContent}
      />

      {siteConfig.showTaskbar !== false && (
        <Taskbar
          windows={windowManager.windows}
          isAdmin={auth.isAdmin}
          editMode={auth.editMode}
          onRestoreWindow={windowManager.restoreWindow}
          onToggleEdit={auth.toggleEditMode}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={auth.logout}
        />
      )}

      {showSettings && (
        <ConfigPanel
          onClose={() => setShowSettings(false)}
          onConfigChange={handleConfigChange}
        />
      )}
    </>
  );
}
