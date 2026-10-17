"use client";

import React from "react";

export default function SunriseBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-white"
      aria-hidden="true"
    >
      <style>{`
        /* Desktop Animated Horizontal Spectrum */
        @keyframes desktopSpectrumMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Mobile Breathing Aurora */
        @keyframes mobileAuroraPulse {
          0% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.05) translateY(-8px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        @media (min-width: 768px) {
          .luminus-desktop-gradient {
            display: block;
            background:
              linear-gradient(0deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.85) 40%, #ffffff 78%, #ffffff 100%),
              linear-gradient(90deg, #FF7700 0%, #E855C8 25%, #0450FB 50%, #A8C800 75%, #FF7700 100%);
            background-size: 100% 100%, 260% 100%;
            animation: desktopSpectrumMove 20s ease-in-out infinite;
            will-change: background-position;
          }
          .luminus-mobile-gradient {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .luminus-desktop-gradient {
            display: none;
          }
          .luminus-mobile-gradient {
            display: block;
            transform-origin: bottom center;
            animation: mobileAuroraPulse 14s ease-in-out infinite;
            will-change: transform;
            background:
              /* White wash overlay from top down to let bottom pastel sunrise glow */
              linear-gradient(180deg, #ffffff 0%, #ffffff 42%, rgba(255, 255, 255, 0.65) 68%, rgba(255, 255, 255, 0.35) 100%),
              /* Bottom-anchored multi-point LUMINUS pastel aurora */
              radial-gradient(circle at 12% 100%, rgba(255, 119, 0, 0.36) 0%, transparent 58%),
              radial-gradient(circle at 40% 100%, rgba(232, 85, 200, 0.32) 0%, transparent 58%),
              radial-gradient(circle at 72% 100%, rgba(4, 80, 251, 0.28) 0%, transparent 58%),
              radial-gradient(circle at 95% 100%, rgba(168, 200, 0, 0.28) 0%, transparent 58%),
              #ffffff;
          }
        }
      `}</style>

      {/* Desktop Viewport Gradient */}
      <div className="luminus-desktop-gradient absolute inset-0" />

      {/* Mobile Viewport Gradient (Custom tailored to portrait aspect ratio) */}
      <div className="luminus-mobile-gradient absolute inset-0" />

      {/* Subtle organic diffusion blur for extra satin finish */}
      <div className="absolute inset-x-0 bottom-0 h-[50vh] backdrop-blur-[35px] pointer-events-none opacity-50" />
    </div>
  );
}
