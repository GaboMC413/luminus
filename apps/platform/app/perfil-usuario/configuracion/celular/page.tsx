"use client";

import { useSettings } from "@/features/user-profile/context/SettingsContext";
import { PhoneSection } from "@/features/user-profile/components/settings/PhoneSection";
import { SettingsGhostLoader } from "@/features/user-profile/components/settings/SettingsGhostLoader";

export default function PhoneSettingsPage() {
  const {
    loadingProfile,
    phone,
    setPhone,
    phoneCountry,
    setPhoneCountry,
    editingFieldId,
    setEditingFieldId,
    attentionCounter,
    setAttentionCounter,
    saveProfile,
  } = useSettings();

  if (loadingProfile) {
    return <SettingsGhostLoader activeTab="phone" />;
  }

  return (
    <PhoneSection
      phone={phone}
      setPhone={setPhone}
      phoneCountry={phoneCountry}
      setPhoneCountry={setPhoneCountry}
      editingFieldId={editingFieldId}
      setEditingFieldId={setEditingFieldId}
      attentionCounter={attentionCounter}
      setAttentionCounter={setAttentionCounter}
      onProfileSave={saveProfile}
    />
  );
}
