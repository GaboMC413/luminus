import React from 'react';
import { useRouter } from 'next/navigation';
import { InterestPill } from './InterestPill';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    location: string;
    avatar: string;
    interests: string[];
  };
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = React.useState(false);
  
  const handleViewProfile = () => {
    router.push(`/comunidad/public-profile?id=${encodeURIComponent(user.id)}`);
  };

  const formatLocation = (loc: string) => {
    if (!loc) return "";
    const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length <= 2) return loc;
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  };

  const hasAvatar = user.avatar && !imgError;

  return (
    <div 
      onClick={handleViewProfile}
      className="bg-white rounded-2xl p-3 md:p-4 flex flex-col items-center gap-2.5 md:gap-3 border border-slate-200 transition-all group hover:border-slate-300 shadow-none cursor-pointer"
    >
      <div className="w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] md:w-[110px] md:h-[110px] rounded-[16px] sm:rounded-[18px] md:rounded-[22px] overflow-hidden bg-slate-50 shrink-0 border-4 border-white shadow-none group-hover:border-slate-200/50 transition-colors relative ring-1 ring-black/5 flex items-center justify-center">
        {hasAvatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-zinc-300 select-none !text-[44px] sm:!text-[56px] md:!text-[72px]">
              person
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 md:gap-1 text-center">
        <h3 className="text-sm md:text-base font-semibold text-slate-900 leading-tight line-clamp-1 font-jakarta px-1">
          {user.name}
        </h3>
        <p className="text-xs md:text-sm font-medium text-slate-500 font-sans tracking-wide">
          {formatLocation(user.location)}
        </p>
      </div>

      <div className="w-full flex flex-col gap-1.5 mt-1 md:mt-2">
        {/* Render interests on mobile & desktop with sm size */}
        <div className="flex md:hidden flex-col gap-1.5 w-full">
          {user.interests.slice(0, 3).map((interest: string, i: number) => (
            <InterestPill key={i} interest={interest} size="sm" />
          ))}
        </div>
        <div className="hidden md:flex flex-col gap-2 w-full">
          {user.interests.slice(0, 3).map((interest: string, i: number) => (
            <InterestPill key={i} interest={interest} size="sm" />
          ))}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewProfile();
        }}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline transition-colors mt-2 shrink-0 cursor-pointer bg-transparent border-none outline-none"
      >
        Ver perfil
      </button>
    </div>
  );
}

export default UserCard;
