"use client";

import { useSettings } from "@/features/user-profile/context/SettingsContext";
import { PersonalInfoSection } from "@/features/user-profile/components/settings/PersonalInfoSection";
import { SettingsGhostLoader } from "@/features/user-profile/components/settings/SettingsGhostLoader";

export default function PersonalSettingsPage() {
  const {
    loadingProfile,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profession,
    setProfession,
    city,
    setCity,
    country,
    setCountry,
    birthdate,
    setBirthdate,
    editingFieldId,
    setEditingFieldId,
    attentionCounter,
    setAttentionCounter,
    saveProfile,
  } = useSettings();

  if (loadingProfile) {
    return <SettingsGhostLoader activeTab="personal" />;
  }

  return (
    <PersonalInfoSection
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      profession={profession}
      setProfession={setProfession}
      city={city}
      setCity={setCity}
      country={country}
      setCountry={setCountry}
      birthdate={birthdate}
      setBirthdate={setBirthdate}
      editingFieldId={editingFieldId}
      setEditingFieldId={setEditingFieldId}
      attentionCounter={attentionCounter}
      setAttentionCounter={setAttentionCounter}
      onProfileSave={saveProfile}
    />
  );
}
