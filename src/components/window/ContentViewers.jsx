import { useState } from 'react';
import './ContentViewers.css';

/**
 * 图片查看器 — 带胶带装饰
 */
export function ImageViewer({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);

  const handleSaveUrl = () => {
    if (onUpdateContent) onUpdateContent(item.id, { url });
    setEditing(false);
  };

  return (
    <div className="viewer-container">
      {isEditMode && (
        <div className="viewer-toolbar">
          <button className="viewer-edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? '取消' : '✏️ 编辑 URL'}
          </button>
          {editing && (
            <div className="viewer-edit-row">
              <input
                className="viewer-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入图片 URL..."
              />
              <button className="viewer-save-btn" onClick={handleSaveUrl}>保存</button>
            </div>
          )}
        </div>
      )}
      <div className="viewer-content viewer-image">
        {url ? (
          <div className="polaroid-frame">
            <img src={url} alt={item.name} className="polaroid-img" />
            <div className="polaroid-caption">{item.name}</div>
            <div className="tape-piece tape-tl" />
            <div className="tape-piece tape-tr" />
          </div>
        ) : (
          <div className="viewer-placeholder">
            <span>🖼️</span>
            <p>暂无图片</p>
            {isEditMode && <p className="hint">点击"编辑 URL"添加图片链接</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 视频播放器 — 手绘播放按钮
 */
export function VideoPlayer({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleSaveUrl = () => {
    if (onUpdateContent) onUpdateContent(item.id, { url });
    setEditing(false);
  };

  return (
    <div className="viewer-container">
      {isEditMode && (
        <div className="viewer-toolbar">
          <button className="viewer-edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? '取消' : '✏️ 编辑 URL'}
          </button>
          {editing && (
            <div className="viewer-edit-row">
              <input
                className="viewer-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入视频 URL..."
              />
              <button className="viewer-save-btn" onClick={handleSaveUrl}>保存</button>
            </div>
          )}
        </div>
      )}
      <div className="viewer-content viewer-video">
        {url ? (
          <div className="video-wrapper">
            <video
              controls
              src={url}
              className="viewer-video-el"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          </div>
        ) : (
          <div className="viewer-placeholder">
            <span>🎬</span>
            <p>暂无视频</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Markdown 查看器
 */
export function MarkdownViewer({ item, isEditMode, onUpdateContent }) {
  const [content, setContent] = useState(item.content || '');
  const [editing, setEditing] = useState(false);

  const handleSaveContent = () => {
    if (onUpdateContent) onUpdateContent(item.id, { content });
    setEditing(false);
  };

  // 简单的 Markdown → HTML（后续可替换为 react-markdown）
  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="viewer-container">
      {isEditMode && (
        <div className="viewer-toolbar">
          <button className="viewer-edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? '👁️ 预览' : '✏️ 编辑'}
          </button>
          {editing && (
            <button className="viewer-save-btn" onClick={handleSaveContent}>
              💾 保存
            </button>
          )}
        </div>
      )}
      <div className="viewer-content viewer-markdown">
        {editing ? (
          <textarea
            className="markdown-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写点什么..."
          />
        ) : content ? (
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <div className="viewer-placeholder">
            <span>📝</span>
            <p>暂无内容</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 链接启动器
 */
export function LinkLauncher({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);

  const handleSaveUrl = () => {
    if (onUpdateContent) onUpdateContent(item.id, { url });
    setEditing(false);
  };

  return (
    <div className="viewer-container">
      {isEditMode && (
        <div className="viewer-toolbar">
          <button className="viewer-edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? '取消' : '✏️ 编辑链接'}
          </button>
          {editing && (
            <div className="viewer-edit-row">
              <input
                className="viewer-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入链接 URL..."
              />
              <button className="viewer-save-btn" onClick={handleSaveUrl}>保存</button>
            </div>
          )}
        </div>
      )}
      <div className="viewer-content viewer-link">
        {url ? (
          <div className="link-card">
            <div className="link-icon">🔗</div>
            <div className="link-info">
              <div className="link-name">{item.name}</div>
              <div className="link-url">{url}</div>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-open-btn"
              onClick={(e) => e.stopPropagation()}
            >
              打开链接 ↗
            </a>
          </div>
        ) : (
          <div className="viewer-placeholder">
            <span>🔗</span>
            <p>暂无链接</p>
          </div>
        )}
      </div>
    </div>
  );
}
