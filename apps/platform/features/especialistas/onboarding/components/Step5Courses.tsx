"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";
import { CourseItem } from "../types";
import {
  SpecialistCoursesForm,
  validateCoursesList,
} from "./SpecialistCoursesForm";

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
  const [collapsedCourses, setCollapsedCourses] = useState<Record<number, boolean>>({});

  const isFormValid = (() => {
    if (coursesChoice === null) return false;
    if (coursesChoice === "no") return true;
    if (coursesChoice === "yes") {
      if (courses.length === 0) return false;
      return validateCoursesList(courses) === -1;
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
      const incompleteIndex = validateCoursesList(courses);
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 font-jakarta leading-tight tracking-tight">
          Cursos y talleres
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
          Comparte cursos, talleres o capacitaciones desde tu perfil.
        </p>
      </div>

      <div ref={coursesContainerRef} className="flex flex-col gap-3 mt-1">
        <label className="text-xs font-semibold text-slate-700 font-jakarta leading-none select-none">
          ¿Deseas agregar un curso o taller?
        </label>
        {errorField === "coursesChoice" && (
          <p className="text-xs font-medium text-rose-600 ml-1">
            Selecciona una opción para continuar
          </p>
        )}

        <div className="grid grid-cols-1 gap-3">
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
                Sí, agregar uno
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Comparte una propuesta vinculada a tu actividad profesional.
              </span>
            </div>

            {coursesChoice === "yes" && (
              <div
                className="mt-4 pt-4 border-t border-slate-200/80 animate-in fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <SpecialistCoursesForm
                  courses={courses}
                  setCourses={setCourses}
                  errorField={errorField}
                  setErrorField={setErrorField}
                  collapsedCourses={collapsedCourses}
                  setCollapsedCourses={setCollapsedCourses}
                />
              </div>
            )}
          </div>

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
                Agregar más adelante
              </span>
              <span className="text-[13px] text-slate-500 font-sans leading-normal">
                Podrás agregar cursos y talleres desde tu perfil.
              </span>
            </div>
          </div>
        </div>
      </div>

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
            {!loading && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>

        <p className="text-[12px] text-slate-400 text-right font-medium">
          Revisaremos tu información antes de aprobar tu incorporación.
        </p>
      </div>
    </div>
  );
}
