"use client";

import { useState, useEffect, Suspense } from "react";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { COUNTRIES, Country } from "@/utils/countries";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Lock, Award, Trash2 } from "lucide-react";

// Modular settings components
import { PersonalInfoSection } from "@/features/user-profile/components/settings/PersonalInfoSection";
import { EmailSection } from "@/features/user-profile/components/settings/EmailSection";
import { PhoneSection } from "@/features/user-profile/components/settings/PhoneSection";
import { PasswordSection } from "@/features/user-profile/components/settings/PasswordSection";
import { MembershipSection } from "@/features/user-profile/components/settings/MembershipSection";
import { SettingsGhostLoader } from "@/features/user-profile/components/settings/SettingsGhostLoader";
import { AccountClosureModal } from "@/features/user-profile/components/settings/AccountClosureModal";

import { PageLoader } from "@/components/ui/PageLoader";

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [mobileView, setMobileView] = useState<'menu' | 'content'>('menu');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [attentionCounter, setAttentionCounter] = useState(0);

  // Loading state flag to power ghost skeleton loading and prevent flashing fallback data
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Account closure modal state
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
    code: 'XX',
    dial: '+00',
    name: 'Seleccionar país',
    priority: false
  });
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [tier, setTier] = useState("FREE");
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("Monthly");
  const [cachedBillingDetails, setCachedBillingDetails] = useState<any>(null);

  // Custom SuccessModal state for LUMINUS
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({ title: "", message: "" });

  const showSuccess = (title: string, message: string) => {
    setSuccessModalConfig({ title, message });
    setSuccessModalOpen(true);
  };

  // Load profile data from the active session
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["personal", "email", "phone", "password", "membership"].includes(tab)) {
      setActiveTab(tab);
      setMobileView('content');
    }
  }, [searchParams]);

  // Clear editing state when switching tabs
  useEffect(() => {
    setEditingFieldId(null);
  }, [activeTab]);

  const tabs = [
    { id: "personal", label: "Información personal", icon: User },
    { id: "email", label: "Email", icon: Mail },
    { id: "phone", label: "Celular", icon: Phone },
    { id: "password", label: "Contraseña", icon: Lock },
    { id: "membership", label: "Membresía y pagos", icon: Award },
  ];

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-50 font-sans selection:bg-slate-200">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-6 md:py-8">
        <div className="w-full max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5 md:mb-7">
            {/* On mobile, if we are in content view, clicking back goes to the menu view */}
            <div className="md:hidden">
              {mobileView === 'content' ? (
                <button
                  onClick={() => setMobileView('menu')}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900 cursor-pointer shadow-none"
                  title="Volver al menú de ajustes"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  href="/perfil-usuario"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900 shadow-none"
                  title="Volver al perfil"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Tablet/Desktop back link */}
            <div className="hidden md:block">
              <Link
                href="/perfil-usuario"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900 shadow-none"
                title="Volver al perfil"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            <h1 className="text-xl md:text-2xl text-slate-900 font-bold font-jakarta tracking-tight m-0">
              <span className="md:inline hidden">Configuración de la cuenta</span>
              <span className="md:hidden">
                {mobileView === 'menu' ? 'Configuración de la cuenta' : tabs.find(t => t.id === activeTab)?.label}
              </span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-5 lg:gap-8 items-start w-full">

            {/* Sidebar Navigation */}
            <div className={`w-full md:w-16 lg:w-60 xl:w-64 shrink-0 flex flex-col gap-3 ${mobileView === 'menu' ? 'flex' : 'hidden md:flex'}`}>
              <div className="flex flex-col gap-1 bg-white rounded-2xl border border-slate-200/90 p-2 shadow-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileView('content');
                      }}
                      title={tab.label}
                      className={`flex items-center text-left md:justify-center lg:justify-start gap-3 px-4 md:px-0 lg:px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold font-jakarta group cursor-pointer ${activeTab === tab.id
                        ? "bg-slate-900 text-white shadow-none"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <Icon className={`w-[18px] h-[18px] transition-colors shrink-0 ${activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`} />
                      <span className="inline md:hidden lg:inline truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setClosureModalOpen(true)}
                title="Cerrar cuenta"
                aria-label="Cerrar cuenta"
                className="w-full flex items-center text-left md:justify-center lg:justify-start gap-3 px-4 md:px-0 lg:px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold font-jakarta group bg-rose-50/50 text-rose-600 hover:bg-rose-100/70 border border-rose-200/60 cursor-pointer active:scale-[0.99] select-none"
              >
                <Trash2 className="w-[18px] h-[18px] text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
                <span className="inline md:hidden lg:inline truncate">Cerrar cuenta</span>
              </button>
            </div>

            {/* Content Area */}
            <div className={`flex-1 w-full min-w-0 ${mobileView === 'content' ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
              <div className={`${activeTab === 'membership' ? 'bg-transparent border-0 p-0 md:bg-white md:rounded-2xl md:border md:border-slate-200/90 md:p-7' : 'bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 md:p-7'} shadow-none min-h-0 md:min-h-[460px]`}>
                {loadingProfile ? (
                  <SettingsGhostLoader activeTab={activeTab} />
                ) : (
                  <>
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
                        birthdate={birthdate}
                        setBirthdate={setBirthdate}
                        editingFieldId={editingFieldId}
                        setEditingFieldId={setEditingFieldId}
                        attentionCounter={attentionCounter}
                        setAttentionCounter={setAttentionCounter}
                        onProfileSave={saveProfile}
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
                        onProfileSave={saveProfile}
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
                        memberSince={memberSince}
                        tier={tier}
                        selectedPlan={selectedPlan}
                        email={email}
                        showSuccess={showSuccess}
                        cachedBillingDetails={cachedBillingDetails}
                        onBillingDetailsLoaded={setCachedBillingDetails}
                      />
                    )}
                  </>
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

      {/* Empathetic Account Closure Modal */}
      <AccountClosureModal
        isOpen={closureModalOpen}
        onClose={() => setClosureModalOpen(false)}
        tier={tier}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
