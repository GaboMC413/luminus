"use client";

import Link from "next/link";
import { ProfileButton } from "@/components/ui/Button";

interface ProfileMembershipCardProps {
  plan: string;
  createdAt: string;
}

export function ProfileMembershipCard({ plan, createdAt }: ProfileMembershipCardProps) {
  const getTrialEndDate = (dateStr: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setMonth(date.getMonth() + 3);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const trialEndDate = getTrialEndDate(createdAt);

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-200 flex flex-col gap-5 shadow-none relative group">
      <div className="w-full flex items-start gap-4">
        <div className="mt-1">
          <span className="material-symbols-rounded text-slate-400 text-[20px]">award_star</span>
        </div>
        <div className="flex flex-col min-w-0 self-center">
          <span className="text-body text-slate-900 font-semibold truncate">Membresía {plan || 'Free'}</span>
          <p className="text-green-600 text-[11px] font-medium leading-snug tracking-[-0.01em] font-sans mt-0.5 select-none">
            Acceso total hasta el {trialEndDate}
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-slate-50" />

      <Link href="/user-profile/settings?tab=membership" className="w-full">
        <ProfileButton
          onClick={() => { }}
          icon="autorenew"
          label="Gestionar membresía"
          className="w-full"
        />
      </Link>
    </div>
  );
}
