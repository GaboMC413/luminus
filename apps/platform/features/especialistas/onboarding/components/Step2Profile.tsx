"use client";

import React, { useRef, useState } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SocialLink } from "../types";
import {
  StepHeader,
  TagSelector,
  SocialLinksEditor,
  FileUploadField,
  StepperNav,
} from "./molecules";

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
  const [customAreas, setCustomAreas] = useState<string[]>([]);

  const specialtySelectRef = useRef<HTMLDivElement>(null);
  const areasContainerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const institutionInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleArea = (area: string) => {
    if (errorField === "areas") setErrorField(null);
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleAddCustomArea = (newArea: string) => {
    if (newArea && !customAreas.includes(newArea)) {
      setCustomAreas([...customAreas, newArea]);
      if (!selectedAreas.includes(newArea)) {
        setSelectedAreas([...selectedAreas, newArea]);
      }
      if (errorField === "areas") setErrorField(null);
    }
  };

  const handleRemoveCustomArea = (areaToRemove: string) => {
    setSelectedAreas(selectedAreas.filter((a) => a !== areaToRemove));
    setCustomAreas(customAreas.filter((a) => a !== areaToRemove));
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
      <StepHeader
        title="Perfil profesional"
        subtitle="Completa la información que aparecerá en tu perfil."
      />

      <div className="flex flex-col gap-5 mt-1">
        {/* 1. Primary Specialty */}
        <div ref={specialtySelectRef} className="flex flex-col gap-1">
          <SelectInput
            label="Especialidad principal *"
            value={specialty}
            options={specialtyOptions}
            error={Boolean(errorField === "specialty")}
            onSelect={(val) => {
              setSpecialty(val);
              setSelectedAreas([]);
              if (errorField === "specialty") setErrorField(null);
            }}
            placeholder="Selecciona tu especialidad principal"
          />
          {errorField === "specialty" && (
            <p className="text-xs font-medium text-rose-600 mt-0.5 px-0.5">
              Selecciona tu especialidad principal
            </p>
          )}
        </div>

        {/* 2. Accompaniment Areas */}
        {specialty && (
          <div ref={areasContainerRef} className="mt-1">
            <TagSelector
              label="Áreas de acompañamiento *"
              helperText="Selecciona las áreas en las que trabajas."
              tags={TAG_GROUPS[specialty] || []}
              selectedTags={selectedAreas}
              onToggle={toggleArea}
              allowCustom
              customTags={customAreas}
              onAddCustom={handleAddCustomArea}
              onRemoveCustom={handleRemoveCustomArea}
              error={errorField === "areas" ? "Selecciona al menos un área de acompañamiento" : undefined}
            />
          </div>
        )}

        {/* 3. Professional Title */}
        <div className="flex flex-col gap-1">
          <InputField
            ref={titleInputRef}
            label="Título profesional *"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorField === "title") setErrorField(null);
            }}
            placeholder="Título profesional (ej. Psicólogo, Terapeuta)"
            error={errorField === "title" ? "Ingresa tu título profesional" : undefined}
          />
        </div>

        {/* 4. Educational Institution */}
        <div className="flex flex-col gap-1">
          <InputField
            ref={institutionInputRef}
            label="Institución de formación *"
            type="text"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              if (errorField === "institution") setErrorField(null);
            }}
            placeholder="Institución donde te formaste"
            error={errorField === "institution" ? "Indica la institución donde te formaste" : undefined}
          />
        </div>

        {/* 5. Bio */}
        <div className="flex flex-col gap-1">
          <TextAreaField
            ref={bioTextareaRef}
            label="Biografía y enfoque *"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (errorField === "bio") setErrorField(null);
            }}
            rows={4}
            placeholder="Describe brevemente tu formación, experiencia y enfoque de trabajo..."
            error={errorField === "bio" ? "Cuéntanos brevemente sobre tu experiencia" : undefined}
          />
        </div>

        {/* 6. Social Links */}
        <div className="mt-1">
          <SocialLinksEditor
            links={socialLinks}
            onChange={setSocialLinks}
            errorField={errorField}
            onClearError={() => {
              if (errorField?.startsWith("socialLink_")) setErrorField(null);
            }}
          />
        </div>

        {/* 7. Resume Attachment */}
        <div className="mt-1">
          <FileUploadField
            label="Currículum Vitae (Opcional)"
            helperText="Formato PDF o Word, máx. 10MB"
            file={resumeFile}
            onFileSelect={(file) => {
              setResumeFile(file);
              if (errorField === "resume") setErrorField(null);
            }}
            onFileRemove={() => setResumeFile(null)}
          />
        </div>
      </div>

      <StepperNav
        onBack={onBack}
        onNext={handleNextStep2}
        nextLabel="Siguiente"
      />
    </div>
  );
}

export default Step2Profile;
