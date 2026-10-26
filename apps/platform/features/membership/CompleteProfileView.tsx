"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocationInput } from "@/components/ui/LocationInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/utils/countries";
import { PhotoEditor } from "@/features/auth/registration/PhotoEditor";
import { uploadAvatar } from "@/lib/uploadAvatar";

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === "UY") || COUNTRIES[0] || {
  code: "UY",
  dial: "+598",
  name: "Uruguay",
};

const POPULAR_INTERESTS = [
  "Meditación",
  "Yoga",
  "Mindfulness",
  "Alimentación consciente",
  "Salud mental",
  "Gestión del estrés",
  "Autoconocimiento",
  "Hábitos",
  "Pilates",
  "Entrenamiento",
  "Sueño y descanso",
  "Longevidad",
  "Respiración",
  "Creatividad",
  "Salud digestiva",
  "Desarrollo personal",
];

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

export default function CompleteProfileView() {
  const router = useRouter();

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

  // Parity Fields: Birthdate, Interests (Gender removed per user request)
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availableInterests, setAvailableInterests] = useState<string[]>(POPULAR_INTERESTS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile & categories
  useEffect(() => {
    async function loadData() {
      // 1. Instant pre-fill from localStorage (credit card and billing address)
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
        const localCity = localStorage.getItem("luminus_billing_city") || "";
        const localCountry = localStorage.getItem("luminus_billing_country") || "";
        if (localCity) setCity(localCity);
        if (localCountry) setCountry(localCountry);
        if (localCity || localCountry) {
          const loc = localCity && localCountry ? `${localCity}, ${localCountry}` : localCity || localCountry;
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
        // 2. Fetch Profile from server
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          router.push("/auth/iniciar-sesion");
          return;
        }

        const data = await res.json();
        const profile = data?.profile;

        if (profile) {
          if (profile.first_name) setFirstName(profile.first_name);
          if (profile.last_name) setLastName(profile.last_name);

          // If first_name is empty, attempt intelligent parse from full_name or cardName
          if (!profile.first_name && !profile.last_name) {
            const localFn = typeof window !== "undefined" ? localStorage.getItem("luminus_first_name") : "";
            const localLn = typeof window !== "undefined" ? localStorage.getItem("luminus_last_name") : "";
            if (localFn) setFirstName(localFn);
            if (localLn) setLastName(localLn);

            if (!localFn && !localLn) {
              const rawName = profile.fullName || (typeof window !== "undefined" ? localStorage.getItem("luminus_card_name") : "") || "";
              if (rawName) {
                const parts = rawName.trim().split(/\s+/);
                setFirstName(parts[0] || "");
                setLastName(parts.slice(1).join(" ") || "");
              }
            }
          }

          if (profile.city) setCity(profile.city);
          if (profile.country) {
            setCountry(profile.country);
            // Auto-match phone country from profile/billing country
            const matched = COUNTRIES.find(
              (c) => c.name.toLowerCase() === profile.country.toLowerCase()
            );
            if (matched) setPhoneCountry(matched);
          }
          if (profile.city || profile.country) {
            const loc = profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.city || profile.country;
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
            setSelectedInterests(profile.interests);
          }

          if (profile.profile_picture_url) setAvatarUrl(profile.profile_picture_url);
          if (profile.phone_number) {
            setPhone(profile.phone_number);
          }
        }

        // 3. Fetch categories for interests
        const catRes = await fetch("/api/categories").catch(() => null);
        if (catRes && catRes.ok) {
          const catData = await catRes.json();
          if (catData?.categories && Array.isArray(catData.categories) && catData.categories.length > 0) {
            const extractedItems: string[] = catData.categories.flatMap((cat: any) =>
              Array.isArray(cat.items) ? cat.items : typeof cat === "string" ? [cat] : []
            );
            setAvailableInterests(Array.from(new Set([...extractedItems, ...POPULAR_INTERESTS])));
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

  // Image Selection -> Opens PhotoEditor (exact same component from current sign-up)
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

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    // Validate birthdate if any part is filled
    let birthdateString: string | undefined = undefined;
    if (birthDay || birthMonth || birthYear) {
      const d = parseInt(birthDay, 10);
      const m = parseInt(birthMonth, 10);
      const y = parseInt(birthYear, 10);

      if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31) {
        setErrorMessage("Por favor ingresa una fecha de nacimiento válida.");
        setSaving(false);
        return;
      }

      const daysInMonth = new Date(y, m, 0).getDate();
      if (d > daysInMonth) {
        setErrorMessage("El día ingresado no es válido para ese mes.");
        setSaving(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      if (y < 1920 || y > currentYear) {
        setErrorMessage("Por favor ingresa un año válido.");
        setSaving(false);
        return;
      }

      const today = new Date();
      let age = today.getFullYear() - y;
      const monthDiff = today.getMonth() + 1 - m;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
        age--;
      }

      if (age < 18) {
        setErrorMessage("Debes ser mayor de 18 años para ser miembro de LUMINUS.");
        setSaving(false);
        return;
      }

      birthdateString = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }

    try {
      const fullPhone = phone ? `${phoneCountry.dial} ${phone.replace(/\D/g, "")}` : undefined;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          phone_number: fullPhone,
          avatarUrl: avatarUrl || undefined,
          birthdate: birthdateString,
          interests: selectedInterests.length > 0 ? selectedInterests : undefined,
          isOnboarded: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al guardar el perfil.");
      }

      router.push("/comunidad?welcome=1");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al guardar los datos. Intenta nuevamente.");
      setSaving(false);
    }
  };

  const handleCompleteLater = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOnboarded: true,
        }),
      });
    } catch (err) {
      console.error("Failed to mark isOnboarded on skip:", err);
    } finally {
      router.push("/comunidad?welcome=1");
    }
  };

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans selection:bg-slate-200">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-8 pb-3 flex items-center justify-center">
        <Link href="/" className="inline-flex items-center">
          <img src="/logo-luminus-black.svg" alt="LUMINUS" className="h-[24px] w-auto" />
        </Link>
      </header>

      {/* Main Container: standardized to max-w-[430px] */}
      <main className="w-full max-w-[430px] mx-auto px-4 pt-4 pb-8 flex flex-col items-center">
        {/* Title (Only one line title, subtitle removed per request) */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-[26px] font-bold font-jakarta text-slate-900 tracking-tight">
            Completa tu perfil
          </h1>
        </div>

        {/* Card: Flat, border border-zinc-200/90, zero shadows, p-6 sm:p-7 */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 flex flex-col gap-5">
          <form onSubmit={handleSaveAndContinue} className="flex flex-col gap-4">
            {/* 1. Profile Photo Section */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 font-jakarta">
                Foto de perfil
              </label>
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
                        {/* Background Track Circle */}
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
                          {/* Animated Progress Wheel */}
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
                        {/* Percentage Center */}
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

                <div className="flex flex-col gap-1.5">
                  <Button
                    type="button"
                    variant="soft"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? `Subiendo ${uploadProgress}%` : avatarUrl ? "Cambiar foto" : "Subir Foto"}
                  </Button>

                  {avatarUrl && !uploading && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-transparent font-jakarta flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      Eliminar foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Names (Nombre & Apellido): standardized InputField components */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Nombre"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre"
              />

              <InputField
                label="Apellido"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellido"
              />
            </div>

            {/* 3. Location (City & Country using Google Places Autocomplete API) */}
            <LocationInput
              label="Ciudad y País"
              defaultValue={initialLocation}
              placeholder="Ingresa tu ciudad"
              onSelect={({ city: selectedCity, country: selectedCountry, countryCode }) => {
                setCity(selectedCity);
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

            {/* 4. Phone Number with Auto-Matched International Country Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 font-jakarta">
                Teléfono
              </label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                phoneCountry={phoneCountry}
                onCountryChange={setPhoneCountry}
              />
            </div>

            {/* 5. Birthdate (Fecha de nacimiento) - SelectInput Components */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 font-jakarta">
                  Fecha de nacimiento
                </label>
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
                />

                <SelectInput
                  placeholder="Mes"
                  value={birthMonth}
                  onSelect={setBirthMonth}
                  options={MONTHS}
                />

                <SelectInput
                  placeholder="Año"
                  value={birthYear}
                  onSelect={setBirthYear}
                  options={YEARS}
                />
              </div>
            </div>

            {/* 6. Wellness Interests (Interactive multi-select chips) */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 font-jakarta">
                Elige los temas que te gustaría explorar
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                {availableInterests.map((item) => {
                  const isSelected = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer font-jakarta border ${
                        isSelected
                          ? "bg-black text-white border-black font-semibold"
                          : "bg-zinc-50 text-slate-700 border-zinc-200 hover:bg-zinc-100 font-normal"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            {/* Primary Action Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="mt-2"
            >
              {saving ? "Creando perfil..." : "Crear mi perfil"}
            </Button>
          </form>
        </div>

        {/* Secondary Action: Volver (outside the card) */}
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="mt-4 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer bg-transparent border-none font-jakarta inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver
        </button>
      </main>

      {/* Cropping Modal from PhotoEditor (exact same component from current sign-up) */}
      {isCropping && tempImage && (
        <PhotoEditor
          image={tempImage}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} LUMINUS Latam.
      </footer>
    </div>
  );
}
