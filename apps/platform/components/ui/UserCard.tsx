import React from 'react';
import { useRouter } from 'next/navigation';
import { INTEREST_CATEGORIES } from '@/utils/constants';

interface CategoryInfo {
  id?: string;
  name?: string;
  title?: string;
  icon?: string;
  iconFilled?: boolean;
  color?: string;
  bgColor?: string;
}

interface UserCardProps {
  user: {
    id: string;
    name: string;
    location: string;
    avatar: string;
    interests?: string[];
    categories?: CategoryInfo[];
  };
  actionMenu?: React.ReactNode;
}

export function UserCard({ user, actionMenu }: UserCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = React.useState(false);

  const isOfficial =
    user.name?.toLowerCase() === "luminus" ||
    user.id === "50d13047-bab8-44f1-9541-a821113845cc" ||
    user.id === "mock-luminus";

  const handleViewProfile = () => {
    if (isOfficial) return;
    router.push(`/comunidad/public-profile?id=${encodeURIComponent(user.id)}`);
  };

  const formatLocation = (loc: string) => {
    if (!loc) return "";
    const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length <= 2) return loc;
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  };

  const hasAvatar = user.avatar && !imgError;

  const categoriesToRender = React.useMemo(() => {
    if (user.categories && user.categories.length > 0) {
      return user.categories;
    }
    const uniqueCatsMap = new Map<string, CategoryInfo>();
    (user.interests || []).forEach((interestName) => {
      const cat = INTEREST_CATEGORIES.find((c) =>
        c.items.some((item) => item.toLowerCase() === interestName.toLowerCase())
      );
      if (cat && !uniqueCatsMap.has(cat.title)) {
        uniqueCatsMap.set(cat.title, {
          name: cat.title,
          icon: cat.icon,
          iconFilled: cat.iconFilled,
          color: cat.color,
        });
      }
    });
    return Array.from(uniqueCatsMap.values());
  }, [user.categories, user.interests]);

  return (
    <div
      onClick={isOfficial ? undefined : handleViewProfile}
      className={`relative bg-white rounded-2xl p-3 md:p-4 flex flex-col items-center gap-2.5 md:gap-3 border border-slate-200 transition-all ${
        isOfficial ? "cursor-default select-none shadow-none" : "group hover:border-slate-300 shadow-none cursor-pointer"
      }`}
    >
      {actionMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 z-10"
        >
          {actionMenu}
        </div>
      )}
      <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] md:w-[80px] md:h-[80px] rounded-[16px] sm:rounded-[18px] md:rounded-[22px] overflow-hidden bg-slate-50 shrink-0 border border-transparent group-hover:border-slate-200 transition-colors relative flex items-center justify-center">
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

      <div className="w-full flex flex-wrap items-center justify-center gap-2 md:gap-2.5 py-1 min-h-[34px] my-auto">
        {categoriesToRender.map((cat, i) => (
          <span
            key={i}
            className="material-symbols-outlined text-[22px] md:text-[25px] transition-transform hover:scale-110 select-none cursor-pointer"
            style={{
              color: cat.color || "#3B82F6",
              fontVariationSettings: cat.iconFilled !== false ? "'FILL' 1" : undefined,
            }}
            title={cat.name || cat.title || "Categoría"}
          >
            {cat.icon || "label"}
          </span>
        ))}
      </div>

      {!isOfficial && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewProfile();
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline transition-colors shrink-0 cursor-pointer bg-transparent border-none outline-none font-jakarta"
        >
          Ver perfil
        </button>
      )}
    </div>
  );
}

export default UserCard;
