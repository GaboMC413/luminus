"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { Loader2, ChevronRight, ChevronUp, Trash2 } from "lucide-react";
import { CourseItem } from "../types";

export const COURSE_TYPE_OPTIONS = [
  { label: "Curso", value: "Curso" },
  { label: "Taller", value: "Taller" },
  { label: "Capacitación", value: "Capacitación" },
];

export const COURSE_MODALITY_OPTIONS = [
  { label: "Online grabado", value: "Online grabado" },
  { label: "Online en vivo", value: "Online en vivo" },
  { label: "Presencial", value: "Presencial" },
  { label: "Híbrido", value: "Híbrido" },
];

const LEGACY_COURSE_TYPE_MAP: Record<string, string> = {
  CURSO: "Curso",
  TALLER: "Taller",
  PROGRAMA: "Capacitación",
  CAPACITACION: "Capacitación",
};

export function normalizeCourseType(raw?: string | null): string {
  if (!raw) return "Curso";
  return LEGACY_COURSE_TYPE_MAP[raw] || raw;
}

export function isValidCourseUrl(url: string): boolean {
  if (!url) return false;
  try {
    const formatted =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    new URL(formatted);
    return true;
  } catch {
    return false;
  }
}

export function validateCoursesList(courses: CourseItem[]): number {
  return courses.findIndex((c) => !c.name.trim() || !c.url.trim());
}

interface SpecialistCoursesFormProps {
  courses: CourseItem[];
  setCourses: React.Dispatch<React.SetStateAction<CourseItem[]>>;
  errorField: string | null;
  setErrorField: (val: string | null) => void;
  collapsedCourses: Record<number, boolean>;
  setCollapsedCourses: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}

export function SpecialistCoursesForm({
  courses,
  setCourses,
  errorField,
  setErrorField,
  collapsedCourses,
  setCollapsedCourses,
}: SpecialistCoursesFormProps) {
  const [courseUrlInput, setCourseUrlInput] = useState("");
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [importError, setImportError] = useState(false);

  const handleAddAnotherCourse = () => {
    setCourses((prev) => {
      const newIndex = prev.length;
      setCollapsedCourses((collapsed) => {
        const updated = { ...collapsed };
        for (let i = 0; i < newIndex; i++) {
          updated[i] = true;
        }
        updated[newIndex] = false;
        return updated;
      });
      return [
        ...prev,
        {
          name: "",
          type: "Curso",
          description: "",
          modality: "Online grabado",
          url: "",
          coverUrl: "",
          institution: "",
        },
      ];
    });
    setImportError(false);
    if (errorField === "coursesList") setErrorField(null);
  };

  const handleFetchCourseMetadata = async () => {
    if (!courseUrlInput.trim()) {
      handleAddAnotherCourse();
      return;
    }
    setImportError(false);

    let formattedUrl = courseUrlInput.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (!isValidCourseUrl(formattedUrl)) {
      setImportError(true);
      return;
    }

    try {
      setIsFetchingMetadata(true);
      const res = await fetch("/api/courses/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const responseData = await res.json();
      if (!res.ok || !responseData.ok) {
        setImportError(true);
        return;
      }

      const meta = responseData.metadata || responseData;

      setCourses((prev) => {
        if (prev.length === 1 && !prev[0].name.trim() && !prev[0].url.trim()) {
          return [
            {
              name: meta.name || "",
              type: meta.type || "Curso",
              description: meta.description || "",
              modality: meta.modality || "Online grabado",
              url: meta.url || formattedUrl,
              coverUrl: meta.coverUrl || "",
              institution: meta.institution || "",
            },
          ];
        }
        return [
          ...prev,
          {
            name: meta.name || "",
            type: meta.type || "Curso",
            description: meta.description || "",
            modality: meta.modality || "Online grabado",
            url: meta.url || formattedUrl,
            coverUrl: meta.coverUrl || "",
            institution: meta.institution || "",
          },
        ];
      });

      setCourseUrlInput("");
      setImportError(false);
      if (errorField === "coursesList") setErrorField(null);
    } catch (err) {
      console.error("Failed to fetch course metadata:", err);
      setImportError(true);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const toggleCollapse = (idx: number) => {
    setCollapsedCourses((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCourseChange = (index: number, field: keyof CourseItem, value: string) => {
    setCourses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (errorField === `courseItem_${index}`) setErrorField(null);
  };

  const handleRemoveCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Importer Section */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          Enlace
        </label>

        <div className="flex gap-2 items-center">
          <InputField
            type="url"
            value={courseUrlInput}
            onChange={(e) => {
              setCourseUrlInput(e.target.value);
              if (importError) setImportError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFetchCourseMetadata();
              }
            }}
            placeholder="Pega el enlace donde está publicado."
            className="!bg-white"
          />
          <Button
            type="button"
            variant="primary"
            disabled={isFetchingMetadata}
            onClick={handleFetchCourseMetadata}
            className="!w-auto px-4 shrink-0 font-bold text-xs"
          >
            {isFetchingMetadata ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Agregando...</span>
              </div>
            ) : (
              "Agregar curso"
            )}
          </Button>
        </div>

        {importError && (
          <p className="text-xs font-medium text-rose-600 ml-1 mt-0.5 font-sans">
            No pudimos importar la información desde este enlace. Revisa la dirección o completa los datos manualmente.
          </p>
        )}
      </div>

      {/* Course Forms List */}
      <div className="flex flex-col gap-4">
        {courses.map((course, idx) => {
          const isCollapsed =
            collapsedCourses[idx] !== undefined
              ? collapsedCourses[idx]
              : Boolean(course.name || course.url);

          return (
            <div
              key={idx}
              className="flex flex-col gap-2 p-4 bg-slate-50/70 border border-slate-200/90 rounded-xl transition-all"
            >
              <div className="flex justify-between items-start gap-3">
                <span className="text-sm font-bold text-slate-900 font-jakarta leading-snug">
                  {course.name || `${course.type || "Curso"} sin título`}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCourse(idx);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center shrink-0"
                  title="Eliminar curso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleCollapse(idx)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer w-fit bg-transparent border-none p-0 mt-1"
                >
                  <span>Ver detalles</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col gap-4 mt-1">
                  {errorField === `courseItem_${idx}` && (
                    <p className="text-xs font-medium text-rose-600">
                      Completa los campos obligatorios del curso (tipo, título y enlace)
                    </p>
                  )}

                  {/* Row 1: Tipo & Título */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
                        Tipo *
                      </label>
                      <SelectInput
                        value={normalizeCourseType(course.type)}
                        options={COURSE_TYPE_OPTIONS}
                        onSelect={(val) => handleCourseChange(idx, "type", val)}
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
                        Título *
                      </label>
                      <InputField
                        type="text"
                        value={course.name}
                        onChange={(e) => handleCourseChange(idx, "name", e.target.value)}
                        placeholder="Escribe el título del curso o taller"
                      />
                    </div>
                  </div>

                  {/* Row 2: Modalidad & Plataforma o institución */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
                        Modalidad *
                      </label>
                      <SelectInput
                        value={course.modality || "Online grabado"}
                        options={COURSE_MODALITY_OPTIONS}
                        onSelect={(val) => handleCourseChange(idx, "modality", val)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
                        Plataforma o institución
                      </label>
                      <InputField
                        type="text"
                        value={course.institution || ""}
                        onChange={(e) =>
                          handleCourseChange(idx, "institution", e.target.value)
                        }
                        placeholder="Nombre de la plataforma o institución"
                      />
                    </div>
                  </div>

                  {/* Row 3: Enlace */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
                      Enlace *
                    </label>
                    <InputField
                      type="url"
                      value={course.url}
                      onChange={(e) => handleCourseChange(idx, "url", e.target.value)}
                      placeholder="Pega el enlace donde está publicado"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCollapse(idx)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer w-fit bg-transparent border-none p-0 mt-1"
                  >
                    <span>Ocultar detalles</span>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
