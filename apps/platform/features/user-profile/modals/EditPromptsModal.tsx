"use client";

import React, { useState } from 'react';
import { CheckCircle2, X } from "lucide-react";
import { Button, ProfileButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ALL_PROMPTS, Prompt } from "../components/ProfilePrompts";
import { SelectInput } from "@/components/ui/SelectInput";

interface EditPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompts: Prompt[]) => void;
  initialPrompts: Prompt[];
  initialStep?: 'list' | 'select' | 'edit';
}

export function EditPromptsModal({ isOpen, onClose, onSave, initialPrompts, initialStep = 'list' }: EditPromptsModalProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<Prompt[]>(initialPrompts);
  const [activeStep, setActiveStep] = useState<'list' | 'select' | 'edit'>(initialStep);
  const [tempPrompt, setTempPrompt] = useState<Prompt | null>(null);

  const handleAddPrompt = () => {
    setActiveStep('select');
  };

  const handleSelectCategory = (category: any) => {
    setTempPrompt({ question: category.question, answer: category.options[0] });
    setActiveStep('edit');
  };

  const handleSaveTemp = () => {
    if (tempPrompt) {
      setSelectedPrompts([...selectedPrompts, tempPrompt]);
    }
    setTempPrompt(null);
    setActiveStep('list');
  };

  const handleRemove = (index: number) => {
    setSelectedPrompts(prev => prev.filter((_, i) => i !== index));
  };

  const modalFooter = (
    <>
      {activeStep === 'list' && (
        <>
          <Button variant="secondary" onClick={onClose} className="w-full md:flex-1">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave(selectedPrompts);
              onClose();
            }}
            className="w-full md:flex-1"
          >
            Guardar cambios
          </Button>
        </>
      )}
      {activeStep === 'select' && (
        <Button variant="secondary" onClick={() => setActiveStep('list')} className="w-full">
          Volver
        </Button>
      )}
      {activeStep === 'edit' && (
        <>
          <Button variant="secondary" onClick={() => setActiveStep('select')} className="w-full md:flex-1">
            Volver
          </Button>
          <Button variant="primary" onClick={handleSaveTemp} className="w-full md:flex-1">
            Aceptar
          </Button>
        </>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeStep === 'list' ? 'Editar reflexiones' : activeStep === 'select' ? 'Selecciona una reflexión' : 'Escribe tu respuesta'}
      maxWidth="720px"
      footer={modalFooter}
    >
      <div className="flex flex-col gap-3 md:gap-4">
        {activeStep === 'list' && (
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col gap-2.5 md:gap-3">
              {selectedPrompts.map((p, i) => {
                const cleanQ = p.question.trim().replace(/[…\. ]+$/, '');
                const cleanA = p.answer.charAt(0).toLowerCase() + p.answer.slice(1);

                return (
                  <div key={i} className="p-3 md:p-3.5 rounded-xl bg-slate-50 flex flex-col justify-center relative min-h-[70px] md:min-h-[80px] border border-slate-200/60">
                    <p className="text-sm md:text-base text-slate-700 italic pr-12 md:pr-16 leading-relaxed">
                      "<span className="text-slate-900 font-medium">{cleanQ}</span> {cleanA}"
                    </p>
                    <button
                      onClick={() => handleRemove(i)}
                      className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-colors text-slate-400 bg-transparent border-none outline-none cursor-pointer"
                      title="Eliminar reflexión"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <ProfileButton
              onClick={handleAddPrompt}
              icon="add"
              label="Agregar otra reflexión"
              className="w-full mt-1"
            />
          </div>
        )}

        {activeStep === 'select' && (
          <div className="flex flex-col gap-2">
            {ALL_PROMPTS.filter(cat => !selectedPrompts.some(p => p.question === cat.question)).length > 0 ? (
              ALL_PROMPTS.filter(cat => !selectedPrompts.some(p => p.question === cat.question)).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="input-text-field text-left flex items-center px-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {cat.question}
                </button>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-slate-300" />
                <p className="text-sm md:text-base text-slate-500">Has completado todas las reflexiones disponibles.</p>
              </div>
            )}
          </div>
        )}

        {activeStep === 'edit' && tempPrompt && (
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col gap-2.5 md:gap-3">
              <p className="text-sm md:text-base text-secondary italic px-1 leading-relaxed">
                {tempPrompt.question}
              </p>

              <SelectInput
                value={
                  ALL_PROMPTS.find(c => c.question === tempPrompt.question)?.options.includes(tempPrompt.answer)
                    ? tempPrompt.answer
                    : 'custom'
                }
                options={[
                  ...(ALL_PROMPTS.find(c => c.question === tempPrompt.question)?.options || []).map(opt => ({
                    label: opt,
                    value: opt
                  })),
                  { label: '✍️ Escribir mi propia respuesta...', value: 'custom' }
                ]}
                onSelect={(val) => {
                  if (val === 'custom') {
                    setTempPrompt({ ...tempPrompt, answer: '' });
                  } else {
                    setTempPrompt({ ...tempPrompt, answer: val });
                  }
                }}
              />
            </div>

            {(!ALL_PROMPTS.find(c => c.question === tempPrompt.question)?.options.includes(tempPrompt.answer) ||
              tempPrompt.answer === '') && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={tempPrompt.answer}
                    onChange={(e) => setTempPrompt({ ...tempPrompt, answer: e.target.value })}
                    className="input-text-field"
                    placeholder="Escribe aquí tu reflexión..."
                    autoFocus
                  />
                </div>
              )}
          </div>
        )}
      </div>
    </Modal>
  );
}
