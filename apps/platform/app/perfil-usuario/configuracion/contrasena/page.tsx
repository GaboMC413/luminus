"use client";

import { useSettings } from "@/features/user-profile/context/SettingsContext";
import { PasswordSection } from "@/features/user-profile/components/settings/PasswordSection";
import { SettingsGhostLoader } from "@/features/user-profile/components/settings/SettingsGhostLoader";

export default function PasswordSettingsPage() {
  const {
    loadingProfile,
    editingFieldId,
    setEditingFieldId,
    attentionCounter,
    setAttentionCounter,
    showSuccess,
  } = useSettings();

  if (loadingProfile) {
    return <SettingsGhostLoader activeTab="password" />;
  }

  return (
    <PasswordSection
      editingFieldId={editingFieldId}
      setEditingFieldId={setEditingFieldId}
      attentionCounter={attentionCounter}
      setAttentionCounter={setAttentionCounter}
      showSuccess={showSuccess}
    />
  );
}
