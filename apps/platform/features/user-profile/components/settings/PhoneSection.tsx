import React from "react";
import { SectionHeader } from "./SectionHeader";
import { EditableField } from "./EditableField";

export interface PhoneSectionProps {
  phone: string;
  setPhone: (phone: string) => void;
  phoneCountry: any;
  setPhoneCountry: (country: any) => void;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
}

export function PhoneSection({
  phone,
  setPhone,
  phoneCountry,
  setPhoneCountry,
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter
}: PhoneSectionProps) {
  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Celular"
        description="Configura tu número de teléfono para contacto directo."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <EditableField
          id="phone"
          label="Número de celular"
          value={phone}
          placeholder="99 123 456"
          isPhone
          phoneCountry={phoneCountry}
          onCountryChange={(matched) => setPhoneCountry(matched)}
          onSave={(val) => {
            setPhone(val);
            const fullPhone = `${phoneCountry.dial} ${val}`.trim();
            localStorage.setItem("luminus_profile_phone", fullPhone);
          }}
          editingFieldId={editingFieldId}
          setEditingFieldId={setEditingFieldId}
          attentionCounter={attentionCounter}
          setAttentionCounter={setAttentionCounter}
        />
      </div>
    </div>
  );
}
