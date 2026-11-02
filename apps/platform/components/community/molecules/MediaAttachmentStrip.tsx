"use client";

import React, { useRef } from "react";
import { Image as ImageIcon, Video, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export interface MediaAttachmentStripProps {
  onImageSelected: (file: File) => void;
  onOpenYoutubeModal: () => void;
  imagePreview?: string | null;
  uploadedImageUrl?: string | null;
  isUploadingImage?: boolean;
  uploadProgress?: number;
  imageError?: string | null;
  onClearImageError?: () => void;
  onRemoveImage?: () => void;
  youtubeId?: string | null;
  onRemoveYoutube?: () => void;
}

export function MediaAttachmentStrip({
  onImageSelected,
  onOpenYoutubeModal,
  imagePreview,
  uploadedImageUrl,
  isUploadingImage = false,
  uploadProgress = 0,
  imageError,
  onClearImageError,
  onRemoveImage,
  youtubeId,
  onRemoveYoutube,
}: MediaAttachmentStripProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 1. Image Preview & Upload Status */}
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={imagePreview}
            alt="Vista previa de imagen"
            className="w-full max-h-[220px] object-cover"
          />

          {/* Uploading progress overlay */}
          {isUploadingImage && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white px-6 select-none animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span className="text-xs font-semibold font-jakarta">
                  Subiendo imagen... {uploadProgress}%
                </span>
              </div>
              <div className="w-36 max-w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${Math.min(100, Math.max(5, uploadProgress))}%` }}
                />
              </div>
            </div>
          )}

          {/* Ready badge */}
          {!isUploadingImage && uploadedImageUrl && (
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lista para publicar</span>
            </div>
          )}

          {/* Remove image button */}
          {!isUploadingImage && onRemoveImage && (
            <button
              type="button"
              onClick={onRemoveImage}
              aria-label="Quitar imagen"
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer border-none transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. Image Error Banner */}
      {imageError && (
        <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-sans flex items-start gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-semibold font-jakarta text-rose-900">No se pudo cargar la imagen</span>
            <span>{imageError}</span>
          </div>
          {onClearImageError && (
            <button
              type="button"
              onClick={onClearImageError}
              aria-label="Cerrar alerta"
              className="w-4 h-4 text-rose-400 hover:text-rose-700 border-none bg-transparent cursor-pointer p-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 3. YouTube Video Preview */}
      {youtubeId && (
        <div className="relative rounded-xl overflow-hidden bg-black border border-slate-200 aspect-video max-h-[220px]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title="Vista previa de video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-none"
          />
          {onRemoveYoutube && (
            <button
              type="button"
              onClick={onRemoveYoutube}
              aria-label="Quitar video"
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer border-none transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 4. Action Strip */}
      <div className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-slate-800 font-jakarta select-none">
          Agregar a tu publicación
        </span>

        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Add Image Pill */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-8.5 px-3 rounded-lg flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 transition-colors cursor-pointer border-none active:scale-95 select-none"
            title="Agregar foto o imagen"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold font-jakarta">Imagen</span>
          </button>

          {/* Add Video Pill */}
          <button
            type="button"
            onClick={onOpenYoutubeModal}
            className="h-8.5 px-3 rounded-lg flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 transition-colors cursor-pointer border-none active:scale-95 select-none"
            title="Agregar video de YouTube"
          >
            <Video className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-semibold font-jakarta">Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}
