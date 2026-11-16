import { clearAllClientCache } from "@/lib/clientCache";

const USER_LOCAL_STORAGE_KEYS = [
  "luminus_profile_firstName",
  "luminus_profile_lastName",
  "luminus_profile_city",
  "luminus_profile_country",
  "luminus_profile_gender",
  "luminus_profile_birthdate",
  "luminus_profile_phone",
  "luminus_profile_profession",
  "luminus_profile_avatar",
  "luminus_profile_interests",
  "luminus_profile_otherInterests",
  "luminus_profile_bio",
  "luminus_profile_prompts",
  "luminus_profile_cover",
  "luminus_user_email",
  "luminus_user_role",
  "luminus_profile_plan",
  "luminus_onboarding_completed",
  "luminus_chats",
  "luminus_cached_user_id",
  "luminus_billing_city",
  "luminus_billing_country",
  "luminus_billing_country_code",
] as const;

/**
 * Clears all client-side in-memory caches and user-scoped localStorage entries
 * so switching accounts (e.g. Facebook <-> Google/email) cannot bleed stale data.
 */
export function clearClientUserSessionState(): void {
  clearAllClientCache();

  if (typeof window === "undefined") {
    return;
  }

  for (const key of USER_LOCAL_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage access errors in restricted browser contexts.
    }
  }
}
