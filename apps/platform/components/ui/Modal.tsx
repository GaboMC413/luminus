"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  backdropClassName?: string;
  containerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  hideDividers?: boolean;
  disableInnerScroll?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '520px',
  backdropClassName,
  containerClassName,
  headerClassName,
  contentClassName,
  footerClassName,
  hideDividers = false,
  disableInnerScroll = false,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling on page when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverscroll = document.body.style.overscrollBehavior;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overscrollBehavior = prevBodyOverscroll;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className={`fixed inset-0 ${backdropClassName || "bg-black/60 backdrop-blur-sm"} z-[9999] overflow-y-auto overscroll-contain custom-scrollbar animate-in fade-in duration-200`}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className={`w-full bg-white rounded-[16px] overflow-hidden flex flex-col ${containerClassName || "shadow-none"} animate-in zoom-in-95 duration-200`}
          style={{ maxWidth }}
        >
          {/* Header */}
          <div className={`flex justify-between items-start shrink-0 ${hideDividers ? "" : "border-b border-slate-100/70"} ${headerClassName || "px-5 py-4 md:px-8 md:py-5"}`}>
            <div className="flex flex-col gap-1 pr-4">
              <h3 className="font-sans font-bold text-black text-[15px] md:text-base leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 font-sans font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none outline-none shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className={`${disableInnerScroll ? "" : "overflow-y-auto max-h-[75vh] custom-scrollbar"} ${contentClassName || "p-5 py-5 md:p-8 md:py-6"}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={`mt-auto shrink-0 ${hideDividers ? "" : "border-t border-slate-50"} relative z-10 bg-white ${footerClassName || "flex flex-col-reverse md:flex-row gap-2.5 md:gap-4 px-5 pt-4 pb-5 md:px-8 md:py-6"}`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
