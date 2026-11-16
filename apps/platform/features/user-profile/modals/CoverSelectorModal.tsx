"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface CoverSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentCover: string;
}

export function CoverSelectorModal({ isOpen, onClose, onSelect, currentCover }: CoverSelectorModalProps) {
  const covers = Array.from({ length: 9 }, (_, i) => `/covers/cover-${i + 1}.png`);
  const [selectedCover, setSelectedCover] = useState(currentCover || covers[0]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCover(currentCover || covers[0]);
    }
  }, [isOpen, currentCover]);

  const handleSave = () => {
    if (!selectedCover) return;
    onSelect(selectedCover);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecciona una portada"
      subtitle="Elige una imagen para el encabezado de tu perfil."
      maxWidth="720px"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={!selectedCover}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-0.5">
        {covers.map((url, idx) => {
          const isSelected = selectedCover === url;
          return (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedCover(url)}
              aria-pressed={isSelected}
              aria-label={`Seleccionar portada ${idx + 1}`}
              className={`relative aspect-[16/7] rounded-xl overflow-hidden cursor-pointer transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                isSelected
                  ? "ring-2 ring-slate-900 ring-offset-2"
                  : "border border-slate-200/80 hover:border-slate-400"
              }`}
            >
              <img
                src={url}
                alt={`Portada ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {isSelected && (
                <span className="absolute top-2 right-2 bg-slate-900 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
