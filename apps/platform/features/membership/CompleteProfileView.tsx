"use client";

import { WelcomeRingCards } from "./WelcomeRingCards";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LocationInput } from "@/components/ui/LocationInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { COUNTRIES, Country } from "@/utils/countries";
import { INTEREST_CATEGORIES } from "@/utils/constants";
import { PhotoEditor } from "@/features/auth/registration/PhotoEditor";
import { uploadAvatar } from "@/lib/uploadAvatar";
import {
  Sun,
  Smile,
  HeartPulse,
  Dumbbell,
  Apple,
  Sparkle,
  Blend,
  Flower,
  Tag,
  Asterisk,
  Compass,
  ArrowRight,
  ChevronDown
} from "lucide-react";

const DEFAULT_COUNTRY: Country = {
  code: "XX",
  dial: "+00",
  name: "Seleccionar país",
  priority: false,
};

const MAX_INTERESTS = 10;

const CURATED_INTERESTS_SET = new Set(
  INTEREST_CATEGORIES.flatMap((cat) => cat.items.map((item) => item.toLowerCase().trim()))
);

const COUNTRY_SYNONYMS: Record<string, string> = {
  "spain": "espana",
  "united states": "estados unidos",
  "usa": "estados unidos",
  "us": "estados unidos",
  "brazil": "brasil",
  "brasil": "brasil",
  "mexico": "mexico",
  "peru": "peru",
  "panama": "panama",
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function findCountry(countryName?: string | null, countryCode?: string | null): Country | undefined {
  if (countryCode) {
    const codeClean = countryCode.trim().toUpperCase();
    const byCode = COUNTRIES.find((c) => c.code.toUpperCase() === codeClean);
    if (byCode) return byCode;
  }
  if (!countryName) return undefined;
  const normalized = normalizeText(countryName);
  const mapped = COUNTRY_SYNONYMS[normalized] || normalized;
  return COUNTRIES.find(
    (c) =>
      normalizeText(c.name) === mapped ||
      normalizeText(c.name) === normalized ||
      c.code.toLowerCase() === normalized
  );
}

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const currentYearNum = new Date().getFullYear();
const YEARS = Array.from({ length: currentYearNum - 1920 + 1 }, (_, i) => String(currentYearNum - i));

type CategoryGroup = {
  title: string;
  icon: string;
  iconFilled?: boolean;
  color: string;
  bgColor?: string;
  items: string[];
};

function renderCategoryIcon(title: string, color: string) {
  const t = normalizeText(title);
  const props = { className: "w-4 h-4 shrink-0", strokeWidth: 2, style: { color } };
  if (t.includes("crecimiento")) return <Sun {...props} />;
  if (t.includes("emocional")) return <Smile {...props} />;
  if (t.includes("integral") || t.includes("salud")) return <HeartPulse {...props} />;
  if (t.includes("ejercicio") || t.includes("movimiento") || t.includes("fisico")) return <Dumbbell {...props} />;
  if (t.includes("nutricion")) return <Apple {...props} />;
  if (t.includes("espiritualidad")) return <Sparkle {...props} />;
  if (t.includes("vinculo") || t.includes("relacion")) return <Blend {...props} />;
  if (t.includes("terapia")) return <Flower {...props} />;
  return <Tag {...props} />;
}

export default function CompleteProfileView() {
  const router = useRouter();

  // 3-step onboarding state ("details" -> "interests" -> "welcome")
  const [step, setStep] = useState<"details" | "interests" | "welcome">("details");
  const [isExitingInterests, setIsExitingInterests] = useState(false);

  // Basic Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [initialLocation, setInitialLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Photo Cropping & Uploading States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  // Parity Fields: Birthdate, Interests & Other Interests
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otherInterests, setOtherInterests] = useState("");
  const [categories, setCategories] = useState<CategoryGroup[]>(INTEREST_CATEGORIES);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const interestsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollInterestsDown, setCanScrollInterestsDown] = useState(true);

  const handleInterestsScroll = () => {
    if (interestsScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = interestsScrollRef.current;
      setCanScrollInterestsDown(scrollTop + clientHeight < scrollHeight - 20);
    }
  };

  useEffect(() => {
    if (step === "interests") {
      const timer = setTimeout(() => {
        handleInterestsScroll();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Load existing profile & categories
  useEffect(() => {
    async function loadData() {
      if (typeof window !== "undefined") {
        const localFirstName = localStorage.getItem("luminus_first_name");
        const localLastName = localStorage.getItem("luminus_last_name");
        if (localFirstName) setFirstName(localFirstName);
        if (localLastName) setLastName(localLastName);

        // Do not guess names from card payments to prevent ghost name caching
        const rawLocalCity = localStorage.getItem("luminus_billing_city") || "";
        const cleanLocalCity = rawLocalCity.split(",")[0].trim();
        const localCountry = localStorage.getItem("luminus_billing_country") || "";
        const localCountryCode = localStorage.getItem("luminus_billing_country_code") || "";
        if (cleanLocalCity) setCity(cleanLocalCity);

        const matchedLocalCountry = findCountry(localCountry, localCountryCode);
        if (matchedLocalCountry) {
          setCountry(matchedLocalCountry.name);
          setPhoneCountry(matchedLocalCountry);
        } else if (localCountry) {
          setCountry(localCountry);
        }

        const resolvedLocalCountryName = matchedLocalCountry ? matchedLocalCountry.name : localCountry;
        if (cleanLocalCity || resolvedLocalCountryName) {
          const loc =
            cleanLocalCity && resolvedLocalCountryName
              ? `${cleanLocalCity}, ${resolvedLocalCountryName}`
              : cleanLocalCity || resolvedLocalCountryName;
          setInitialLocation(loc);
        }
      }

      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          router.push("/iniciar-sesion");
          return;
        }

        const data = await res.json();
        const profile = data?.profile;

        if (profile) {
          if (profile.first_name) setFirstName(profile.first_name);
          if (profile.last_name) setLastName(profile.last_name);

          if (!profile.first_name && !profile.last_name) {
            const localFn =
              typeof window !== "undefined" ? localStorage.getItem("luminus_first_name") : "";
            const localLn =
              typeof window !== "undefined" ? localStorage.getItem("luminus_last_name") : "";
            if (localFn) setFirstName(localFn);
            if (localLn) setLastName(localLn);

            if (!localFn && !localLn) {
              const rawName =
                profile.fullName ||
                (typeof window !== "undefined" ? localStorage.getItem("luminus_card_name") : "") ||
                "";
              if (rawName) {
                const parts = rawName.trim().split(/\s+/);
                setFirstName(parts[0] || "");
                setLastName(parts.slice(1).join(" ") || "");
              }
            }
          }

          const cleanProfileCity = profile.city ? profile.city.split(",")[0].trim() : "";
          const profileCountry = profile.country ? profile.country.trim() : "";

          if (cleanProfileCity) setCity(cleanProfileCity);
          if (profileCountry) {
            const matchedProfileCountry = findCountry(profileCountry);
            if (matchedProfileCountry) {
              setCountry(matchedProfileCountry.name);
              setPhoneCountry(matchedProfileCountry);
            } else {
              setCountry(profileCountry);
            }
          }
          if (cleanProfileCity || profileCountry) {
            const loc =
              cleanProfileCity && profileCountry
                ? `${cleanProfileCity}, ${profileCountry}`
                : cleanProfileCity || profileCountry;
            setInitialLocation(loc);
          }

          if (profile.birthdate) {
            const d = new Date(profile.birthdate);
            if (!isNaN(d.getTime())) {
              setBirthDay(String(d.getUTCDate()).padStart(2, "0"));
              setBirthMonth(String(d.getUTCMonth() + 1).padStart(2, "0"));
              setBirthYear(String(d.getUTCFullYear()));
            }
          }

          if (profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0) {
            setSelectedInterests(profile.interests.slice(0, MAX_INTERESTS));
          }

          if (profile.other_interests) {
            setOtherInterests(profile.other_interests);
          }

          if (profile.profile_picture_url) setAvatarUrl(profile.profile_picture_url);
          if (profile.phone_number) {
            const rawPhone = String(profile.phone_number).trim();
            const matchedCountry = [...COUNTRIES]
              .sort((a, b) => b.dial.length - a.dial.length)
              .find((c) => rawPhone.startsWith(c.dial));
            if (matchedCountry) {
              setPhoneCountry(matchedCountry);
              setPhone(rawPhone.slice(matchedCountry.dial.length).trim());
            } else {
              setPhone(rawPhone);
            }
          }
        }

        const catRes = await fetch("/api/categories").catch(() => null);
        if (catRes && catRes.ok) {
          const catData = await catRes.json();
          if (
            catData?.categories &&
            Array.isArray(catData.categories) &&
            catData.categories.length > 0
          ) {
            const normalizedCategories: CategoryGroup[] = catData.categories
              .map((cat: any) => {
                const rawItems: string[] = Array.isArray(cat.items) ? cat.items : [];
                const filteredItems = rawItems.filter((item) =>
                  CURATED_INTERESTS_SET.has(item.toLowerCase().trim())
                );
                const fallbackCat = INTEREST_CATEGORIES.find(
                  (c) =>
                    normalizeText(c.title) === normalizeText(String(cat.title || cat.name || ""))
                );
                return {
                  title: cat.title || cat.name || fallbackCat?.title || "",
                  icon: cat.icon || fallbackCat?.icon || "label",
                  iconFilled: cat.iconFilled ?? fallbackCat?.iconFilled ?? true,
                  color: cat.color || fallbackCat?.color || "#0F172A",
                  bgColor: cat.bgColor || fallbackCat?.bgColor,
                  items: filteredItems.length > 0 ? filteredItems : fallbackCat?.items || rawItems,
                };
              })
              .filter((c: CategoryGroup) => c.title && c.items.length > 0);

            if (normalizedCategories.length > 0) {
              setCategories(normalizedCategories);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile for prefill:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImage(null);
  };

  const handleCropSave = async (croppedImage: Blob) => {
    try {
      setUploading(true);
      setUploadProgress(10);
      setIsCropping(false);

      const { publicUrl } = await uploadAvatar(croppedImage, (percent) => {
        setUploadProgress(percent);
      });
      setAvatarUrl(publicUrl);
      setTempImage(null);
    } catch (error: any) {
      console.error("Error processing avatar:", error);
      alert("No pudimos subir tu foto. Intenta nuevamente.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateBirthdate = (): { valid: boolean; birthdateString?: string; error?: string } => {
    if (!birthDay && !birthMonth && !birthYear) {
      return { valid: true, birthdateString: undefined };
    }

    const d = parseInt(birthDay, 10);
    const m = parseInt(birthMonth, 10);
    const y = parseInt(birthYear, 10);

    if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31) {
      return { valid: false, error: "Por favor ingresa una fecha de nacimiento válida." };
    }

    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) {
      return { valid: false, error: "El día ingresado no es válido para ese mes." };
    }

    const currentYear = new Date().getFullYear();
    if (y < 1920 || y > currentYear) {
      return { valid: false, error: "Por favor ingresa un año válido." };
    }

    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() + 1 - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
      age--;
    }

    if (age < 18) {
      return { valid: false, error: "Debes ser mayor de 18 años para ser miembro de LUMINUS." };
    }

    return {
      valid: true,
      birthdateString: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    };
  };

  const handleContinueToInterests = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const birthCheck = validateBirthdate();
    if (!birthCheck.valid) {
      setErrorMessage(birthCheck.error || "Fecha de nacimiento inválida.");
      return;
    }

    setSaving(true);
    try {
      const cleanCity = city.split(",")[0].trim();
      const digitsOnly = phone.replace(/\D/g, "");
      const hasValidDial = phoneCountry.code !== "XX" && phoneCountry.dial !== "+00";
      const fullPhone = digitsOnly
        ? hasValidDial
          ? `${phoneCountry.dial} ${digitsOnly}`
          : digitsOnly
        : undefined;

      if (cleanCity && country) {
        setInitialLocation(`${cleanCity}, ${country}`);
      } else if (cleanCity) {
        setInitialLocation(cleanCity);
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          city: cleanCity || undefined,
          country: country.trim() || undefined,
          phone_number: fullPhone,
          avatarUrl: avatarUrl || undefined,
          birthdate: birthCheck.birthdateString,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al guardar tus datos.");
      }

      setStep("interests");
      window.scrollTo(0, 0);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al guardar los datos. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinishProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const birthCheck = validateBirthdate();
    const cleanCity = city.split(",")[0].trim();
    const digitsOnly = phone.replace(/\D/g, "");
    const hasValidDial = phoneCountry.code !== "XX" && phoneCountry.dial !== "+00";
    const fullPhone = digitsOnly
      ? hasValidDial
        ? `${phoneCountry.dial} ${digitsOnly}`
        : digitsOnly
      : undefined;

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          city: cleanCity || undefined,
          country: country.trim() || undefined,
          phone_number: fullPhone,
          avatarUrl: avatarUrl || undefined,
          birthdate: birthCheck.birthdateString,
          interests: selectedInterests.length > 0 ? selectedInterests.slice(0, MAX_INTERESTS) : undefined,
          otherInterests: otherInterests.trim() || undefined,
          isOnboarded: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al crear el perfil.");
      }

      if (typeof window !== "undefined" && otherInterests.trim()) {
        localStorage.setItem("luminus_profile_otherInterests", otherInterests.trim());
      }

      // Smooth crossfade transition to Welcome Screen
      setIsExitingInterests(true);
      setTimeout(() => {
        setStep("welcome");
        window.scrollTo(0, 0);
        setIsExitingInterests(false);
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al guardar los datos. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else if (selectedInterests.length < MAX_INTERESTS) {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const getCategoryColor = (item: string): string => {
    const target = item.toLowerCase().trim();
    const matchedCat =
      categories.find((c) => c.items.some((i) => i.toLowerCase().trim() === target)) ||
      INTEREST_CATEGORIES.find((c) => c.items.some((i) => i.toLowerCase().trim() === target));
    return matchedCat?.color || "#0F172A";
  };

  const limitReached = selectedInterests.length >= MAX_INTERESTS;

  return (
    <div
      style={
        step === "welcome"
          ? {
              backgroundImage:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.75) 0%, #ffffff 100%), linear-gradient(90deg, #FF7700 0%, #E855C8 33%, #0450FB 66%, #A8C800 100%)",
            }
          : undefined
      }
      className={`min-h-[100dvh] bg-white flex flex-col justify-between font-sans selection:bg-slate-200 relative ${
        step === "interests" ? "h-[100dvh] overflow-hidden" : "overflow-x-hidden overflow-y-auto"
      }`}
    >
      <div
        className={`flex-1 flex flex-col items-center px-4 ${
          step === "interests"
            ? "justify-between pt-6 pb-2 h-full overflow-hidden w-full"
            : step === "welcome"
            ? "justify-center pt-5 pb-3 sm:py-6"
            : "justify-center pt-10 pb-8 sm:py-12"
        }`}
      >
        {step === "details" ? (
          /* STEP 1: Personal Details */
          <main className="w-full max-w-[380px] mx-auto flex flex-col items-center my-auto gap-6 sm:gap-8 animate-fade-in-up">
            <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight text-center m-0">
              Completa tu perfil
            </h1>

            <div className="w-full flex flex-col gap-4">
              <form onSubmit={handleContinueToInterests} className="flex flex-col gap-3">
                {/* 1. Profile Photo Section */}
                <div className="inline-flex items-end gap-4">
                  <div className="w-24 h-24 bg-white rounded-2xl flex justify-center items-center overflow-hidden shrink-0 relative border border-zinc-200/90">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/empty-profile-picture.png"
                        alt="Avatar por defecto"
                        className="w-full h-full object-cover select-none"
                      />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                        <div className="relative w-11 h-11 flex items-center justify-center">
                          <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 44 44">
                            <circle
                              cx="22"
                              cy="22"
                              r="18"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-zinc-200"
                              fill="none"
                            />
                            <circle
                              cx="22"
                              cy="22"
                              r="18"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              strokeDasharray={113.097}
                              strokeDashoffset={113.097 - (113.097 * uploadProgress) / 100}
                              strokeLinecap="round"
                              className="text-slate-900 transition-all duration-150 ease-out"
                              fill="none"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-bold font-mono text-slate-900 tracking-tight">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, .png, .jpg, .jpeg, .webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="h-8 px-3 bg-zinc-100 hover:bg-zinc-200/80 text-slate-800 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-zinc-200/90 font-jakarta inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50"
                    >
                      {uploading
                        ? `Subiendo ${uploadProgress}%`
                        : avatarUrl
                        ? "Cambiar foto"
                        : "Subir foto"}
                    </button>

                    {avatarUrl && !uploading && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="h-8 px-3 bg-red-50/70 hover:bg-red-100/80 text-red-600 hover:text-red-700 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-red-200/60 font-jakarta inline-flex items-center justify-center whitespace-nowrap"
                      >
                        Eliminar foto
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nombre"
                  />

                  <InputField
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellido"
                  />
                </div>

                {/* 3. Location */}
                <LocationInput
                  defaultValue={initialLocation}
                  placeholder="Ciudad y País"
                  onSelect={({ city: selectedCity, country: selectedCountry, countryCode }) => {
                    const cleanCity = (selectedCity || "").split(",")[0].trim();
                    setCity(cleanCity);
                    setCountry(selectedCountry || "");
                    if (countryCode || selectedCountry) {
                      const found = findCountry(selectedCountry, countryCode);
                      if (found) setPhoneCountry(found);
                    }
                  }}
                />

                {/* 4. Phone Number */}
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  phoneCountry={phoneCountry}
                  onCountryChange={setPhoneCountry}
                />

                {/* 5. Birthdate */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 font-jakarta">
                      Fecha de nacimiento
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Mayor de 18 años
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <SelectInput
                      placeholder="Día"
                      value={birthDay}
                      onSelect={setBirthDay}
                      options={DAYS}
                      searchable={true}
                    />

                    <SelectInput
                      placeholder="Mes"
                      value={birthMonth}
                      onSelect={setBirthMonth}
                      options={MONTHS}
                      searchable={true}
                    />

                    <SelectInput
                      placeholder="Año"
                      value={birthYear}
                      onSelect={setBirthYear}
                      options={YEARS}
                      searchable={true}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 text-center">
                    {errorMessage}
                  </div>
                )}

                {/* Primary Action Button: Continuar */}
                <div className="pt-3">
                  <Button type="submit" variant="primary" disabled={saving || uploading}>
                    {saving ? "Guardando..." : "Continuar"}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        ) : step === "interests" ? (
          /* STEP 2: Categorized Wellness Interests Screen */
          <main className={`w-full max-w-[380px] sm:max-w-[540px] md:max-w-[640px] mx-auto flex-1 min-h-0 h-full flex flex-col transition-opacity duration-300 ease-out ${
            isExitingInterests ? "opacity-0" : "animate-fade-in-up"
          }`}>
            <form onSubmit={handleFinishProfile} className="w-full flex-1 min-h-0 flex flex-col justify-between">
              {/* STICKY TOP BAR */}
              <div className="sticky top-0 z-20 w-full bg-white pt-1 pb-2 flex flex-col gap-4">
                <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight text-center m-0">
                  Elige tus intereses
                </h1>

                <div className="flex items-start justify-between gap-2 w-full min-h-[30px] pt-1">
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {selectedInterests.length === 0 ? (
                      <span className="text-xs text-slate-400 font-sans italic leading-[30px]">
                        Selecciona hasta {MAX_INTERESTS} temas
                      </span>
                    ) : (
                      selectedInterests.map((item) => {
                        const catColor = getCategoryColor(item);
                        return (
                          <button
                            key={`selected-${item}`}
                            type="button"
                            onClick={() => toggleInterest(item)}
                            style={{
                              backgroundColor: catColor,
                              borderColor: catColor,
                              color: "#FFFFFF",
                            }}
                            className="h-[28px] px-2.5 text-xs leading-none rounded-full transition-all font-jakarta border font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 shadow-sm"
                          >
                            <span>{item}</span>
                            <svg
                              className="w-3 h-3 shrink-0"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            >
                              <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" />
                            </svg>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <span
                    className={`text-xs font-semibold font-jakarta tabular-nums select-none shrink-0 leading-[30px] ${
                      limitReached ? "text-slate-900 font-bold" : "text-slate-400"
                    }`}
                  >
                    {selectedInterests.length}/{MAX_INTERESTS}
                  </span>
                </div>
              </div>

              {/* SCROLLABLE CATEGORIES & OTHER INTERESTS WITH GRADIENT FADE */}
              <div
                ref={interestsScrollRef}
                onScroll={handleInterestsScroll}
                className="subtle-scrollbar flex-1 min-h-0 overflow-y-auto pr-2 my-1 flex flex-col gap-4 w-full pt-1 pb-3 [mask-image:linear-gradient(to_bottom,transparent,black_14px,black_calc(100%-16px),transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_14px,black_calc(100%-16px),transparent)]"
              >
                {categories.map((category) => (
                  <div key={category.title} className="flex flex-col gap-2.5">
                    <h3
                      className="flex items-center gap-1.5 text-xs font-bold font-jakarta m-0"
                      style={{ color: category.color }}
                    >
                      {renderCategoryIcon(category.title, category.color)}
                      {category.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                      {category.items.map((item) => {
                        const isSelected = selectedInterests.includes(item);
                        const isDisabled = !isSelected && limitReached;
                        return (
                          <button
                            key={item}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => toggleInterest(item)}
                            style={
                              isSelected
                                ? {
                                    backgroundColor: category.color,
                                    borderColor: category.color,
                                    color: "#FFFFFF",
                                  }
                                : undefined
                            }
                            className={`h-[30px] px-3 text-xs leading-none rounded-full transition-all font-jakarta border inline-flex items-center justify-center ${
                              isSelected
                                ? "font-semibold cursor-pointer hover:opacity-90 active:scale-95"
                                : isDisabled
                                ? "bg-white text-slate-400 border-zinc-200/70 opacity-50 cursor-not-allowed font-normal"
                                : "bg-white text-slate-700 border-zinc-200/90 hover:bg-zinc-50 active:scale-95 cursor-pointer font-normal"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Other Interests (No Limits) */}
                <div className="flex flex-col gap-2.5 w-full">
                  <h3 className="flex items-center gap-1.5 text-slate-400 text-xs font-bold font-jakarta m-0">
                    <Asterisk className="w-4 h-4 text-slate-400 shrink-0" />
                    ¿Algo más que te interese?
                  </h3>
                  <InputField
                    type="text"
                    value={otherInterests}
                    onChange={(e) => setOtherInterests(e.target.value)}
                    placeholder="Escribe otros temas aquí..."
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 text-center">
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* Scroll Affordance Cue */}
              {canScrollInterestsDown && (
                <button
                  type="button"
                  onClick={() => interestsScrollRef.current?.scrollBy({ top: 180, behavior: "smooth" })}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-xs text-slate-400 hover:text-slate-600 transition-colors select-none cursor-pointer bg-transparent border-none"
                >
                  <span>Más categorías abajo</span>
                  <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                </button>
              )}

              {/* BOTTOM ACTIONS BAR - Pinned above footer */}
              <div className="w-full shrink-0 pt-2 pb-1 flex flex-col items-center gap-0 pointer-events-none">
                <div className="w-full max-w-[380px] mx-auto pointer-events-auto rounded-xl">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? "Creando perfil..." : "Crear mi perfil"}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setErrorMessage(null);
                    window.scrollTo(0, 0);
                  }}
                  disabled={saving}
                  className="pointer-events-auto mt-3.5 mb-1 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors text-center cursor-pointer bg-transparent border-none p-0 font-sans"
                >
                  Volver
                </button>
              </div>
            </form>
          </main>
        ) : (
          /* STEP 3: ANIMATED WELCOME SCREEN WITH 3D RING CARDS */
          <main className="w-full max-w-[420px] sm:max-w-xl mx-auto flex flex-col items-center my-auto text-center relative py-1">
            {/* Header: [LUMINUS LOGO] on top with entrance animation */}
            <header className="animate-welcome-header flex flex-col items-center text-center gap-3 mb-6 sm:mb-8 shrink-0">
              <div className="relative inline-flex items-center justify-center mb-0.5">
                <img
                  src="/logo-luminus-black.svg"
                  alt="LUMINUS"
                  className="h-[22px] sm:h-[24px] w-auto transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <h1 className="text-2xl sm:text-[28px] font-bold font-jakarta text-slate-900 tracking-tight m-0 leading-tight">
                  ¡Te damos la bienvenida!
                </h1>
              </div>
            </header>

            {/* Middle: 3D Rotating Ring Cards with staggered entrance */}
            <div className="animate-welcome-cards w-full my-auto flex items-center justify-center py-2">
              <WelcomeRingCards />
            </div>

            {/* Bottom: Direct CTA with staggered entrance */}
            <div className="animate-welcome-button w-full max-w-[340px] mx-auto pt-8 sm:pt-10 shrink-0">
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push("/comunidad?welcome=1")}
                className="w-full flex items-center justify-center gap-2 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <span>Ingresar</span>
              </Button>
            </div>
          </main>
        )}
      </div>

      {/* Cropping Modal from PhotoEditor */}
      {isCropping && tempImage && (
        <PhotoEditor
          image={tempImage}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-[380px] mx-auto px-4 py-3 sm:py-4 flex flex-col items-center gap-1 text-center shrink-0 mt-auto">
        <p className="text-xs text-slate-400 m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
