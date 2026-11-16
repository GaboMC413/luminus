"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import {
  normalizeInstagramInput,
  normalizeLinkedinInput,
  normalizeWebsiteUrl,
  stripInstagramPrefix,
  stripLinkedinInPrefix,
  stripHttpsPrefix,
} from "@/utils/socialLinks";

export interface SpecialistPracticeFormData {
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
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setBio(initialData.bio ?? "");
    setInstitution(initialData.institution ?? "");
    setInstagramUrl(stripInstagramPrefix(initialData.instagramUrl ?? ""));
    setLinkedinUrl(stripLinkedinInPrefix(initialData.linkedinUrl ?? ""));
    setWebsiteUrl(stripHttpsPrefix(initialData.websiteUrl ?? ""));
    setErrors({});
  }, [isOpen, initialData]);

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    const normalizedInstagram = instagramUrl.trim() ? normalizeInstagramInput(instagramUrl) : "";
    const normalizedLinkedin = linkedinUrl.trim() ? normalizeLinkedinInput(linkedinUrl) : "";
    const normalizedWebsite = websiteUrl.trim() ? normalizeWebsiteUrl(websiteUrl) : "";

    if (instagramUrl.trim() && !normalizedInstagram) {
      nextErrors.instagramUrl = "Ingresa tu usuario (ej. tuusuario) o un enlace válido de Instagram";
    }
    if (linkedinUrl.trim() && !normalizedLinkedin) {
      nextErrors.linkedinUrl = "Ingresa tu perfil (ej. tuperfil) o un enlace válido de LinkedIn";
    }
    if (websiteUrl.trim() && !normalizedWebsite) {
      nextErrors.websiteUrl = "Ingresa una URL válida (ej. tusitio.com)";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        bio: bio.trim(),
        institution: institution.trim(),
        instagramUrl: normalizedInstagram ?? "",
        linkedinUrl: normalizedLinkedin ?? "",
        websiteUrl: normalizedWebsite ?? "",
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
      title="Editar sobre mi práctica"
      subtitle="Actualiza tu enfoque, formación y redes sociales."
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
            leftPrefix="instagram.com/"
            placeholder="tuusuario"
            value={instagramUrl}
            onChange={(e) => {
              const val = e.target.value;
              setInstagramUrl(/instagram\.com\/|instagr\.am\//i.test(val) ? stripInstagramPrefix(val) : val);
            }}
            error={errors.instagramUrl}
          />
          <InputField
            label="LinkedIn"
            leftPrefix="linkedin.com/in/"
            placeholder="tuperfil"
            value={linkedinUrl}
            onChange={(e) => {
              const val = e.target.value;
              setLinkedinUrl(/linkedin\.com\/in\//i.test(val) ? stripLinkedinInPrefix(val) : val);
            }}
            error={errors.linkedinUrl}
          />
          <InputField
            label="Sitio web"
            leftPrefix="https://"
            placeholder="tusitio.com"
            value={websiteUrl}
            onChange={(e) => {
              const val = e.target.value;
              setWebsiteUrl(/^https:\/\//i.test(val) ? stripHttpsPrefix(val) : val);
            }}
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
