"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { SocialLink } from "../../types";
import { isValidUrl } from "@/utils/socialLinks";

const ALL_PLATFORMS = ["Instagram", "LinkedIn", "YouTube", "Facebook", "X", "Website"];

export { isValidUrl };

const getSocialPlaceholder = (platform: string): string => {
  if (!platform) return "https://...";
  switch (platform.toLowerCase()) {
    case "youtube":
      return "https://www.youtube.com/...";
    case "instagram":
      return "@tuusuario o https://instagram.com/...";
    case "facebook":
      return "https://www.facebook.com/...";
    case "linkedin":
      return "tuperfil o https://linkedin.com/in/...";
    case "x":
    case "twitter":
      return "https://x.com/...";
    case "website":
      return "https://...";
    default:
      return "https://...";
  }
};

export interface SocialLinksEditorProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  errorField?: string | null;
  onClearError?: () => void;
  className?: string;
}

export function SocialLinksEditor({
  links,
  onChange,
  errorField,
  onClearError,
  className = "",
}: SocialLinksEditorProps) {
  const handleLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
    if (onClearError) onClearError();
  };

  const handleAdd = () => {
    onChange([...links, { platform: "", url: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
    if (onClearError) onClearError();
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          Redes profesionales <span className="text-[11px] font-normal text-slate-400 font-sans ml-1">(Opcional)</span>
        </label>
      </div>

      <div className="flex flex-col gap-2.5">
        {links.map((link, idx) => {
          const isError = errorField === `socialLink_${idx}`;
          return (
            <div key={idx} className="flex items-start gap-2 animate-in fade-in duration-150">
              <div className="w-36 sm:w-40 shrink-0">
                <SelectInput
                  value={link.platform}
                  options={ALL_PLATFORMS}
                  placeholder="Plataforma"
                  onSelect={(val) => handleLinkChange(idx, "platform", val)}
                />
              </div>

              <div className="flex-1">
                <InputField
                  id={`social-input-${idx}`}
                  type={
                    link.platform.toLowerCase() === "instagram" ||
                    link.platform.toLowerCase() === "linkedin"
                      ? "text"
                      : "url"
                  }
                  value={link.url}
                  onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                  placeholder={getSocialPlaceholder(link.platform)}
                  error={
                    isError
                      ? link.platform.toLowerCase() === "instagram"
                        ? "Ingresa un usuario válido (ej. @tuusuario) o URL de Instagram"
                        : "Ingresa una URL válida (ej. https://...)"
                      : undefined
                  }
                />
              </div>

              {links.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent cursor-pointer"
                  title="Eliminar red social"
                  aria-label="Eliminar red social"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {links.length < 5 && (
        <div className="pt-1">
          <Button
            type="button"
            onClick={handleAdd}
            variant="soft"
            size="sm"
            className="gap-1.5 self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar otra red</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default SocialLinksEditor;
