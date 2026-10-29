"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from "lucide-react";

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
  hideDividers = true,
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
          <div className={`flex justify-between items-start shrink-0 ${hideDividers ? "" : "border-b border-slate-100/70"} ${headerClassName || "px-6 pt-6 pb-4 sm:px-7 sm:pt-7 sm:pb-4"}`}>
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
              aria-label="Cerrar modal"
              title="Cerrar modal"
              className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none outline-none shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className={`${disableInnerScroll ? "" : "overflow-y-auto max-h-[75vh] custom-scrollbar"} ${contentClassName || (footer ? "px-6 py-0 sm:px-7" : "px-6 pb-6 pt-1 sm:px-7 sm:pb-7 sm:pt-1")}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={`mt-auto shrink-0 ${hideDividers ? "" : "border-t border-slate-50"} relative z-10 bg-white ${footerClassName || "flex flex-col-reverse md:flex-row gap-3 px-6 pb-6 pt-4 sm:px-7 sm:pb-7 sm:pt-4"}`}>
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
