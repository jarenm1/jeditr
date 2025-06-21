import React, { useRef, useState } from "react";
import type { ModalPosition } from "./modalStore";

interface ModalProps {
  id: string;
  position: ModalPosition;
  pluginName: string;
  onClose: (id: string) => void;
  onDragEnd: (id: string, position: ModalPosition) => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  id,
  position,
  pluginName,
  onClose,
  onDragEnd,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    if (modalRef.current) {
      modalRef.current.style.left = `${newX}px`;
      modalRef.current.style.top = `${newY}px`;
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
    document.body.style.userSelect = "";
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    onDragEnd(id, { x: newX, y: newY });
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, offset]);

  return (
    <div
      ref={modalRef}
      className="fixed z-50 shadow-lg rounded bg-[var(--color-bg)] border border-[var(--color-secondary)]"
      style={{
        left: position.x,
        top: position.y,
        minWidth: 320,
        minHeight: 80,
      }}
    >
      <div
        className="cursor-move flex items-center justify-between px-4 py-2 bg-[var(--color-secondary)] rounded-t select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="font-bold text-[var(--color-fg)]">{pluginName}</span>
        <button
          className="ml-2 text-gray-400 hover:text-white text-lg leading-none"
          onClick={() => onClose(id)}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      <div className="p-4 text-[var(--color-fg)]">{children}</div>
    </div>
  );
};
