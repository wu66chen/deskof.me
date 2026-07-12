import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 文件重命名 Hook
 * 双击标签进入编辑模式
 */
export function useRename(onRename) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef(null);

  const startRename = useCallback((id, currentName) => {
    setRenamingId(id);
    setRenameValue(currentName);
  }, []);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue('');
  }, []);

  const confirmRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  }, [renamingId, renameValue, onRename]);

  // 自动聚焦输入框
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  return {
    renamingId,
    renameValue,
    setRenameValue,
    inputRef,
    startRename,
    cancelRename,
    confirmRename,
  };
}
