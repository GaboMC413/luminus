"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

interface UpdateBillingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: () => void;
}

export function UpdateBillingInfoModal({
  isOpen,
  onClose,
  currentInfo,
  onSuccess,
}: UpdateBillingInfoModalProps) {
  const [name, setName] = useState(currentInfo.name);
  const [email, setEmail] = useState(currentInfo.email);
  const [phone, setPhone] = useState(currentInfo.phone);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentInfo.name);
      setEmail(currentInfo.email);
      setPhone(currentInfo.phone);
      setErrorMessage(null);
    }
  }, [isOpen, currentInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Por favor ingresa tu nombre completo.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/membership/customer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar la información.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "No se pudo actualizar la información.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizar información de facturación"
      maxWidth="460px"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {errorMessage}
          </div>
        )}

        <InputField
          label="Nombre completo"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. María López"
          autoComplete="name"
        />

        <InputField
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          autoComplete="email"
        />

        <InputField
          label="Número de celular"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="99 123 456"
          autoComplete="tel"
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={submitting}
            className="w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting}
            className="w-auto"
          >
            {submitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
