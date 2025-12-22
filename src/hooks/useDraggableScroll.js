// src/hooks/useDraggableScroll.js
import { useState } from "react";

export function useDraggableScroll() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e, ref) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none"; // Impede selecionar texto
  };

  const onMouseLeave = (ref) => {
    setIsDragging(false);
    if (ref.current) {
        ref.current.style.cursor = "grab";
        ref.current.style.removeProperty('user-select');
    }
  };

  const onMouseUp = (ref) => {
    setIsDragging(false);
    if (ref.current) {
        ref.current.style.cursor = "grab";
        ref.current.style.removeProperty('user-select');
    }
  };

  const onMouseMove = (e, ref) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll (2x)
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return {
    events: (ref) => ({
      onMouseDown: (e) => onMouseDown(e, ref),
      onMouseLeave: () => onMouseLeave(ref),
      onMouseUp: () => onMouseUp(ref),
      onMouseMove: (e) => onMouseMove(e, ref),
    }),
    style: { cursor: "grab" }
  };
}