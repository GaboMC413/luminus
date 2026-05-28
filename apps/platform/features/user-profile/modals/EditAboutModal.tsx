"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface EditAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bio: string) => void;
  initialBio: string;
}

export function EditAboutModal({ isOpen, onClose, onSave, initialBio }: EditAboutModalProps) {
  const [bio, setBio] = useState(initialBio);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Sobre mí"
      maxWidth="720px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !rounded-[10px] md:!rounded-[12px]">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(bio);
              onClose();
            }}
            className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white hover:!bg-slate-800 !rounded-[10px] md:!rounded-[12px]"
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5 md:gap-2">
        <label className="text-[11px] md:text-label ml-1">Sobre mí</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full min-h-[160px] md:min-h-[240px] p-3 md:p-4 rounded-[10px] md:rounded-[12px] border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm md:text-base resize-none leading-relaxed"
          placeholder="Cuéntanos un poco sobre ti..."
        />
      </div>
    </Modal>
  );
}
