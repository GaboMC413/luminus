import React from 'react';
import { useRouter } from 'next/navigation';
import { InterestPill } from './InterestPill';

interface UserCardProps {
  user: {
    name: string;
    location: string;
    avatar: string;
    interests: string[];
  };
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  
  const handleViewProfile = () => {
    // Special case for Nancy Núñez as currently implemented in the platform
    if (user.name === "Nancy Núñez") {
      router.push("/comunidad/public-profile");
    }
  };

  return (
    <div className="bg-white rounded-[28px] p-4 flex flex-col items-center gap-3 border border-slate-200 transition-all group hover:border-slate-300 shadow-none">
      <div className="w-[88px] h-[88px] md:w-[110px] md:h-[110px] rounded-3xl overflow-hidden bg-slate-50 shrink-0 border-4 border-white shadow-none group-hover:border-slate-200/50 transition-colors relative ring-1 ring-black/5">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-[15px] md:text-[18px] font-medium text-slate-900 leading-tight line-clamp-1 font-jakarta px-1">
          {user.name}
        </h3>
        <p className="text-[11px] md:text-[13px] font-medium text-slate-400 font-sans tracking-wide">
          {user.location}
        </p>
      </div>

      <div className="w-full flex flex-col gap-2 mt-2">
        {user.interests.slice(0, 3).map((interest: string, i: number) => (
          <InterestPill key={i} interest={interest} />
        ))}
      </div>

      <button
        onClick={handleViewProfile}
        className="mt-2 text-slate-400 text-[12px] font-semibold hover:text-black transition-all uppercase tracking-widest font-jakarta border-none bg-transparent cursor-pointer"
      >
        Ver Perfil
      </button>
    </div>
  );
}

export default UserCard;
