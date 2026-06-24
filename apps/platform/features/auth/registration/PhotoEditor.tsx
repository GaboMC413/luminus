"use client";

import React, { useRef, useState, useEffect } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button } from '@/components/ui/Button';

interface PhotoEditorProps {
  image: string;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
}

export function PhotoEditor({ image, onSave, onCancel }: PhotoEditorProps) {
  const [zoom, setZoom] = useState(1);
  const editorRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // We keep a mutable ref for the current zoom to avoid stale closures in event listeners
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const touchStartRef = useRef<{ distance: number; zoom: number } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const getDistance = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        touchStartRef.current = {
          distance: dist,
          zoom: zoomRef.current,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartRef.current) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const scale = dist / touchStartRef.current.distance;
        let newZoom = touchStartRef.current.zoom * scale;
        newZoom = Math.max(1, Math.min(newZoom, 3));
        setZoom(newZoom);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartRef.current = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      let newZoom = zoomRef.current - e.deltaY * 0.002;
      newZoom = Math.max(1, Math.min(newZoom, 3));
      setZoom(newZoom);
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleSave = async () => {
    if (!editorRef.current) return;

    // Get the cropped image as a Canvas
    const canvas = editorRef.current.getImageScaledToCanvas();

    // Convert canvas to Blob (Optimized WebP)
    const croppedImage: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((blob: any) => resolve(blob), 'image/webp', 0.85);
    });

    if (croppedImage) {
      onSave(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white rounded-[16px] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-8 py-5">
          <h3 className="font-jakarta font-bold text-black text-[14px]">
            Ajusta tu foto
          </h3>

          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-300 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div 
          ref={wrapperRef}
          className="relative w-full aspect-square bg-[#f8fafc] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={380}
            height={380}
            border={0}
            borderRadius={0}
            color={[0, 0, 0, 0.4]}
            scale={zoom}
            rotate={0}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Rule of Thirds Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical lines */}
            <div className="absolute inset-0 flex justify-evenly">
              <div className="w-[1px] h-full bg-white/20 shadow-none"></div>
              <div className="w-[1px] h-full bg-white/20 shadow-none"></div>
            </div>
            {/* Horizontal lines */}
            <div className="absolute inset-0 flex flex-col justify-evenly">
              <div className="h-[1px] w-full bg-white/20 shadow-none"></div>
              <div className="h-[1px] w-full bg-white/20 shadow-none"></div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#2563EB] cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
            />
          </div>

          <div className="flex gap-4 py-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 !h-11 !text-[13px] !font-normal !normal-case !tracking-normal"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1 !h-11 !text-[13px] !font-normal"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PhotoEditor;
