"use client";

import { useState, useMemo } from "react";
import { 
  Calendar, 
  MapPin, 
  Globe, 
  BookOpen, 
  ExternalLink,
  Building2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Phone,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IntroSessionScheduler } from "./IntroSessionScheduler";
import { ProfileHeroHeader } from "./ProfileHeroHeader";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ProfileInterestsSection } from "./ProfileInterestsSection";
import { ProfileCompletionCard } from "./ProfileCompletionCard";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_LABELS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface SpecialistProfileViewProps {
  profile: any;
  isPublic?: boolean;
  onConnect?: () => void;
  onDeclineConnect?: () => void;
  onRemoveConnection?: () => void;
  onBlockConnection?: () => void;
  connectionLoading?: boolean;
  getConnectionButtonLabel?: () => string;
  isConnectionDropdownOpen?: boolean;
  setIsConnectionDropdownOpen?: (open: boolean) => void;
  connectionDropdownRefDesktop?: React.RefObject<HTMLDivElement>;
  connectionDropdownRefMobile?: React.RefObject<HTMLDivElement>;
  onSendMessage?: () => void;
  onShareProfile?: () => void;
}

export function SpecialistProfileView({
  profile,
  isPublic = true,
  onConnect,
  onDeclineConnect,
  onRemoveConnection,
  onBlockConnection,
  connectionLoading,
  isConnectionDropdownOpen,
  setIsConnectionDropdownOpen,
  connectionDropdownRefDesktop,
  connectionDropdownRefMobile,
  onSendMessage,
  onShareProfile,
}: SpecialistProfileViewProps) {
  const [mainTab, setMainTab] = useState<"profesional" | "personal">("profesional");
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
  const [inlineWeekOffset, setInlineWeekOffset] = useState(0);
  
  const specialist = profile.specialistProfile;
  const courses = specialist?.courses || [];
  const spaces = specialist?.spaces || [];

  const availability = spaces.flatMap((space: any) => space.availability || []);
  const effectiveAvailability = availability;
  const hasAvailability = effectiveAvailability.length > 0;

  const inlineDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + inlineWeekOffset * 7 + index);
      return date;
    });
  }, [inlineWeekOffset]);

  const availabilityByDay = useMemo(() => {
    const map = new Map<number, any>();
    availability.filter((item: any) => item.isActive !== false).forEach((item: any) => map.set(item.dayOfWeek, item));
    return map;
  }, [availability]);

  return (
    <div className="w-full flex flex-col font-sans">
      {isSchedulerOpen && (
        <IntroSessionScheduler
          specialistName={profile.first_name || "el especialista"}
          availability={effectiveAvailability}
          initialDate={selectedDateForModal}
          onClose={() => {
            setIsSchedulerOpen(false);
            setSelectedDateForModal(null);
          }}
        />
      )}

      {/* 1. 100% Full-Width Edge-to-Edge Cover & Hero Header */}
      <ProfileHeroHeader
        profile={profile}
        isSpecialist={true}
        activeTab={mainTab}
        onTabChange={setMainTab}
        onConnect={onConnect}
        onDeclineConnect={onDeclineConnect}
        onRemoveConnection={onRemoveConnection}
        onBlockConnection={onBlockConnection}
        connectionLoading={connectionLoading}
        isConnectionDropdownOpen={isConnectionDropdownOpen}
        setIsConnectionDropdownOpen={setIsConnectionDropdownOpen}
        connectionDropdownRefDesktop={connectionDropdownRefDesktop}
        connectionDropdownRefMobile={connectionDropdownRefMobile}
        onSendMessage={onSendMessage}
        onShareProfile={onShareProfile}
      />

      {/* 2. Balanced 8:4 Grid Content Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Split Sub-Navigation Tabs (Separated from user card, text only, no icons) */}
        <div className="flex items-center gap-2 mt-4 sm:mt-5">
          <button
            type="button"
            onClick={() => setMainTab("profesional")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-jakarta transition-all cursor-pointer ${
              mainTab === "profesional"
                ? "bg-slate-900 text-white font-bold shadow-xs border border-slate-900"
                : "bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold"
            }`}
          >
            Perfil Profesional
          </button>
          <button
            type="button"
            onClick={() => setMainTab("personal")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-jakarta transition-all cursor-pointer ${
              mainTab === "personal"
                ? "bg-slate-900 text-white font-bold shadow-xs border border-slate-900"
                : "bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold"
            }`}
          >
            Perfil Personal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 mt-4 items-start">
          {mainTab === "profesional" ? (
            <>
              {/* MAIN COLUMN (lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                {/* Card 1: Sobre mi Práctica */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-3.5 shadow-none">
                  <div className="flex items-center gap-2">
                    <h3 className="text-title-section text-slate-900 font-jakarta uppercase tracking-wider text-xs font-bold">
                      Sobre mi práctica
                    </h3>
                  </div>

                  <div className="text-body text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                    {specialist?.bio || "Este especialista aún no ha añadido una descripción de su práctica."}
                  </div>

                  {specialist?.institution && (
                    <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-600 font-medium font-sans">
                      <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Formación / Certificación: <strong className="text-slate-800 font-semibold">{specialist.institution}</strong></span>
                    </div>
                  )}

                  {/* Social / Web channels if present */}
                  {(specialist?.instagramUrl || specialist?.linkedinUrl || specialist?.websiteUrl) && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4">
                      {specialist?.instagramUrl && (
                        <a 
                          href={specialist.instagramUrl.startsWith("http") ? specialist.instagramUrl : `https://${specialist.instagramUrl}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold font-jakarta"
                        >
                          <InstagramIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {specialist?.linkedinUrl && (
                        <a 
                          href={specialist.linkedinUrl.startsWith("http") ? specialist.linkedinUrl : `https://${specialist.linkedinUrl}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold font-jakarta"
                        >
                          <LinkedinIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {specialist?.websiteUrl && (
                        <a 
                          href={specialist.websiteUrl.startsWith("http") ? specialist.websiteUrl : `https://${specialist.websiteUrl}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold font-jakarta"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sitio web</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Card 2: Espacios de Atención */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-none">
                  <div className="flex items-center justify-between">
                    <h3 className="text-title-section text-slate-900 font-jakarta uppercase tracking-wider text-xs font-bold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Espacios de Atención
                    </h3>
                    {spaces.length > 0 && (
                      <span className="text-meta text-slate-400 font-medium">
                        {spaces.length} espacio{spaces.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {spaces.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center text-body text-slate-400 font-sans">
                      No hay espacios de atención registrados actualmente.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5">
                      {spaces.map((space: any) => (
                        <div key={space.id} className="border border-slate-200/80 rounded-xl p-4 sm:p-5 bg-slate-50/50 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-title-section font-bold text-slate-900 font-jakarta text-base">
                                {space.name}
                              </h4>
                              {space.spaceType && (
                                <span className="text-[11px] font-semibold text-slate-500 font-jakarta uppercase tracking-wider">
                                  {space.spaceType}
                                </span>
                              )}
                            </div>
                            {space.googleMapsUrl && (
                              <a 
                                href={space.googleMapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-jakarta font-semibold shrink-0"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Ver mapa</span>
                              </a>
                            )}
                          </div>

                          {space.description && (
                            <p className="text-body text-slate-600 font-sans text-xs sm:text-sm leading-relaxed">
                              {space.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-1">
                            {(space.address || space.city || space.country) && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {[space.address, space.city, space.country].filter(Boolean).join(", ")}
                              </span>
                            )}
                            {space.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {space.phone}
                              </span>
                            )}
                            {space.website && (
                              <a 
                                href={space.website.startsWith("http") ? space.website : `https://${space.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1.5 hover:text-slate-900 font-medium"
                              >
                                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                Sitio web
                              </a>
                            )}
                          </div>

                          {/* Services Tag Pills */}
                          {space.services && space.services.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                              {space.services.map((service: any) => (
                                <span key={service.id} className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200/80 text-slate-700 text-[11px] font-medium font-sans">
                                  {service.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Cursos & Talleres */}
                {courses.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-none">
                    <div className="flex items-center justify-between">
                      <h3 className="text-title-section text-slate-900 font-jakarta uppercase tracking-wider text-xs font-bold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        Cursos & Talleres
                      </h3>
                      <span className="text-meta text-slate-400 font-medium">
                        {courses.length} activo{courses.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {courses.map((course: any) => (
                        <div key={course.id} className="border border-slate-200/80 rounded-xl p-4 sm:p-5 bg-slate-50/50 flex flex-col gap-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-title-section font-bold text-slate-900 font-jakarta text-base">
                                {course.name}
                              </h4>
                              {course.modality && (
                                <span className="text-[11px] font-semibold text-slate-500 font-jakarta uppercase tracking-wider">
                                  {course.modality}
                                </span>
                              )}
                            </div>
                            {course.url && (
                              <a 
                                href={course.url.startsWith("http") ? course.url : `https://${course.url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1 font-semibold font-jakarta shrink-0"
                              >
                                <span>Ver curso</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <p className="text-body text-slate-600 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {course.description}
                          </p>

                          {course.institution && (
                            <p className="text-meta text-slate-400 font-medium">
                              Organizado por: {course.institution}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SIDEBAR COLUMN (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                {/* Scheduler CTA Card with Interactive Inline Calendar */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-none">
                  {/* Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-title-section text-slate-900 font-bold font-jakarta text-sm">
                        Sesión Introductoria
                      </h4>
                      <p className="text-meta text-slate-400 font-sans">
                        15 minutos · Sin costo
                      </p>
                    </div>
                  </div>

                  <p className="text-body text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
                    Conoce a {profile.first_name || "el especialista"} en una videollamada corta de 15 minutos.
                  </p>

                  {/* Inline Weekly Calendar */}
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        disabled={inlineWeekOffset === 0}
                        onClick={() => setInlineWeekOffset((v) => Math.max(0, v - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-none"
                        aria-label="Semana anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="capitalize text-slate-900 font-jakarta text-xs font-bold">
                        {MONTH_LABELS[inlineDays[0].getMonth()]} {inlineDays[0].getFullYear()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInlineWeekOffset((v) => v + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-none"
                        aria-label="Semana siguiente"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {inlineDays.map((date, index) => {
                        const enabled = availabilityByDay.has(mondayIndex(date));
                        return (
                          <button
                            key={dateKey(date)}
                            type="button"
                            disabled={!enabled}
                            onClick={() => {
                              setSelectedDateForModal(date);
                              setIsSchedulerOpen(true);
                            }}
                            title={enabled ? "Ver horarios" : "Sin disponibilidad"}
                            className={`flex min-h-[50px] flex-col items-center justify-center rounded-xl border text-xs transition-all font-jakarta cursor-pointer ${
                              enabled
                                ? "border-slate-200 bg-white hover:border-slate-900 hover:bg-slate-50 text-slate-900 font-semibold group shadow-none"
                                : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            <span className="text-[10px] text-slate-400 group-hover:text-slate-600 font-normal">{DAY_LABELS[index]}</span>
                            <span className="text-xs sm:text-sm font-bold mt-0.5">{date.getDate()}</span>
                            {enabled && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans text-center">
                      Elige un día disponible para seleccionar tu horario.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      const firstAvailable = inlineDays.find((d) => availabilityByDay.has(mondayIndex(d))) || inlineDays[0];
                      setSelectedDateForModal(firstAvailable);
                      setIsSchedulerOpen(true);
                    }}
                    className="gap-2 font-semibold text-xs sm:text-sm font-jakarta"
                  >
                    <Calendar className="w-4 h-4" />
                    Agendar sesión introductoria
                  </Button>
                </div>              </div>
            </>
          ) : (
            <>
              {/* PERSONAL TAB: MAIN COLUMN (lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                <ProfileAboutSection
                  bio={profile.bio}
                  isPublic={true}
                  firstName={profile.first_name}
                />

                <ProfileCompletionCard
                  prompts={profile.prompts}
                  isPublic={true}
                  firstName={profile.first_name}
                />
              </div>

              {/* PERSONAL TAB: SIDEBAR COLUMN (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  isPublic={true}
                  firstName={profile.first_name}
                />

                {/* Community Tenure Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-3 shadow-none">
                  <h4 className="text-title-section text-slate-900 font-jakarta uppercase tracking-wider text-xs font-bold">
                    Comunidad LUMINUS
                  </h4>
                  <p className="text-body text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
                    {profile.first_name || "Este usuario"} es parte de la comunidad de bienestar y crecimiento consciente en LUMINUS.
                  </p>
                  {profile?.member_since && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-meta text-slate-500">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span>Conectando personas con el bienestar.</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
