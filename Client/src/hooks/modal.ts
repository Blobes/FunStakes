import { useState, useCallback } from "react";

type Axis = "x" | "y";
type Direction = "ltr" | "rtl"; // Left-to-Right or Right-to-Left

interface DragConfig {
  axis: Axis;
  direction?: Direction; // Required if axis is "x"
  threshold?: number; // Pixels to drag before triggering close
  onClose?: () => void;
}

export const useDragClose = (config: DragConfig) => {
  const [startPos, setStartPos] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const {
    axis,
    direction,
    threshold = axis === "y" ? 150 : 250,
    onClose,
  } = config;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Save starting point based on axis
      const pos = axis === "y" ? e.touches[0].clientY : e.touches[0].clientX;
      setStartPos(pos);
    },
    [axis],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const currentPos =
        axis === "y" ? e.touches[0].clientY : e.touches[0].clientX;
      const diff = currentPos - startPos;

      if (axis === "y") {
        // Y-axis: Only allow dragging downwards (positive diff)
        if (diff > 0) setDragOffset(diff);
      } else {
        // X-axis: Check direction
        if (direction === "ltr" && diff > 0) {
          setDragOffset(diff);
        } else if (direction === "rtl" && diff < 0) {
          setDragOffset(Math.abs(diff));
        }
      }
    },
    [axis, direction, startPos],
  );

  const handleTouchEnd = useCallback(() => {
    if (dragOffset > threshold) {
      if (onClose) onClose();
    }
    setDragOffset(0);
  }, [dragOffset, threshold, onClose]);

  return {
    axis,
    dragOffset,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
