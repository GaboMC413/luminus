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
          <Button variant="secondary" onClick={onClose} className="flex-1 !h-11 !text-[13px] !font-normal">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(bio);
              onClose();
            }}
            className="flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white hover:!bg-slate-800"
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <label className="text-label ml-1">Sobre mí</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full min-h-[240px] p-4 rounded-[12px] border border-slate-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-body resize-none"
          placeholder="Cuéntanos un poco sobre ti..."
        />
      </div>
    </Modal>
  );
}
