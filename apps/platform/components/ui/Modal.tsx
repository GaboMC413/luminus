"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  backdropClassName?: string;
  containerClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '520px',
  backdropClassName,
  containerClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className={`fixed inset-0 ${backdropClassName || "bg-black/60 backdrop-blur-sm"} z-[9999] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar animate-in fade-in duration-200`}>
      <div
        className={`w-full bg-white rounded-[16px] overflow-hidden flex flex-col ${containerClassName || "shadow-none"} animate-in zoom-in-95 duration-200`}
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 md:px-8 md:py-5 shrink-0 border-b border-slate-50">
          <h3 className="font-sans font-bold text-black text-[13px] md:text-[14px]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-300 cursor-pointer bg-transparent border-none outline-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 py-5 md:p-8 md:py-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pt-4 pb-5 md:px-8 md:py-6 flex flex-col-reverse md:flex-row gap-2.5 md:gap-4 mt-auto shrink-0 border-t border-slate-50 relative z-10 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
