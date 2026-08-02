"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { COUNTRIES, Country } from "@/utils/countries";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { PhoneInput } from "@/components/ui/PhoneInput";

export const SPACE_TYPE_OPTIONS = [
  {
    label: "Centro de desarrollo personal",
    value: "Centro de desarrollo personal",
    categoryArea: "Crecimiento Personal",
    description: "Coaching, mentoría, liderazgo, orientación y crecimiento personal.",
  },
  {
    label: "Centro de psicología y bienestar emocional",
    value: "Centro de psicología y bienestar emocional",
    categoryArea: "Bienestar Emocional",
    description: "Psicología, psicoterapia, acompañamiento emocional, talleres y grupos de apoyo.",
  },
  {
    label: "Centro de salud integral",
    value: "Centro de salud integral",
    categoryArea: "Salud Integral",
    description: "Atención médica, prevención, hábitos saludables y servicios coordinados de bienestar.",
  },
  {
    label: "Centro de actividad física",
    value: "Centro de actividad física",
    categoryArea: "Movimiento Físico",
    description: "Entrenamiento, yoga, pilates, movilidad, danza y otras prácticas corporales.",
  },
  {
    label: "Centro de nutrición",
    value: "Centro de nutrición",
    categoryArea: "Nutrición",
    description: "Consultas nutricionales, educación alimentaria y acompañamiento en hábitos de alimentación.",
  },
  {
    label: "Centro de meditación y espiritualidad",
    value: "Centro de meditación y espiritualidad",
    categoryArea: "Espiritualidad",
    description: "Meditación, mindfulness, respiración, encuentros y prácticas contemplativas.",
  },
  {
    label: "Espacio de familia y vínculos",
    value: "Espacio de familia y vínculos",
    categoryArea: "Vínculos",
    description: "Crianza, pareja, familia, talleres y actividades compartidas.",
  },
  {
    label: "Centro de terapias complementarias",
    value: "Centro de terapias complementarias",
    categoryArea: "Terapias Complementarias",
    description: "Masajes, acupuntura, reiki, reflexología y otras prácticas complementarias.",
  },
  {
    label: "Otro tipo de espacio",
    value: "Otro tipo de espacio",
    categoryArea: "Otro",
    description: "Permite escribir manualmente el tipo de espacio.",
  },
];

export function PlacesSearchAutocomplete({
  value: externalValue,
  onChange,
  onPlaceSelect,
  placeholder = "Nombre del espacio o dirección",
  className = "",
  error = false,
  clearOnSelect = false,
}: {
  value?: string;
  onChange?: (val: string) => void;
  onPlaceSelect: (placeId: string, description: string, mainText: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  clearOnSelect?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const {
    ready,
    value,
    suggestions: { status, data: suggestions },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: externalValue || "",
    debounce: 300,
  });

  const lastResolvedValueRef = useRef(externalValue || "");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== lastResolvedValueRef.current) {
      setValue(externalValue, false);
      lastResolvedValueRef.current = externalValue;
    }
  }, [externalValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect) {
        const preferredMaxHeight = 240;
        const spaceBelow = window.innerHeight - rect.bottom - 16;
        const spaceAbove = rect.top - 16;

        let top: number | undefined = rect.bottom + 4;
        let bottom: number | undefined = undefined;
        let maxHeight = preferredMaxHeight;

        if (spaceBelow < 120 && spaceAbove > spaceBelow) {
          top = undefined;
          bottom = window.innerHeight - rect.top + 4;
          maxHeight = Math.min(preferredMaxHeight, spaceAbove);
        } else {
          maxHeight = Math.min(preferredMaxHeight, spaceBelow);
        }

        maxHeight = Math.max(maxHeight, 100);

        setCoords({
          top,
          bottom,
          left: rect.left,
          width: rect.width,
          maxHeight,
        });
      }
    }
  };

  useEffect(() => {
    if (status === "OK" && suggestions.length > 0) {
      updateCoords();
      const handleScroll = (event: Event) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        clearSuggestions();
      };
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", updateCoords);
      };
    } else {
      setCoords(null);
    }
  }, [status, suggestions]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <InputField
        type="text"
        value={value}
        onChange={(e) => {
          const nextVal = e.target.value;
          setValue(nextVal);
          lastResolvedValueRef.current = nextVal;
          if (onChange) onChange(nextVal);
        }}
        disabled={!ready}
        placeholder={placeholder}
        className={`w-full ${error ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}`}
      />

      {status === "OK" &&
        suggestions.length > 0 &&
        mounted &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : "auto",
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : "auto",
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 10000,
            }}
            className="bg-white rounded-xl border border-slate-200 overflow-y-auto animate-in fade-in duration-200"
          >
            {suggestions.map(({ place_id, description, structured_formatting }) => (
              <div
                key={place_id}
                onClick={() => {
                  const main = structured_formatting?.main_text || description;
                  if (clearOnSelect) {
                    setValue("", false);
                    lastResolvedValueRef.current = "";
                    if (onChange) onChange("");
                  } else {
                    setValue(description, false);
                    lastResolvedValueRef.current = description;
                  }
                  clearSuggestions();
                  onPlaceSelect(place_id, description, main);
                }}
                className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none flex flex-col min-w-0"
              >
                <span className="text-[13px] font-bold text-slate-900 font-jakarta truncate">
                  {structured_formatting?.main_text || description}
                </span>
                <span className="text-[11px] text-slate-400 font-sans truncate">
                  {structured_formatting?.secondary_text || description}
                </span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

interface Step4ClinicsProps {
  clinicChoice: "yes" | "no" | null;
  setClinicChoice: (val: "yes" | "no" | null) => void;
  setClinicEnabled: (val: boolean) => void;
  spaceType: string;
  setSpaceType: (val: string) => void;
  customSpaceType: string;
  setCustomSpaceType: (val: string) => void;
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

export function Step4Clinics({
  clinicChoice,
  setClinicChoice,
  setClinicEnabled,
  spaceType,
  setSpaceType,
  customSpaceType,
  setCustomSpaceType,
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
  googlePlaceId,
  setGooglePlaceId,
  googleMapsUrl,
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
  photoAttribution,
  setPhotoAttribution,
  errorField,
  setErrorField,
  onNext,
  onBack,
}: Step4ClinicsProps) {
  const clinicContainerRef = useRef<HTMLDivElement>(null);
  const spaceTypeSelectRef = useRef<HTMLDivElement>(null);
  const customSpaceTypeInputRef = useRef<HTMLInputElement>(null);
  const clinicNameInputRef = useRef<HTMLInputElement>(null);
  const clinicDescriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const clinicAddressInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const [isOptimizingImage, setIsOptimizingImage] = useState(false);

  const handleSelectPlace = async (
    placeId: string,
    description: string,
    mainText: string,
    isAddressOnly = false
  ) => {
    try {
      const results = await getGeocode({ placeId });
      if (results && results[0]) {
        const first = results[0];
        const addressComponents = first.address_components;

        const localityComp = addressComponents.find((c: any) => c.types.includes("locality"));
        const admin2Comp = addressComponents.find((c: any) => c.types.includes("administrative_area_level_2"));
        const admin1Comp = addressComponents.find((c: any) => c.types.includes("administrative_area_level_1"));
        const sublocalityComp = addressComponents.find(
          (c: any) => c.types.includes("sublocality_level_1") || c.types.includes("sublocality")
        );
        const countryComp = addressComponents.find((c: any) => c.types.includes("country"));

        const detectedCity =
          localityComp?.long_name ||
          admin2Comp?.long_name ||
          admin1Comp?.long_name ||
          sublocalityComp?.long_name ||
          "";
        const detectedCountry = countryComp?.long_name || "";

        if (isAddressOnly) {
          setClinicAddress(first.formatted_address || description);
        } else {
          setClinicName(mainText || description);
          setClinicAddress(first.formatted_address || description);
        }

        if (detectedCity) setCity(detectedCity);
        if (detectedCountry) {
          setCountry(detectedCountry);
          const matched = COUNTRIES.find(
            (c) => c.name.toLowerCase() === detectedCountry.toLowerCase()
          );
          if (matched) setPhoneCountry(matched);
        }

        const { lat: placeLat, lng: placeLng } = await getLatLng(first);
        setLat(placeLat);
        setLng(placeLng);
        setGooglePlaceId(placeId);
        setGoogleMapsUrl(`https://www.google.com/maps/place/?q=place_id:${placeId}`);

        if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
          const service = new (window as any).google.maps.places.PlacesService(
            document.createElement("div")
          );
          service.getDetails(
            {
              placeId,
              fields: ["photos", "website", "formatted_phone_number", "international_phone_number", "editorial_summary"],
            },
            (placeDetails: any, statusDetails: any) => {
              if (
                statusDetails === (window as any).google.maps.places.PlacesServiceStatus.OK &&
                placeDetails
              ) {
                if (placeDetails.editorial_summary?.overview) {
                  setClinicDescription(placeDetails.editorial_summary.overview);
                }
                if (placeDetails.photos?.length > 0) {
                  const photosUrls = placeDetails.photos.map((p: any) =>
                    p.getUrl({ maxWidth: 800, maxHeight: 600 })
                  );
                  setSuggestedPhotos(photosUrls);
                  setActivePhotoIndex(0);

                  const attr = placeDetails.photos[0]?.html_attributions?.[0] || "";
                  setPhotoAttribution(attr);
                } else {
                  setSuggestedPhotos([]);
                  setActivePhotoIndex(0);
                  setPhotoAttribution("");
                }

                if (placeDetails.website) {
                  setClinicWebsite(placeDetails.website);
                }

                const rawPhone =
                  placeDetails.international_phone_number || placeDetails.formatted_phone_number;
                if (rawPhone) {
                  let cleanPhone = rawPhone;
                  const matchedCountry = detectedCountry
                    ? COUNTRIES.find((c) => c.name.toLowerCase() === detectedCountry.toLowerCase())
                    : null;
                  const currentDial = matchedCountry?.dial || phoneCountry?.dial;
                  if (currentDial && cleanPhone.startsWith(currentDial)) {
                    cleanPhone = cleanPhone.slice(currentDial.length).trim();
                  } else {
                    cleanPhone = cleanPhone.replace(/^\+\d+\s*/, "").trim();
                  }
                  setClinicPhone(cleanPhone);
                }
              }
            }
          );
        }
      }
    } catch (err) {
      console.error("Error geocoding selected place:", err);
    }
  };

  const handleCustomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsOptimizingImage(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const optimizedDataUrl = canvas.toDataURL("image/webp", 0.82);
          setSelectedPhotoUrl(optimizedDataUrl);
          setIsOptimizingImage(false);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error optimizing uploaded photo:", err);
      setIsOptimizingImage(false);
    }
  };

  const handleNextStep4 = () => {
    if (clinicChoice === null) {
      setErrorField("clinicChoice");
      clinicContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (clinicChoice === "yes") {
      if (!spaceType) {
        setErrorField("spaceType");
        spaceTypeSelectRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (spaceType === "Otro tipo de espacio" && !customSpaceType.trim()) {
        setErrorField("customSpaceType");
        customSpaceTypeInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        customSpaceTypeInputRef.current?.focus();
        return;
      }
      if (!clinicName.trim()) {
        setErrorField("clinicName");
        clinicNameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        clinicNameInputRef.current?.focus();
        return;
      }
      if (!clinicDescription.trim()) {
        setErrorField("clinicDescription");
        clinicDescriptionInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        clinicDescriptionInputRef.current?.focus();
        return;
      }
      if (!clinicAddress.trim()) {
        setErrorField("clinicAddress");
        clinicAddressInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        clinicAddressInputRef.current?.focus();
        return;
      }
      if (!city.trim()) {
        setErrorField("city");
        cityInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        cityInputRef.current?.focus();
        return;
      }
      if (!country.trim()) {
        setErrorField("country");
        countryInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        countryInputRef.current?.focus();
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
      <input
        type="file"
        ref={photoFileInputRef}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleCustomPhotoUpload}
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
          Espacios de atención
        </h1>
        <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
          Haz visibles los lugares donde brindas atención presencial.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed font-sans mt-1">
        <p>
          Puedes agregar consultorios, clínicas u otros espacios vinculados a tu actividad profesional. Estos aparecerán en el mapa de LUMINUS para que los usuarios puedan conocerlos y encontrarlos según su ubicación.
        </p>
      </div>

      {/* Question & 2 Selectable Option Cards */}
      <div ref={clinicContainerRef} className="flex flex-col gap-3 mt-1">
        <label className="text-label ml-1 font-jakarta font-bold text-slate-900">
          ¿Deseas agregar un espacio de atención presencial?
        </label>
        {errorField === "clinicChoice" && (
          <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Selecciona una opción para continuar</p>
        )}

        <div className="grid grid-cols-1 gap-3">
          {/* Option 1: Yes */}
          <div
            onClick={() => {
              setClinicChoice("yes");
              setClinicEnabled(true);
              if (errorField === "clinicChoice") setErrorField(null);
            }}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${clinicChoice === "yes"
              ? "border-slate-900 bg-white"
              : "border-slate-200 bg-white hover:border-slate-300"
              }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                Sí, quiero agregar un espacio
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Publica el consultorio, clínica o espacio donde atiendes presencialmente.
              </span>
            </div>

            {/* Expanded Unified Editable Form inside Option 1 Card */}
            {clinicChoice === "yes" && (
              <div
                className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-200/80 animate-in fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Input & Helper Text */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[14px] font-bold text-slate-900 font-jakarta">
                    Busca tu espacio
                  </h3>
                  <PlacesSearchAutocomplete
                    onPlaceSelect={handleSelectPlace}
                    placeholder="Nombre del espacio o dirección"
                    clearOnSelect={true}
                  />
                  <p className="text-slate-500 text-[13px] ml-1">
                    Selecciona un resultado para completar los datos automáticamente. Luego podrás revisarlos y editarlos.
                  </p>
                </div>

                {/* Editable Form Fields */}
                <div className="flex flex-col gap-4">
                  {/* Tipo de espacio */}
                  <div ref={spaceTypeSelectRef} className="flex flex-col gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-label ml-1">Tipo de espacio *</label>
                      <p className="text-slate-500 text-[13px] ml-1">
                        Selecciona el tipo de espacio según las principales actividades o servicios que ofrece.
                      </p>
                    </div>
                    <SelectInput
                      value={spaceType}
                      options={SPACE_TYPE_OPTIONS}
                      error={errorField === "spaceType"}
                      onSelect={(val) => {
                        setSpaceType(val);
                        if (errorField === "spaceType") setErrorField(null);
                      }}
                      placeholder="Selecciona"
                    />
                    {errorField === "spaceType" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Selecciona el tipo de espacio</p>
                    )}
                    {spaceType === "Otro tipo de espacio" && (
                      <div className="mt-1.5 flex flex-col gap-1">
                        <label className="text-label ml-1 text-slate-700">Otro tipo de espacio*</label>
                        <InputField
                          ref={customSpaceTypeInputRef}
                          type="text"
                          value={customSpaceType}
                          onChange={(e) => {
                            setCustomSpaceType(e.target.value);
                            if (errorField === "customSpaceType") setErrorField(null);
                          }}
                          placeholder="Escribe el tipo de espacio"
                          className={errorField === "customSpaceType" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                        />
                        {errorField === "customSpaceType" && (
                          <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Escribe el tipo de espacio</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label ml-1">Nombre del espacio *</label>
                    <InputField
                      ref={clinicNameInputRef}
                      type="text"
                      value={clinicName}
                      onChange={(e) => {
                        setClinicName(e.target.value);
                        if (errorField === "clinicName") setErrorField(null);
                      }}
                      placeholder="Ej. Consultorio Palermo / Centro Vital"
                      className={errorField === "clinicName" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                    />
                    {errorField === "clinicName" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa el nombre del espacio</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label ml-1">Descripción del espacio *</label>
                    <textarea
                      ref={clinicDescriptionInputRef}
                      value={clinicDescription}
                      onChange={(e) => {
                        setClinicDescription(e.target.value);
                        if (errorField === "clinicDescription") setErrorField(null);
                      }}
                      placeholder="Breve descripción del espacio, instalaciones, enfoque o comodidades..."
                      rows={3}
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-[14px] text-slate-800 focus:outline-none focus:border-black font-sans resize-none transition-all duration-200 ${errorField === "clinicDescription" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : "border-slate-200"
                        }`}
                    />
                    {errorField === "clinicDescription" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa la descripción del espacio</p>
                    )}
                  </div>

                  <div ref={clinicAddressInputRef} className="flex flex-col gap-2">
                    <label className="text-label ml-1">Dirección completa *</label>
                    <PlacesSearchAutocomplete
                      value={clinicAddress}
                      onChange={(val) => {
                        setClinicAddress(val);
                        if (errorField === "clinicAddress") setErrorField(null);
                      }}
                      onPlaceSelect={(placeId, description, mainText) =>
                        handleSelectPlace(placeId, description, mainText, true)
                      }
                      placeholder="Calle, Altura, Ciudad, País"
                      error={errorField === "clinicAddress"}
                    />
                    {errorField === "clinicAddress" && (
                      <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa la dirección completa</p>
                    )}

                    {/* Map Pin Preview */}
                    {lat !== null && lng !== null && (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center mt-1">
                        <iframe
                          title="Mapa de ubicación"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
                            }&q=${lat},${lng}&zoom=15`}
                        />
                        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-lg text-[12px] font-medium text-slate-800 border border-slate-200 flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-slate-900 text-[16px]">location_on</span>
                          <span className="truncate max-w-[240px]">{clinicName || clinicAddress}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-label ml-1">Ciudad *</label>
                      <InputField
                        ref={cityInputRef}
                        type="text"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errorField === "city") setErrorField(null);
                        }}
                        placeholder="Ej. Buenos Aires"
                        className={errorField === "city" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                      />
                      {errorField === "city" && (
                        <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa la ciudad</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label ml-1">País *</label>
                      <InputField
                        ref={countryInputRef}
                        type="text"
                        value={country}
                        onChange={(e) => {
                          const newCountry = e.target.value;
                          setCountry(newCountry);
                          if (errorField === "country") setErrorField(null);
                          const matched = COUNTRIES.find((c) => c.name.toLowerCase() === newCountry.toLowerCase());
                          if (matched) {
                            setPhoneCountry(matched);
                          }
                        }}
                        placeholder="Ej. Argentina"
                        className={errorField === "country" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                      />
                      {errorField === "country" && (
                        <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa el país</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-label ml-1">Sitio web o red social del espacio</label>
                    <p className="text-[12px] text-slate-500 ml-1 mb-0.5 font-sans">
                      Puedes ingresar la página web, perfil de Instagram o página de Facebook de tu espacio.
                    </p>
                    <InputField
                      type="text"
                      value={clinicWebsite}
                      onChange={(e) => setClinicWebsite(e.target.value)}
                      placeholder="https://... o @perfil"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label ml-1">Teléfono</label>
                    <PhoneInput
                      value={clinicPhone}
                      phoneCountry={phoneCountry}
                      onCountryChange={(matched) => setPhoneCountry(matched)}
                      onChange={(newNumber) => setClinicPhone(newNumber)}
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-label ml-1">Imagen del espacio</label>

                  {isOptimizingImage ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-lg gap-2 text-center animate-in fade-in duration-200">
                      <span className="animate-spin material-symbols-rounded text-emerald-600 text-[24px]">progress_activity</span>
                      <span className="text-[13px] font-semibold text-slate-800">Optimizando imagen automáticamente...</span>
                      <span className="text-[11px] text-slate-400">Reduciendo tamaño y convirtiendo a formato WebP ligero</span>
                    </div>
                  ) : selectedPhotoUrl ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <div className="relative h-44 aspect-[4/3] shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={selectedPhotoUrl}
                          alt="Imagen del espacio"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          <span className="material-symbols-rounded text-[14px]">check</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => photoFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl text-[12px] font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          <span className="material-symbols-rounded text-[18px]">upload_file</span>
                          Cambiar imagen
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPhotoUrl("")}
                          className="px-3.5 py-2 rounded-xl text-[12px] font-bold bg-white text-red-600 border border-slate-200 hover:bg-red-50 transition cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          <span className="material-symbols-rounded text-[18px]">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : suggestedPhotos.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <div className="relative h-44 aspect-[4/3] shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={suggestedPhotos[activePhotoIndex]}
                          alt="Foto del espacio"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPhotoUrl(suggestedPhotos[activePhotoIndex])}
                          className="px-4 py-2 rounded-xl text-[12px] font-bold bg-black text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
                        >
                          Usar esta imagen
                        </button>

                        <button
                          type="button"
                          onClick={() => photoFileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl text-[12px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer shrink-0"
                        >
                          Subir otra
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition cursor-pointer bg-slate-50/50 hover:bg-slate-50 gap-1.5 text-center"
                    >
                      <span className="material-symbols-rounded text-[26px] text-slate-400">upload_file</span>
                      <span className="text-[13px] font-semibold text-slate-700">Subir una imagen propia</span>
                      <span className="text-[11px] text-slate-400">Archivos JPG, PNG o WEBP</span>
                    </button>
                  )}
                </div>
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
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${clinicChoice === "no"
              ? "border-slate-900 bg-white"
              : "border-slate-200 bg-white hover:border-slate-300"
              }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                No por el momento
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Podrás agregar tus consultorios o espacios de atención en cualquier momento desde tu perfil.
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
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
