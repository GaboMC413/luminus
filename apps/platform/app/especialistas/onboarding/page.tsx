"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectInput } from "@/components/ui/SelectInput";

interface Course {
  name: string;
  description: string;
  url: string;
  coverUrl?: string;
}

const TAG_GROUPS: Record<string, string[]> = {
  "Crecimiento personal": [
    "Coaching de vida",
    "Coaching ejecutivo",
    "Coaching ontológico",
    "Orientación vocacional",
    "Mentoría profesional",
    "Desarrollo de liderazgo",
    "Desarrollo organizacional",
    "Facilitación de procesos",
    "Formación en habilidades blandas",
    "Otro"
  ],
  "Bienestar emocional": [
    "Psicología",
    "Psicoterapia",
    "Terapia cognitivo-conductual",
    "Terapia sistémica",
    "Terapia gestáltica",
    "Terapia humanista",
    "Psicología positiva",
    "Acompañamiento en duelo",
    "Arteterapia",
    "Musicoterapia",
    "Otro"
  ],
  "Salud integral": [
    "Medicina general",
    "Medicina integrativa",
    "Medicina funcional",
    "Fisioterapia",
    "Terapia ocupacional",
    "Osteopatía",
    "Quiropraxia",
    "Medicina del dolor",
    "Medicina del sueño",
    "Ginecología",
    "Endocrinología",
    "Otro"
  ],
  "Movimiento físico": [
    "Entrenamiento personal",
    "Entrenamiento funcional",
    "Entrenamiento de fuerza",
    "Preparación física",
    "Yoga",
    "Pilates",
    "Movilidad",
    "Danza",
    "Calistenia",
    "Entrenamiento postural",
    "Acondicionamiento físico",
    "Otro"
  ],
  "Nutrición": [
    "Nutrición clínica",
    "Nutrición deportiva",
    "Nutrición funcional",
    "Nutrición vegetariana",
    "Nutrición vegana",
    "Nutrición materno-infantil",
    "Nutrición digestiva",
    "Nutrición hormonal",
    "Psiconutrición",
    "Educación alimentaria",
    "Otro"
  ],
  "Espiritualidad": [
    "Meditación",
    "Mindfulness",
    "Respiración consciente",
    "Acompañamiento espiritual",
    "Filosofía práctica",
    "Prácticas contemplativas",
    "Sonoterapia",
    "Facilitación de retiros",
    "Desarrollo espiritual",
    "Otro"
  ],
  "Vínculos": [
    "Terapia de pareja",
    "Terapia familiar",
    "Sexología",
    "Terapia sexual",
    "Mediación familiar",
    "Orientación parental",
    "Psicología perinatal",
    "Acompañamiento en crianza",
    "Comunicación interpersonal",
    "Otro"
  ],
  "Terapias complementarias": [
    "Acupuntura",
    "Medicina tradicional china",
    "Ayurveda",
    "Reiki",
    "Masoterapia",
    "Aromaterapia",
    "Reflexología",
    "Sonoterapia",
    "Terapia floral",
    "Terapias energéticas",
    "Biomagnetismo",
    "Otro"
  ]
};

export default function SpecialistOnboardingPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  // Step 1
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2
  const [specialty, setSpecialty] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  
  // Social links state
  interface SocialLink {
    platform: string;
    url: string;
  }
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Instagram", url: "" }
  ]);

  // Step 3
  const [sessionsEnabled, setSessionsEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // Step 4
  const [clinicEnabled, setClinicEnabled] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  // Step 5
  const [coursesEnabled, setCoursesEnabled] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Reset scroll on step change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [step]);

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

  const hoursOptions = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00", "22:00"
  ];

  const daysOfWeek = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  // Course Helpers
  const handleAddCourse = () => {
    setCourses([...courses, { name: "", description: "", url: "", coverUrl: "" }]);
  };

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const [customAreaInput, setCustomAreaInput] = useState("");
  const [customAreas, setCustomAreas] = useState<string[]>([]);

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleAddCustomArea = () => {
    const trimmed = customAreaInput.trim();
    if (trimmed && !selectedAreas.includes(trimmed)) {
      setSelectedAreas([...selectedAreas, trimmed]);
      setCustomAreas([...customAreas, trimmed]);
      setCustomAreaInput("");
    }
  };

  const handleRemoveCustomArea = (areaToRemove: string) => {
    setSelectedAreas(selectedAreas.filter(a => a !== areaToRemove));
    setCustomAreas(customAreas.filter(a => a !== areaToRemove));
  };

  const ALL_PLATFORMS = ["Instagram", "YouTube", "Facebook", "LinkedIn", "Website", "X"];

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleAddSocialLinkRow = () => {
    const used = socialLinks.map(l => l.platform);
    const unused = ALL_PLATFORMS.find(p => !used.includes(p)) || "Website";
    setSocialLinks([...socialLinks, { platform: unused, url: "" }]);
  };

  const handleRemoveSocialLinkRow = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const linkedinObj = socialLinks.find((l) => l.platform.toLowerCase() === "linkedin");
      const instagramObj = socialLinks.find((l) => l.platform.toLowerCase() === "instagram");
      const websiteObj = socialLinks.find((l) => l.platform.toLowerCase() === "website" || l.platform.toLowerCase() === "web");

      const payload = {
        specialty,
        title,
        bio,
        clinicName: clinicEnabled ? clinicName : null,
        linkedinUrl: linkedinObj?.url || null,
        instagramUrl: instagramObj?.url || null,
        websiteUrl: websiteObj?.url || null,
        courses: coursesEnabled ? courses.map(c => ({ name: c.name, description: c.description, url: c.url })) : [],
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

      setStep(6); // Go to thank you screen
    } catch (err) {
      console.error("Failed to submit postulation:", err);
      alert("Error de conexión al enviar la postulación.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min(((step - 1) / 5) * 100, 100);

  // Render Left Branding Panel
  const renderSidebar = () => {
    return (
      <div className="fixed top-0 left-0 right-0 lg:relative w-full h-14 lg:h-full lg:w-80 xl:w-96 luminus-gradient shrink-0 flex lg:flex-col items-center justify-between lg:py-12 px-6 lg:px-8 z-50 transition-all duration-500">
        <div className="flex flex-col items-center w-full">
          <Link href="/especialistas" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo-luminus-white.svg" alt="Luminus" className="h-[20px] lg:h-[24px]" />
          </Link>

          {/* Stepper progress (Desktop only) */}
          {step <= 5 && (
            <div className="hidden lg:flex flex-col gap-6 w-full mt-16 text-white/90">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Progreso</span>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2 font-jakarta">
                {[
                  { num: 1, label: "Introducción" },
                  { num: 2, label: "Perfil Profesional" },
                  { num: 3, label: "Disponibilidad" },
                  { num: 4, label: "Consultorios" },
                  { num: 5, label: "Cursos y Talleres" }
                ].map(s => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  return (
                    <div key={s.num} className="flex gap-3 items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all border ${
                        isActive
                          ? "bg-white text-black border-white"
                          : isCompleted
                            ? "bg-white/20 text-white border-transparent"
                            : "bg-transparent text-white/40 border-white/20"
                      }`}>
                        {isCompleted ? "✓" : s.num}
                      </div>
                      <span className={`text-[13px] font-medium tracking-wide transition-all ${
                        isActive ? "text-white font-bold" : isCompleted ? "text-white/70" : "text-white/40"
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="hidden lg:flex flex-col w-full pt-6 border-t border-white/10 mt-12">
          <p className="text-[9px] text-white/60 text-center uppercase tracking-widest font-sans">
            Luminus Latam © 2026
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="auth-fixed-page bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      
      {/* 1. Left Sidebar */}
      {renderSidebar()}

      {/* 2. Main Onboarding wizard pane */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto pt-14 lg:pt-0"
      >
        <div className="flex-1 flex flex-col items-center pt-8 md:pt-16 pb-12 md:pb-24 px-6 md:px-12">
          <div className="w-full max-w-[344px] md:max-w-[580px] flex flex-col">
            
            {step === 1 && (
              <div className="mb-6">
                <Button
                  onClick={() => router.push("/especialistas")}
                  variant="back"
                >
                  Volver a la plataforma
                </Button>
              </div>
            )}

            {/* Step 1: Welcome & Terms */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-2">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Forma parte de LUMINUS como especialista
                  </h1>
                </div>

                <div className="flex flex-col gap-5 text-[14px] text-slate-600 leading-relaxed font-sans mt-2">
                  <p>
                    LUMINUS es una red de bienestar que reúne a especialistas, espacios y personas de toda Latinoamérica.
                  </p>
                  <p>
                    Como especialista, podrás presentar tu perfil profesional, compartir tu enfoque, recibir solicitudes de sesiones breves de primer contacto y dar visibilidad a tus consultorios, espacios y cursos.
                  </p>
                  <p>
                    Cada postulación es revisada por el Consejo de Expertos de LUMINUS para asegurar la calidad, la trayectoria y la coherencia profesional de quienes forman parte de la red.
                  </p>
                </div>

                {/* Terms and conditions checkbox */}
                <div className="flex items-start gap-3 mt-4 px-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300 text-black focus:ring-black cursor-pointer mt-0.5 shrink-0"
                  />
                  <label htmlFor="terms" className="text-[13px] text-slate-600 font-normal leading-normal cursor-pointer select-none">
                    Acepto las{" "}
                    <Link
                      href="https://dev.luminuslatam.com/legal/condiciones-especialistas"
                      target="_blank"
                      className="font-semibold text-black underline hover:text-zinc-800"
                    >
                      Condiciones de Uso y Políticas para Especialistas
                    </Link>{" "}
                    de la plataforma.
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-6">
                  <Button
                    onClick={() => router.push("/especialistas")}
                    variant="outline"
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    variant="primary"
                    disabled={!termsAccepted}
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold bg-black text-white hover:bg-zinc-900"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Professional Data */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Perfil profesional
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
                    Comparte información sobre tu especialidad, experiencia y forma de trabajo.
                  </p>
                </div>

                <div className="flex flex-col gap-5 mt-2">
                  {/* 1. Primary Specialty */}
                  <SelectInput
                    label="Especialidad principal *"
                    value={specialty}
                    options={specialtyOptions}
                    onSelect={(val) => {
                      setSpecialty(val);
                      setSelectedAreas([]);
                    }}
                    placeholder="Seleccioná tu especialidad principal"
                  />

                  {/* 2. Accompaniment Areas (Appears only when Specialty is selected) */}
                  {specialty && (
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 mt-2 animate-in fade-in duration-200">
                      <label className="text-label ml-1 font-jakarta font-bold">Áreas de acompañamiento *</label>
                      <p className="text-[11px] text-slate-400 -mt-1 leading-normal ml-1">
                        Selecciona las áreas en las que brindas acompañamiento. Puedes elegir varias opciones o agregar una nueva.
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(TAG_GROUPS[specialty] || []).map(tag => {
                          const isSelected = selectedAreas.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleArea(tag)}
                              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer select-none ${
                                isSelected
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-slate-600 border-zinc-200 hover:border-zinc-300 hover:text-black"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      {selectedAreas.includes("Otro") && (
                        <div className="flex flex-col gap-2.5 mt-2 animate-in fade-in duration-200">
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={customAreaInput}
                              onChange={(e) => setCustomAreaInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomArea();
                                }
                              }}
                              placeholder="Agregar otra área de acompañamiento"
                              className="flex-1 h-10 px-3.5 border border-zinc-200 rounded-xl text-[13px] text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white font-sans"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomArea}
                              className="h-10 px-5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer border-none transition-colors"
                            >
                              Agregar
                            </button>
                          </div>

                          {customAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {customAreas.map((cArea) => (
                                <span key={cArea} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-slate-900 text-white">
                                  {cArea}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomArea(cArea)}
                                    className="hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none text-white text-xs font-bold"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Professional Title */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 mt-2">
                    <label className="text-label ml-1 font-jakarta font-bold">Título o credencial profesional *</label>
                    <InputField
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ejemplo: Psicología clínica, Nutrición, Coaching de bienestar."
                    />
                  </div>

                  {/* 4. Bio */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 mt-2">
                    <label className="text-label ml-1 font-jakarta font-bold">Biografía y enfoque *</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Describe brevemente tu experiencia profesional, tu enfoque de trabajo y la manera en que acompañas a las personas."
                      rows={5}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-[14px] text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none placeholder:text-slate-400 font-sans leading-relaxed"
                    />
                  </div>

                  {/* 5. Dynamic Social Links List */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 mt-2">
                    <label className="text-label ml-1 font-jakarta font-bold">Redes y enlaces</label>
                    <div className="flex flex-col gap-3">
                      {socialLinks.map((link, idx) => {
                        const availablePlatforms = ALL_PLATFORMS.filter(
                          (p) => p === link.platform || !socialLinks.some((other, otherIdx) => otherIdx !== idx && other.platform === p)
                        );
                        return (
                          <div key={idx} className="flex gap-2 items-center">
                            <div className="w-36 shrink-0">
                              <SelectInput
                                value={link.platform}
                                options={availablePlatforms}
                                onSelect={(val) => handleSocialLinkChange(idx, "platform", val)}
                                className="!h-10 text-[13px]"
                              />
                            </div>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => handleSocialLinkChange(idx, "url", e.target.value)}
                              placeholder="https://..."
                              className="flex-1 h-10 px-3.5 border border-zinc-200 rounded-xl text-[13px] text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white font-sans"
                            />
                            {socialLinks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSocialLinkRow(idx)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-transparent border-none cursor-pointer shrink-0"
                                title="Eliminar enlace"
                              >
                                <span className="material-symbols-rounded text-[20px] block">delete</span>
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {socialLinks.length < ALL_PLATFORMS.length && (
                        <button
                          type="button"
                          onClick={handleAddSocialLinkRow}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-jakarta rounded-xl border border-zinc-200/80 transition-colors cursor-pointer self-start mt-1"
                        >
                          Agregar otro enlace
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-6">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold"
                  >
                    Atrás
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    variant="primary"
                    disabled={!specialty || selectedAreas.length === 0 || !title.trim() || !bio.trim()}
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold bg-black text-white hover:bg-zinc-900"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Sessions */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Sesiones de Primer Contacto
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
                    Define si deseas ofrecer breves sesiones de introducción.
                  </p>
                </div>

                <div className="flex flex-col gap-5 text-[14px] text-slate-600 leading-relaxed font-sans mt-2">
                  <p>
                    En Luminus promovemos una sesión inicial de 15 minutos. Sirve como un primer acercamiento sin compromiso para que el consultante te conozca y evalúe si tu enfoque es el indicado para acompañar su camino.
                  </p>
                  <p>
                    Estas sesiones son solicitadas por los usuarios y deberás aceptarlas manualmente para coordinar el encuentro.
                  </p>
                </div>

                {/* Offer Sessions Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 mt-2 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-slate-900 font-jakarta">Ofrecer sesiones de 15 minutos</span>
                    <span className="text-[11px] text-slate-400">Habilita esta opción para configurar tus turnos</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSessionsEnabled(!sessionsEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out cursor-pointer ${
                      sessionsEnabled ? "bg-black" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${
                        sessionsEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Schedule Selector */}
                {sessionsEnabled && (
                  <div className="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in duration-300">
                    <label className="text-label ml-1 font-jakarta font-bold">Días de Disponibilidad</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => {
                        const isChecked = selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer select-none ${
                              isChecked
                                ? "bg-black text-white border-black"
                                : "bg-white text-slate-600 border-zinc-200 hover:border-zinc-300"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <SelectInput
                        label="Hora de Inicio"
                        value={startTime}
                        options={hoursOptions}
                        onSelect={(val) => setStartTime(val)}
                      />
                      <SelectInput
                        label="Hora de Fin"
                        value={endTime}
                        options={hoursOptions}
                        onSelect={(val) => setEndTime(val)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-6">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold"
                  >
                    Atrás
                  </Button>
                  <button
                    onClick={() => {
                      if (!sessionsEnabled) {
                        setSelectedDays([]);
                      }
                      setStep(4);
                    }}
                    className="h-11 px-5 border border-transparent rounded-xl text-[13px] font-jakarta font-semibold text-slate-500 hover:text-black hover:bg-slate-150 transition active:scale-95 cursor-pointer bg-transparent uppercase tracking-wider"
                  >
                    Saltar paso
                  </button>
                  <Button
                    onClick={() => setStep(4)}
                    variant="primary"
                    disabled={sessionsEnabled && selectedDays.length === 0}
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold bg-black text-white hover:bg-zinc-900"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Clinics */}
            {step === 4 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Consultorios y Espacios de Trabajo
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
                    Cuéntanos dónde atiendes a tus consultantes de forma física.
                  </p>
                </div>

                {/* Clinic Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 mt-2 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-slate-900 font-jakarta">Agregar un consultorio físico</span>
                    <span className="text-[11px] text-slate-400">Habilita esta opción para registrar tu dirección</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClinicEnabled(!clinicEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out cursor-pointer ${
                      clinicEnabled ? "bg-black" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${
                        clinicEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Clinic Fields */}
                {clinicEnabled && (
                  <div className="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in duration-300">
                    <div className="flex flex-col gap-2">
                      <label className="text-label ml-1">Nombre del Consultorio / Espacio</label>
                      <InputField
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Ej. Consultorio Palermo / Centro Vital"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-label ml-1">Dirección Completa</label>
                      <InputField
                        type="text"
                        value={clinicAddress}
                        onChange={(e) => setClinicAddress(e.target.value)}
                        placeholder="Calle, Altura, Ciudad, País"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-6">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold"
                  >
                    Atrás
                  </Button>
                  <button
                    onClick={() => {
                      if (!clinicEnabled) {
                        setClinicName("");
                        setClinicAddress("");
                      }
                      setStep(5);
                    }}
                    className="h-11 px-5 border border-transparent rounded-xl text-[13px] font-jakarta font-semibold text-slate-500 hover:text-black hover:bg-slate-150 transition active:scale-95 cursor-pointer bg-transparent uppercase tracking-wider"
                  >
                    Saltar paso
                  </button>
                  <Button
                    onClick={() => setStep(5)}
                    variant="primary"
                    disabled={clinicEnabled && (!clinicName || !clinicAddress)}
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold bg-black text-white hover:bg-zinc-900"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Courses */}
            {step === 5 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-slate-900 font-jakarta leading-tight">
                    Cursos y Talleres Externos
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-500 font-sans">
                    Comparte tus formaciones, cursos o talleres actuales.
                  </p>
                </div>

                <div className="flex flex-col gap-5 text-[14px] text-slate-600 leading-relaxed font-sans mt-2">
                  <p>
                    Si tienes cursos grabados, talleres presenciales o programas en plataformas externas, puedes listarlos aquí para darles visibilidad en tu perfil. Luminus no gestionará las inscripciones ni cobros de estos cursos.
                  </p>
                </div>

                {/* Courses Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 mt-2 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-slate-900 font-jakarta">Agregar cursos o talleres</span>
                    <span className="text-[11px] text-slate-400">Habilita esta opción para listar tus programas</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoursesEnabled(!coursesEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out cursor-pointer ${
                      coursesEnabled ? "bg-black" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${
                        coursesEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Courses Dynamic Form */}
                {coursesEnabled && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Mis Cursos</span>
                      <button
                        type="button"
                        onClick={handleAddCourse}
                        className="text-[12px] font-bold text-slate-900 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Agregar Curso
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {courses.map((course, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                          <div className="flex-1 flex flex-col gap-3">
                            <InputField
                              type="text"
                              value={course.name}
                              onChange={(e) => handleCourseChange(idx, 'name', e.target.value)}
                              placeholder="Nombre del Curso / Taller *"
                              className="!h-10 !text-[13px] !bg-white"
                            />
                            <textarea
                              value={course.description}
                              onChange={(e) => handleCourseChange(idx, 'description', e.target.value)}
                              placeholder="Descripción breve *"
                              rows={2}
                              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-[13px] text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none placeholder:text-slate-400 font-sans"
                            />
                            <InputField
                              type="url"
                              value={course.url}
                              onChange={(e) => handleCourseChange(idx, 'url', e.target.value)}
                              placeholder="Enlace URL al Curso (ej. https://...) *"
                              className="!h-10 !text-[13px] !bg-white"
                            />
                            <InputField
                              type="url"
                              value={course.coverUrl || ""}
                              onChange={(e) => handleCourseChange(idx, 'coverUrl', e.target.value)}
                              placeholder="Enlace URL a la imagen de portada (Opcional)"
                              className="!h-10 !text-[13px] !bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer shrink-0 mt-1"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      ))}

                      {courses.length === 0 && (
                        <p className="text-[12px] text-slate-400 text-center py-4 border border-dashed border-zinc-200 rounded-xl bg-white">
                          Haz clic en "Agregar Curso" para añadir tu primer taller o programa.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-6">
                  <Button
                    onClick={() => setStep(4)}
                    variant="outline"
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold"
                  >
                    Atrás
                  </Button>
                  <button
                    onClick={() => {
                      setCourses([]);
                      handleSubmit();
                    }}
                    disabled={loading}
                    className="h-11 px-5 border border-transparent rounded-xl text-[13px] font-jakarta font-semibold text-slate-500 hover:text-black hover:bg-slate-150 transition active:scale-95 cursor-pointer bg-transparent uppercase tracking-wider"
                  >
                    Saltar paso
                  </button>
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    disabled={loading || (coursesEnabled && courses.some(c => !c.name || !c.description || !c.url))}
                    className="!w-auto px-6 !h-11 text-[13px] font-jakarta font-bold bg-black text-white hover:bg-zinc-900"
                  >
                    {loading ? "Enviando..." : "Finalizar Registro"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Success / Thank You Screen */}
            {step === 6 && (
              <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300 py-4">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100 text-green-600 animate-bounce">
                  <span className="material-symbols-outlined text-[36px] select-none">
                    verified_user
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-[26px] md:text-[30px] font-bold text-slate-900 font-jakarta leading-tight">
                    ¡Muchas gracias por postularte!
                  </h1>
                  <p className="text-[13px] md:text-[14px] text-slate-400 font-medium font-sans uppercase tracking-widest">
                    Tu solicitud ha sido registrada con éxito.
                  </p>
                </div>

                <div className="text-[14px] text-slate-500 leading-relaxed font-sans max-w-[460px] flex flex-col gap-4 mt-2">
                  <p>
                    Tu postulación para sumarte como especialista en Luminus está en proceso de revisión por nuestro <strong className="text-slate-800 font-bold">Consejo de Expertos</strong> (Review Board).
                  </p>
                  <p>
                    Evaluamos detalladamente cada perfil para asegurar la máxima calidad y alineación con los estándares y valores de nuestra comunidad. Te enviaremos un correo electrónico con la resolución del comité en los próximos días.
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/especialistas")}
                  variant="primary"
                  className="w-full md:!w-auto px-8 !h-12 bg-black text-white hover:bg-zinc-900 font-bold font-jakarta text-[13px] uppercase tracking-wider mt-6 !rounded-xl"
                >
                  Volver a la plataforma
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
