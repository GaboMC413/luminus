"use client";

import React, { useRef, useState } from "react";
import { Country } from "@/utils/countries";
import { Button } from "@/components/ui/Button";
import { SPACE_TYPE_OPTIONS_CONFIG } from "@/utils/constants";
import { SpaceServiceItem } from "../types";
import {
  PlacesSearchAutocomplete,
  SpecialistSpaceForm,
  validateSpecialistSpaceData,
} from "./SpecialistSpaceForm";

export const SPACE_TYPE_OPTIONS = SPACE_TYPE_OPTIONS_CONFIG;
export { PlacesSearchAutocomplete };

interface Step4SpacesProps {
  clinicChoice: "yes" | "no" | null;
  setClinicChoice: (val: "yes" | "no" | null) => void;
  setClinicEnabled: (val: boolean) => void;
  spaceType: string;
  setSpaceType: (val: string) => void;
  customSpaceType: string;
  setCustomSpaceType: (val: string) => void;
  spaceCategories: string[];
  setSpaceCategories: React.Dispatch<React.SetStateAction<string[]>>;
  spaceServices: SpaceServiceItem[];
  setSpaceServices: React.Dispatch<React.SetStateAction<SpaceServiceItem[]>>;
  clinicName: string;
  setClinicName: (val: string) => void;
  clinicDescription: string;
  setClinicDescription: (val: string) => void;
  clinicAddress: string;
  setClinicAddress: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
  lat: number | null;
  setLat: (val: number | null) => void;
  lng: number | null;
  setLng: (val: number | null) => void;
  googlePlaceId: string | null;
  setGooglePlaceId: (val: string | null) => void;
  googleMapsUrl: string | null;
  setGoogleMapsUrl: (val: string | null) => void;
  clinicPhone: string;
  setClinicPhone: (val: string) => void;
  clinicWebsite: string;
  setClinicWebsite: (val: string) => void;
  phoneCountry: Country;
  setPhoneCountry: (val: Country) => void;
  selectedPhotoUrl: string;
  setSelectedPhotoUrl: (val: string) => void;
  suggestedPhotos: string[];
  setSuggestedPhotos: (val: string[]) => void;
  activePhotoIndex: number;
  setActivePhotoIndex: (val: number) => void;
  photoAttribution: string;
  setPhotoAttribution: (val: string) => void;
  errorField: string | null;
  setErrorField: (val: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Spaces({
  clinicChoice,
  setClinicChoice,
  setClinicEnabled,
  spaceType,
  setSpaceType,
  customSpaceType,
  setCustomSpaceType,
  spaceCategories = [],
  setSpaceCategories,
  spaceServices = [],
  setSpaceServices,
  clinicName,
  setClinicName,
  clinicDescription,
  setClinicDescription,
  clinicAddress,
  setClinicAddress,
  city,
  setCity,
  country,
  setCountry,
  lat,
  setLat,
  lng,
  setLng,
  setGooglePlaceId,
  setGoogleMapsUrl,
  clinicPhone,
  setClinicPhone,
  clinicWebsite,
  setClinicWebsite,
  phoneCountry,
  setPhoneCountry,
  selectedPhotoUrl,
  setSelectedPhotoUrl,
  suggestedPhotos,
  setSuggestedPhotos,
  activePhotoIndex,
  setActivePhotoIndex,
  setPhotoAttribution,
  errorField,
  setErrorField,
  onNext,
  onBack,
}: Step4SpacesProps) {
  const clinicContainerRef = useRef<HTMLDivElement>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  const handleNextStep4 = () => {
    if (clinicChoice === null) {
      setErrorField("clinicChoice");
      clinicContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (clinicChoice === "yes") {
      const invalidField = validateSpecialistSpaceData({
        clinicName,
        clinicDescription,
        clinicAddress,
        city,
        country,
        spaceType,
        customSpaceType,
        spaceCategories,
        spaceServices,
      });

      if (invalidField) {
        setErrorField(invalidField);
        setFocusTrigger((prev) => prev + 1);
        return;
      }

      if (!selectedPhotoUrl && suggestedPhotos.length > 0) {
        setSelectedPhotoUrl(suggestedPhotos[activePhotoIndex]);
      }
      setClinicEnabled(true);
    } else {
      setClinicEnabled(false);
    }

    setErrorField(null);
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
          Espacios de atención
        </h1>
        <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
          Agrega los lugares donde atiendes presencialmente.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed font-sans mt-1">
        <p>Tus espacios aparecerán en la sección Espacios de LUMINUS.</p>
      </div>

      {/* Main Choice */}
      <div ref={clinicContainerRef} className="flex flex-col gap-3 mt-1">
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          ¿Deseas agregar un espacio?
        </label>
        {errorField === "clinicChoice" && (
          <p className="text-xs font-medium text-rose-600 ml-1">
            Selecciona una opción para continuar
          </p>
        )}

        <div className="grid grid-cols-1 gap-3">
          {/* Option 1: Yes */}
          <div
            onClick={() => {
              setClinicChoice("yes");
              setClinicEnabled(true);
              if (errorField === "clinicChoice") setErrorField(null);
            }}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              clinicChoice === "yes"
                ? "border-slate-900 bg-white"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                Sí, agregar un espacio
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Publica el lugar donde atiendes presencialmente.
              </span>
            </div>

            {clinicChoice === "yes" && (
              <div
                className="mt-5 pt-5 border-t border-slate-200/80 animate-in fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <SpecialistSpaceForm
                  spaceType={spaceType}
                  setSpaceType={setSpaceType}
                  customSpaceType={customSpaceType}
                  setCustomSpaceType={setCustomSpaceType}
                  spaceCategories={spaceCategories}
                  setSpaceCategories={setSpaceCategories}
                  spaceServices={spaceServices}
                  setSpaceServices={setSpaceServices}
                  clinicName={clinicName}
                  setClinicName={setClinicName}
                  clinicDescription={clinicDescription}
                  setClinicDescription={setClinicDescription}
                  clinicAddress={clinicAddress}
                  setClinicAddress={setClinicAddress}
                  city={city}
                  setCity={setCity}
                  country={country}
                  setCountry={setCountry}
                  lat={lat}
                  setLat={setLat}
                  lng={lng}
                  setLng={setLng}
                  setGooglePlaceId={setGooglePlaceId}
                  setGoogleMapsUrl={setGoogleMapsUrl}
                  clinicPhone={clinicPhone}
                  setClinicPhone={setClinicPhone}
                  clinicWebsite={clinicWebsite}
                  setClinicWebsite={setClinicWebsite}
                  phoneCountry={phoneCountry}
                  setPhoneCountry={setPhoneCountry}
                  selectedPhotoUrl={selectedPhotoUrl}
                  setSelectedPhotoUrl={setSelectedPhotoUrl}
                  suggestedPhotos={suggestedPhotos}
                  setSuggestedPhotos={setSuggestedPhotos}
                  activePhotoIndex={activePhotoIndex}
                  setActivePhotoIndex={setActivePhotoIndex}
                  setPhotoAttribution={setPhotoAttribution}
                  errorField={errorField}
                  setErrorField={setErrorField}
                  focusTrigger={focusTrigger}
                />
              </div>
            )}
          </div>

          {/* Option 2: No */}
          <div
            onClick={() => {
              setClinicChoice("no");
              setClinicEnabled(false);
              if (errorField === "clinicChoice") setErrorField(null);
            }}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              clinicChoice === "no"
                ? "border-slate-900 bg-white"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                Agregar más adelante
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Podrás hacerlo desde tu perfil.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center gap-3 mt-8 pt-2">
        <Button onClick={onBack} variant="back">
          Atrás
        </Button>
        <Button onClick={handleNextStep4} variant="primary" className="!w-auto px-6 gap-2">
          Continuar
        </Button>
      </div>
    </div>
  );
}

export const Step4Clinics = Step4Spaces;
