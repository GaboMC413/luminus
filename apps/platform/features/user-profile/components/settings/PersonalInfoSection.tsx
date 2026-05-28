import React from "react";
import { SectionHeader } from "./SectionHeader";
import { EditableField } from "./EditableField";

export interface PersonalInfoSectionProps {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  profession: string;
  setProfession: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  birthdate: string;
  setBirthdate: (v: string) => void;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  attentionCounter: number;
  setAttentionCounter: (val: number | ((prev: number) => number)) => void;
}

export function PersonalInfoSection({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  profession,
  setProfession,
  city,
  setCity,
  country,
  setCountry,
  gender,
  setGender,
  birthdate,
  setBirthdate,
  editingFieldId,
  setEditingFieldId,
  attentionCounter,
  setAttentionCounter
}: PersonalInfoSectionProps) {
  return (
    <div className="w-full flex flex-col">
      <SectionHeader title="Información personal"
        description="Aquí puedes gestionar tus datos personales."
      />
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            id="first_name"
            label="Nombre"
            value={firstName}
            onSave={(val) => {
              setFirstName(val);
              localStorage.setItem("luminus_profile_firstName", val);
            }}
            placeholder="Nombre"
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
          <EditableField
            id="last_name"
            label="Apellido"
            value={lastName}
            onSave={(val) => {
              setLastName(val);
              localStorage.setItem("luminus_profile_lastName", val);
            }}
            placeholder="Apellido"
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            id="profession"
            label="Profesión"
            value={profession}
            onSave={(val) => {
              setProfession(val);
              localStorage.setItem("luminus_profile_profession", val);
            }}
            placeholder="Ej. Diseñador de Productos"
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />

          <EditableField
            id="city"
            label="Ciudad"
            value={city}
            isLocation
            onSave={(cityVal, countryVal) => {
              setCity(cityVal);
              localStorage.setItem("luminus_profile_city", cityVal);
              if (countryVal) {
                setCountry(countryVal);
                localStorage.setItem("luminus_profile_country", countryVal);
              }
            }}
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            id="gender"
            label="Género"
            value={gender}
            isSelect
            options={["Mujer", "Hombre", "No binario", "Prefiero no decirlo"]}
            onSave={(val) => {
              setGender(val);
              localStorage.setItem("luminus_profile_gender", val);
            }}
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
          <EditableField
            id="birthdate"
            label="Fecha de nacimiento"
            value={birthdate}
            isDate
            onSave={(val) => {
              setBirthdate(val);
              // convert DD / MM / YYYY back to YYYY-MM-DD
              const parts = val.split(" / ");
              if (parts.length === 3) {
                localStorage.setItem("luminus_profile_birthdate", `${parts[2]}-${parts[1]}-${parts[0]}`);
              } else {
                localStorage.setItem("luminus_profile_birthdate", val);
              }
            }}
            editingFieldId={editingFieldId}
            setEditingFieldId={setEditingFieldId}
            attentionCounter={attentionCounter}
            setAttentionCounter={setAttentionCounter}
          />
        </div>
      </div>
    </div>
  );
}
