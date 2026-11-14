"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectInput } from "@/components/ui/SelectInput";

const SPACE_TYPE_OPTIONS = [
  { label: "Consultorio", value: "CONSULTORIO" },
  { label: "Centro / Clínica", value: "CENTRO" },
  { label: "Estudio / Sala", value: "ESTUDIO" },
  { label: "Atención Online", value: "ONLINE" },
  { label: "Otro", value: "OTRO" },
];

export interface SpecialistSpaceItem {
  id?: string;
  name: string;
  spaceType: string;
  customSpaceType?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  website?: string | null;
  googleMapsUrl?: string | null;
}

interface EditSpecialistSpacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSpaces: SpecialistSpaceItem[];
  onSave: (spaces: SpecialistSpaceItem[]) => Promise<void>;
}

const EMPTY_SPACE: SpecialistSpaceItem = {
  name: "",
  spaceType: "CONSULTORIO",
  description: "",
  address: "",
  city: "",
  country: "",
  phone: "",
  website: "",
  googleMapsUrl: "",
};

export function EditSpecialistSpacesModal({
  isOpen,
  onClose,
  initialSpaces,
  onSave,
}: EditSpecialistSpacesModalProps) {
  const [spaces, setSpaces] = useState<SpecialistSpaceItem[]>([]);
  const [draft, setDraft] = useState<SpecialistSpaceItem>(EMPTY_SPACE);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSpaces(initialSpaces.map((s) => ({ ...s })));
    setDraft(EMPTY_SPACE);
    setEditingIndex(null);
    setShowForm(initialSpaces.length === 0);
    setError("");
  }, [isOpen, initialSpaces]);

  const handleConfirmDraft = () => {
    if (!draft.name.trim()) {
      setError("El nombre del espacio es obligatorio.");
      return;
    }
    const clean: SpecialistSpaceItem = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description?.trim() || null,
      address: draft.address?.trim() || null,
      city: draft.city?.trim() || null,
      country: draft.country?.trim() || null,
      phone: draft.phone?.trim() || null,
      website: draft.website?.trim() || null,
      googleMapsUrl: draft.googleMapsUrl?.trim() || null,
    };

    if (editingIndex !== null) {
      setSpaces((prev) => prev.map((s, idx) => (idx === editingIndex ? clean : s)));
    } else {
      setSpaces((prev) => [...prev, clean]);
    }
    setDraft(EMPTY_SPACE);
    setEditingIndex(null);
    setShowForm(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(spaces);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible guardar los espacios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Espacios de atención"
      subtitle="Administra los consultorios, centros o modalidades donde atiendes."
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
        {spaces.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {spaces.map((space, idx) => (
              <div
                key={`${space.id || space.name}-${idx}`}
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-slate-900 truncate">
                    {space.name}
                  </p>
                  <p className="text-meta text-slate-500 truncate">
                    {[space.spaceType, space.address, space.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraft({ ...EMPTY_SPACE, ...space });
                      setEditingIndex(idx);
                      setShowForm(true);
                    }}
                  >
                    Editar
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSpaces((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Eliminar espacio"
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
            <InputField
              label="Nombre del espacio"
              placeholder="Ej. Consultorio Pocitos / Atención Online"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            />

            <SelectInput
              label="Tipo de espacio"
              options={SPACE_TYPE_OPTIONS}
              value={draft.spaceType}
              onSelect={(val) => setDraft((p) => ({ ...p, spaceType: val }))}
            />

            <TextAreaField
              label="Descripción (opcional)"
              placeholder="Detalles sobre el espacio o modalidad..."
              rows={2}
              value={draft.description ?? ""}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
            />

            <InputField
              label="Dirección (opcional)"
              placeholder="Calle, número, barrio"
              value={draft.address ?? ""}
              onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Ciudad (opcional)"
                placeholder="Ej. Montevideo"
                value={draft.city ?? ""}
                onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))}
              />
              <InputField
                label="Teléfono / WhatsApp (opcional)"
                placeholder="+598 ..."
                value={draft.phone ?? ""}
                onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <InputField
              label="Enlace de Google Maps (opcional)"
              placeholder="https://maps.google.com/..."
              value={draft.googleMapsUrl ?? ""}
              onChange={(e) => setDraft((p) => ({ ...p, googleMapsUrl: e.target.value }))}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(EMPTY_SPACE);
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
              setDraft(EMPTY_SPACE);
              setEditingIndex(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar espacio de atención</span>
          </Button>
        )}

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
