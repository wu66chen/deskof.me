import { useState, useCallback, useRef } from 'react';

/**
 * 桌面图标拖拽
 */
export function useDrag(onDragEnd, gridSnap = true, gridSize = 80) {
  const [dragging, setDragging] = useState(null); // { id, startX, startY, offsetX, offsetY }
  const dragRef = useRef(null);

  const snapToGrid = useCallback((value) => {
    if (!gridSnap) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [gridSnap, gridSize]);

  const onMouseDown = useCallback((e, item) => {
    // 只在编辑模式或管理员时可拖拽
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging({
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      currentX: item.position.x,
      currentY: item.position.y,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - dragging.startX;
    const dy = e.clientY - dragging.startY;
    const newX = snapToGrid(dragging.currentX + dx);
    const newY = snapToGrid(dragging.currentY + dy);
    setDragging(prev => ({ ...prev, currentX: newX, currentY: newY }));
  }, [dragging, snapToGrid]);

  const onMouseUp = useCallback(() => {
    if (!dragging) return;
    onDragEnd(dragging.id, dragging.currentX, dragging.currentY);
    setDragging(null);
  }, [dragging, onDragEnd]);

  return { dragging, onMouseDown, onMouseMove, onMouseUp };
}
