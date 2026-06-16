"use client";

import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

interface ConfettiParticle {
  id: number;
  color: string;
  left: string;
  top: string;
  size: string;
  delay: string;
  duration: string;
  angle: string;
}

const CONFETTI_COLORS = ["#FF4B4B", "#CBBEFF", "#6649AE", "#FFB347", "#50C878", "#FFD700", "#FF69B4"];

function ConfettiExplosion() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    const temp: ConfettiParticle[] = [];
    for (let i = 0; i < 24; i++) {
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const angle = Math.random() * 360;
      const size = Math.floor(Math.random() * 6 + 6) + "px"; // 6px to 12px
      const delay = (Math.random() * 0.15).toFixed(2) + "s";
      const duration = (Math.random() * 1.2 + 0.8).toFixed(2) + "s";
      temp.push({
        id: i,
        color,
        left: "50%",
        top: "35%",
        size,
        delay,
        duration,
        angle: angle + "deg",
      });
    }
    setParticles(temp);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-confetti-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            animationFillMode: "both",
            "--particle-angle": p.angle,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Cerrar"
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 sm:bottom-8 sm:right-8 sm:left-auto sm:translate-x-0 z-[9999] w-[calc(100%-32px)] sm:w-[380px] bg-white rounded-2xl border border-slate-200 shadow-none flex flex-col overflow-hidden animate-in fade-in duration-300">
      <style>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(-35px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(-100px) scale(0.4);
          }
        }
        .animate-confetti-particle {
          animation-name: confetti-burst;
          animation-timing-function: cubic-bezier(0.15, 0.85, 0.35, 1);
        }
      `}</style>

      {/* Confetti Celebration Burst */}
      <ConfettiExplosion />

      {/* Top Gradient Banner Accent */}
      <div className="w-full h-3.5 luminus-gradient shrink-0" />

      {/* Content */}
      <div className="p-6 flex flex-col items-start text-left relative">
        
        {/* Title */}
        <h3 className="text-[15px] font-semibold text-slate-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        <div className="w-full flex justify-end">
          <Button
            onClick={onClose}
            variant="primary"
            className="!h-9 !text-xs !font-semibold px-5 bg-black hover:bg-zinc-900 text-white rounded-xl !w-auto"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
