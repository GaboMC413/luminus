"use client";

import { useState, useEffect, Suspense } from "react";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { COUNTRIES, Country } from "@/utils/countries";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// Modular settings components
import { PersonalInfoSection } from "@/features/user-profile/components/settings/PersonalInfoSection";
import { EmailSection } from "@/features/user-profile/components/settings/EmailSection";
import { PhoneSection } from "@/features/user-profile/components/settings/PhoneSection";
import { PasswordSection } from "@/features/user-profile/components/settings/PasswordSection";
import { MembershipSection } from "@/features/user-profile/components/settings/MembershipSection";

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#FAF9F6] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[24px] invert brightness-0" />
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Cargando configuración...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [attentionCounter, setAttentionCounter] = useState(0);

  // Profile data states reactively synchronized to localStorage
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>({ code: 'XX', dial: '+00', name: 'Seleccionar país', priority: false });
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // Custom SuccessModal state for LUMINUS
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({ title: "", message: "" });

  const showSuccess = (title: string, message: string) => {
    setSuccessModalConfig({ title, message });
    setSuccessModalOpen(true);
  };

  // Load profile data from the active session and temporary local profile state.
  useEffect(() => {
    async function loadProfile() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        router.push("/auth/signin");
        return;
      }

      const data = await response.json();
      setEmail(data.user?.email ?? "");
    }

    loadProfile();

    setFirstName(localStorage.getItem("luminus_profile_firstName") || "");
    setLastName(localStorage.getItem("luminus_profile_lastName") || "");
    setProfession(localStorage.getItem("luminus_profile_profession") || "");

    const storedCity = localStorage.getItem("luminus_profile_city") || "";
    setCity(storedCity);

    const storedCountry = localStorage.getItem("luminus_profile_country") || "";
    setCountry(storedCountry);

    setGender(localStorage.getItem("luminus_profile_gender") || "");

    const storedBirthdate = localStorage.getItem("luminus_profile_birthdate") || "";
    if (storedBirthdate && storedBirthdate.includes("-")) {
      const parts = storedBirthdate.split("-");
      if (parts.length === 3) {
        setBirthdate(`${parts[2]} / ${parts[1]} / ${parts[0]}`);
      } else {
        setBirthdate(storedBirthdate);
      }
    } else {
      setBirthdate(storedBirthdate);
    }

    const storedPhone = localStorage.getItem("luminus_profile_phone") || "";
    if (storedPhone) {
      const matched = COUNTRIES.find(c => storedPhone.startsWith(c.dial));
      if (matched) {
        setPhoneCountry(matched);
        const rawNumber = storedPhone.slice(matched.dial.length).trim();
        setPhone(rawNumber);
      } else {
        setPhone(storedPhone);
      }
    } else {
      setPhone("");
    }

    let storedCreatedAt = localStorage.getItem("luminus_user_createdAt");
    if (!storedCreatedAt) {
      storedCreatedAt = new Date().toISOString();
      localStorage.setItem("luminus_user_createdAt", storedCreatedAt);
    }
    setCreatedAt(storedCreatedAt);

  }, [router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["personal", "email", "phone", "password", "membership"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Clear editing state when switching tabs
  useEffect(() => {
    setEditingFieldId(null);
  }, [activeTab]);

  const tabs = [
    { id: "personal", label: "Información personal", icon: "person" },
    { id: "email", label: "Email", icon: "mail" },
    { id: "phone", label: "Teléfono", icon: "call" },
    { id: "password", label: "Contraseña", icon: "lock" },
    { id: "membership", label: "Membresía", icon: "award_star" },
  ];

  return (
    <div className="flex-1 w-full flex flex-col bg-[#F8FAFC]">
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-8">
        <div className="w-full max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/user-profile"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900"
              title="Volver al perfil"
            >
              <span className="material-symbols-rounded text-[20px]">arrow_back</span>
            </Link>
            <h1 className="text-xl text-black font-semibold">Configuración de la cuenta</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

            {/* Sidebar Navigation */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-1 bg-white rounded-2xl border border-zinc-200/40 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-[14px] font-semibold group ${activeTab === tab.id
                    ? "bg-black text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <span className={`material-symbols-rounded text-[20px] transition-colors ${activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-zinc-200/40 p-6 md:p-10 shadow-none min-h-[400px]">
                {activeTab === "personal" && (
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
                    gender={gender}
                    setGender={setGender}
                    birthdate={birthdate}
                    setBirthdate={setBirthdate}
                    editingFieldId={editingFieldId}
                    setEditingFieldId={setEditingFieldId}
                    attentionCounter={attentionCounter}
                    setAttentionCounter={setAttentionCounter}
                  />
                )}
                {activeTab === "email" && (
                  <EmailSection
                    email={email}
                    setEmail={setEmail}
                    editingFieldId={editingFieldId}
                    setEditingFieldId={setEditingFieldId}
                    attentionCounter={attentionCounter}
                    setAttentionCounter={setAttentionCounter}
                    showSuccess={showSuccess}
                  />
                )}
                {activeTab === "phone" && (
                  <PhoneSection
                    phone={phone}
                    setPhone={setPhone}
                    phoneCountry={phoneCountry}
                    setPhoneCountry={setPhoneCountry}
                    editingFieldId={editingFieldId}
                    setEditingFieldId={setEditingFieldId}
                    attentionCounter={attentionCounter}
                    setAttentionCounter={setAttentionCounter}
                  />
                )}
                {activeTab === "password" && (
                  <PasswordSection
                    editingFieldId={editingFieldId}
                    setEditingFieldId={setEditingFieldId}
                    attentionCounter={attentionCounter}
                    setAttentionCounter={setAttentionCounter}
                    showSuccess={showSuccess}
                  />
                )}
                {activeTab === "membership" && (
                  <MembershipSection
                    createdAt={createdAt}
                    showSuccess={showSuccess}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title={successModalConfig.title}
        message={successModalConfig.message}
      />
    </div>
  );
}
