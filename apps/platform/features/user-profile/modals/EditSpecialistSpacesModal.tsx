"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { COUNTRIES, Country } from "@/utils/countries";
import { SpaceServiceItem } from "@/features/especialistas/onboarding/types";
import {
  SpecialistSpaceForm,
  validateSpecialistSpaceData,
} from "@/features/especialistas/onboarding/components/SpecialistSpaceForm";

export interface SpecialistSpaceItem {
  id?: string;
  name: string;
  spaceType: string;
  customSpaceType?: string | null;
  categoryArea?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  googlePlaceId?: string | null;
  phone?: string | null;
  website?: string | null;
  googleMapsUrl?: string | null;
  coverUrl?: string | null;
  spaceCategories?: Array<string | { category?: { name?: string } }>;
  spaceServices?: SpaceServiceItem[];
  services?: Array<{
    id?: string;
    name: string;
    isCustom?: boolean;
    category?: { name?: string } | null;
  }>;
}

interface EditSpecialistSpacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSpaces: SpecialistSpaceItem[];
  onSave: (spaces: SpecialistSpaceItem[]) => Promise<void>;
}

const LEGACY_SPACE_TYPE_MAP: Record<string, string> = {
  CONSULTORIO: "Consultorio",
  CENTRO: "Centro",
  ESTUDIO: "Estudio",
  OTRO: "Otro",
};

function normalizeSpaceType(raw?: string | null): string {
  if (!raw) return "";
  return LEGACY_SPACE_TYPE_MAP[raw] || raw;
}

function extractCategories(space: SpecialistSpaceItem): string[] {
  if (Array.isArray(space.spaceCategories) && space.spaceCategories.length > 0) {
    const names = space.spaceCategories
      .map((item) => (typeof item === "string" ? item : item?.category?.name || ""))
      .filter(Boolean);
    if (names.length > 0) return Array.from(new Set(names));
  }

  const fromServices = (space.spaceServices || [])
    .map((s) => s.categoryName)
    .concat((space.services || []).map((s) => s.category?.name || ""))
    .filter(Boolean);
  if (fromServices.length > 0) return Array.from(new Set(fromServices));

  return space.categoryArea ? [space.categoryArea] : [];
}

function extractServices(space: SpecialistSpaceItem): SpaceServiceItem[] {
  if (Array.isArray(space.spaceServices) && space.spaceServices.length > 0) {
    return space.spaceServices;
  }
  if (Array.isArray(space.services) && space.services.length > 0) {
    return space.services
      .map((s) => ({
        name: s.name,
        categoryName: s.category?.name || space.categoryArea || "",
        isCustom: !!s.isCustom,
      }))
      .filter((s) => s.name && s.categoryName);
  }
  return [];
}

function resolvePhoneState(rawPhone?: string | null, rawCountry?: string | null) {
  let matchedCountry =
    (rawCountry
      ? COUNTRIES.find((c) => c.name.toLowerCase() === rawCountry.trim().toLowerCase())
      : undefined) || COUNTRIES[0];

  let localPhone = rawPhone?.trim() || "";
  if (localPhone) {
    const byDial = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => localPhone.startsWith(c.dial));
    if (byDial) {
      matchedCountry = byDial;
      localPhone = localPhone.slice(byDial.dial.length).trim();
    }
  }

  return { matchedCountry, localPhone };
}

export function EditSpecialistSpacesModal({
  isOpen,
  onClose,
  initialSpaces,
  onSave,
}: EditSpecialistSpacesModalProps) {
  const [spaces, setSpaces] = useState<SpecialistSpaceItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Exact Step4Spaces form state
  const [clinicName, setClinicName] = useState("");
  const [clinicDescription, setClinicDescription] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicWebsite, setClinicWebsite] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  const [spaceType, setSpaceType] = useState("");
  const [customSpaceType, setCustomSpaceType] = useState("");
  const [spaceCategories, setSpaceCategories] = useState<string[]>([]);
  const [spaceServices, setSpaceServices] = useState<SpaceServiceItem[]>([]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
  const [suggestedPhotos, setSuggestedPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const resetDraftForm = () => {
    setEditingId(undefined);
    setClinicName("");
    setClinicDescription("");
    setClinicAddress("");
    setCity("");
    setCountry("");
    setLat(null);
    setLng(null);
    setGooglePlaceId(null);
    setGoogleMapsUrl(null);
    setClinicPhone("");
    setClinicWebsite("");
    setPhoneCountry(COUNTRIES[0]);
    setSpaceType("");
    setCustomSpaceType("");
    setSpaceCategories([]);
    setSpaceServices([]);
    setSelectedPhotoUrl("");
    setSuggestedPhotos([]);
    setActivePhotoIndex(0);
    setErrorField(null);
    setError("");
    setFormKey((k) => k + 1);
  };

  const hydrateDraftFromSpace = (space: SpecialistSpaceItem) => {
    const { matchedCountry, localPhone } = resolvePhoneState(space.phone, space.country);
    setEditingId(space.id);
    setClinicName(space.name || "");
    setClinicDescription(space.description || "");
    setClinicAddress(space.address || "");
    setCity(space.city || "");
    setCountry(space.country || "");
    setLat(space.lat !== null && space.lat !== undefined ? Number(space.lat) : null);
    setLng(space.lng !== null && space.lng !== undefined ? Number(space.lng) : null);
    setGooglePlaceId(space.googlePlaceId || null);
    setGoogleMapsUrl(space.googleMapsUrl || null);
    setClinicPhone(localPhone);
    setClinicWebsite(space.website || "");
    setPhoneCountry(matchedCountry);
    setSpaceType(normalizeSpaceType(space.spaceType));
    setCustomSpaceType(space.customSpaceType || "");
    setSpaceCategories(extractCategories(space));
    setSpaceServices(extractServices(space));
    setSelectedPhotoUrl(space.coverUrl || "");
    setSuggestedPhotos([]);
    setActivePhotoIndex(0);
    setErrorField(null);
    setError("");
    setFormKey((k) => k + 1);
  };

  useEffect(() => {
    if (!isOpen) return;
    setSpaces(
      initialSpaces.map((s) => ({
        ...s,
        spaceCategories: extractCategories(s),
        spaceServices: extractServices(s),
      }))
    );
    setEditingIndex(null);
    setShowForm(initialSpaces.length === 0);
    resetDraftForm();
  }, [isOpen, initialSpaces]);

  const buildDraftSpace = (): SpecialistSpaceItem | null => {
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
      return null;
    }

    const resolvedPhotoUrl =
      selectedPhotoUrl || (suggestedPhotos.length > 0 ? suggestedPhotos[activePhotoIndex] : "");

    return {
      ...(editingId ? { id: editingId } : {}),
      name: clinicName.trim(),
      spaceType,
      customSpaceType: spaceType === "Otro" ? customSpaceType.trim() : null,
      categoryArea: spaceCategories[0] || null,
      description: clinicDescription.trim(),
      address: clinicAddress.trim(),
      city: city.trim(),
      country: country.trim(),
      lat,
      lng,
      googlePlaceId,
      googleMapsUrl,
      phone: clinicPhone.trim() ? `${phoneCountry.dial} ${clinicPhone.trim()}` : null,
      website: clinicWebsite.trim() || null,
      coverUrl: resolvedPhotoUrl || null,
      spaceCategories,
      spaceServices,
    };
  };

  const handleConfirmDraft = () => {
    const clean = buildDraftSpace();
    if (!clean) return;

    if (editingIndex !== null) {
      setSpaces((prev) => prev.map((s, idx) => (idx === editingIndex ? clean : s)));
    } else {
      setSpaces((prev) => [...prev, clean]);
    }
    resetDraftForm();
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    let spacesToSave = spaces;
    const hasDraftInput = Boolean(
      clinicName.trim() ||
        clinicDescription.trim() ||
        clinicAddress.trim() ||
        city.trim() ||
        country.trim() ||
        spaceType ||
        customSpaceType.trim() ||
        spaceCategories.length > 0 ||
        spaceServices.length > 0 ||
        clinicPhone.trim() ||
        clinicWebsite.trim() ||
        selectedPhotoUrl
    );

    if (showForm && (editingIndex !== null || hasDraftInput)) {
      const draft = buildDraftSpace();
      if (!draft) return;

      spacesToSave =
        editingIndex !== null
          ? spaces.map((s, idx) => (idx === editingIndex ? draft : s))
          : [...spaces, draft];
    }

    setSaving(true);
    setError("");
    try {
      await onSave(spacesToSave);
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
      subtitle="Agrega los lugares donde atiendes presencialmente."
      maxWidth="680px"
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
                    {[
                      space.customSpaceType || normalizeSpaceType(space.spaceType),
                      space.address,
                      space.city,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      hydrateDraftFromSpace(space);
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
          <div className="flex flex-col gap-5 p-4 rounded-xl border border-slate-200 bg-white">
            <SpecialistSpaceForm
              key={formKey}
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
              errorField={errorField}
              setErrorField={setErrorField}
              focusTrigger={focusTrigger}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetDraftForm();
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
              resetDraftForm();
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
