"use client";

import { Suspense } from "react";
import { ProfileContent } from "@/features/user-profile/components/ProfileContent";
import { ProfileSkeleton } from "@/components/ui/Skeleton";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
