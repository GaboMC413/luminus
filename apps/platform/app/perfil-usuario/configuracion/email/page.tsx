"use client";

import { useSettings } from "@/features/user-profile/context/SettingsContext";
import { EmailSection } from "@/features/user-profile/components/settings/EmailSection";
import { SettingsGhostLoader } from "@/features/user-profile/components/settings/SettingsGhostLoader";

export default function EmailSettingsPage() {
  const {
    loadingProfile,
    email,
    setEmail,
    editingFieldId,
    setEditingFieldId,
    attentionCounter,
    setAttentionCounter,
    showSuccess,
  } = useSettings();

  if (loadingProfile) {
    return <SettingsGhostLoader activeTab="email" />;
  }

  return (
    <EmailSection
      email={email}
      setEmail={setEmail}
      editingFieldId={editingFieldId}
      setEditingFieldId={setEditingFieldId}
      attentionCounter={attentionCounter}
      setAttentionCounter={setAttentionCounter}
      showSuccess={showSuccess}
    />
  );
}
