"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { useDynamicCategories } from "@/components/ui/InterestPill";
import { TagSelector } from "@/features/especialistas/onboarding/components/molecules/TagSelector";
import { TAG_GROUPS } from "@/features/especialistas/onboarding/components/Step2Profile";

export interface SpecialistSpecialtyFormData {
  specialty: string;
  title: string;
  selectedAreas: string[];
}

interface EditSpecialistSpecialtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<SpecialistSpecialtyFormData>;
  onSave: (data: SpecialistSpecialtyFormData) => Promise<void>;
}

export function EditSpecialistSpecialtyModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditSpecialistSpecialtyModalProps) {
  const categories = useDynamicCategories();

  const [specialty, setSpecialty] = useState("");
  const [title, setTitle] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSpecialty(initialData.specialty ?? "");
    setTitle(initialData.title ?? "");
    setSelectedAreas(Array.isArray(initialData.selectedAreas) ? initialData.selectedAreas : []);
    setError("");
  }, [isOpen, initialData]);

  const specialtyOptions = useMemo(() => {
    const names =
      categories.length > 0
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
    setSaving(true);
    setError("");
    try {
      await onSave({
        specialty: specialty.trim(),
        title: title.trim(),
        selectedAreas,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar especialidad y áreas"
      subtitle="Actualiza tu especialidad principal, rol y áreas de acompañamiento."
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

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
