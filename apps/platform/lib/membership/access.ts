/**
 * Membership and Mecenas domain access control.
 * Centralized logic for feature-gating and tier identification.
 */

export type MembershipTier = "GRATIS" | "MECENAS_MENSUAL" | "MECENAS_ANUAL";

export interface UserSubscriptionContext {
  tier?: string | null;
  stripeSubscriptionId?: string | null;
  selectedPlan?: string | null;
}

/**
 * Authoritative check to verify if a user has active Mecenas patron status.
 * Use this in API route guards and server actions before granting access to patron-only features.
 */
export function isMecenas(user?: UserSubscriptionContext | null): boolean {
  if (!user) return false;
  return user.tier === "MECENAS" || Boolean(user.stripeSubscriptionId);
}

/**
 * Returns human-readable labels and presentation details for a given tier.
 */
export function getMembershipDisplay(user?: UserSubscriptionContext | null) {
  const patron = isMecenas(user);

  if (!patron) {
    return {
      tierKey: "GRATIS" as MembershipTier,
      badgeLabel: "Gratis",
      title: "Plan Actual: Gratis",
      priceLabel: "USD 0",
      isMecenas: false,
      description: "Acceso estándar a la red y actividades de bienestar.",
    };
  }

  const isAnnual = user?.selectedPlan?.toLowerCase() === "annual";

  return {
    tierKey: (isAnnual ? "MECENAS_ANUAL" : "MECENAS_MENSUAL") as MembershipTier,
    badgeLabel: isAnnual ? "Mecenas Anual" : "Mecenas Mensual",
    title: isAnnual ? "Mecenas Anual" : "Mecenas Mensual",
    priceLabel: isAnnual ? "USD 45 / año" : "USD 5 / mes",
    isMecenas: true,
    description: "Acceso completo como Mecenas a la red LUMINUS.",
  };
}
