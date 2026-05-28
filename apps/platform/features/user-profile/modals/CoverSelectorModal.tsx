"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface CoverSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentCover: string;
}

export function CoverSelectorModal({ isOpen, onClose, onSelect, currentCover }: CoverSelectorModalProps) {
  const [selectedCover, setSelectedCover] = useState(currentCover);
  const covers = Array.from({ length: 9 }, (_, i) => `/covers/cover-${i + 1}.png`);

  useEffect(() => {
    if (isOpen) setSelectedCover(currentCover);
  }, [isOpen, currentCover]);

  const handleSave = () => {
    onSelect(selectedCover);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecciona una portada"
      maxWidth="720px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1 !h-11 !text-[13px] !font-normal !normal-case !tracking-normal">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white hover:!bg-slate-800">
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {covers.map((url) => (
          <div
            key={url}
            onClick={() => setSelectedCover(url)}
            className={`relative aspect-[16/7] rounded-xl overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-black group ${selectedCover === url ? 'ring-2 ring-black shadow-none' : 'border border-slate-100'}`}
          >
            <img src={url} alt="Cover option" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {selectedCover === url && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center shadow-none">
                  <span className="material-symbols-rounded text-[20px]">check</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
