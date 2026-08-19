"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import { LocationInput } from "@/components/ui/LocationInput";
import { SelectInput } from "@/components/ui/SelectInput";

interface ProfileData {
  first_name: string;
  last_name: string;
  profession: string;
  city: string;
  country: string;
  phone_number: string;
  birthdate: string;
  gender: string;
}

interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProfileData>) => void;
  initialData: ProfileData;
  initialFocusField?: string | null;
}

const MONTHS = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => {
  const d = (i + 1).toString().padStart(2, '0');
  return { label: d, value: d };
});

const currentYearNum = new Date().getFullYear();
const YEARS = Array.from({ length: currentYearNum - 1900 + 1 }, (_, i) => {
  const y = (currentYearNum - i).toString();
  return { label: y, value: y };
});

const isValidBirthdate = (val: string): boolean => {
  const clean = val.replace(/\s+/g, '');
  const parts = clean.split('/').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
  if (parts.length !== 3) return false;
  
  const [day, month, year] = parts;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;
  
  return true;
};

export function EditPersonalInfoModal({ isOpen, onClose, onSave, initialData, initialFocusField }: EditPersonalInfoModalProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  
  // Split birthdate states
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [dateError, setDateError] = useState("");
  const [locationError, setLocationError] = useState("");

  // Refs for auto-focusing & auto-tabbing
  const professionRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  
  const dayRef = useRef<HTMLDivElement>(null);
  
  const genderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialFocusField) {
      const timer = setTimeout(() => {
        if (initialFocusField === 'profession') professionRef.current?.focus();
        else if (initialFocusField === 'city') cityRef.current?.focus();
        else if (initialFocusField === 'birthdate') dayRef.current?.focus();
        else if (initialFocusField === 'gender') genderRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialFocusField]);

  // Reset errors when closing/opening modal
  useEffect(() => {
    if (!isOpen) {
      setDateError("");
      setLocationError("");
    }
  }, [isOpen]);

  // Initialize birthdate splits from initialData (YYYY-MM-DD -> split states)
  useEffect(() => {
    if (initialData.birthdate) {
      const parts = initialData.birthdate.split('-');
      if (parts.length === 3) {
        setBirthDay(parts[2]);
        setBirthMonth(parts[1]);
        setBirthYear(parts[0]);
      }
    }
  }, [initialData.birthdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Pad single digits
    const paddedDay = birthDay.length === 1 ? '0' + birthDay : birthDay;
    const paddedMonth = birthMonth.length === 1 ? '0' + birthMonth : birthMonth;
    let fullYear = birthYear;
    if (birthYear.length === 2) {
      const yr = parseInt(birthYear);
      fullYear = (yr > 26 ? '19' : '20') + birthYear;
    }

    const normalized = `${paddedDay} / ${paddedMonth} / ${fullYear}`;
    
    if (birthDay || birthMonth || birthYear) {
      if (!isValidBirthdate(normalized)) {
        setDateError("Fecha inválida");
        return;
      }
    }

    if (!formData.city || !formData.country) {
      setLocationError("Selecciona una ciudad de la lista de sugerencias");
      return;
    }

    // Convert birthdate splits back to YYYY-MM-DD for saving
    let finalBirthdate = "";
    if (paddedDay && paddedMonth && fullYear && isValidBirthdate(normalized)) {
      finalBirthdate = `${fullYear}-${paddedMonth}-${paddedDay}`;
    }

    onSave({
      ...formData,
      birthdate: finalBirthdate
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Información Personal"
      maxWidth="720px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !rounded-[10px] md:!rounded-[12px]">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="w-full md:flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white hover:!bg-slate-800 !rounded-[10px] md:!rounded-[12px]">
            Guardar cambios
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3.5 md:gap-y-5">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <label className="text-label text-[11px] md:text-xs ml-1">Nombre</label>
            <InputField
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Nombre"
              variant="bordered"
            />
          </div>
          <div className="flex flex-col gap-1.5 md:gap-2">
            <label className="text-label text-[11px] md:text-xs ml-1">Apellido</label>
            <InputField
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Apellido"
              variant="bordered"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label className="text-label text-[11px] md:text-xs ml-1">Profesión</label>
          <InputField
            ref={professionRef}
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            placeholder="Tu profesión"
            variant="bordered"
            autoFocus={initialFocusField === 'profession'}
          />
        </div>

        <div>
          <LocationInput
            ref={cityRef}
            label="Ciudad"
            defaultValue={formData.city}
            onSelect={({ city, country }) => {
              setFormData(prev => ({ ...prev, city, country }));
              setLocationError("");
            }}
            autoFocus={initialFocusField === 'city'}
            className={locationError ? '[&_input]:!border-[#FF3D3D] [&_input]:!ring-1 [&_input]:!ring-[#FF3D3D]' : ''}
          />
          {locationError && <p className="text-[#FF3D3D] text-[12px] font-bold mt-1 ml-1">{locationError}</p>}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>La fecha de nacimiento y género se gestionan desde los Ajustes de Cuenta.</span>
        </div>
      </form>
    </Modal>
  );
}
