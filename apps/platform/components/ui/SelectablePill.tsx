import React from "react";
import { Check } from "lucide-react";

interface SelectablePillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const SelectablePill: React.FC<SelectablePillProps> = ({
  label,
  selected,
  onClick,
  icon
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-premium border active:scale-95 ${
        selected
          ? "bg-wellness-sage-50 border-wellness-sage-400 text-wellness-sage-800 shadow-sm ring-1 ring-wellness-sage-400"
          : "bg-white hover:bg-wellness-sand-50 border-wellness-sand-200 text-wellness-sage-700 hover:border-wellness-sand-300"
      }`}
    >
      {icon && <span className="opacity-80">{icon}</span>}
      <span>{label}</span>
      {selected && (
        <span className="flex items-center justify-center w-4 h-4 bg-wellness-sage-500 rounded-full text-white animate-scale-in">
          <Check className="w-2.5 h-2.5 stroke-[3px]" />
        </span>
      )}
    </button>
  );
};
export default SelectablePill;
