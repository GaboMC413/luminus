"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextAreaField } from "@/components/ui/TextAreaField";

interface EditAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bio: string) => void;
  initialBio: string;
}

export function EditAboutModal({
  isOpen,
  onClose,
  onSave,
  initialBio,
}: EditAboutModalProps) {
  const [bio, setBio] = useState(initialBio);

  useEffect(() => {
    if (isOpen) {
      setBio(initialBio);
    }
  }, [isOpen, initialBio]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar sobre mí"
      maxWidth="540px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full sm:flex-1">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave(bio);
              onClose();
            }}
            className="w-full sm:flex-1"
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <TextAreaField
        label="Sobre mí"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={6}
        placeholder="Cuéntanos un poco sobre ti..."
      />
    </Modal>
  );
}
