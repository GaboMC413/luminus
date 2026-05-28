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
          <Button variant="secondary" onClick={onClose} className="flex-1 !h-11 !text-[13px] !font-normal">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1 !h-11 !text-[13px] !font-normal !bg-black !text-white hover:!bg-slate-800">
            Guardar cambios
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-label ml-1">Nombre</label>
            <InputField
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Nombre"
              variant="bordered"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label ml-1">Apellido</label>
            <InputField
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Apellido"
              variant="bordered"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label ml-1">Profesión</label>
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

        <LocationInput
          ref={cityRef}
          label="Ciudad"
          defaultValue={formData.city}
          onSelect={({ city, country }) => {
            setFormData(prev => ({ ...prev, city, country }));
          }}
          autoFocus={initialFocusField === 'city'}
        />

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-label ml-1">Fecha de Nacimiento</label>
            <div className="flex gap-3 items-center w-full">
              <div className="flex-1 min-w-0">
                <SelectInput
                  ref={dayRef}
                  value={birthDay}
                  options={DAYS}
                  onSelect={(val) => {
                    setBirthDay(val);
                    setDateError("");
                  }}
                  placeholder="Día"
                  error={!!dateError}
                />
              </div>
              <div className="flex-1 min-w-0">
                <SelectInput
                  value={birthMonth}
                  options={MONTHS}
                  onSelect={(val) => {
                    setBirthMonth(val);
                    setDateError("");
                  }}
                  placeholder="Mes"
                  error={!!dateError}
                />
              </div>
              <div className="flex-1 min-w-0">
                <SelectInput
                  value={birthYear}
                  options={YEARS}
                  onSelect={(val) => {
                    setBirthYear(val);
                    setDateError("");
                  }}
                  placeholder="Año"
                  error={!!dateError}
                />
              </div>
            </div>
            {dateError && <p className="text-[#FF3D3D] text-[12px] font-bold mt-1">{dateError}</p>}
          </div>
          <SelectInput
            ref={genderRef}
            label="Género"
            value={formData.gender}
            options={[
              { label: 'Mujer', value: 'Mujer' },
              { label: 'Hombre', value: 'Hombre' },
              { label: 'No binario', value: 'No binario' },
              { label: 'Prefiero no decirlo', value: 'Prefiero no decirlo' }
            ]}
            onSelect={(val) => setFormData(prev => ({ ...prev, gender: val }))}
            autoFocus={initialFocusField === 'gender'}
          />
        </div>
      </form>
    </Modal>
  );
}
