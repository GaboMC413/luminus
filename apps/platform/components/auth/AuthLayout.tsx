import React from "react";
import { Sparkles, Heart } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-tr from-wellness-sand-50 via-white to-wellness-sage-50 text-wellness-slate-900">
      
      {/* Left: Calming Scenic Panel (Visible on lg+) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden bg-[#2C3B30] text-wellness-sand-50">
        
        {/* Calming glow spots (background animations) */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-wellness-sage-600/20 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-wellness-clay-500/10 blur-[80px] animate-float"></div>
        
        {/* Premium Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-wellness-sand-50/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
            <Heart className="w-4.5 h-4.5 text-wellness-sand-100 fill-wellness-sand-100/10" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-wellness-sand-100">
            Luminus
          </span>
        </div>

        {/* Dynamic Wellness Quote/Copy */}
        <div className="relative z-10 my-auto max-w-sm pl-4 border-l-2 border-wellness-sand-200/40">
          <p className="text-2xl font-normal leading-relaxed text-wellness-sand-100 tracking-wide">
            "A serene environment built for meaningful professional connections, wellbeing, and growth in Latin America."
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-wellness-sand-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Designed for wellbeing</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-wellness-sand-200/40 font-medium tracking-wide">
          © 2026 LUMINUS LATAM. All rights reserved.
        </div>
      </div>

      {/* Right: Focused Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 relative">
        {/* Small branding logo for mobile/tablet */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-8 h-8 bg-wellness-sage-500 rounded-full shadow-sm text-white">
            <Heart className="w-4 h-4 fill-white/10" />
          </div>
          <span className="text-sm font-extrabold tracking-widest uppercase text-wellness-sage-800">
            Luminus
          </span>
        </div>

        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-wellness-slate-900 leading-tight">
              {title}
            </h1>
            <p className="text-sm text-wellness-slate-500 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="animate-scale-in">
            {children}
          </div>
        </div>
      </div>
      
    </div>
  );
};
export default AuthLayout;
