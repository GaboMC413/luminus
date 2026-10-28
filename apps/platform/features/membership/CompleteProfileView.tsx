"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LocationInput } from "@/components/ui/LocationInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/utils/countries";
import { INTEREST_CATEGORIES } from "@/utils/constants";
import { PhotoEditor } from "@/features/auth/registration/PhotoEditor";
import { uploadAvatar } from "@/lib/uploadAvatar";
import {
  Sun,
  Smile,
  Stethoscope,
  Activity,
  Apple,
  Sparkles,
  Users,
  Flower2,
  Tag,
  Asterisk,
  Compass,
  ArrowRight
} from "lucide-react";

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === "UY") || COUNTRIES[0] || {
  code: "UY",
  dial: "+598",
  name: "Uruguay",
};

const MAX_INTERESTS = 10;

const CURATED_INTERESTS_SET = new Set(
  INTEREST_CATEGORIES.flatMap((cat) => cat.items.map((item) => item.toLowerCase().trim()))
);

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
  const props = { className: "w-4 h-4 shrink-0", style: { color } };
  if (t.includes("crecimiento")) return <Sun {...props} />;
  if (t.includes("emocional")) return <Smile {...props} />;
  if (t.includes("integral") || t.includes("salud")) return <Stethoscope {...props} />;
  if (t.includes("movimiento") || t.includes("fisico")) return <Activity {...props} />;
  if (t.includes("nutricion")) return <Apple {...props} />;
  if (t.includes("espiritualidad")) return <Sparkles {...props} />;
  if (t.includes("vinculo") || t.includes("relacion")) return <Users {...props} />;
  if (t.includes("terapia")) return <Flower2 {...props} />;
  return <Tag {...props} />;
}

export default function CompleteProfileView() {
  const router = useRouter();

  // 3-step onboarding state ("details" -> "interests" -> "welcome")
  const [step, setStep] = useState<"details" | "interests" | "welcome">("details");

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

  // Load existing profile & categories
  useEffect(() => {
    async function loadData() {
      if (typeof window !== "undefined") {
        const localFirstName = localStorage.getItem("luminus_first_name");
        const localLastName = localStorage.getItem("luminus_last_name");
        if (localFirstName) setFirstName(localFirstName);
        if (localLastName) setLastName(localLastName);

        if (!localFirstName && !localLastName) {
          const localCardName = localStorage.getItem("luminus_card_name");
          if (localCardName) {
            const parts = localCardName.trim().split(/\s+/);
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
        }
        const rawLocalCity = localStorage.getItem("luminus_billing_city") || "";
        const cleanLocalCity = rawLocalCity.split(",")[0].trim();
        const localCountry = localStorage.getItem("luminus_billing_country") || "";
        if (cleanLocalCity) setCity(cleanLocalCity);
        if (localCountry) setCountry(localCountry);
        if (cleanLocalCity || localCountry) {
          const loc =
            cleanLocalCity && localCountry
              ? `${cleanLocalCity}, ${localCountry}`
              : cleanLocalCity || localCountry;
          setInitialLocation(loc);
        }

        const localCountryCode = localStorage.getItem("luminus_billing_country_code");
        if (localCountryCode || localCountry) {
          const matched = COUNTRIES.find(
            (c) =>
              (localCountryCode && c.code.toUpperCase() === localCountryCode.toUpperCase()) ||
              (localCountry && c.name.toLowerCase() === localCountry.toLowerCase())
          );
          if (matched) setPhoneCountry(matched);
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
            setCountry(profileCountry);
            const matched = COUNTRIES.find(
              (c) => c.name.toLowerCase() === profileCountry.toLowerCase()
            );
            if (matched) setPhoneCountry(matched);
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
      const fullPhone = phone ? `${phoneCountry.dial} ${phone.replace(/\D/g, "")}` : undefined;

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
    const fullPhone = phone ? `${phoneCountry.dial} ${phone.replace(/\D/g, "")}` : undefined;

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

      // Smooth transition to Welcome Screen before entering /comunidad
      setStep("welcome");
      window.scrollTo(0, 0);
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
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans selection:bg-slate-200">
      <div
        className={`flex-1 flex flex-col items-center px-4 ${
          step === "details"
            ? "justify-center pt-24 pb-8"
            : step === "interests"
            ? "pt-12 sm:pt-16 pb-2"
            : "justify-center pt-16 pb-8"
        }`}
      >
        {step === "details" ? (
          /* STEP 1: Personal Details */
          <main className="w-full max-w-[380px] mx-auto flex flex-col items-center gap-8 animate-fade-in-up">
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
                      const normalized = (selectedCountry || "").toLowerCase().trim();
                      const found = COUNTRIES.find(
                        (c) =>
                          (countryCode && c.code.toLowerCase() === countryCode.toLowerCase()) ||
                          c.name.toLowerCase() === normalized
                      );
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
          <main className="w-full max-w-[380px] sm:max-w-[540px] md:max-w-[640px] mx-auto flex flex-col animate-fade-in-up">
            <form onSubmit={handleFinishProfile} className="w-full flex flex-col">
              {/* STICKY TOP BAR */}
              <div className="sticky top-0 z-20 w-full bg-gradient-to-b from-white from-80% via-white/95 to-transparent pt-6 pb-6 flex flex-col gap-6">
                <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight text-center m-0">
                  Elige tus intereses
                </h1>

                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {selectedInterests.map((item) => {
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
                          className="h-[30px] px-3 text-xs leading-none rounded-full transition-all font-jakarta border font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95"
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
                    })}
                  </div>

                  <span
                    className={`text-xs font-semibold font-jakarta tabular-nums select-none shrink-0 leading-[30px] ${
                      limitReached ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {selectedInterests.length}/{MAX_INTERESTS}
                  </span>
                </div>
              </div>

              {/* SCROLLABLE CATEGORIES & OTHER INTERESTS */}
              <div className="flex flex-col gap-6 w-full pt-2 pb-0">
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

              {/* STICKY FLOATING BOTTOM BAR */}
              <div className="sticky bottom-0 z-20 w-full bg-gradient-to-t from-white from-60% via-white/85 to-transparent pt-6 pb-2 flex flex-col items-center gap-4 pointer-events-none">
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
                  className="pointer-events-auto text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors text-center cursor-pointer bg-transparent border-none p-0 font-sans"
                >
                  Volver
                </button>
              </div>
            </form>
          </main>
        ) : (
          /* STEP 3: ANIMATED WELCOME SCREEN */
          <main className="w-full max-w-[420px] mx-auto flex flex-col items-center gap-7 animate-fade-in-up text-center relative">
            {/* Luminous Warm Background Glow */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-gradient-to-tr from-amber-200/40 via-purple-200/35 to-rose-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-float-gentle"
              aria-hidden="true"
            />
            {/* Header */}
            <div className="flex flex-col items-center gap-3">
              <h1 className="text-2xl sm:text-[30px] font-bold font-jakarta text-slate-900 tracking-tight m-0 leading-tight">
                ¡Te damos la bienvenida a LUMINUS!
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-[360px] m-0 font-sans">
                Un mundo de conexiones, conocimientos y experiencias de bienestar te espera.
              </p>
            </div>

            {/* 3 Animated Cards */}
            <div className="w-full flex flex-col gap-3">
              {/* Card 1 */}
              <div
                className="w-full bg-white/90 backdrop-blur-sm rounded-2xl border border-zinc-200/90 p-4 sm:p-4.5 flex items-start gap-3.5 text-left transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_8px_25px_-6px_rgba(99,102,241,0.12)] hover:-translate-y-0.5"
                style={{ animationDelay: "100ms" }}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold font-jakarta text-slate-900 m-0">
                    Conecta con otras personas
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed m-0 font-sans">
                    Comparte intereses y experiencias sobre bienestar.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="w-full bg-white/90 backdrop-blur-sm rounded-2xl border border-zinc-200/90 p-4 sm:p-4.5 flex items-start gap-3.5 text-left transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_8px_25px_-6px_rgba(16,185,129,0.12)] hover:-translate-y-0.5"
                style={{ animationDelay: "200ms" }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold font-jakarta text-slate-900 m-0">
                    Encuentra especialistas
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed m-0 font-sans">
                    Descubre profesionales de distintas áreas.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className="w-full bg-white/90 backdrop-blur-sm rounded-2xl border border-zinc-200/90 p-4 sm:p-4.5 flex items-start gap-3.5 text-left transition-all duration-300 hover:border-amber-300 hover:shadow-[0_8px_25px_-6px_rgba(245,158,11,0.12)] hover:-translate-y-0.5"
                style={{ animationDelay: "300ms" }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold font-jakarta text-slate-900 m-0">
                    Descubre nuevas experiencias
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed m-0 font-sans">
                    Explora actividades y encuentros de bienestar.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct CTA */}
            <div className="w-full pt-1">
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push("/comunidad?welcome=1")}
                className="w-full flex items-center justify-center gap-2"
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
      <footer className="w-full max-w-[380px] mx-auto px-4 py-6 flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-slate-400 m-0">© 2026 LUMINUS Latam.</p>
      </footer>
    </div>
  );
}
