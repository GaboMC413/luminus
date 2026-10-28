"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";

interface CommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment";
  targetId: string;
  authorName?: string;
}

const REPORT_REASONS = [
  "Comportamiento abusivo o acoso",
  "Spam o contenido comercial no deseado",
  "Contenido inapropiado u ofensivo",
  "Suplantación de identidad",
  "Otro",
];

export function CommunityReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  authorName,
}: CommunityReportModalProps) {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsSuccess(false);
    setReportReason("");
    setReportDescription("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulate backend report registration (or POST to moderation queue)
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err) {
      console.error("Error submitting report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reportar"
      maxWidth="440px"
      containerClassName="shadow-none"
      footerClassName="px-5 py-3.5 border-t border-zinc-100 flex items-center gap-3 w-full"
      footer={
        isSuccess ? null : (
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !reportReason}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px] !bg-[#FF4B4B] hover:!bg-[#E03A3A] !text-white flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-rounded text-[18px]">flag</span>
                  <span>Reportar</span>
                </>
              )}
            </Button>
          </>
        )
      }
    >
      {isSuccess ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2.5 text-center animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-[26px]">check_circle</span>
          </div>
          <h4 className="text-sm font-bold font-jakarta text-slate-900 mt-1">
            Reporte enviado
          </h4>
          <p className="text-xs text-slate-500 font-sans max-w-[280px]">
            Revisaremos el contenido a la brevedad para cuidar la calidad y seguridad de la comunidad.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <SelectInput
              label="Motivo del reporte *"
              value={reportReason}
              onSelect={(val) => setReportReason(val)}
              placeholder="Selecciona una opción..."
              options={REPORT_REASONS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Detalles adicionales (opcional)
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Proporciona más detalles si lo deseas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-slate-300 outline-none resize-none h-24 text-slate-800 font-medium"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
