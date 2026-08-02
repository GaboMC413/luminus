"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { SocialLink } from "../types";

export const TAG_GROUPS: Record<string, string[]> = {
  "Crecimiento personal": [
    "Coaching de vida",
    "Coaching ejecutivo",
    "Coaching ontológico",
    "Orientación vocacional",
    "Mentoría profesional",
    "Desarrollo de liderazgo",
    "Desarrollo organizacional",
    "Facilitación de procesos",
    "Formación en habilidades blandas",
    "Otro",
  ],
  "Bienestar emocional": [
    "Psicología",
    "Psicoterapia",
    "Terapia cognitivo-conductual",
    "Terapia sistémica",
    "Terapia gestáltica",
    "Terapia humanista",
    "Psicología positiva",
    "Acompañamiento en duelo",
    "Arteterapia",
    "Musicoterapia",
    "Otro",
  ],
  "Salud integral": [
    "Medicina general",
    "Medicina integrativa",
    "Medicina funcional",
    "Fisioterapia",
    "Terapia ocupacional",
    "Osteopatía",
    "Quiropraxia",
    "Medicina del dolor",
    "Medicina del sueño",
    "Ginecología",
    "Endocrinología",
    "Otro",
  ],
  "Movimiento físico": [
    "Entrenamiento personal",
    "Entrenamiento funcional",
    "Entrenamiento de fuerza",
    "Preparación física",
    "Yoga",
    "Pilates",
    "Movilidad",
    "Danza",
    "Calistenia",
    "Entrenamiento postural",
    "Acondicionamiento físico",
    "Otro",
  ],
  "Nutrición": [
    "Nutrición clínica",
    "Nutrición deportiva",
    "Nutrición funcional",
    "Nutrición vegetariana",
    "Nutrición vegana",
    "Nutrición materno-infantil",
    "Nutrición digestiva",
    "Nutrición hormonal",
    "Psiconutrición",
    "Educación alimentaria",
    "Otro",
  ],
  "Espiritualidad": [
    "Meditación",
    "Mindfulness",
    "Respiración consciente",
    "Acompañamiento espiritual",
    "Filosofía práctica",
    "Prácticas contemplativas",
    "Sonoterapia",
    "Facilitación de retiros",
    "Desarrollo espiritual",
    "Otro",
  ],
  "Vínculos": [
    "Terapia de pareja",
    "Terapia familiar",
    "Sexología",
    "Terapia sexual",
    "Mediación familiar",
    "Orientación parental",
    "Psicología perinatal",
    "Acompañamiento en crianza",
    "Comunicación interpersonal",
    "Otro",
  ],
  "Terapias complementarias": [
    "Acupuntura",
    "Medicina tradicional china",
    "Ayurveda",
    "Reiki",
    "Masoterapia",
    "Aromaterapia",
    "Reflexología",
    "Sonoterapia",
    "Terapia floral",
    "Terapias energéticas",
    "Biomagnetismo",
    "Otro",
  ],
};

const ALL_PLATFORMS = ["Instagram", "Facebook", "YouTube", "LinkedIn", "X", "Website"];

export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const formatted = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    new URL(formatted);
    return true;
  } catch {
    return false;
  }
};

interface Step2ProfileProps {
  specialty: string;
  setSpecialty: (val: string) => void;
  specialtyOptions: string[];
  selectedAreas: string[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<string[]>>;
  title: string;
  setTitle: (val: string) => void;
  institution: string;
  setInstitution: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  socialLinks: SocialLink[];
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  errorField: string | null;
  setErrorField: (val: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Profile({
  specialty,
  setSpecialty,
  specialtyOptions,
  selectedAreas,
  setSelectedAreas,
  title,
  setTitle,
  institution,
  setInstitution,
  bio,
  setBio,
  socialLinks,
  setSocialLinks,
  resumeFile,
  setResumeFile,
  errorField,
  setErrorField,
  onNext,
  onBack,
}: Step2ProfileProps) {
  const [customAreaInput, setCustomAreaInput] = useState("");
  const [customAreas, setCustomAreas] = useState<string[]>([]);

  const specialtySelectRef = useRef<HTMLDivElement>(null);
  const areasContainerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const institutionInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const toggleArea = (area: string) => {
    if (errorField === "areas") setErrorField(null);
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleAddCustomArea = () => {
    const trimmed = customAreaInput.trim();
    if (trimmed && !customAreas.includes(trimmed)) {
      setCustomAreas([...customAreas, trimmed]);
      if (!selectedAreas.includes(trimmed)) {
        setSelectedAreas([...selectedAreas, trimmed]);
      }
      setCustomAreaInput("");
      if (errorField === "areas") setErrorField(null);
    }
  };

  const handleRemoveCustomArea = (areaToRemove: string) => {
    setSelectedAreas(selectedAreas.filter((a) => a !== areaToRemove));
    setCustomAreas(customAreas.filter((a) => a !== areaToRemove));
  };

  const getSocialPlaceholder = (platform: string): string => {
    if (!platform) return "https://...";
    switch (platform.toLowerCase()) {
      case "youtube":
        return "https://www.youtube.com/...";
      case "instagram":
        return "https://www.instagram.com/...";
      case "facebook":
        return "https://www.facebook.com/...";
      case "linkedin":
        return "https://www.linkedin.com/in/...";
      case "x":
      case "twitter":
        return "https://x.com/...";
      case "website":
        return "https://...";
      default:
        return "https://...";
    }
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleAddSocialLinkRow = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  const handleRemoveSocialLinkRow = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleNextStep2 = () => {
    if (!specialty) {
      setErrorField("specialty");
      specialtySelectRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (selectedAreas.length === 0) {
      setErrorField("areas");
      areasContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!title.trim()) {
      setErrorField("title");
      titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleInputRef.current?.focus();
      return;
    }
    if (!institution.trim()) {
      setErrorField("institution");
      institutionInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      institutionInputRef.current?.focus();
      return;
    }
    if (!bio.trim()) {
      setErrorField("bio");
      bioTextareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      bioTextareaRef.current?.focus();
      return;
    }

    const invalidLinkIndex = socialLinks.findIndex((l) => {
      const url = l.url.trim();
      if (!url) return false;
      return !isValidUrl(url);
    });
    if (invalidLinkIndex !== -1) {
      setErrorField(`socialLink_${invalidLinkIndex}`);
      const inputEl = document.getElementById(`social-input-${invalidLinkIndex}`);
      inputEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputEl?.focus();
      return;
    }

    setErrorField(null);
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-title-display font-jakarta">Perfil profesional</h1>
        <p className="text-body-secondary">
          Comparte información sobre tu especialidad, experiencia y forma de trabajo.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-2">
        {/* 1. Primary Specialty */}
        <div className="flex flex-col gap-1">
          <SelectInput
            ref={specialtySelectRef}
            label="Especialidad principal *"
            value={specialty}
            options={specialtyOptions}
            error={errorField === "specialty"}
            onSelect={(val) => {
              setSpecialty(val);
              setSelectedAreas([]);
              if (errorField === "specialty") setErrorField(null);
            }}
            placeholder="Seleccioná tu especialidad principal"
          />
          {errorField === "specialty" && (
            <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
              Selecciona tu especialidad principal
            </p>
          )}
        </div>

        {/* 2. Accompaniment Areas */}
        {specialty && (
          <div ref={areasContainerRef} className="flex flex-col gap-3 mt-2 animate-in fade-in duration-200">
            <label className="text-label ml-1">Áreas de acompañamiento *</label>
            <p className="text-body-secondary text-[13px] ml-1 -mt-1">
              Selecciona las áreas en las que brindas acompañamiento. Puedes elegir varias opciones o agregar una nueva.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {(TAG_GROUPS[specialty] || []).map((tag) => {
                const isSelected = selectedAreas.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleArea(tag)}
                    className={`h-8 md:h-9 px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-200 border cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    {tag}
                    {isSelected && (
                      <span className="material-symbols-rounded text-[14px] shrink-0">check</span>
                    )}
                  </button>
                );
              })}
            </div>

            {errorField === "areas" && (
              <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
                Selecciona al menos un área de acompañamiento
              </p>
            )}

            {selectedAreas.includes("Otro") && (
              <div className="flex flex-col gap-2.5 mt-2 animate-in fade-in duration-200">
                <div className="flex gap-2 items-center">
                  <InputField
                    type="text"
                    value={customAreaInput}
                    onChange={(e) => setCustomAreaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomArea();
                      }
                    }}
                    placeholder="Agregar otra área de acompañamiento"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomArea}
                    variant="secondary"
                    className="!w-auto px-5 shrink-0"
                  >
                    Agregar
                  </Button>
                </div>

                {customAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {customAreas.map((cArea) => (
                      <span
                        key={cArea}
                        className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-medium bg-emerald-600 text-white"
                      >
                        {cArea}
                        <span className="material-symbols-rounded text-[14px] shrink-0">check</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomArea(cArea)}
                          className="hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-none text-white text-xs font-bold ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Professional Title */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-label ml-1">Título profesional *</label>
          <InputField
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorField === "title") setErrorField(null);
            }}
            placeholder="Ingresa tu título profesional"
            className={errorField === "title" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
          />
          {errorField === "title" && (
            <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Ingresa tu título profesional</p>
          )}
        </div>

        {/* 4. Educational Institution */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-label ml-1">Institución de formación *</label>
          <InputField
            ref={institutionInputRef}
            type="text"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              if (errorField === "institution") setErrorField(null);
            }}
            placeholder="Indica la institución donde te formaste"
            className={errorField === "institution" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
          />
          {errorField === "institution" && (
            <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
              Indica la institución donde te formaste
            </p>
          )}
        </div>

        {/* 5. Bio */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-label ml-1">Biografía y enfoque *</label>
          <textarea
            ref={bioTextareaRef}
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (errorField === "bio") setErrorField(null);
            }}
            placeholder="Resume tu trayectoria, tu enfoque profesional y la forma en que desarrollas tu práctica."
            rows={5}
            className={`reg-input-bordered !h-auto p-4 resize-none ${
              errorField === "bio" ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""
            }`}
          />
          {errorField === "bio" && (
            <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">Completa tu biografía profesional</p>
          )}
        </div>

        {/* 6. Dynamic Social Links List */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-2">
            <label className="text-label ml-1">Redes profesionales</label>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
              Opcional
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {socialLinks.map((link, idx) => {
              const availablePlatforms = ALL_PLATFORMS.filter(
                (p) =>
                  p === link.platform ||
                  !socialLinks.some((other, otherIdx) => otherIdx !== idx && other.platform === p)
              );
              const hasLinkError = errorField === `socialLink_${idx}`;
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <div className="w-36 shrink-0">
                      <SelectInput
                        value={link.platform}
                        options={availablePlatforms}
                        placeholder="Seleccionar"
                        onSelect={(val) => handleSocialLinkChange(idx, "platform", val)}
                      />
                    </div>
                    <InputField
                      id={`social-input-${idx}`}
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        handleSocialLinkChange(idx, "url", e.target.value);
                        if (errorField === `socialLink_${idx}`) setErrorField(null);
                      }}
                      placeholder={getSocialPlaceholder(link.platform)}
                      className={hasLinkError ? "!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]" : ""}
                    />
                    {socialLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLinkRow(idx)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-transparent border-none cursor-pointer shrink-0"
                        title="Eliminar enlace"
                      >
                        <span className="material-symbols-rounded text-[20px] block">delete</span>
                      </button>
                    )}
                  </div>
                  {hasLinkError && (
                    <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
                      Ingresa una URL o enlace válido
                    </p>
                  )}
                </div>
              );
            })}

            {socialLinks.length < ALL_PLATFORMS.length && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddSocialLinkRow}
                className="!w-auto self-start mt-1"
              >
                Agregar otro enlace
              </Button>
            )}
          </div>
        </div>

        {/* 7. Professional Resume */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <label className="text-label ml-1">Currículum profesional</label>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
              Opcional
            </span>
          </div>
          <p className="text-body-secondary text-[13px] ml-1 -mt-1">
            Puedes adjuntar tu currículum para ampliar la información de tu perfil.
          </p>
          <div className="flex flex-col gap-2.5 mt-1 w-full">
            <input
              type="file"
              ref={resumeInputRef}
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setResumeFile(file);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => resumeInputRef.current?.click()}
              className="!w-full border-dashed border-slate-200 hover:border-slate-300 py-3.5"
            >
              <span className="material-symbols-rounded text-[18px] mr-2">upload_file</span>
              {resumeFile ? resumeFile.name : "Subir currículum"}
            </Button>
            {resumeFile && (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl text-[12px]">
                <span className="truncate max-w-[300px] text-slate-700 font-medium">
                  {resumeFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer bg-transparent border-none"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-3 mt-8 pt-2">
        <Button onClick={onBack} variant="back">
          Atrás
        </Button>
        <Button onClick={handleNextStep2} variant="primary" className="!w-auto px-6 gap-2">
          Siguiente
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
