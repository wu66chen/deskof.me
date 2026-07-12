import { useCallback } from 'react';
import './ContextMenu.css';

export default function ContextMenu({
  menu, isAdmin, editMode, onClose,
  onOpen, onRename, onDelete, onChangeIcon,
  onAddItem, onToggleEdit, onOpenSettings,
  onAddDecoration,
}) {
  if (!menu) return null;

  const act = useCallback((action, data) => {
    onClose();
    setTimeout(() => {
      switch (action) {
        case 'open': onOpen(data); break;
        case 'rename': onRename(data.id, data.name); break;
        case 'delete': onDelete(data.id); break;
        case 'changeIcon': onChangeIcon(data.id); break;
        case 'newFolder': onAddItem({type:'folder',name:'新文件夹',size:'normal'}); break;
        case 'newLargeFolder': onAddItem({type:'folder-large',name:'新文件夹',size:'large'}); break;
        case 'newMarkdown': onAddItem({type:'markdown',name:'新文档.md',content:'# 新文档\n\n开始写点什么...'}); break;
        case 'newImage': onAddItem({type:'image',name:'新图片.png',url:''}); break;
        case 'newVideo': onAddItem({type:'video',name:'新视频.mp4',url:''}); break;
        case 'newLink': onAddItem({type:'link',name:'新链接',url:'https://'}); break;
        case 'toggleEdit': onToggleEdit(); break;
        case 'openSettings': onOpenSettings(); break;
        case 'addSticker': {const u=prompt('贴纸/图片URL（支持WebP/GIF）：');if(u)onAddDecoration?.({type:'image',content:u,x:menu.x+20,y:menu.y-40,width:80,height:80});break;}
        case 'addText': {const t=prompt('文字内容：');if(t)onAddDecoration?.({type:'text',content:t,x:menu.x+20,y:menu.y-40});break;}
      }
    }, 50);
  }, [onClose,onOpen,onRename,onDelete,onChangeIcon,onAddItem,onToggleEdit,onOpenSettings,onAddDecoration,menu]);

  const x=Math.min(menu.x,window.innerWidth-200),y=Math.min(menu.y,window.innerHeight-400);

  return (
    <div className="context-menu-overlay" onClick={onClose} onContextMenu={e=>{e.preventDefault();onClose();}}>
      <div className="context-menu win98-window" style={{left:x,top:y}} onClick={e=>e.stopPropagation()}>
        {menu.type==='desktop'&&(<>
          <div className="menu-section-label">编辑</div>
          <button className="menu-item" onClick={e=>{e.stopPropagation();act('toggleEdit');}}>{editMode?'✕ 退出编辑模式':(isAdmin?'✎ 进入编辑模式':'🔑 管理员登录')}</button>
          {isAdmin&&editMode&&(<>
            <div className="menu-separator"/><div className="menu-section-label">新建</div>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('newFolder');}}>📁 文件夹</button>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('newLargeFolder');}}>📂 大型文件夹</button>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('newMarkdown');}}>📝 Markdown</button>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('newImage');}}>🖼️ 图片</button>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('newVideo');}}>🎬 视频</button>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('newLink');}}>🔗 链接</button>
            <div className="menu-separator"/><div className="menu-section-label">装饰</div>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('addSticker');}}>🖼️ 贴纸</button>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('addText');}}>📝 文字</button>
            <div className="menu-separator"/>
          </>)}
          {isAdmin&&<button className="menu-item" onClick={e=>{e.stopPropagation();act('openSettings');}}>⚙️ 站点设置</button>}
        </>)}
        {menu.type==='icon'&&(<>
          <button className="menu-item" onClick={e=>{e.stopPropagation();act('open',menu.item);}}>📂 打开</button>
          {isAdmin&&editMode&&(<>
            <div className="menu-separator"/>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('rename',{id:menu.itemId,name:menu.item.name});}}>✏️ 重命名</button>
            <button className="menu-item" onClick={e=>{e.stopPropagation();act('changeIcon',{id:menu.itemId});}}>🎨 换图标</button>
            <div className="menu-separator"/>
            <button className="menu-item menu-item-danger" onClick={e=>{e.stopPropagation();act('delete',{id:menu.itemId});}}>🗑️ 删除</button>
          </>)}
        </>)}
        {menu.type==='decoration'&&isAdmin&&editMode&&(<>
          <button className="menu-item" onClick={e=>{e.stopPropagation();act('addSticker');}}>🖼️ 贴纸</button>
          <button className="menu-item" onClick={e=>{e.stopPropagation();act('addText');}}>📝 文字</button>
        </>)}
      </div>
    </div>
  );
}
