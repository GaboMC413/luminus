"use client";

import React, { useState, useRef } from 'react';
import { PhotoEditor } from './PhotoEditor';
import { InputField } from '@/components/ui/InputField';
import { LocationInput } from '@/components/ui/LocationInput';
import { SelectInput } from '@/components/ui/SelectInput';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { COUNTRIES as ALL_COUNTRIES } from '@/utils/countries';
import { AsYouType, CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

const capitalizeName = (value: string) => {
  return value
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};
import { uploadAvatar } from '@/lib/uploadAvatar';

const NEUTRAL_COUNTRY = { code: 'XX', dial: '+00', name: 'Seleccionar país', priority: false };

const COUNTRY_SYNONYMS: Record<string, string> = {
  'spain': 'españa',
  'united states': 'estados unidos',
  'usa': 'estados unidos',
  'us': 'estados unidos',
  'brazil': 'brasil',
  'mexico': 'méxico',
  'peru': 'perú',
  'panama': 'panamá',
};

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

const validateBirthdate = (val: string): 'valid' | 'invalid' | 'underage' => {
  const clean = val.replace(/\s+/g, '');
  const parts = clean.split('/').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
  if (parts.length !== 3) return 'invalid';

  const [day, month, year] = parts;
  if (month < 1 || month > 12) return 'invalid';
  if (day < 1 || day > 31) return 'invalid';

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return 'invalid';

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return 'invalid';

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = (today.getMonth() + 1) - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  if (age < 18) return 'underage';

  return 'valid';
};

export function PersonalData({
  onNext,
  data,
  onUpdate
}: {
  onNext?: () => void;
  data: any;
  onUpdate: (data: any) => void;
}) {
  const {
    gender,
    phoneCountry,
    firstName,
    lastName,
    city,
    country,
    phone,
    birthdateString,
    avatarUrl
  } = data;

  const setGender = (val: string) => onUpdate({ gender: val });
  const setPhoneCountry = (val: any) => onUpdate({ phoneCountry: val });
  const setFirstName = (val: string) => onUpdate({ firstName: val });
  const setLastName = (val: string) => onUpdate({ lastName: val });
  const setCity = (val: string) => onUpdate({ city: val });
  const setCountry = (val: string) => onUpdate({ country: val });
  const setPhone = (val: string) => onUpdate({ phone: val });
  const setBirthdateString = (val: string) => onUpdate({ birthdateString: val });
  const setAvatarUrl = (val: string | null) => onUpdate({ avatarUrl: val });
  const [isSaving, setIsSaving] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Split birthdate states
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");



  // Initialize birthdate splits from parent state on mount or when updated via autofill
  React.useEffect(() => {
    if (birthdateString) {
      if (birthdateString.includes(" / ")) {
        const parts = birthdateString.split(" / ");
        if (parts.length === 3) {
          setBirthDay(parts[0].padStart(2, "0"));
          setBirthMonth(parts[1].padStart(2, "0"));
          setBirthYear(parts[2]);
        }
      } else if (birthdateString.includes("-")) {
        const parts = birthdateString.split("-");
        if (parts.length === 3) {
          setBirthYear(parts[0]);
          setBirthMonth(parts[1].padStart(2, "0"));
          setBirthDay(parts[2].padStart(2, "0"));
        }
      } else if (birthdateString.includes("/")) {
        const parts = birthdateString.split("/");
        if (parts.length === 3) {
          setBirthDay(parts[0].padStart(2, "0"));
          setBirthMonth(parts[1].padStart(2, "0"));
          setBirthYear(parts[2]);
        }
      }
    }
  }, [birthdateString]);

  // Clear photo warning error declaratively when a photo has been uploaded
  React.useEffect(() => {
    if (avatarUrl && errorField === 'photo') {
      setErrorField(null);
    }
  }, [avatarUrl, errorField]);

  const updateParentBirthdate = (day: string, month: string, year: string) => {
    let formatted = "";
    if (day || month || year) {
      formatted = `${day} / ${month} / ${year}`;
    }
    setBirthdateString(formatted);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
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
      setIsCropping(false);

      const { publicUrl } = await uploadAvatar(croppedImage);
      setAvatarUrl(publicUrl);
      if (errorField === 'photo') setErrorField(null);
      setTempImage(null);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('No pudimos subir tu foto. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    setErrorField(null);

    // Pad single digits and expand years
    const paddedDay = birthDay.length === 1 ? '0' + birthDay : birthDay;
    const paddedMonth = birthMonth.length === 1 ? '0' + birthMonth : birthMonth;
    let fullYear = birthYear;
    if (birthYear.length === 2) {
      const yr = parseInt(birthYear);
      fullYear = (yr > 26 ? '19' : '20') + birthYear;
    }

    const finalBirthdate = (birthDay || birthMonth || birthYear) ? `${paddedDay} / ${paddedMonth} / ${fullYear}` : "";

    if (!avatarUrl) { setErrorField('photo'); return; }
    if (!firstName) { setErrorField('firstName'); return; }
    if (!lastName) { setErrorField('lastName'); return; }
    if (!gender) { setErrorField('gender'); return; }
    if (!finalBirthdate) { setErrorField('birthdate'); return; }
    const birthStatus = validateBirthdate(finalBirthdate);
    if (birthStatus === 'invalid') { setErrorField('birthdate'); return; }
    if (birthStatus === 'underage') { setErrorField('underage'); return; }
    if (!city || !country) { setErrorField('city'); return; }
    if (!phone) { setErrorField('phone'); return; }

    setIsSaving(true);

    // Simulate frontend local saving
    setTimeout(() => {
      setIsSaving(false);

      // Save data locally
      localStorage.setItem("luminus_profile_firstName", firstName);
      localStorage.setItem("luminus_profile_lastName", lastName);
      localStorage.setItem("luminus_profile_city", city);
      localStorage.setItem("luminus_profile_country", country);
      let finalPhoneToSave = `${phoneCountry.dial} ${phone}`;
      try {
        const parsed = parsePhoneNumberFromString(phone, phoneCountry.code as CountryCode);
        if (parsed) {
          finalPhoneToSave = parsed.formatInternational();
        }
      } catch (err) {
        console.error('Error formatting phone for storage:', err);
      }
      localStorage.setItem("luminus_profile_phone", finalPhoneToSave);
      localStorage.setItem("luminus_profile_gender", gender);
      localStorage.setItem("luminus_profile_birthdate", `${fullYear}-${paddedMonth}-${paddedDay}`);
      localStorage.setItem("luminus_profile_avatar", avatarUrl || "");

      if (onNext) onNext();
    }, 800);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleContinue();
      }}
      className="w-full h-full flex flex-col justify-start items-start gap-8 animate-in fade-in duration-300"
    >

      {/* Title Section */}
      <div className="w-full flex flex-col justify-start items-start gap-2">
        <h1 className="text-page-title text-primary">Datos personales</h1>
        <p className="text-body text-secondary">Necesitamos algunos datos básicos para crear tu cuenta.</p>
      </div>

      {/* Profile Photo Section */}
      <div className="w-full flex flex-col justify-start items-start gap-2.5">
        <div className="w-full inline-flex justify-start items-end gap-5">
          <div className="w-32 h-32 bg-white rounded-2xl flex justify-center items-center overflow-hidden shrink-0 relative border border-zinc-200">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-zinc-200 select-none flex items-center justify-center" style={{ fontSize: '104px', width: '104px', height: '104px' }}>
                person
              </span>
            )}
            {uploading && <div className="absolute inset-0 flex items-center justify-center text-slate-900 font-bold text-xs bg-white/40">...</div>}
          </div>

          <input type="file" accept="image/png, image/jpeg, image/webp, .png, .jpg, .jpeg, .webp" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={uploading} />

          <Button
            type="button"
            variant="slate"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mb-2"
          >
            {uploading ? 'Cargando...' : 'Subir Foto'}
          </Button>
        </div>
        {errorField === 'photo' && <p className="text-[#FF3D3D] text-[12px] font-bold">Sube una foto de perfil</p>}
      </div>

      {/* Fields Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 w-full">

        {/* Nombre */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2">
            <label className="text-label ml-1">Nombre</label>
            <InputField
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => {
                setFirstName(capitalizeName(e.target.value));
                if (errorField === 'firstName') setErrorField(null);
              }}
              variant="bordered"
              className={errorField === 'firstName' ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}
              enterKeyHint="next"
              autoComplete="given-name"
            />
            {errorField === 'firstName' && <p className="text-[#FF3D3D] text-[12px] font-bold">Campo requerido</p>}
          </div>
        </div>

        {/* Apellido */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2">
            <label className="text-label ml-1">Apellido</label>
            <InputField
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => {
                setLastName(capitalizeName(e.target.value));
                if (errorField === 'lastName') setErrorField(null);
              }}
              variant="bordered"
              className={errorField === 'lastName' ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}
              enterKeyHint="next"
              autoComplete="family-name"
            />
            {errorField === 'lastName' && <p className="text-[#FF3D3D] text-[12px] font-bold">Campo requerido</p>}
          </div>
        </div>

        {/* Género */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2">
            <SelectInput
              label="Género"
              value={gender}
              options={['Mujer', 'Hombre', 'No binario', 'Prefiero no decirlo']}
              onSelect={(val) => {
                setGender(val);
                if (errorField === 'gender') setErrorField(null);
              }}
              error={errorField === 'gender'}
            />
            {errorField === 'gender' && <p className="text-[#FF3D3D] text-[12px] font-bold">Selecciona género</p>}
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2">
            <label className="text-label ml-1">Fecha de Nacimiento</label>
            <div className="flex gap-3 items-center w-full">
              <div className="flex-1 min-w-0">
                <SelectInput
                  value={birthDay}
                  options={DAYS}
                  onSelect={(val) => {
                    setBirthDay(val);
                    updateParentBirthdate(val, birthMonth, birthYear);
                    if (errorField === 'birthdate' || errorField === 'underage') setErrorField(null);
                  }}
                  placeholder="Día"
                  error={errorField === 'birthdate' || errorField === 'underage'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <SelectInput
                  value={birthMonth}
                  options={MONTHS}
                  onSelect={(val) => {
                    setBirthMonth(val);
                    updateParentBirthdate(birthDay, val, birthYear);
                    if (errorField === 'birthdate' || errorField === 'underage') setErrorField(null);
                  }}
                  placeholder="Mes"
                  error={errorField === 'birthdate' || errorField === 'underage'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <SelectInput
                  value={birthYear}
                  options={YEARS}
                  onSelect={(val) => {
                    setBirthYear(val);
                    updateParentBirthdate(birthDay, birthMonth, val);
                    if (errorField === 'birthdate' || errorField === 'underage') setErrorField(null);
                  }}
                  placeholder="Año"
                  error={errorField === 'birthdate' || errorField === 'underage'}
                />
              </div>
            </div>
            {errorField === 'birthdate' && <p className="text-[#FF3D3D] text-[12px] font-bold">Fecha inválida o incompleta</p>}
            {errorField === 'underage' && <p className="text-[#FF3D3D] text-[12px] font-bold">Debes ser mayor de 18 años para registrarte</p>}
          </div>
        </div>

        {/* Ciudad */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2">
            <LocationInput
              label="Ciudad"
              defaultValue={city}
              onSelect={({ city, country, countryCode }) => {
                setCity(city);
                setCountry(country);

                // Auto-detect phone country from city selection
                const normalizedCountry = country.toLowerCase().trim();
                const mappedName = COUNTRY_SYNONYMS[normalizedCountry] || normalizedCountry;

                const detected = ALL_COUNTRIES.find(c =>
                  (countryCode && c.code.toLowerCase() === countryCode.toLowerCase()) ||
                  c.name.toLowerCase() === mappedName ||
                  c.name.toLowerCase() === normalizedCountry
                );
                if (detected) {
                  setPhoneCountry(detected);
                  if (phone) {
                    const formatter = new AsYouType(detected.code as CountryCode);
                    setPhone(formatter.input(phone));
                  }
                }
              }}
              className={errorField === 'city' ? '[&_input]:!border-[#FF3D3D] [&_input]:!ring-1 [&_input]:!ring-[#FF3D3D]' : ''}
            />
            {errorField === 'city' && <p className="text-[#FF3D3D] text-[12px] font-bold">Selecciona una ciudad de la lista de sugerencias</p>}
          </div>
        </div>

        {/* Celular */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2 relative">
            <label className="text-label ml-1">Celular</label>
            <PhoneInput
              value={phone}
              phoneCountry={phoneCountry || { code: 'XX', dial: '+00', name: 'Seleccionar país', priority: false }}
              onCountryChange={(matched) => setPhoneCountry(matched)}
              onChange={(newNumber) => {
                setPhone(newNumber);
                if (errorField === 'phone') setErrorField(null);
              }}
              error={errorField === 'phone'}
            />
            {errorField === 'phone' && <p className="text-[#FF3D3D] text-[12px] font-bold">Ingresa celular</p>}
          </div>
        </div>

      </div>

      <div className="w-full flex justify-end mt-4">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Continuar →'}
        </Button>
      </div>

      {isCropping && tempImage && (
        <PhotoEditor
          image={tempImage}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}
    </form>
  );
}
