"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CourseItem } from "@/features/especialistas/onboarding/types";
import {
  SpecialistCoursesForm,
  normalizeCourseType,
  validateCoursesList,
} from "@/features/especialistas/onboarding/components/SpecialistCoursesForm";

export interface SpecialistCourseItem {
  id?: string;
  name: string;
  type: string;
  description?: string | null;
  modality?: string | null;
  url?: string | null;
  coverUrl?: string | null;
  institution?: string | null;
}

interface EditSpecialistCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourses: SpecialistCourseItem[];
  onSave: (courses: SpecialistCourseItem[]) => Promise<void>;
}

function toCourseItem(c: SpecialistCourseItem): CourseItem {
  return {
    name: c.name || "",
    type: normalizeCourseType(c.type),
    description: c.description || "",
    modality: c.modality || "Online grabado",
    url: c.url || "",
    coverUrl: c.coverUrl || "",
    institution: c.institution || "",
  };
}

export function EditSpecialistCoursesModal({
  isOpen,
  onClose,
  initialCourses,
  onSave,
}: EditSpecialistCoursesModalProps) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [collapsedCourses, setCollapsedCourses] = useState<Record<number, boolean>>({});
  const [errorField, setErrorField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCourses(initialCourses.map(toCourseItem));
    setCollapsedCourses({});
    setErrorField(null);
    setError("");
  }, [isOpen, initialCourses]);

  const handleSave = async () => {
    const incompleteIndex = validateCoursesList(courses);
    if (incompleteIndex !== -1) {
      setCollapsedCourses((prev) => ({ ...prev, [incompleteIndex]: false }));
      setErrorField(`courseItem_${incompleteIndex}`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload: SpecialistCourseItem[] = courses.map((c) => ({
        name: c.name.trim(),
        type: c.type || "Curso",
        description: c.description?.trim() || null,
        modality: c.modality || "Online grabado",
        url: c.url.trim(),
        coverUrl: c.coverUrl?.trim() || null,
        institution: c.institution?.trim() || null,
      }));
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible guardar los cursos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cursos y talleres"
      subtitle="Comparte cursos, talleres o capacitaciones desde tu perfil."
      maxWidth="640px"
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
      <div className="flex flex-col gap-4">
        <SpecialistCoursesForm
          courses={courses}
          setCourses={setCourses}
          errorField={errorField}
          setErrorField={setErrorField}
          collapsedCourses={collapsedCourses}
          setCollapsedCourses={setCollapsedCourses}
        />

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
