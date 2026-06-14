import React, { useState, useEffect, useRef } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { LocationInput } from "@/components/ui/LocationInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { DAYS, MONTHS, YEARS, isValidBirthdate } from "@/utils/profileDateUtils";

export interface EditableFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  isDate?: boolean;
  isSelect?: boolean;
  isLocation?: boolean;
  isPhone?: boolean;
  phoneCountry?: any;
  onCountryChange?: (country: any) => void;
  options?: string[];
  className?: string;
  onSave?: (newValue: string, extraValue?: string) => void | Promise<void>;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
}

export function EditableField({
  id,
  label,
  value,
  placeholder,
  type = "text",
  isDate = false,
  isSelect = false,
  isLocation = false,
  isPhone = false,
  phoneCountry,
  onCountryChange,
  options = [],
  className = "",
  onSave,
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter
}: EditableFieldProps) {
  const isEditing = editingFieldId === id;
  const isAnotherEditing = editingFieldId !== null && editingFieldId !== id;
  const [currentValue, setCurrentValue] = useState(value);
  const [birthdateString, setBirthdateString] = useState(value);
  const [extraValue, setExtraValue] = useState("");
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const lastAttentionRef = useRef(attentionCounter);

  // Split birthdate states
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [validationError, setValidationError] = useState("");

  // Sync state with incoming value
  useEffect(() => {
    setCurrentValue(value);
    if (isDate) {
      setBirthdateString(value);
      const parts = value.split(" / ");
      if (parts.length === 3) {
        setBirthDay(parts[0]);
        setBirthMonth(parts[1]);
        setBirthYear(parts[2]);
      } else {
        setBirthDay("");
        setBirthMonth("");
        setBirthYear("");
      }
      setValidationError("");
    }
  }, [value, isDate]);

  // Watch for attention requests from other fields
  useEffect(() => {
    if (isEditing && attentionCounter > lastAttentionRef.current) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 400);
      lastAttentionRef.current = attentionCounter;
      return () => clearTimeout(timer);
    }
    lastAttentionRef.current = attentionCounter;
  }, [attentionCounter, isEditing]);

  // Reset errors when editing starts
  useEffect(() => {
    if (isEditing) {
      setValidationError("");
    }
  }, [isEditing]);

  const handleEditClick = () => {
    if (isAnotherEditing) {
      setAttentionCounter(prev => prev + 1);
      return;
    }
    setEditingFieldId(id);
  };

  const handleSave = async () => {
    if (isDate) {
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
          setValidationError("Fecha inválida");
          return;
        }
      }

      await onSave?.(normalized, extraValue);
    } else {
      if (isLocation && (!currentValue || !extraValue)) {
        setValidationError("Selecciona una ciudad de la lista de sugerencias");
        return;
      }
      await onSave?.(currentValue, extraValue);
    }
    setValidationError("");
    setEditingFieldId(null);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    if (isDate) {
      setBirthdateString(value);
      const parts = value.split(" / ");
      if (parts.length === 3) {
        setBirthDay(parts[0]);
        setBirthMonth(parts[1]);
        setBirthYear(parts[2]);
      } else {
        setBirthDay("");
        setBirthMonth("");
        setBirthYear("");
      }
    }
    setValidationError("");
    setEditingFieldId(null);
  };

  return (
    <div className={`flex flex-col gap-2 w-full max-w-lg relative ${className}`}>
      <label className="text-label ml-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          {isSelect ? (
            <SelectInput
              value={currentValue}
              options={options.map(opt => ({ label: opt, value: opt }))}
              onSelect={(val) => isEditing && setCurrentValue(val)}
              disabled={!isEditing}
              disabledOpacity={false}
              className={`${!isEditing ? "[&_.reg-input-bordered]:bg-slate-50 [&_.reg-input-bordered]:!border-none [&_.reg-input-bordered_span]:!text-slate-500 pointer-events-none" : "[&_.reg-input-bordered]:bg-white [&_.reg-input-bordered]:border-black [&_.reg-input-bordered_span]:!text-black"}`}
            />
          ) : isLocation ? (
            <div className="flex flex-col gap-2 w-full">
              <LocationInput
                defaultValue={currentValue}
                onSelect={({ city: selCity, country: selCountry }) => {
                  if (isEditing) {
                    setCurrentValue(selCity);
                    setExtraValue(selCountry);
                    setValidationError("");
                  }
                }}
                disabled={!isEditing}
                className={`${!isEditing ? "[&_.reg-input-bordered]:bg-slate-50 [&_.reg-input-bordered]:!border-none [&_input]:!text-slate-500 pointer-events-none" : `[&_.reg-input-bordered]:bg-white [&_.reg-input-bordered]:border-black [&_input]:!text-black ${validationError ? '[&_input]:!border-[#FF3D3D] [&_input]:!ring-1 [&_input]:!ring-[#FF3D3D]' : ''}`}`}
              />
              {validationError && <p className="text-[#FF3D3D] text-label font-bold mt-1 ml-1">{validationError}</p>}
            </div>
          ) : isPhone ? (
            <PhoneInput
              value={currentValue}
              phoneCountry={phoneCountry}
              onCountryChange={(country) => {
                if (isEditing && onCountryChange) onCountryChange(country);
              }}
              onChange={(val) => isEditing && setCurrentValue(val)}
              disabled={!isEditing}
              className={`${!isEditing ? "!bg-slate-50 !border-none [&_span]:!text-slate-500 [&_input]:!text-slate-500 pointer-events-none" : "bg-white border-black text-black [&_span]:!text-zinc-900 [&_input]:!text-zinc-900"}`}
            />
          ) : isDate && isEditing ? (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-3 items-center w-full">
                <div className="flex-1">
                  <SelectInput
                    value={birthDay}
                    options={DAYS}
                    onSelect={(val) => {
                      setBirthDay(val);
                      setValidationError("");
                    }}
                    placeholder="Día"
                    error={!!validationError}
                  />
                </div>
                <div className="flex-1">
                  <SelectInput
                    value={birthMonth}
                    options={MONTHS}
                    onSelect={(val) => {
                      setBirthMonth(val);
                      setValidationError("");
                    }}
                    placeholder="Mes"
                    error={!!validationError}
                  />
                </div>
                <div className="flex-1">
                  <SelectInput
                    value={birthYear}
                    options={YEARS}
                    onSelect={(val) => {
                      setBirthYear(val);
                      setValidationError("");
                    }}
                    placeholder="Año"
                    error={!!validationError}
                  />
                </div>
              </div>
              {validationError && <p className="text-[#FF3D3D] text-label font-bold mt-1">{validationError}</p>}
            </div>
          ) : (
            <InputField
              type={isDate ? "text" : type}
              placeholder={placeholder}
              value={isDate ? birthdateString : currentValue}
              disabled={!isEditing}
              onChange={(e) => {
                setCurrentValue(e.target.value);
              }}
              variant="bordered"
              className={`${!isEditing ? "!bg-slate-50 !border-none !text-slate-500" : "bg-white border-black text-black"}`}
            />
          )}
        </div>

        {!isEditing && (
          <button
            onClick={handleEditClick}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all ${isAnotherEditing ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-black hover:bg-slate-100"}`}
            title="Editar"
          >
            <span className="material-symbols-rounded text-[18px]">edit</span>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={handleCancel}
            className={`px-3 h-8 text-button text-slate-500 hover:text-slate-900 transition-all duration-300 origin-center ${shouldAnimate ? "scale-110 text-slate-900" : "scale-100"}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-4 h-8 text-button font-bold bg-black text-white rounded-lg hover:bg-slate-800 transition-all duration-300 origin-center ${shouldAnimate ? "scale-110" : "scale-100"}`}
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
