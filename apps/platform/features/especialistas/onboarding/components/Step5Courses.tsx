"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";
import { CourseItem } from "../types";

const TYPE_OPTIONS = [
  { label: "Curso", value: "Curso" },
  { label: "Taller", value: "Taller" },
  { label: "Capacitación", value: "Capacitación" },
];

const MODALITY_OPTIONS = [
  { label: "Online grabado", value: "Online grabado" },
  { label: "Online en vivo", value: "Online en vivo" },
  { label: "Presencial", value: "Presencial" },
  { label: "Híbrido", value: "Híbrido" },
];

interface Step5CoursesProps {
  coursesChoice: "yes" | "no" | null;
  setCoursesChoice: (val: "yes" | "no" | null) => void;
  setCoursesEnabled: (val: boolean) => void;
  courses: CourseItem[];
  setCourses: React.Dispatch<React.SetStateAction<CourseItem[]>>;
  loading: boolean;
  errorField: string | null;
  setErrorField: (val: string | null) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function Step5Courses({
  coursesChoice,
  setCoursesChoice,
  setCoursesEnabled,
  courses,
  setCourses,
  loading,
  errorField,
  setErrorField,
  onSubmit,
  onBack,
}: Step5CoursesProps) {
  const coursesContainerRef = useRef<HTMLDivElement>(null);
  const [courseUrlInput, setCourseUrlInput] = useState("");
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [importError, setImportError] = useState(false);
  const [collapsedCourses, setCollapsedCourses] = useState<Record<number, boolean>>({});



  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const formatted = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      new URL(formatted);
      return true;
    } catch {
      return false;
    }
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

    if (!isValidUrl(formattedUrl)) {
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
        // If first course is completely empty, overwrite it directly
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
        // Otherwise append new course
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

  // Validation logic
  const isFormValid = (() => {
    if (coursesChoice === null) return false;
    if (coursesChoice === "no") return true;
    if (coursesChoice === "yes") {
      if (courses.length === 0) return false;
      return courses.every((c) => Boolean(c.name.trim()) && Boolean(c.url.trim()));
    }
    return false;
  })();

  const handleStep5Submit = () => {
    if (coursesChoice === null) {
      setErrorField("coursesChoice");
      coursesContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (coursesChoice === "yes") {
      if (courses.length === 0) {
        setErrorField("coursesList");
        coursesContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const incompleteIndex = courses.findIndex((c) => !c.name.trim() || !c.url.trim());
      if (incompleteIndex !== -1) {
        setCollapsedCourses((prev) => ({ ...prev, [incompleteIndex]: false }));
        setErrorField(`courseItem_${incompleteIndex}`);
        return;
      }
    }
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Title & Introductory Copy */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
          Cursos y talleres
        </h1>
        <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
          Comparte tus propuestas formativas con la comunidad.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed font-sans mt-1">
        <p>
          Puedes agregar cursos grabados, talleres presenciales o capacitaciones publicadas en otras plataformas. Los usuarios podrán conocerlas desde tu perfil y acceder mediante el enlace que indiques.
        </p>
      </div>

      {/* Initial Decision Options */}
      <div ref={coursesContainerRef} className="flex flex-col gap-3 mt-1">
        <label className="text-label ml-1 font-jakarta font-bold text-slate-900">
          ¿Deseas agregar cursos o talleres?
        </label>
        {errorField === "coursesChoice" && (
          <p className="text-[#FF3D3D] text-[12px] font-bold ml-1">
            Selecciona una opción para continuar
          </p>
        )}

        <div className="grid grid-cols-1 gap-3">
          {/* Option 1: Yes */}
          <div
            onClick={() => {
              setCoursesChoice("yes");
              setCoursesEnabled(true);
              if (errorField === "coursesChoice") setErrorField(null);
            }}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              coursesChoice === "yes"
                ? "border-slate-900 bg-white"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                Sí, quiero agregar uno
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Comparte un curso, taller o capacitación vinculada a tu actividad profesional.
              </span>
            </div>

            {/* Expanded Section inside Option 1 Card */}
            {coursesChoice === "yes" && (
              <div
                className="flex flex-col gap-5 mt-4 pt-4 border-t border-slate-200/80 animate-in fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Importer Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-label ml-1 font-jakarta font-bold text-slate-900">
                    Enlace al curso
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
                      placeholder="Pega aquí el enlace a donde está publicado"
                      className="!bg-white"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      disabled={isFetchingMetadata}
                      onClick={handleFetchCourseMetadata}
                      className="!w-auto px-4 shrink-0 font-bold text-[13px]"
                    >
                      {isFetchingMetadata ? (
                        <div className="flex items-center gap-1.5">
                          <span className="animate-spin material-symbols-rounded text-[16px]">
                            progress_activity
                          </span>
                          <span>Agregando...</span>
                        </div>
                      ) : (
                        "Agregar curso"
                      )}
                    </Button>
                  </div>

                  {/* Non-blocking Import Error State */}
                  {importError && (
                    <p className="text-[#FF3D3D] text-[12px] font-bold ml-1 mt-0.5 font-sans">
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
                        {/* Header: Title on Left, Trash Icon Button on Right */}
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-[14px] font-bold text-slate-900 font-jakarta leading-snug">
                            {course.name || `${course.type || "Curso"} sin título`}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCourse(idx);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center shrink-0"
                            title="Eliminar curso"
                          >
                            <span className="material-symbols-rounded text-[18px]">delete</span>
                          </button>
                        </div>

                        {/* Collapsed state summary / toggle button */}
                        {isCollapsed ? (
                          <button
                            type="button"
                            onClick={() => toggleCollapse(idx)}
                            className="flex items-center gap-1 text-[12px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer w-fit bg-transparent border-none p-0 mt-1"
                          >
                            <span>Ver detalles</span>
                            <span className="material-symbols-rounded text-[16px]">chevron_right</span>
                          </button>
                        ) : (
                          /* Full Form Fields */
                          <div className="flex flex-col gap-4 mt-1">
                            {errorField === `courseItem_${idx}` && (
                              <p className="text-[#FF3D3D] text-[12px] font-bold">
                                Completa los campos obligatorios del curso (tipo, título y enlace)
                              </p>
                            )}

                            {/* Row 1: Tipo & Título */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="flex flex-col gap-2">
                                <label className="text-label ml-1">Tipo *</label>
                                <SelectInput
                                  value={course.type || "Curso"}
                                  options={TYPE_OPTIONS}
                                  onSelect={(val) => handleCourseChange(idx, "type", val)}
                                />
                              </div>
                              <div className="sm:col-span-2 flex flex-col gap-2">
                                <label className="text-label ml-1">Título *</label>
                                <InputField
                                  type="text"
                                  value={course.name}
                                  onChange={(e) => handleCourseChange(idx, "name", e.target.value)}
                                  placeholder="Ej. Taller de Gestión Emocional"
                                />
                              </div>
                            </div>

                            {/* Row 2: Modalidad & Plataforma o institución */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-2">
                                <label className="text-label ml-1">Modalidad *</label>
                                <SelectInput
                                  value={course.modality || "Online grabado"}
                                  options={MODALITY_OPTIONS}
                                  onSelect={(val) => handleCourseChange(idx, "modality", val)}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-label ml-1">
                                  Plataforma o institución
                                </label>
                                <InputField
                                  type="text"
                                  value={course.institution || ""}
                                  onChange={(e) =>
                                    handleCourseChange(idx, "institution", e.target.value)
                                  }
                                  placeholder="Ej. Udemy, Hotmart, Plataforma propia"
                                />
                              </div>
                            </div>

                            {/* Row 3: Enlace */}
                            <div className="flex flex-col gap-2">
                              <label className="text-label ml-1">Enlace *</label>
                              <InputField
                                type="url"
                                value={course.url}
                                onChange={(e) => handleCourseChange(idx, "url", e.target.value)}
                                placeholder="https://..."
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleCollapse(idx)}
                              className="flex items-center gap-1 text-[12px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer w-fit bg-transparent border-none p-0 mt-1"
                            >
                              <span>Ocultar detalles</span>
                              <span className="material-symbols-rounded text-[16px]">expand_less</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Option 2: No */}
          <div
            onClick={() => {
              setCoursesChoice("no");
              setCoursesEnabled(false);
              if (errorField === "coursesChoice") setErrorField(null);
            }}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              coursesChoice === "no"
                ? "border-slate-900 bg-white"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold text-slate-900 font-jakarta">
                No por el momento
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Podrás agregar cursos y talleres más adelante desde tu perfil.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions & Final Submission CTA */}
      <div className="flex flex-col gap-3 mt-8 pt-2">
        <div className="flex justify-between items-center gap-3">
          <Button onClick={onBack} variant="back">
            Atrás
          </Button>
          <Button
            onClick={handleStep5Submit}
            disabled={loading || !isFormValid}
            variant="primary"
            className="!w-auto px-6 gap-2 font-bold font-jakarta"
          >
            {loading ? "Enviando..." : "Enviar aplicación"}
            {!loading && (
              <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
            )}
          </Button>
        </div>

        {/* Supporting text near CTA */}
        <p className="text-[12px] text-slate-400 text-right font-medium">
          Revisaremos la información antes de aprobar tu incorporación a la red.
        </p>
      </div>
    </div>
  );
}
