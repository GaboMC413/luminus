"use client";

import React from "react";
import { Clock, ExternalLink, Globe, MapPin, Phone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatSpaceAddress } from "@/utils/locationUtils";
import { resolveSocialHref } from "@/utils/socialLinks";

export interface SpaceDetailAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface SpaceDetailService {
  id?: string;
  name: string;
  isCustom?: boolean;
  category?: { id?: string; name?: string } | null;
}

export interface SpaceDetailItem {
  id?: string;
  name: string;
  spaceType?: string | null;
  customSpaceType?: string | null;
  categoryArea?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  googleMapsUrl?: string | null;
  phone?: string | null;
  website?: string | null;
  coverUrl?: string | null;
  spaceCategories?: Array<string | { category?: { name?: string | null } | null }>;
  services?: SpaceDetailService[];
  availability?: SpaceDetailAvailability[];
}

interface SpaceDetailModalProps {
  space: SpaceDetailItem | null;
  onClose: () => void;
}

const SPACE_TYPE_LABELS: Record<string, string> = {
  CONSULTORIO: "Consultorio",
  CENTRO: "Centro / Clínica",
  ESTUDIO: "Estudio / Sala",
  ONLINE: "Atención Online",
};

const FULL_DAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function formatSpaceType(spaceType?: string | null, customSpaceType?: string | null) {
  if (customSpaceType?.trim()) return customSpaceType.trim();
  if (!spaceType) return null;
  if (spaceType === "OTRO" || spaceType === "Otro") return null;
  return SPACE_TYPE_LABELS[spaceType] || spaceType;
}

function extractCategoryNames(space: SpaceDetailItem): string[] {
  const names: string[] = [];
  if (Array.isArray(space.spaceCategories)) {
    for (const item of space.spaceCategories) {
      const name = typeof item === "string" ? item : item?.category?.name;
      if (name?.trim()) names.push(name.trim());
    }
  }
  if (names.length === 0 && space.categoryArea?.trim()) {
    names.push(space.categoryArea.trim());
  }
  return Array.from(new Set(names));
}

export function SpaceDetailModal({ space, onClose }: SpaceDetailModalProps) {
  if (!space) return null;

  const spaceTypeLabel = formatSpaceType(space.spaceType, space.customSpaceType);
  const formattedAddress = formatSpaceAddress(space.address, space.city, space.country);
  const categoryNames = extractCategoryNames(space);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasCoordinates = space.lat != null && space.lng != null;
  const canEmbedMap = Boolean(hasCoordinates && googleMapsApiKey);
  const websiteHref = space.website ? resolveSocialHref("website", space.website) : null;

  const activeAvailability = (space.availability || [])
    .filter((av) => av.isActive !== false)
    .slice()
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <Modal
      isOpen={Boolean(space)}
      onClose={onClose}
      title={spaceTypeLabel || "Espacio de atención"}
      hideDividers
      maxWidth="640px"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cerrar
          </Button>
          {space.googleMapsUrl && (
            <a
              href={space.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="md" className="gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Abrir en Maps</span>
              </Button>
            </a>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {space.coverUrl && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
            <img
              src={space.coverUrl}
              alt={space.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h4 className="text-title-page text-slate-900 leading-snug">
            {space.name}
          </h4>
          {spaceTypeLabel && (
            <span className="text-body text-slate-500">{spaceTypeLabel}</span>
          )}
        </div>

        {categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categoryNames.map((cat) => (
              <span
                key={cat}
                className="h-7 px-3 inline-flex items-center rounded-full bg-slate-100 text-meta text-slate-700 font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {space.description && (
          <div className="bg-slate-50/80 rounded-2xl p-4">
            <p className="text-body text-slate-700 whitespace-pre-wrap leading-relaxed">
              {space.description}
            </p>
          </div>
        )}

        {(formattedAddress || space.phone || websiteHref) && (
          <div className="flex flex-col gap-2.5 bg-slate-50/80 rounded-2xl p-4">
            {formattedAddress && (
              <div className="flex items-start gap-2.5 text-body text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                <span>{formattedAddress}</span>
              </div>
            )}
            {space.phone && (
              <a
                href={`tel:${space.phone}`}
                className="flex items-center gap-2.5 text-body text-slate-700 hover:text-slate-900 transition-colors w-fit"
              >
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{space.phone}</span>
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-body text-slate-700 hover:text-slate-900 transition-colors w-fit"
              >
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="inline-flex items-center gap-1.5">
                  <span>Sitio web</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </a>
            )}
          </div>
        )}

        {canEmbedMap && (
          <div className="relative w-full h-52 rounded-xl overflow-hidden bg-slate-100">
            <iframe
              title={`Mapa de ${space.name}`}
              width="100%"
              height="100%"
              className="border-0"
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${space.lat},${space.lng}&zoom=15`}
            />
          </div>
        )}

        {space.services && space.services.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-label text-slate-700">Servicios y prácticas</span>
            <div className="flex flex-wrap gap-1.5">
              {space.services.map((service, idx) => (
                <span
                  key={service.id || `${service.name}-${idx}`}
                  className="h-7 px-3 inline-flex items-center rounded-full bg-slate-100/80 text-meta text-slate-700 font-medium"
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeAvailability.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-label text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Horarios de atención</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {activeAvailability.map((av, idx) => (
                <span
                  key={`${av.dayOfWeek}-${av.startTime}-${idx}`}
                  className="h-7 px-3 inline-flex items-center rounded-full bg-slate-50 text-meta text-slate-600 font-medium"
                >
                  {FULL_DAY_LABELS[av.dayOfWeek] || "Día"} · {av.startTime} – {av.endTime}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
