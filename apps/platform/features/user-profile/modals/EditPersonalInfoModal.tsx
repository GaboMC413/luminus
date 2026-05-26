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
  
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  
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
            <div className="flex gap-2 items-center">
              <InputField
                ref={dayRef}
                type="text"
                placeholder="DD"
                value={birthDay}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setBirthDay(v);
                  setDateError("");
                  if (v.length === 2) monthRef.current?.focus();
                }}
                className={`text-center !w-16 ${dateError ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}`}
                variant="bordered"
              />
              <span className="text-slate-400">/</span>
              <InputField
                ref={monthRef}
                type="text"
                placeholder="MM"
                value={birthMonth}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setBirthMonth(v);
                  setDateError("");
                  if (v.length === 2) {
                    yearRef.current?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !birthMonth) {
                    dayRef.current?.focus();
                  }
                }}
                className={`text-center !w-16 ${dateError ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}`}
                variant="bordered"
              />
              <span className="text-slate-400">/</span>
              <InputField
                ref={yearRef}
                type="text"
                placeholder="AAAA"
                value={birthYear}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setBirthYear(v);
                  setDateError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !birthYear) {
                    monthRef.current?.focus();
                  }
                }}
                className={`text-center flex-1 ${dateError ? '!border-[#FF3D3D] !ring-1 !ring-[#FF3D3D]' : ''}`}
                variant="bordered"
              />
            </div>
            {dateError && <p className="text-[#FF3D3D] text-[12px] font-bold mt-1">{dateError}</p>}
          </div>
          <SelectInput
            ref={genderRef}
            label="Género"
            value={formData.gender}
            options={[
              { label: 'Masculino', value: 'Masculino' },
              { label: 'Femenino', value: 'Femenino' },
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
