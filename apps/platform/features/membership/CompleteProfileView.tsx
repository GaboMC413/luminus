"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocationInput } from "@/components/ui/LocationInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { COUNTRIES } from "@/utils/countries";

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === "CO") || COUNTRIES[0] || {
  code: "CO",
  dial: "+57",
  name: "Colombia",
};

export default function CompleteProfileView() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current profile to pre-fill (e.g. from Google OAuth)
  useEffect(() => {
    async function loadCurrentProfile() {
      try {
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
          if (profile.city) setCity(profile.city);
          if (profile.country) setCountry(profile.country);
          if (profile.profile_picture_url) setAvatarUrl(profile.profile_picture_url);
          if (profile.phone_number) {
            setPhone(profile.phone_number);
          }
        }
      } catch (err) {
        console.error("Failed to load profile for prefill:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentProfile();
  }, [router]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage("La foto no debe pesar más de 3 MB.");
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage(null);

    try {
      // 1. Get presigned upload URL
      const presignRes = await fetch("/api/uploads/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type || "image/jpeg",
          contentLength: file.size,
        }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        throw new Error(presignData.message || "Error al preparar la carga.");
      }

      // 2. Upload file directly to S3
      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("No se pudo subir la foto a S3.");
      }

      setAvatarUrl(presignData.publicUrl);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setErrorMessage(err.message || "No pudimos subir tu foto. Intenta con otra imagen.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

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
      // Mark isOnboarded so user is not blocked by assertOnboarded middleware
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans selection:bg-slate-200">
      {/* Header */}
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-8 pb-4 flex items-center justify-center">
        <Link href="/" className="inline-flex items-center">
          <img src="/logo-luminus-black.svg" alt="LUMINUS" className="h-[24px] w-auto" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-4 py-6 flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-jakarta text-slate-900 tracking-tight">
            Completa tu perfil
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium max-w-sm">
            Agrega algunos datos para que otros miembros puedan conocerte.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col gap-6">
          <form onSubmit={handleSaveAndContinue} className="flex flex-col gap-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border border-zinc-200/90 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 text-[32px] select-none">
                      person
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-black hover:bg-zinc-800 text-white rounded-full flex items-center justify-center shadow-sm cursor-pointer border border-white"
                  title="Subir foto de perfil"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {uploadingAvatar ? "hourglass_top" : "photo_camera"}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {uploadingAvatar ? "Subiendo foto..." : "Foto de perfil (opcional)"}
              </span>
            </div>

            {/* Names (Nombre & Apellido) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 font-jakarta">
                  Nombre
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full h-11 px-3.5 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 font-jakarta">
                  Apellido
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full h-11 px-3.5 text-sm bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Location (City & Country with Google Places Autocomplete) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 font-jakarta">
                Ciudad y País
              </label>
              <LocationInput
                defaultValue={city && country ? `${city}, ${country}` : city || ""}
                placeholder="Busca tu ciudad (ej. Santiago, Bogotá, Madrid)"
                onSelect={({ city: selectedCity, country: selectedCountry }) => {
                  setCity(selectedCity);
                  setCountry(selectedCountry);
                }}
              />
            </div>

            {/* Phone Number with International Country Selector */}
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

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 bg-black hover:bg-zinc-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center font-jakarta disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar y continuar"}
              </button>

              <button
                type="button"
                onClick={handleCompleteLater}
                disabled={saving}
                className="w-full py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors text-center cursor-pointer bg-transparent border-none"
              >
                Completar después
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-6 text-center text-xs text-slate-400">
        LUMINUS © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
