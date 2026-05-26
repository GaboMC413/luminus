"use client";

import React, { useState, useRef } from 'react';
import { PhotoEditor } from './PhotoEditor';
import { InputField } from '@/components/ui/InputField';
import { LocationInput } from '@/components/ui/LocationInput';
import { SelectInput } from '@/components/ui/SelectInput';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { COUNTRIES as ALL_COUNTRIES } from '@/utils/countries';
import { AsYouType, CountryCode } from 'libphonenumber-js';

const NEUTRAL_COUNTRY = { code: 'XX', dial: '+00', name: 'Seleccionar país', priority: false };

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

      // Perform a simulated upload generating a local object URL
      const localUrl = URL.createObjectURL(croppedImage);
      setAvatarUrl(localUrl);
      if (errorField === 'photo') setErrorField(null);
      setTempImage(null);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    setErrorField(null);
    if (!avatarUrl) { setErrorField('photo'); return; }
    if (!firstName) { setErrorField('firstName'); return; }
    if (!lastName) { setErrorField('lastName'); return; }
    if (!gender) { setErrorField('gender'); return; }
    if (!birthdateString || birthdateString.length < 10) { setErrorField('birthdate'); return; }
    if (!city) { setErrorField('city'); return; }
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
      localStorage.setItem("luminus_profile_phone", `${phoneCountry.dial}${phone}`);
      localStorage.setItem("luminus_profile_gender", gender);
      localStorage.setItem("luminus_profile_birthdate", birthdateString);
      localStorage.setItem("luminus_profile_avatar", avatarUrl || "");

      if (onNext) onNext();
    }, 800);
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-start gap-8 animate-in fade-in duration-300">

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

          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={uploading} />

          <Button
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
                setFirstName(e.target.value);
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
                setLastName(e.target.value);
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

        <SelectInput
          label="Género"
          value={gender}
          options={['Femenino', 'Masculino', 'No binario', 'Prefiero no decirlo']}
          onSelect={(val) => {
            setGender(val);
            if (errorField === 'gender') setErrorField(null);
          }}
          error={errorField === 'gender'}
        />
        {errorField === 'gender' && <p className="text-[#FF3D3D] text-[12px] font-bold -mt-4">Selecciona género</p>}

        {/* Fecha */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2">
            <label className="text-label ml-1">Fecha de Nacimiento</label>
            <InputField
              type="text"
              placeholder="DD / MM / YYYY"
              value={birthdateString}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 8);
                if (v.length >= 5) v = `${v.slice(0, 2)} / ${v.slice(2, 4)} / ${v.slice(4)}`;
                else if (v.length >= 3) v = `${v.slice(0, 2)} / ${v.slice(2)}`;
                setBirthdateString(v);
                if (errorField === 'birthdate') setErrorField(null);
              }}
              variant="bordered"
              className={errorField === 'birthdate' ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}
              enterKeyHint="next"
            />
            {errorField === 'birthdate' && <p className="text-[#FF3D3D] text-[12px] font-bold">Fecha inválida</p>}
          </div>
        </div>

        <LocationInput
          label="Ciudad"
          defaultValue={city}
          onSelect={({ city, country }) => {
            setCity(city);
            setCountry(country);

            // Auto-detect phone country from city selection
            const detected = ALL_COUNTRIES.find(c =>
              c.name.toLowerCase() === country.toLowerCase()
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
        {errorField === 'city' && <p className="text-[#FF3D3D] text-[12px] font-bold -mt-4">Selecciona ciudad</p>}

        {/* Celular */}
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col justify-start items-start gap-2 relative">
            <label className="text-label ml-1">Celular</label>
            <PhoneInput
              value={phone ? `${phoneCountry?.dial || ''} ${phone}` : ''}
              onChange={(fullVal) => {
                const dial = fullVal.split(' ')[0] || '';
                const rest = fullVal.slice(dial.length).trim();
                const matched = ALL_COUNTRIES.find(c => c.dial === dial);
                if (matched) {
                  setPhoneCountry(matched);
                }
                setPhone(rest);
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
          variant="primary"
          className="w-full"
          disabled={isSaving}
          onClick={handleContinue}
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
    </div>
  );
}
