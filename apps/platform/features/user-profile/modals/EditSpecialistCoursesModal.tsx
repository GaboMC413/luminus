"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectInput } from "@/components/ui/SelectInput";

const TYPE_OPTIONS = [
  { label: "Curso", value: "CURSO" },
  { label: "Taller", value: "TALLER" },
  { label: "Programa", value: "PROGRAMA" },
];

const MODALITY_OPTIONS = [
  { label: "Online en vivo", value: "Online en vivo" },
  { label: "Online grabado", value: "Online grabado" },
  { label: "Presencial", value: "Presencial" },
  { label: "Híbrido", value: "Híbrido" },
];

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

const EMPTY_COURSE: SpecialistCourseItem = {
  name: "",
  type: "CURSO",
  modality: "Online grabado",
  description: "",
  url: "",
  institution: "",
};

export function EditSpecialistCoursesModal({
  isOpen,
  onClose,
  initialCourses,
  onSave,
}: EditSpecialistCoursesModalProps) {
  const [courses, setCourses] = useState<SpecialistCourseItem[]>([]);
  const [draft, setDraft] = useState<SpecialistCourseItem>(EMPTY_COURSE);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCourses(initialCourses.map((c) => ({ ...c })));
    setDraft(EMPTY_COURSE);
    setEditingIndex(null);
    setShowForm(initialCourses.length === 0);
    setError("");
  }, [isOpen, initialCourses]);

  const handleImportUrl = async () => {
    const url = draft.url?.trim();
    if (!url) return;
    setImporting(true);
    setError("");
    try {
      const res = await fetch("/api/courses/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        setDraft((prev) => ({
          ...prev,
          name: prev.name || data.title || "",
          description: prev.description || data.description || "",
          institution: prev.institution || data.siteName || "",
          coverUrl: data.image || prev.coverUrl || null,
        }));
      }
    } catch {
      // Metadata autofill is optional; allow manual entry silently
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmDraft = () => {
    if (!draft.name.trim()) {
      setError("El nombre del curso o taller es obligatorio.");
      return;
    }
    const clean: SpecialistCourseItem = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description?.trim() || null,
      url: draft.url?.trim() || null,
      institution: draft.institution?.trim() || null,
    };

    if (editingIndex !== null) {
      setCourses((prev) => prev.map((c, idx) => (idx === editingIndex ? clean : c)));
    } else {
      setCourses((prev) => [...prev, clean]);
    }
    setDraft(EMPTY_COURSE);
    setEditingIndex(null);
    setShowForm(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(courses);
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
      subtitle="Comparte tus programas, talleres o cursos con la comunidad."
      maxWidth="560px"
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
        {courses.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {courses.map((course, idx) => (
              <div
                key={`${course.name}-${idx}`}
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-slate-900 truncate">
                    {course.name}
                  </p>
                  <p className="text-meta text-slate-500">
                    {[course.type, course.modality, course.institution].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraft({ ...EMPTY_COURSE, ...course });
                      setEditingIndex(idx);
                      setShowForm(true);
                    }}
                  >
                    Editar
                  </Button>
                  <button
                    type="button"
                    onClick={() => setCourses((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Eliminar curso"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm ? (
          <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <InputField
                  label="Enlace del curso (opcional)"
                  placeholder="https://..."
                  value={draft.url ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, url: e.target.value }))}
                />
              </div>
              <Button
                variant="soft"
                size="md"
                className="gap-1.5 shrink-0"
                onClick={handleImportUrl}
                disabled={importing || !draft.url?.trim()}
              >
                <LinkIcon className="w-4 h-4" />
                <span>{importing ? "Importando..." : "Autocompletar"}</span>
              </Button>
            </div>

            <InputField
              label="Nombre del curso o taller"
              placeholder="Ej. Mindfulness para el día a día"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectInput
                label="Tipo"
                options={TYPE_OPTIONS}
                value={draft.type}
                onSelect={(val) => setDraft((p) => ({ ...p, type: val }))}
              />
              <SelectInput
                label="Modalidad"
                options={MODALITY_OPTIONS}
                value={draft.modality ?? ""}
                onSelect={(val) => setDraft((p) => ({ ...p, modality: val }))}
              />
            </div>

            <InputField
              label="Plataforma o institución (opcional)"
              placeholder="Ej. Hotmart, Espacio LUMINUS"
              value={draft.institution ?? ""}
              onChange={(e) => setDraft((p) => ({ ...p, institution: e.target.value }))}
            />

            <TextAreaField
              label="Descripción breve (opcional)"
              placeholder="Qué aprenderán o trabajarán en este espacio..."
              rows={3}
              value={draft.description ?? ""}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(EMPTY_COURSE);
                  setEditingIndex(null);
                  setShowForm(false);
                }}
              >
                Cerrar
              </Button>
              <Button variant="soft" size="sm" onClick={handleConfirmDraft}>
                {editingIndex !== null ? "Actualizar" : "Agregar a la lista"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="soft"
            size="md"
            fullWidth
            className="gap-2"
            onClick={() => {
              setDraft(EMPTY_COURSE);
              setEditingIndex(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar curso o taller</span>
          </Button>
        )}

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
