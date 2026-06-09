"use client";

import React, { useEffect } from 'react';
import { Button } from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Aceptar"
}: SuccessModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-none animate-in zoom-in-95 duration-200">
        
        {/* Animated Check Circle */}
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6 shrink-0 animate-bounce">
          <span className="material-symbols-rounded text-green-600 text-[32px] select-none">
            check_circle
          </span>
        </div>

        {/* Title */}
        <h3 className="text-card-title text-slate-900 font-bold mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-body-small text-slate-500 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Button */}
        <Button
          onClick={onClose}
          variant="primary"
          className="!h-11 !text-button !font-bold w-full bg-black hover:bg-zinc-900 text-white rounded-xl"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default SuccessModal;
