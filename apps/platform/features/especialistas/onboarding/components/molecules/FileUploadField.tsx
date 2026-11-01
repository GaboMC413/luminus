"use client";

import React, { useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface FileUploadFieldProps {
  label?: string;
  helperText?: string;
  accept?: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  error?: string;
  uploading?: boolean;
  className?: string;
}

export function FileUploadField({
  label,
  helperText,
  accept = ".pdf,.doc,.docx",
  file,
  onFileSelect,
  onFileRemove,
  error,
  uploading = false,
  className = "",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTrigger = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      onFileSelect(selected);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {!file ? (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleTrigger}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>{uploading ? "Subiendo..." : "Seleccionar archivo"}</span>
          </Button>

          {helperText && (
            <span className="text-xs text-slate-400 font-sans">
              {helperText}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl w-fit max-w-full">
          <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-medium text-slate-900 truncate">
              {file.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Eliminar archivo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-600 mt-0.5 px-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

export default FileUploadField;
