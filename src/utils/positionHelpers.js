/**
 * 位置辅助函数
 */
export function clampPosition(x, y, containerW, containerH, iconW = 80, iconH = 100) {
  return {
    x: Math.max(0, Math.min(x, containerW - iconW)),
    y: Math.max(0, Math.min(y, containerH - iconH)),
  };
}

export function snapToGrid(value, gridSize = 80) {
  return Math.round(value / gridSize) * gridSize;
}
