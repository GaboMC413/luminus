"use client";

import { useState, useEffect } from "react";
import { isMecenas, getMembershipDisplay, MembershipTier } from "@/lib/membership/access";

export interface MembershipState {
  loading: boolean;
  isMecenas: boolean;
  tierKey: MembershipTier;
  badgeLabel: string;
  title: string;
  priceLabel: string;
  memberSince?: string | null;
  email?: string;
  refetch: () => Promise<void>;
}

/**
 * Client-side hook to access current user membership state and feature gating.
 * Example:
 * const { isMecenas, loading } = useMembership();
 * if (!isMecenas) return <MecenasLockBanner />;
 */
export function useMembership(): MembershipState {
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("FREE");
  const [selectedPlan, setSelectedPlan] = useState<string>("Monthly");
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTier(data.tier || "FREE");
        setEmail(data.email || "");
        setMemberSince(data.member_since || null);
        setSelectedPlan(data.profile?.selectedPlan || "Monthly");
        setStripeSubscriptionId(data.stripeSubscriptionId || null);
      }
    } catch {
      // Fallback to default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const display = getMembershipDisplay({ tier, stripeSubscriptionId, selectedPlan });

  return {
    loading,
    isMecenas: display.isMecenas,
    tierKey: display.tierKey,
    badgeLabel: display.badgeLabel,
    title: display.title,
    priceLabel: display.priceLabel,
    memberSince,
    email,
    refetch: fetchStatus,
  };
}
