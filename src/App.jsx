import { useCallback, useEffect, useRef, useState } from 'react';
import Desktop from './Desktop';
import Windows from './Windows';
import CustomCursor from './CustomCursor';
import { AuthDialog, ContextMenu, EditorDialog, FileProperties, Taskbar, Toast } from './Overlays';
import { CursorPopover, DesktopProperties, ScreenSaver, SiteSettings } from './Properties';
import { countItems, createItem, findItem, findParent, moveIntoFolder, moveToDesktop, removeItem, safeExternalUrl, updateItem, copyText, makeDeepLink } from './lib';
import { useAdmin, useDeskState, useMobile, usePublishToken } from './useDesk';
import './styles.css';

const WINDOW_BASE_Z = 30000;

function defaultRect(type, config, offset, mobile) {
  if (mobile) return { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 42 };
  const preferred = config.windowDefaults[type] || { w: 600, h: 500 };
  const w = Math.min(preferred.w, window.innerWidth - 36);
  const h = Math.min(preferred.h, window.innerHeight - 66);
  return {
    x: Math.max(18, (window.innerWidth - w) / 2 + offset * 12),
    y: Math.max(18, (window.innerHeight - h - 42) / 2 + offset * 10),
    w,
    h,
  };
}

export default function App() {
  const { desk, updateConfig, updateItems, updateDecorations, resetDesk, publish } = useDeskState();
  const admin = useAdmin();
  const mobile = useMobile();
  const [token, setToken] = usePublishToken();
  const [selectedId, setSelectedId] = useState(null);
  const [windows, setWindows] = useState([]);
  const [menu, setMenu] = useState(null);
  const [editor, setEditor] = useState(null);
  const [desktopProperties, setDesktopProperties] = useState(false);
  const [filePropertiesId, setFilePropertiesId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pencilOpen, setPencilOpen] = useState(false);
  const [cursorPreview, setCursorPreview] = useState(null);
  const [screensaver, setScreensaver] = useState(null);
  const [toast, setToast] = useState('');
  const nextZ = useRef(WINDOW_BASE_Z);
  const openedDeepLink = useRef(false);
  const toastTimer = useRef(null);
  const config = desk.config;
  const effectiveEditMode = admin.isAdmin && admin.editMode && !mobile;

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--win-bg', config.colors.winBg);
    root.setProperty('--paper-bg', config.colors.paperBg);
    root.setProperty('--y2k-pink', config.colors.pink);
    root.setProperty('--y2k-cyan', config.colors.cyan);
    root.setProperty('--y2k-purple', config.colors.purple);
    root.setProperty('--y2k-orange', config.colors.orange);
    root.setProperty('--ink', config.colors.ink);
    root.setProperty('--icon-size', `${config.iconSize}px`);
    root.setProperty('--icon-large-size', `${config.iconSize * config.largeIconScale}px`);
  }, [config]);

  useEffect(() => {
    const block = (event) => event.preventDefault();
    document.addEventListener('contextmenu', block);
    return () => document.removeEventListener('contextmenu', block);
  }, []);

  const focusWindow = useCallback((id) => {
    nextZ.current += 1;
    setWindows((current) => current.map((win) => win.id === id ? { ...win, z: nextZ.current, minimized: false } : win));
  }, []);

  const openItem = useCallback((itemId) => {
    const item = findItem(desk.items, itemId);
    if (!item) return;
    setWindows((current) => {
      const existing = current.find((win) => win.itemId === itemId);
      nextZ.current += 1;
      if (existing) return current.map((win) => win.id === existing.id ? { ...win, minimized: false, z: nextZ.current } : win);
      const id = `${itemId}-${Date.now()}`;
      return [...current.slice(-7), {
        id,
        itemId,
        type: item.type,
        title: item.name,
        z: nextZ.current,
        minimized: false,
        maximized: mobile,
        rect: defaultRect(item.type, config, current.length % 4, mobile),
        previousRect: null,
      }];
    });
  }, [config, desk.items, mobile]);

  useEffect(() => {
    if (openedDeepLink.current) return;
    const fileId = new URLSearchParams(window.location.search).get('file');
    if (fileId && findItem(desk.items, fileId)) {
      openedDeepLink.current = true;
      openItem(fileId);
    }
  }, [desk.items, openItem]);

  const closeWindow = useCallback((id) => setWindows((current) => current.filter((win) => win.id !== id)), []);
  const minimizeWindow = useCallback((id) => setWindows((current) => current.map((win) => win.id === id ? { ...win, minimized: true } : win)), []);
  const setWindowRect = useCallback((id, rect) => setWindows((current) => current.map((win) => win.id === id ? { ...win, rect } : win)), []);
  const toggleMax = useCallback((id) => setWindows((current) => current.map((win) => {
    if (win.id !== id) return win;
    if (win.maximized) return { ...win, maximized: false, rect: win.previousRect || defaultRect(win.type, config, 0, mobile), previousRect: null };
    return { ...win, maximized: true, previousRect: win.rect, rect: { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 42 } };
  })), [config, mobile]);
  const taskClick = useCallback((id) => {
    const win = windows.find((entry) => entry.id === id);
    if (!win) return;
    const topZ = Math.max(...windows.filter((entry) => !entry.minimized).map((entry) => entry.z), 0);
    if (!win.minimized && win.z === topZ) minimizeWindow(id);
    else focusWindow(id);
  }, [focusWindow, minimizeWindow, windows]);

  const moveDesktopItem = useCallback((id, position) => updateItems((items) => updateItem(items, id, { position })), [updateItems]);
  const moveDesktopItemIntoFolder = useCallback((id, folderId) => {
    const moving = findItem(desk.items, id);
    if (!moving || (moving.children && findItem(moving.children, folderId))) return;
    updateItems((items) => moveIntoFolder(items, id, folderId));
  }, [desk.items, updateItems]);
  const moveOut = useCallback((id, _folderId, position) => updateItems((items) => moveToDesktop(items, id, position)), [updateItems]);
  const updateDeskItem = useCallback((id, patch) => updateItems((items) => updateItem(items, id, patch)), [updateItems]);
  const updateDecoration = useCallback((id, patch) => updateDecorations((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item)), [updateDecorations]);
  const deleteDecoration = useCallback((id) => updateDecorations((items) => items.filter((item) => item.id !== id)), [updateDecorations]);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2200);
  }, []);
  const shareItem = useCallback(async (id) => {
    await copyText(makeDeepLink(id));
    showToast('复制成功！✨');
  }, [showToast]);

  const openContext = useCallback((event, itemId, parentId = null) => setMenu({ kind: 'item', itemId, parentId, x: event.clientX, y: event.clientY }), []);
  const openDesktopContext = useCallback((event) => setMenu({ kind: 'desktop', x: event.clientX, y: event.clientY }), []);

  const editItem = (mode, id) => {
    const item = findItem(desk.items, id);
    if (!item) return;
    setEditor({ mode, type: item.type, itemId: id, draft: mode === 'rename' ? { name: item.name } : { icon: item.icon || '', displaySize: item.displaySize || '', rotation: item.rotation || 0, opacity: item.opacity ?? 1 } });
  };

  const newItem = (type) => {
    const index = desk.items.length;
    const item = createItem(type, { position: { x: 42 + (index % 6) * 135, y: 88 + Math.floor(index / 6) * 140 } });
    setEditor({ mode: 'create', type, draft: item });
  };

  const newDecoration = (type, existing = null) => {
    const draft = existing || {
      id: `decoration-${Date.now()}`, type, content: type === 'text' ? '新文字 ✦' : '',
      x: 540, y: 110, width: type === 'text' ? 180 : 100, height: 80,
      rotation: 0, opacity: 1, fontSize: 18, color: '#2E294E', bgColor: '#FFF3A6',
      fontFamily: 'var(--font-hand)', fontWeight: 'normal', zIndex: 25000,
    };
    setEditor({ mode: 'decoration', decorationId: existing?.id || null, type, draft });
  };

  const submitEditor = (draft) => {
    if (editor.mode === 'create') updateItems((items) => [...items, draft]);
    if (editor.mode === 'rename') updateDeskItem(editor.itemId, { name: draft.name });
    if (editor.mode === 'icon') updateDeskItem(editor.itemId, { icon: draft.icon || null, displaySize: draft.displaySize ? Number(draft.displaySize) : null, rotation: Number(draft.rotation) || 0, opacity: Number(draft.opacity) });
    if (editor.mode === 'decoration') {
      if (editor.decorationId) updateDecoration(editor.decorationId, draft);
      else updateDecorations((items) => [...items, draft]);
    }
    setEditor(null);
  };

  const contextActions = {
    github: () => { const url = safeExternalUrl(config.repoUrl); if (url) window.open(url, '_blank', 'noopener,noreferrer'); },
    desktopProperties: () => setDesktopProperties(true),
    toggleEdit: admin.toggleEdit,
    create: newItem,
    createDecoration: (type) => newDecoration(type),
    settings: () => setSettingsOpen(true),
    open: openItem,
    share: shareItem,
    fileProperties: setFilePropertiesId,
    rename: (id) => editItem('rename', id),
    icon: (id) => editItem('icon', id),
    delete: (id) => {
      const item = findItem(desk.items, id);
      if (item && window.confirm(`把“${item.name}”移到碎纸机？`)) {
        updateItems((items) => removeItem(items, id).items);
        setWindows((current) => current.filter((win) => win.itemId !== id));
      }
    },
  };

  const startAction = (item) => {
    if (item.action === 'toggle-edit') admin.toggleEdit();
    if (item.action === 'settings') setSettingsOpen(true);
    if (item.action === 'logout') admin.logout();
    if (item.action === 'link') { const url = safeExternalUrl(item.url); if (url) window.open(url, '_blank', 'noopener,noreferrer'); }
  };

  const taskWindows = windows.map((win) => {
    const item = findItem(desk.items, win.itemId);
    return { ...win, type: item?.type || win.type, title: item?.name || win.title };
  });
  const filePropertyItem = findItem(desk.items, filePropertiesId);
  const propertyParent = filePropertyItem ? findParent(desk.items, filePropertyItem.id) : null;

  return <div className="app-shell">
    <Desktop
      items={desk.items} decorations={desk.decorations} config={config} editMode={effectiveEditMode} mobile={mobile}
      selectedId={selectedId} onSelect={setSelectedId} onOpen={openItem} onContext={openContext}
      onDesktopContext={openDesktopContext} onMove={moveDesktopItem} onMoveIntoFolder={moveDesktopItemIntoFolder}
      onUpdateDecoration={updateDecoration} onDeleteDecoration={deleteDecoration} onEditDecoration={(decoration) => newDecoration(decoration.type, decoration)}
      pencilOpen={pencilOpen} onPencilToggle={() => setPencilOpen((value) => !value)}
    />
    <Windows
      windows={windows} itemsById={(id) => findItem(desk.items, id)} config={config} editMode={effectiveEditMode}
      onFocus={focusWindow} onClose={closeWindow} onMinimize={minimizeWindow} onRect={setWindowRect}
      onToggleMax={toggleMax} onSaveDefault={(type, size) => updateConfig((current) => ({ ...current, windowDefaults: { ...current.windowDefaults, [type]: size } }))}
      onOpen={openItem} onContext={openContext} onUpdateItem={updateDeskItem} onMoveOut={moveOut}
    />
    <Taskbar config={config} windows={taskWindows} isAdmin={admin.isAdmin} editMode={effectiveEditMode} onTask={taskClick} onLogin={admin.showLogin} onStartAction={startAction} />
    <ContextMenu menu={menu} item={menu?.itemId ? findItem(desk.items, menu.itemId) : null} isAdmin={admin.isAdmin} editMode={effectiveEditMode} config={config} onClose={() => setMenu(null)} actions={contextActions} />
    <AuthDialog mode={admin.authMode} adminExists={admin.adminExists} authReady={admin.authReady} authError={admin.authError} config={config} onClose={admin.closeAuth} onLogin={admin.login} onSetup={admin.setup} onChangeMode={(mode) => mode === 'setup' ? admin.showSetup() : admin.showLogin()} />
    <EditorDialog editor={editor} onClose={() => setEditor(null)} onSubmit={submitEditor} />
    {desktopProperties && <DesktopProperties config={config} editMode={effectiveEditMode} itemCount={countItems(desk.items)} decorationCount={desk.decorations.length} onClose={() => setDesktopProperties(false)} onApply={updateConfig} onPreview={(draft) => setScreensaver(draft)} />}
    {filePropertyItem && <FileProperties item={filePropertyItem} parentName={propertyParent?.name} onClose={() => setFilePropertiesId(null)} onShare={shareItem} />}
    {settingsOpen && <SiteSettings config={config} token={token} setToken={setToken} onClose={() => setSettingsOpen(false)} onSave={updateConfig} onReset={() => { resetDesk(); setSettingsOpen(false); }} onPublish={publish} />}
    {pencilOpen && effectiveEditMode && <CursorPopover config={config} onUpdate={updateConfig} onClose={() => { setPencilOpen(false); setCursorPreview(null); }} onPreview={setCursorPreview} />}
    {screensaver && <ScreenSaver config={screensaver} onExit={() => setScreensaver(null)} />}
    <Toast message={toast} />
    <CustomCursor config={config} previewState={cursorPreview} />
  </div>;
}
