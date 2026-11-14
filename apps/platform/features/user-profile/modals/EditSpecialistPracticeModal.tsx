"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectInput } from "@/components/ui/SelectInput";
import { useDynamicCategories } from "@/components/ui/InterestPill";
import { TagSelector } from "@/features/especialistas/onboarding/components/molecules/TagSelector";
import { TAG_GROUPS, isValidUrl } from "@/features/especialistas/onboarding/components/Step2Profile";

export interface SpecialistPracticeFormData {
  specialty: string;
  title: string;
  selectedAreas: string[];
  bio: string;
  institution: string;
  instagramUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
}

interface EditSpecialistPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<SpecialistPracticeFormData>;
  onSave: (data: SpecialistPracticeFormData) => Promise<void>;
}

export function EditSpecialistPracticeModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditSpecialistPracticeModalProps) {
  const categories = useDynamicCategories();

  const [specialty, setSpecialty] = useState("");
  const [title, setTitle] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSpecialty(initialData.specialty ?? "");
    setTitle(initialData.title ?? "");
    setSelectedAreas(Array.isArray(initialData.selectedAreas) ? initialData.selectedAreas : []);
    setBio(initialData.bio ?? "");
    setInstitution(initialData.institution ?? "");
    setInstagramUrl(initialData.instagramUrl ?? "");
    setLinkedinUrl(initialData.linkedinUrl ?? "");
    setWebsiteUrl(initialData.websiteUrl ?? "");
    setErrors({});
  }, [isOpen, initialData]);

  const specialtyOptions = useMemo(() => {
    const names = categories.length > 0
      ? categories.map((c: { name: string }) => c.name)
      : Object.keys(TAG_GROUPS);
    return names.map((name: string) => ({ label: name, value: name }));
  }, [categories]);

  const availableTags = useMemo(() => {
    if (specialty && TAG_GROUPS[specialty]) {
      return TAG_GROUPS[specialty];
    }
    return Array.from(new Set(Object.values(TAG_GROUPS).flat()));
  }, [specialty]);

  const customTags = useMemo(
    () => selectedAreas.filter((area) => !availableTags.includes(area)),
    [selectedAreas, availableTags]
  );

  const toggleArea = (tag: string) => {
    setSelectedAreas((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (instagramUrl.trim() && !isValidUrl(instagramUrl.trim())) {
      nextErrors.instagramUrl = "Ingresa una URL válida (ej. https://instagram.com/...)";
    }
    if (linkedinUrl.trim() && !isValidUrl(linkedinUrl.trim())) {
      nextErrors.linkedinUrl = "Ingresa una URL válida (ej. https://linkedin.com/in/...)";
    }
    if (websiteUrl.trim() && !isValidUrl(websiteUrl.trim())) {
      nextErrors.websiteUrl = "Ingresa una URL válida (ej. https://tusitio.com)";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        specialty: specialty.trim(),
        title: title.trim(),
        selectedAreas,
        bio: bio.trim(),
        institution: institution.trim(),
        instagramUrl: instagramUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        websiteUrl: websiteUrl.trim(),
      });
      onClose();
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : "No fue posible guardar los cambios.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar perfil profesional"
      subtitle="Actualiza tu especialidad, áreas de acompañamiento y enfoque."
      maxWidth="540px"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <SelectInput
          label="Especialidad principal"
          placeholder="Selecciona una categoría"
          options={specialtyOptions}
          value={specialty}
          onSelect={setSpecialty}
        />

        <InputField
          label="Título profesional o rol"
          placeholder="Ej. Psicóloga clínica · Terapeuta sistémica"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TagSelector
          label="Áreas de acompañamiento"
          helperText="Selecciona o agrega tus enfoques principales."
          tags={availableTags}
          selectedTags={selectedAreas}
          onToggle={toggleArea}
          allowCustom
          customTags={customTags}
          onAddCustom={(tag) => {
            if (!selectedAreas.includes(tag)) {
              setSelectedAreas((prev) => [...prev, tag]);
            }
          }}
          onRemoveCustom={(tag) =>
            setSelectedAreas((prev) => prev.filter((item) => item !== tag))
          }
        />

        <TextAreaField
          label="Sobre mi práctica"
          placeholder="Cuéntale a la comunidad cómo acompañas y qué pueden esperar de tus sesiones..."
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <InputField
          label="Formación / Certificación"
          placeholder="Ej. Universidad de la República · Formación en Mindfulness"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />

        <div className="pt-2 border-t border-slate-100 flex flex-col gap-4">
          <span className="text-label text-slate-600">Redes y sitio web (opcional)</span>
          <InputField
            label="Instagram"
            placeholder="https://instagram.com/tuusuario"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            error={errors.instagramUrl}
          />
          <InputField
            label="LinkedIn"
            placeholder="https://linkedin.com/in/tuperfil"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            error={errors.linkedinUrl}
          />
          <InputField
            label="Sitio web"
            placeholder="https://tusitio.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            error={errors.websiteUrl}
          />
        </div>

        {errors.submit && (
          <p className="text-xs font-medium text-rose-600">{errors.submit}</p>
        )}
      </div>
    </Modal>
  );
}
