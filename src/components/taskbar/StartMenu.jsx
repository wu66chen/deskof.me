import './StartMenu.css';

export default function StartMenu({
  isAdmin, editMode, onToggleEdit, onOpenSettings,
  onLogout, onClose, startMenuItems = [],
}) {
  const handleAction = (item) => {
    onClose();
    setTimeout(() => {
      if (!item.action) return;
      switch (item.action) {
        case 'toggleEdit': onToggleEdit(); break;
        case 'openSettings': onOpenSettings(); break;
        case 'logout': onLogout(); break;
        case 'link': {
          let url = item.url || '';
          if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
          window.open(url, '_blank'); break;
        }
      }
    }, 50);
  };

  return (
    <div className="start-menu-overlay" onClick={onClose}>
      <div className="start-menu win98-window" onClick={e => e.stopPropagation()}>
        <div className="start-menu-sidebar">
          <span className="start-menu-brand">deskof.me</span>
          <span className="start-menu-version">Y2K Edition</span>
        </div>
        <div className="start-menu-items">
          {startMenuItems.map((item, i) => {
            if (item.type === 'separator') return <div key={i} className="start-menu-separator" />;
            if (item.adminOnly && !isAdmin) return null;
            let label = item.label, icon = item.icon;
            if (item.id === 'edit' && editMode) { label = item.editLabel || item.label; icon = item.editIcon || item.icon; }
            return (
              <button key={item.id || i} className="start-menu-item" onClick={() => handleAction(item)}>
                <span className="menu-item-icon">{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
