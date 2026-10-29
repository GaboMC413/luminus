"use client";

import { useSettings } from "@/features/user-profile/context/SettingsContext";
import { MembershipSection } from "@/features/user-profile/components/settings/MembershipSection";
import { SettingsGhostLoader } from "@/features/user-profile/components/settings/SettingsGhostLoader";

export default function MembershipSettingsPage() {
  const {
    loadingProfile,
    createdAt,
    memberSince,
    tier,
    selectedPlan,
    email,
    showSuccess,
    cachedBillingDetails,
    setCachedBillingDetails,
  } = useSettings();

  if (loadingProfile) {
    return <SettingsGhostLoader activeTab="membership" />;
  }

  return (
    <MembershipSection
      createdAt={createdAt}
      memberSince={memberSince}
      tier={tier}
      selectedPlan={selectedPlan}
      email={email}
      showSuccess={showSuccess}
      cachedBillingDetails={cachedBillingDetails}
      onBillingDetailsLoaded={setCachedBillingDetails}
    />
  );
}
