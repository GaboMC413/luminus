"use client";

import { Suspense } from "react";
import { ProfileContent } from "@/features/user-profile/components/ProfileContent";
import { PageLoader } from "@/components/ui/PageLoader";

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProfileContent />
    </Suspense>
  );
}
