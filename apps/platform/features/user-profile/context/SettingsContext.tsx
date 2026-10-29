"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, Country } from "@/utils/countries";

export interface SettingsContextType {
  loadingProfile: boolean;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  profession: string;
  setProfession: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  birthdate: string;
  setBirthdate: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  phoneCountry: Country;
  setPhoneCountry: (v: Country) => void;
  email: string;
  setEmail: (v: string) => void;
  createdAt: string;
  setCreatedAt: (v: string) => void;
  tier: string;
  setTier: (v: string) => void;
  memberSince: string | null;
  setMemberSince: (v: string | null) => void;
  selectedPlan: string;
  setSelectedPlan: (v: string) => void;
  cachedBillingDetails: any;
  setCachedBillingDetails: (v: any) => void;
  saveProfile: (payload: Record<string, unknown>) => Promise<unknown>;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
  showSuccess: (title: string, message: string) => void;
  successModalOpen: boolean;
  setSuccessModalOpen: (open: boolean) => void;
  successModalConfig: { title: string; message: string };
  closureModalOpen: boolean;
  setClosureModalOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [closureModalOpen, setClosureModalOpen] = useState(false);

  // Profile data states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>({
    code: "XX",
    dial: "+00",
    name: "Seleccionar país",
    priority: false,
  });
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [tier, setTier] = useState("FREE");
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("Monthly");
  const [cachedBillingDetails, setCachedBillingDetails] = useState<any>(null);

  // Inline editing & field attention states
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [attentionCounter, setAttentionCounter] = useState(0);

  // SuccessModal handler
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({ title: "", message: "" });

  const showSuccess = (title: string, message: string) => {
    setSuccessModalConfig({ title, message });
    setSuccessModalOpen(true);
  };

  // Load profile data from active session
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/auth/iniciar-sesion");
          return;
        }

        const data = await response.json();
        const profile = data.profile ?? {};
        setEmail(data.email ?? "");
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setProfession(profile.profession ?? "");
        setCity(profile.city ?? "");
        setCountry(profile.country ?? "");

        if (profile.birthdate) {
          const parts = String(profile.birthdate).split("-");
          setBirthdate(parts.length === 3 ? `${parts[2]} / ${parts[1]} / ${parts[0]}` : profile.birthdate);
        }

        const savedPhone = profile.phone_number ?? "";
        const matched = COUNTRIES.find((c) => savedPhone.startsWith(c.dial));
        if (matched) {
          setPhoneCountry(matched);
          setPhone(savedPhone.slice(matched.dial.length).trim());
        } else {
          setPhone(savedPhone);
        }
        setCreatedAt(profile.created_at || new Date().toISOString());
        setTier(data.tier ?? profile.tier ?? "FREE");
        setMemberSince(data.member_since ?? data.memberSince ?? profile.member_since ?? null);
        setSelectedPlan(profile.selectedPlan ?? profile.selected_plan ?? data.selectedPlan ?? "Monthly");
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [router]);

  const saveProfile = async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Could not save profile.");
    }

    return response.json();
  };

  return (
    <SettingsContext.Provider
      value={{
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
        phone,
        setPhone,
        phoneCountry,
        setPhoneCountry,
        email,
        setEmail,
        createdAt,
        setCreatedAt,
        tier,
        setTier,
        memberSince,
        setMemberSince,
        selectedPlan,
        setSelectedPlan,
        cachedBillingDetails,
        setCachedBillingDetails,
        saveProfile,
        editingFieldId,
        setEditingFieldId,
        attentionCounter,
        setAttentionCounter,
        showSuccess,
        successModalOpen,
        setSuccessModalOpen,
        successModalConfig,
        closureModalOpen,
        setClosureModalOpen,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
