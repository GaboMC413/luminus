"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AdminHeader() {
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  useEffect(() => {
    const storedFirst = localStorage.getItem("luminus_profile_firstName") || "";
    const storedLast = localStorage.getItem("luminus_profile_lastName") || "";
    const fullName = `${storedFirst} ${storedLast}`.trim();
    if (fullName) {
      setProfileName(fullName);
    } else {
      const storedEmail = localStorage.getItem("luminus_user_email") || "Usuario";
      setProfileName(storedEmail.split("@")[0]);
    }

    const storedAvatar = localStorage.getItem("luminus_profile_avatar") || "";
    setProfileAvatar(storedAvatar);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[64px] bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left: Logo & Admin badge */}
      <div className="flex items-center gap-3">
        <Link href="/comunidad" className="flex items-center gap-2.5">
          <img src="/logo-luminus-black.svg" alt="Luminus" className="hidden sm:block h-[20px] cursor-pointer" />
          <img src="/iso-logo-black.svg" alt="Luminus" className="sm:hidden h-[24px] cursor-pointer" />
        </Link>
        <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 rounded-md border border-slate-200">
          Admin
        </span>
      </div>

      {/* Right: Go to Platform button & Static user profile display */}
      <div className="flex items-center gap-3">
        <Link
          href="/comunidad"
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-black hover:bg-slate-50 transition-all text-xs font-semibold shadow-xs"
        >
          <span className="material-symbols-rounded text-[20px]">arrow_circle_left</span>
          <span>Ir a la plataforma</span>
        </Link>

        {/* Static Profile Display */}
        <div className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt="Perfil"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] object-cover"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-slate-400 text-[20px]">person</span>
            </div>
          )}
          <span className="hidden sm:block text-sm font-semibold text-slate-800">
            {profileName || "Usuario"}
          </span>
        </div>
      </div>
    </header>
  );
}

