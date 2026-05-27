"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { LocationInput } from "@/components/ui/LocationInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { COUNTRIES, Country } from "@/utils/countries";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const MONTHS = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => {
  const d = (i + 1).toString().padStart(2, '0');
  return { label: d, value: d };
});

const currentYearNum = new Date().getFullYear();
const YEARS = Array.from({ length: currentYearNum - 1900 + 1 }, (_, i) => {
  const y = (currentYearNum - i).toString();
  return { label: y, value: y };
});

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
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/user-profile"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900"
              title="Volver al perfil"
            >
              <span className="material-symbols-rounded text-[24px]">arrow_back</span>
            </Link>
            <h1 className="text-page-title">Configuración de la cuenta</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

            {/* Sidebar Navigation */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-1 bg-white rounded-2xl border border-slate-200 p-2 shadow-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-[14px] font-semibold group ${activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-none animate-premium"
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
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-none min-h-[400px]">
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
                  />
                )}
                {activeTab === "membership" && <MembershipSection />}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const normalizeDate = (val: string): string => {
  let clean = val.replace(/\s+/g, '');
  if (!clean) return "";

  if (/^\d{8}$/.test(clean)) {
    return `${clean.slice(0, 2)} / ${clean.slice(2, 4)} / ${clean.slice(4)}`;
  }
  
  if (/^\d{6}$/.test(clean)) {
    const year = parseInt(clean.slice(4));
    const fullYear = year > 26 ? '19' + year : '20' + year;
    return `${clean.slice(0, 2)} / ${clean.slice(2, 4)} / ${fullYear}`;
  }

  if (clean.includes('/')) {
    const parts = clean.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 1) {
      if (parts[0].length === 1) parts[0] = '0' + parts[0];
      else if (parts[0].length > 2) parts[0] = parts[0].slice(0, 2);
    }
    if (parts.length >= 2) {
      if (parts[1].length === 1) parts[1] = '0' + parts[1];
      else if (parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
    }
    if (parts.length >= 3) {
      if (parts[2].length === 2) {
        const yearNum = parseInt(parts[2]);
        parts[2] = (yearNum > 26 ? '19' : '20') + parts[2];
      } else if (parts[2].length > 4) {
        parts[2] = parts[2].slice(0, 4);
      }
    }
    
    let formatted = '';
    if (parts[0]) formatted += parts[0];
    if (parts[1]) formatted += ' / ' + parts[1];
    if (parts[2]) formatted += ' / ' + parts[2];
    return formatted;
  }

  const digits = clean.replace(/\D/g, '').slice(0, 8);
  if (digits.length >= 5) {
    return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
  } else if (digits.length >= 3) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }
  return digits;
};

const isValidBirthdate = (val: string): boolean => {
  const clean = val.replace(/\s+/g, '');
  const parts = clean.split('/').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
  if (parts.length !== 3) return false;
  
  const [day, month, year] = parts;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;
  
  return true;
};

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1.5 mb-8">
      <h2 className="text-[20px] font-bold text-slate-900 tracking-tight font-jakarta">{title}</h2>
      {description && <p className="text-slate-500 text-[14px] leading-relaxed font-jakarta">{description}</p>}
    </div>
  );
}

interface EditableFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  isDate?: boolean;
  isSelect?: boolean;
  isLocation?: boolean;
  isPhone?: boolean;
  phoneCountry?: any;
  onCountryChange?: (country: any) => void;
  options?: string[];
  className?: string;
  onSave?: (newValue: string, extraValue?: string) => void;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
}

function EditableField({
  id,
  label,
  value,
  placeholder,
  type = "text",
  isDate = false,
  isSelect = false,
  isLocation = false,
  isPhone = false,
  phoneCountry,
  onCountryChange,
  options = [],
  className = "",
  onSave,
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter
}: EditableFieldProps) {
  const isEditing = editingFieldId === id;
  const isAnotherEditing = editingFieldId !== null && editingFieldId !== id;
  const [currentValue, setCurrentValue] = useState(value);
  const [birthdateString, setBirthdateString] = useState(value);
  const [extraValue, setExtraValue] = useState("");
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const lastAttentionRef = useRef(attentionCounter);

  // Split birthdate states
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [dateError, setDateError] = useState("");

  // Sync state with incoming value
  useEffect(() => {
    setCurrentValue(value);
    if (isDate) {
      setBirthdateString(value);
      const parts = value.split(" / ");
      if (parts.length === 3) {
        setBirthDay(parts[0]);
        setBirthMonth(parts[1]);
        setBirthYear(parts[2]);
      } else {
        setBirthDay("");
        setBirthMonth("");
        setBirthYear("");
      }
      setDateError("");
    }
  }, [value, isDate]);

  // Watch for attention requests from other fields
  useEffect(() => {
    if (isEditing && attentionCounter > lastAttentionRef.current) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 400);
      lastAttentionRef.current = attentionCounter;
      return () => clearTimeout(timer);
    }
    lastAttentionRef.current = attentionCounter;
  }, [attentionCounter, isEditing]);

  // Reset errors when editing starts
  useEffect(() => {
    if (isEditing && isDate) {
      setDateError("");
    }
  }, [isEditing, isDate]);

  const handleEditClick = () => {
    if (isAnotherEditing) {
      setAttentionCounter(prev => prev + 1);
      return;
    }
    setEditingFieldId(id);
  };

  const handleSave = () => {
    if (isDate) {
      // Pad single digits
      const paddedDay = birthDay.length === 1 ? '0' + birthDay : birthDay;
      const paddedMonth = birthMonth.length === 1 ? '0' + birthMonth : birthMonth;
      let fullYear = birthYear;
      if (birthYear.length === 2) {
        const yr = parseInt(birthYear);
        fullYear = (yr > 26 ? '19' : '20') + birthYear;
      }

      const normalized = `${paddedDay} / ${paddedMonth} / ${fullYear}`;
      
      if (birthDay || birthMonth || birthYear) {
        if (!isValidBirthdate(normalized)) {
          setDateError("Fecha inválida");
          return;
        }
      }
      
      onSave?.(normalized, extraValue);
    } else {
      onSave?.(currentValue, extraValue);
    }
    setDateError("");
    setEditingFieldId(null);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    if (isDate) {
      setBirthdateString(value);
      const parts = value.split(" / ");
      if (parts.length === 3) {
        setBirthDay(parts[0]);
        setBirthMonth(parts[1]);
        setBirthYear(parts[2]);
      } else {
        setBirthDay("");
        setBirthMonth("");
        setBirthYear("");
      }
    }
    setDateError("");
    setEditingFieldId(null);
  };

  return (
    <div className={`flex flex-col gap-2 w-full max-w-lg relative ${className}`}>
      <label className="text-label ml-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {isSelect ? (
            <SelectInput
              value={currentValue}
              options={options.map(opt => ({ label: opt, value: opt }))}
              onSelect={(val) => isEditing && setCurrentValue(val)}
              disabled={!isEditing}
              className={`${!isEditing ? "[&_.reg-input-bordered]:bg-slate-50 [&_.reg-input-bordered]:!border-none pointer-events-none" : "[&_.reg-input-bordered]:bg-white [&_.reg-input-bordered]:border-black"}`}
            />
          ) : isLocation ? (
            <LocationInput
              defaultValue={currentValue}
              onSelect={({ city: selCity, country: selCountry }) => {
                if (isEditing) {
                  setCurrentValue(selCity);
                  setExtraValue(selCountry);
                }
              }}
              disabled={!isEditing}
              className={`${!isEditing ? "[&_.reg-input-bordered]:bg-slate-50 [&_.reg-input-bordered]:!border-none pointer-events-none" : "[&_.reg-input-bordered]:bg-white [&_.reg-input-bordered]:border-black"}`}
            />
          ) : isPhone ? (
            <PhoneInput
              value={currentValue}
              phoneCountry={phoneCountry}
              onCountryChange={(country) => {
                if (isEditing && onCountryChange) onCountryChange(country);
              }}
              onChange={(val) => isEditing && setCurrentValue(val)}
              disabled={!isEditing}
              className={`${!isEditing ? "!bg-slate-50 !border-none text-slate-900 pointer-events-none" : "bg-white border-black text-black"}`}
            />
          ) : isDate && isEditing ? (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-3 items-center w-full">
                <div className="flex-1">
                  <SelectInput
                    value={birthMonth}
                    options={MONTHS}
                    onSelect={(val) => {
                      setBirthMonth(val);
                      setDateError("");
                    }}
                    placeholder="Mes"
                    error={!!dateError}
                  />
                </div>
                <div className="flex-1">
                  <SelectInput
                    value={birthDay}
                    options={DAYS}
                    onSelect={(val) => {
                      setBirthDay(val);
                      setDateError("");
                    }}
                    placeholder="Día"
                    error={!!dateError}
                  />
                </div>
                <div className="flex-1">
                  <SelectInput
                    value={birthYear}
                    options={YEARS}
                    onSelect={(val) => {
                      setBirthYear(val);
                      setDateError("");
                    }}
                    placeholder="Año"
                    error={!!dateError}
                  />
                </div>
              </div>
              {dateError && <p className="text-[#FF3D3D] text-[12px] font-bold mt-1">{dateError}</p>}
            </div>
          ) : (
            <InputField
              type={isDate ? "text" : type}
              placeholder={placeholder}
              value={isDate ? birthdateString : currentValue}
              disabled={!isEditing}
              onChange={(e) => {
                setCurrentValue(e.target.value);
              }}
              variant="bordered"
              className={`${!isEditing ? "!bg-slate-50 !border-none text-slate-900" : "bg-white border-black text-black"}`}
            />
          )}
        </div>

        {!isEditing && (
          <button
            onClick={handleEditClick}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all ${isAnotherEditing ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-black hover:bg-slate-100"}`}
            title="Editar"
          >
            <span className="material-symbols-rounded text-[18px]">edit</span>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={handleCancel}
            className={`px-3 h-8 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-all duration-300 origin-center ${shouldAnimate ? "scale-110 text-slate-900" : "scale-100"}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-4 h-8 text-[12px] font-bold bg-black text-white rounded-lg hover:bg-slate-800 transition-all duration-300 origin-center ${shouldAnimate ? "scale-110" : "scale-100"}`}
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}

interface PersonalInfoSectionProps {
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
  gender: string;
  setGender: (v: string) => void;
  birthdate: string;
  setBirthdate: (v: string) => void;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
}

function PersonalInfoSection({
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
  gender,
  setGender,
  birthdate,
  setBirthdate,
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter
}: PersonalInfoSectionProps) {
  return (
    <div className="w-full flex flex-col">
      <SectionHeader title="Información personal" />
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            id="first_name"
            label="Nombre"
            value={firstName}
            onSave={(val) => {
              setFirstName(val);
              localStorage.setItem("luminus_profile_firstName", val);
            }}
            placeholder="Nombre"
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
          <EditableField
            id="last_name"
            label="Apellido"
            value={lastName}
            onSave={(val) => {
              setLastName(val);
              localStorage.setItem("luminus_profile_lastName", val);
            }}
            placeholder="Apellido"
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            id="profession"
            label="Profesión"
            value={profession}
            onSave={(val) => {
              setProfession(val);
              localStorage.setItem("luminus_profile_profession", val);
            }}
            placeholder="Ej. Diseñador de Productos"
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />

          <EditableField
            id="city"
            label="Ciudad"
            value={city}
            isLocation
            onSave={(cityVal, countryVal) => {
              setCity(cityVal);
              localStorage.setItem("luminus_profile_city", cityVal);
              if (countryVal) {
                setCountry(countryVal);
                localStorage.setItem("luminus_profile_country", countryVal);
              }
            }}
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            id="gender"
            label="Género"
            value={gender}
            isSelect
            options={["Masculino", "Femenino", "No binario", "Prefiero no decirlo"]}
            onSave={(val) => {
              setGender(val);
              localStorage.setItem("luminus_profile_gender", val);
            }}
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
          <EditableField
            id="birthdate"
            label="Fecha de nacimiento"
            value={birthdate}
            isDate
            onSave={(val) => {
              setBirthdate(val);
              // convert DD / MM / YYYY back to YYYY-MM-DD
              const parts = val.split(" / ");
              if (parts.length === 3) {
                localStorage.setItem("luminus_profile_birthdate", `${parts[2]}-${parts[1]}-${parts[0]}`);
              } else {
                localStorage.setItem("luminus_profile_birthdate", val);
              }
            }}
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
        </div>
      </div>
    </div>
  );
}

interface EmailSectionProps {
  email: string;
  setEmail: (email: string) => void;
}

function EmailSection({ email, setEmail }: EmailSectionProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSendVerification = () => {
    setIsSent(true);
    setEmail(newEmail);
    localStorage.setItem("luminus_user_email", newEmail);
  };

  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Correo electrónico"
        description="Gestiona tu dirección de correo para notificaciones e inicio de sesión."
      />

      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Email */}
          <div className="flex flex-col gap-2">
            <label className="text-label ml-1">Email actual</label>
            <div className="flex items-center gap-2">
              <div className={`relative flex-1 ${isChanging ? 'opacity-50' : ''}`}>
                <InputField
                  value={email}
                  disabled
                  variant="bordered"
                  className="!bg-slate-50 !border-none text-slate-900"
                />
              </div>
              {!isChanging && !isSent && (
                <button
                  onClick={() => setIsChanging(true)}
                  className="shrink-0 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-100 rounded-full transition-all"
                >
                  <span className="material-symbols-rounded text-[18px]">edit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Change Flow */}
        {isChanging && !isSent && (
          <div className="flex flex-col gap-5 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-label ml-1">Nuevo email</label>
                <InputField
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  variant="bordered"
                  className="bg-white border-black text-black"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-start">
              <Button
                variant="secondary"
                onClick={() => { setIsChanging(false); setNewEmail(""); }}
                className="!h-10 !text-[12px] !font-semibold !px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendVerification}
                disabled={!newEmail || !newEmail.includes('@')}
                className="!h-10 !text-[12px] !font-bold !bg-black !text-white !px-8"
              >
                Enviar verificación
              </Button>
            </div>
          </div>
        )}

        {/* Sent State */}
        {isSent && (
          <div className="flex flex-col gap-4 p-6 rounded-2xl bg-blue-50 border border-blue-100 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-3 text-blue-600">
              <span className="material-symbols-rounded text-[24px]">mark_email_read</span>
              <h4 className="font-bold text-[15px]">Verificación enviada</h4>
            </div>
            <p className="text-[13px] text-blue-800 leading-relaxed">
              Hemos enviado un enlace de confirmación a <strong className="font-bold">{newEmail}</strong>.
              Por favor, revisa tu bandeja de entrada para completar el cambio.
            </p>
            <button
              onClick={() => { setIsSent(false); setIsChanging(false); setNewEmail(""); }}
              className="text-[12px] font-bold text-blue-600 hover:underline text-left w-fit"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PhoneSectionProps {
  phone: string;
  setPhone: (phone: string) => void;
  phoneCountry: any;
  setPhoneCountry: (country: any) => void;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
}

function PhoneSection({
  phone,
  setPhone,
  phoneCountry,
  setPhoneCountry,
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter
}: PhoneSectionProps) {
  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Celular"
        description="Configura tu número de teléfono para contacto directo."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <EditableField
          id="phone"
          label="Número de celular"
          value={phone}
          placeholder="99 123 456"
          isPhone
          phoneCountry={phoneCountry}
          onCountryChange={(matched) => setPhoneCountry(matched)}
          onSave={(val) => {
            setPhone(val);
            const fullPhone = `${phoneCountry.dial} ${val}`.trim();
            localStorage.setItem("luminus_profile_phone", fullPhone);
          }}
          editingFieldId={editingFieldId}
          setEditingFieldId={setEditingFieldId}
          attentionCounter={attentionCounter}
          setAttentionCounter={setAttentionCounter}
        />
      </div>
    </div>
  );
}

interface PasswordSectionProps {
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
}

function PasswordSection({
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter
}: PasswordSectionProps) {
  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Contraseña"
        description="Asegura tu cuenta utilizando una contraseña fuerte."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <EditableField
          id="password"
          label="Cambiar contraseña"
          value="••••••••"
          type="password"
          placeholder="Nueva contraseña"
          onSave={(val) => {
            alert("Contraseña actualizada exitosamente.");
          }}
          editingFieldId={editingFieldId}
          setEditingFieldId={setEditingFieldId}
          attentionCounter={attentionCounter}
          setAttentionCounter={setAttentionCounter}
        />
      </div>
    </div>
  );
}

function MembershipSection() {
  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Membresía y Plan"
        description="Consulta los detalles de tu suscripción actual y gestiona tus pagos."
      />

      <div className="flex flex-col gap-8">
        {/* Active Plan Card */}
        <div className="w-full bg-slate-900 rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden shadow-none">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase w-fit">Plan Actual</span>
              <h3 className="text-[32px] font-bold tracking-tight font-jakarta">Luminus Full Access</h3>
              <p className="text-white/70 text-[14px]">Prueba gratuita de 3 meses activa.</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[36px] font-bold font-jakarta">$0</span>
              <span className="text-white/50 text-[14px]">hasta el 12/08/2026</span>
            </div>
          </div>
          {/* Abstract Background Decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-rounded text-slate-400">calendar_today</span>
              <span className="text-[14px] font-semibold text-slate-600">Próximo cobro</span>
            </div>
            <p className="text-[18px] font-bold text-slate-900">12 de Agosto, 2026</p>
            <p className="text-[12px] text-slate-400">Se te cobrará $70.00 USD automáticamente.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-rounded text-slate-400">credit_card</span>
              <span className="text-[14px] font-semibold text-slate-600">Método de pago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-slate-50 rounded border border-slate-100 flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-400">VISA</span>
              </div>
              <p className="text-[16px] font-bold text-slate-900">•••• 4817</p>
            </div>
            <button className="text-[12px] font-bold text-slate-900 underline text-left" onClick={() => alert("Próximamente: Cambiar de método de pago")}>Cambiar método</button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[13px] text-slate-400 text-center md:text-left">¿Deseas dejar de formar parte de la comunidad? </p>
        <button className="text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors" onClick={() => alert("Próximamente: Cancelar membresía")}>Cancelar suscripción</button>
      </div>
    </div>
  );
}
