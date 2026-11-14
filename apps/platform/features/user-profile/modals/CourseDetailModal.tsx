"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { resolveSocialHref } from "@/utils/socialLinks";

export interface CourseDetailItem {
  id?: string;
  name: string;
  type?: string | null;
  description?: string | null;
  modality?: string | null;
  url?: string | null;
  coverUrl?: string | null;
  institution?: string | null;
}

interface CourseDetailModalProps {
  course: CourseDetailItem | null;
  onClose: () => void;
}

const COURSE_TYPE_LABELS: Record<string, string> = {
  CURSO: "Curso",
  TALLER: "Taller",
  PROGRAMA: "Programa",
};

function formatCourseType(type?: string | null) {
  if (!type) return null;
  return COURSE_TYPE_LABELS[type] || type;
}

export function CourseDetailModal({ course, onClose }: CourseDetailModalProps) {
  if (!course) return null;

  const typeLabel = formatCourseType(course.type);
  const courseUrl = course.url ? resolveSocialHref("website", course.url) : null;

  return (
    <Modal
      isOpen={Boolean(course)}
      onClose={onClose}
      title={typeLabel || "Curso o taller"}
      hideDividers
      maxWidth="560px"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cerrar
          </Button>
          {courseUrl && (
            <a
              href={courseUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="md" className="gap-2">
                <span>Ir al curso</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </Button>
            </a>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {course.coverUrl && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
            <img
              src={course.coverUrl}
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h4 className="text-title-page text-slate-900 leading-snug">
          {course.name}
        </h4>

        {(typeLabel || course.modality || course.institution) && (
          <div className="flex flex-wrap items-center gap-2">
            {typeLabel && (
              <span className="h-7 px-3 inline-flex items-center rounded-full bg-slate-100 text-meta text-slate-700 font-medium">
                {typeLabel}
              </span>
            )}
            {course.modality && (
              <span className="h-7 px-3 inline-flex items-center rounded-full bg-slate-100 text-meta text-slate-700 font-medium">
                {course.modality}
              </span>
            )}
            {course.institution && (
              <span className="h-7 px-3 inline-flex items-center rounded-full bg-slate-100 text-meta text-slate-700 font-medium">
                {course.institution}
              </span>
            )}
          </div>
        )}

        {course.description && (
          <div className="bg-slate-50/80 rounded-2xl p-4">
            <p className="text-body text-slate-700 whitespace-pre-wrap leading-relaxed">
              {course.description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
