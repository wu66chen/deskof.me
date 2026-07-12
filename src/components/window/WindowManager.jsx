import Window from './Window';
import FolderWindow from './FolderWindow';
import { ImageViewer, VideoPlayer, MarkdownViewer, LinkLauncher } from './ContentViewers';
import { iconEmoji } from '../../config/defaultIcons';
import { canOpenWindow } from '../../utils/fileHelpers';

export default function WindowManager({
  windows, isEditMode, selectedId, renamingId, renameValue,
  onRenameValueChange, onRenameConfirm, onRenameCancel, inputRef,
  onSelect, onDoubleClickItem, onContextMenu,
  onClose, onMinimize, onFocus, onUpdateContent, onMoveItem,
  windowDefaults, windowDecorations, customAssets, onSaveWindowDefault,
  onDragOutOfFolder, items,
}) {
  const renderContent = (item) => {
    switch (item.type) {
      case 'folder': case 'folder-large':
        return (<FolderWindow folderItem={item} isEditMode={isEditMode} selectedId={selectedId}
          renamingId={renamingId} renameValue={renameValue}
          onRenameValueChange={onRenameValueChange} onRenameConfirm={onRenameConfirm}
          onRenameCancel={onRenameCancel} inputRef={inputRef} onSelect={onSelect}
          onDoubleClick={onDoubleClickItem} onContextMenu={onContextMenu}
          onDragOutOfFolder={onDragOutOfFolder} onMoveItem={onMoveItem} />);
      case 'image': return <ImageViewer item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      case 'video': return <VideoPlayer item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      case 'markdown': return <MarkdownViewer item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      case 'link': return <LinkLauncher item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      default: return (<div style={{padding:40,textAlign:'center'}}><span>📄</span><p>{item.name}</p></div>);
    }
  };

  return (<>
    {windows.map(win => {
      if (!canOpenWindow(win.item.type)) return null;
      return (<Window key={win.id} id={win.id} title={win.item.name}
        icon={iconEmoji[win.item.type]||'📄'} type={win.item.type}
        isMinimized={win.minimized} onClose={onClose} onMinimize={onMinimize}
        onFocus={onFocus} zIndex={win.zIndex}
        defaultSize={windowDefaults?.[win.item.type]}
        onSaveDefault={onSaveWindowDefault}
        windowDecoration={windowDecorations?.[win.item.type]}
        customAssets={customAssets}>
        {renderContent(win.item)}
      </Window>);
    })}
  </>);
}
