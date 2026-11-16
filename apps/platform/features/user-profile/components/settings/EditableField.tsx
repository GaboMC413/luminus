import React, { useState, useEffect, useRef } from "react";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/SelectInput";
import { LocationInput } from "@/components/ui/LocationInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { DAYS, MONTHS, YEARS, isValidBirthdate } from "@/utils/profileDateUtils";
import { Pencil } from "lucide-react";

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
  required?: boolean;
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
  setAttentionCounter,
  required = false
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
      if (required && (!birthDay || !birthMonth || !birthYear)) {
        setValidationError("Ingresa tu fecha de nacimiento");
        return;
      }

      const paddedDay = birthDay ? birthDay.padStart(2, '0') : '';
      const paddedMonth = birthMonth ? birthMonth.padStart(2, '0') : '';
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
      if ((required || isLocation) && !currentValue?.trim()) {
        const msg = isLocation
          ? "Ingresa tu ciudad"
          : `Ingresa tu ${label.toLowerCase()}`;
        setValidationError(msg);
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
    <div className={`flex flex-col gap-1.5 w-full max-w-lg relative ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          {isSelect ? (
            <SelectInput
              value={currentValue}
              options={options.map(opt => ({ label: opt, value: opt }))}
              onSelect={(val) => isEditing && setCurrentValue(val)}
              disabled={!isEditing}
              disabledOpacity={false}
              className={`${!isEditing ? "pointer-events-none" : ""}`}
            />
          ) : isLocation ? (
            <div className="flex flex-col gap-1 w-full">
              <LocationInput
                placeholder="Ingresa tu ciudad"
                defaultValue={currentValue}
                onSelect={({ city: selCity, country: selCountry }) => {
                  if (isEditing) {
                    setCurrentValue(selCity);
                    if (selCountry) {
                      setExtraValue(selCountry);
                    }
                    setValidationError("");
                  }
                }}
                disabled={!isEditing}
                className={`${!isEditing ? "pointer-events-none" : ""} ${
                  validationError ? "[&_input]:!border-rose-500 [&_input]:!ring-rose-500" : ""
                }`}
              />
              {validationError && <p className="text-rose-600 text-xs font-medium mt-1">{validationError}</p>}
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
              className={`${!isEditing ? "pointer-events-none" : ""}`}
            />
          ) : isDate && isEditing ? (
            <div className="flex flex-col gap-1 w-full">
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
              {validationError && <p className="text-rose-600 text-xs font-medium mt-1">{validationError}</p>}
            </div>
          ) : (
            <InputField
              id={id}
              type={isDate ? "text" : type}
              placeholder={placeholder}
              value={isDate ? birthdateString : currentValue}
              disabled={!isEditing}
              onChange={(e) => {
                setCurrentValue(e.target.value);
                if (validationError) setValidationError("");
              }}
              error={isEditing ? validationError : undefined}
              variant="bordered"
            />
          )}
        </div>

        {!isEditing && (
          <button
            onClick={handleEditClick}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all ${
              isAnotherEditing
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title={`Editar ${label}`}
            aria-label={`Editar ${label}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2 justify-end mt-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className={`!w-auto !h-8 !px-3 !text-xs font-medium text-slate-600 hover:text-slate-900 !rounded-lg transition-all duration-200 ${
              shouldAnimate ? "scale-105" : "scale-100"
            }`}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            className={`!w-auto !h-8 !px-3.5 !text-xs font-semibold !rounded-lg transition-all duration-200 ${
              shouldAnimate ? "scale-105" : "scale-100"
            }`}
          >
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
}
