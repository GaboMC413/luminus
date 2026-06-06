"use client";

import { ProfileButton } from "@/components/ui/Button";

interface ProfileHeaderCoverProps {
 coverUrl: string;
 onChangeCover?: () => void;
 isPublic?: boolean;
}

export function ProfileHeaderCover({ coverUrl, onChangeCover, isPublic = false }: ProfileHeaderCoverProps) {
 const hasCover = coverUrl && coverUrl !== "" && !coverUrl.includes("empty");

 return (
  <div className={`hidden md:block w-full md:h-[180px] lg:h-[240px] overflow-hidden relative shrink-0 group ${!hasCover ? 'luminus-gradient' : 'bg-slate-200'}`}>
   {hasCover && (
    <img
     src={coverUrl}
     alt="Profile Cover"
     className="w-full h-full object-cover"
    />
   )}
   {!isPublic && onChangeCover && (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
     <div className="w-full max-w-7xl mx-auto px-2 md:px-8 h-full relative">
      <div className="w-full max-w-6xl mx-auto h-full relative">
       <ProfileButton
        onClick={onChangeCover}
        icon="photo_camera"
        label={hasCover ? "Cambiar portada" : "Seleccionar portada"}
        className="absolute bottom-4 right-0 pointer-events-auto"
       />
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
