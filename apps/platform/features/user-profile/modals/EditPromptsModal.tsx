"use client";

import React, { useState } from 'react';
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
          <Button variant="secondary" onClick={onClose} className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !rounded-[10px] md:!rounded-[12px]">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(selectedPrompts);
              onClose();
            }}
            className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white hover:!bg-slate-800 !rounded-[10px] md:!rounded-[12px]"
          >
            Guardar cambios
          </Button>
        </>
      )}
      {activeStep === 'select' && (
        <Button variant="secondary" onClick={() => setActiveStep('list')} className="w-full !h-11 !text-[13px] !font-normal !rounded-[10px] md:!rounded-[12px]">
          Volver
        </Button>
      )}
      {activeStep === 'edit' && (
        <>
          <Button variant="secondary" onClick={() => setActiveStep('select')} className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !rounded-[10px] md:!rounded-[12px]">
            Volver
          </Button>
          <Button onClick={handleSaveTemp} className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white !rounded-[10px] md:!rounded-[12px]">
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
      title={activeStep === 'list' ? 'Editar Mis Reflexiones' : activeStep === 'select' ? 'Selecciona una reflexión' : 'Escribe tu respuesta'}
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
                  <div key={i} className="p-2.5 md:p-3 rounded-[10px] md:rounded-[12px] bg-slate-50 flex flex-col justify-center relative min-h-[70px] md:min-h-[80px]">
                    <p className="text-sm md:text-base text-secondary italic pr-12 md:pr-16 leading-relaxed">
                      "<span className="text-secondary">{cleanQ}</span> {cleanA}"
                    </p>
                    <button
                      onClick={() => handleRemove(i)}
                      className="absolute top-1/2 -translate-y-1/2 right-4 p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-300 bg-transparent border-none outline-none cursor-pointer"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
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
                  className="reg-input-bordered !text-secondary !font-normal !justify-start !px-4 md:!px-6 hover:bg-slate-50 transition-colors !h-10 md:!h-12 !text-[13px] md:!text-[14px]"
                >
                  {cat.question}
                </button>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-rounded text-[40px] text-slate-200">check_circle</span>
                <p className="text-sm md:text-base text-muted">Has completado todas las reflexiones disponibles.</p>
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
                    className="reg-input-bordered !h-10 md:!h-12 !text-[13px] md:!text-[14px]"
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
