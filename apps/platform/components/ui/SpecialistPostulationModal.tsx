"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import InputField from './InputField';
import SelectInput from './SelectInput';

interface Course {
  title: string;
  url: string;
}

interface SpecialistPostulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SpecialistPostulationModal({
  isOpen,
  onClose,
  onSuccess
}: SpecialistPostulationModalProps) {
  const [specialty, setSpecialty] = useState('');
  const [title, setTitle] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const specialtyOptions = [
    "Crecimiento personal",
    "Bienestar emocional",
    "Salud integral",
    "Movimiento físico",
    "Nutrición",
    "Espiritualidad",
    "Vínculos",
    "Terapias complementarias"
  ];

  const handleAddCourse = () => {
    setCourses([...courses, { title: '', url: '' }]);
  };

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialty || !title || !bio) {
      alert("Por favor completa los campos requeridos (Especialidad, Título y Biografía)");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        specialty,
        title,
        clinicName: clinicName || null,
        bio,
        linkedinUrl: linkedinUrl || null,
        instagramUrl: instagramUrl || null,
        websiteUrl: websiteUrl || null,
        courses: courses.map(c => ({ name: c.title, url: c.url })),
      };

      const response = await fetch("/api/especialistas/postulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Error al enviar la postulación.");
        return;
      }

      // Reset form
      setSpecialty('');
      setTitle('');
      setClinicName('');
      setBio('');
      setLinkedinUrl('');
      setInstagramUrl('');
      setWebsiteUrl('');
      setCourses([]);
      onSuccess();
    } catch (err) {
      console.error("Failed to submit postulation:", err);
      alert("Error de conexión al enviar la postulación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sumarte como Especialista"
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-slate-800">
        <p className="text-[13px] text-slate-500 leading-relaxed -mt-2">
          Completa el formulario a continuación para postularte como especialista. Una vez enviado, tu postulación estará en revisión.
        </p>

        {/* Specialty Selector */}
        <div className="w-full">
          <SelectInput
            label="Especialidad Principal *"
            value={specialty}
            options={specialtyOptions}
            onSelect={(val) => setSpecialty(val)}
            placeholder="Selecciona tu especialidad"
          />
        </div>

        {/* Title / Short Credentials */}
        <div className="flex flex-col gap-2">
          <label className="text-label ml-1">Título o Subtítulo Profesional *</label>
          <InputField
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Licenciada en Psicología Clínica / Especialista en Mindfulness"
            required
          />
        </div>

        {/* Clinic / Space */}
        <div className="flex flex-col gap-2">
          <label className="text-label ml-1">Consultorio / Espacio de Trabajo (Opcional)</label>
          <InputField
            type="text"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            placeholder="Ej. Espacio Sincronía / Consulta Virtual"
          />
        </div>

        {/* Bio / Focus */}
        <div className="flex flex-col gap-2">
          <label className="text-label ml-1 font-jakarta">Biografía y Enfoque Profesional *</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe tu metodología, enfoque de bienestar y cómo acompañas a tus consultantes..."
            rows={4}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none placeholder:text-slate-400 font-sans"
            required
          />
        </div>

        {/* Courses Section */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center">
            <label className="text-label ml-1 font-jakarta font-bold">Cursos y Programas (Opcional)</label>
            <button
              type="button"
              onClick={handleAddCourse}
              className="text-[12px] font-bold text-slate-900 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Agregar Curso
            </button>
          </div>
          <p className="text-[11px] text-slate-400 -mt-1 leading-normal ml-1">
            Agrega enlaces externos a tus cursos o talleres. No serán gestionados dentro de Luminus.
          </p>

          <div className="flex flex-col gap-3">
            {courses.map((course, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                <div className="flex-1 flex flex-col gap-2">
                  <InputField
                    type="text"
                    value={course.title}
                    onChange={(e) => handleCourseChange(idx, 'title', e.target.value)}
                    placeholder="Nombre del Curso"
                    className="!h-9 !text-[13px]"
                  />
                  <InputField
                    type="url"
                    value={course.url}
                    onChange={(e) => handleCourseChange(idx, 'url', e.target.value)}
                    placeholder="Enlace URL (ej. https://...)"
                    className="!h-9 !text-[13px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCourse(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media & Website */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
          <label className="text-label ml-1 font-jakarta font-bold">Enlaces Profesionales y Redes</label>
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-slate-400 absolute left-4 text-[20px]">link</span>
              <InputField
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="Enlace a LinkedIn (https://linkedin.com/in/...)"
                className="pl-11"
              />
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-slate-400 absolute left-4 text-[20px]">photo_camera</span>
              <InputField
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="Enlace a Instagram (https://instagram.com/...)"
                className="pl-11"
              />
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-slate-400 absolute left-4 text-[20px]">language</span>
              <InputField
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="Sitio Web Personal (https://...)"
                className="pl-11"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="!w-auto !h-11 px-6 text-[14px]"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="!w-auto !h-11 px-6 text-[14px] bg-black text-white hover:bg-zinc-900"
            disabled={submitting}
          >
            {submitting ? "Enviando..." : "Enviar Postulación"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SpecialistPostulationModal;
