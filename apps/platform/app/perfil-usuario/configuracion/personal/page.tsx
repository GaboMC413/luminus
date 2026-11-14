"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SettingsGhostLoader } from "@/features/user-profile/components/settings/SettingsGhostLoader";

export default function PersonalSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/perfil-usuario?edit=personal");
  }, [router]);

  return <SettingsGhostLoader activeTab="personal" />;
}
