"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CalendarCheck, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProfileSectionCard } from "@/components/ui/ProfileSectionCard";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { IntroSessionScheduler } from "./IntroSessionScheduler";
import { IntroSessionGuideModal } from "./IntroSessionGuideModal";
import { ProfileHeroHeader } from "./ProfileHeroHeader";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ProfileInterestsSection } from "./ProfileInterestsSection";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { formatSpaceAddress } from "@/utils/locationUtils";
import {
  getAvailableDatesWithSlots,
  formatShortSessionDate,
  type BookedSlot,
} from "@/lib/sessions/sessionAvailability";
import {
  getCategoryTextClass,
  getCategoryPillClass,
  renderCategoryIcon,
  getCategoryCustomStyles,
  useDynamicCategories,
} from "@/components/ui/InterestPill";

const FULL_DAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function normalizeUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

interface SpecialistProfileViewProps {
  profile: any;
  isPublic?: boolean;
  onConnect?: () => void;
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
  // Owner mode actions
  onEditProfile?: () => void;
  onEditPhoto?: () => void;
  onEditCover?: () => void;
  onEditBio?: () => void;
  onEditInterests?: () => void;
  onEditPrompts?: (step?: "list" | "select") => void;
  onEditSpecialistPractice?: () => void;
  onEditSpecialistSpaces?: () => void;
  onEditSpecialistCourses?: () => void;
  onEditSpecialistAvailability?: () => void;
  membershipCard?: React.ReactNode;
  onSignOut?: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export function SpecialistProfileView({
  profile,
  isPublic = true,
  onConnect,
  onRemoveConnection,
  onBlockConnection,
  connectionLoading,
  isConnectionDropdownOpen,
  setIsConnectionDropdownOpen,
  connectionDropdownRefDesktop,
  connectionDropdownRefMobile,
  onSendMessage,
  onShareProfile,
  onEditProfile,
  onEditPhoto,
  onEditCover,
  onEditBio,
  onEditInterests,
  onEditPrompts,
  onEditSpecialistPractice,
  onEditSpecialistSpaces,
  onEditSpecialistCourses,
  onEditSpecialistAvailability,
  membershipCard,
  onSignOut,
  onBack,
  backLabel,
}: SpecialistProfileViewProps) {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<"profesional" | "personal">("profesional");
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedDateKeyForModal, setSelectedDateKeyForModal] = useState<string | null>(null);
  const [showSessionGuide, setShowSessionGuide] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [myActiveSession, setMyActiveSession] = useState<any>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const dbCategories = useDynamicCategories();
  const specialist = profile.specialistProfile;
  const specialtyCustomStyles = getCategoryCustomStyles(
    specialist?.specialty || specialist?.title,
    dbCategories
  );
  const courses = specialist?.courses || [];
  const spaces = specialist?.spaces || [];

  const availability = spaces.flatMap((space: any) => space.availability || []);
  const activeAvailability = useMemo(
    () => availability.filter((item: any) => item.isActive !== false),
    [availability]
  );
  const hasAvailability = activeAvailability.length > 0;

  useEffect(() => {
    if (!isPublic || !profile?.id || !hasAvailability) return;
    let cancelled = false;
    setLoadingSessions(true);
    fetch(`/api/sessions?specialistId=${profile.id}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setBookedSlots(data.bookedSlots || []);
        setMyActiveSession(data.myActiveSession || null);
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setLoadingSessions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isPublic, profile?.id, hasAvailability]);

  const availableDates = useMemo(
    () => getAvailableDatesWithSlots(activeAvailability, bookedSlots, 28),
    [activeAvailability, bookedSlots]
  );

  const hasPracticeHeader = Boolean(
    specialist?.title ||
      specialist?.specialty ||
      (Array.isArray(specialist?.selectedAreas) && specialist.selectedAreas.length > 0)
  );

  const hasPracticeAbout = Boolean(
    specialist?.bio ||
      specialist?.institution ||
      specialist?.instagramUrl ||
      specialist?.linkedinUrl ||
      specialist?.websiteUrl
  );

  return (
    <div className="w-full flex flex-col font-sans">
      {isSchedulerOpen && profile?.id && (
        <IntroSessionScheduler
          specialistId={profile.id}
          specialistName={profile.first_name || "el especialista"}
          availableDates={availableDates}
          initialDateKey={selectedDateKeyForModal}
          onBooked={(created) => {
            if (created) {
              setMyActiveSession(created);
              setBookedSlots((prev) => [
                ...prev,
                {
                  scheduledDate: created.scheduledDate,
                  startTime: created.startTime,
                  status: created.status,
                },
              ]);
            }
          }}
          onClose={() => {
            setIsSchedulerOpen(false);
            setSelectedDateKeyForModal(null);
          }}
        />
      )}

      {/* 1. Full-Width Cover & Hero Header */}
      <ProfileHeroHeader
        profile={profile}
        isSpecialist={true}
        activeTab={mainTab}
        onTabChange={setMainTab}
        onConnect={onConnect}
        onRemoveConnection={onRemoveConnection}
        onBlockConnection={onBlockConnection}
        connectionLoading={connectionLoading}
        isConnectionDropdownOpen={isConnectionDropdownOpen}
        setIsConnectionDropdownOpen={setIsConnectionDropdownOpen}
        connectionDropdownRefDesktop={connectionDropdownRefDesktop}
        connectionDropdownRefMobile={connectionDropdownRefMobile}
        onSendMessage={onSendMessage}
        onShareProfile={onShareProfile}
        isOwnProfile={!isPublic || Boolean(profile?.is_own_profile)}
        onEditProfile={onEditProfile}
        onEditPhoto={onEditPhoto}
        onEditCover={onEditCover}
        onBack={onBack}
        backLabel={backLabel}
      />

      {/* 2. Balanced 8:4 Grid Content Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <UnderlineTabs
          tabs={[
            { id: "profesional", label: "Perfil Profesional" },
            { id: "personal", label: "Perfil Personal" },
          ]}
          activeTab={mainTab}
          onChange={(tab) => setMainTab(tab as "profesional" | "personal")}
          className="mt-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 lg:gap-6 mt-4 sm:mt-5 items-start">
          {mainTab === "profesional" ? (
            <>
              {/* MAIN COLUMN (lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-5">
                {/* Card 0: Especialidad & Áreas de acompañamiento */}
                <ProfileSectionCard
                  title={
                    specialist?.specialty?.toLowerCase().startsWith("especialista en")
                      ? specialist.specialty
                      : `Especialista en ${specialist?.specialty || "Bienestar"}`
                  }
                  isPublic={isPublic}
                  isEmpty={!hasPracticeHeader}
                  onEdit={onEditSpecialistPractice}
                  editTitle="Editar especialidad y áreas"
                  emptyActionLabel="Agregar especialidad y áreas"
                >
                  <div className="flex flex-col gap-3">
                    {(specialist?.title || specialist?.specialty) && (
                      <div
                        style={
                          specialtyCustomStyles?.color
                            ? { color: specialtyCustomStyles.color }
                            : undefined
                        }
                        className={`flex items-center gap-2 ${getCategoryTextClass(
                          specialist?.specialty || specialist?.title,
                          dbCategories
                        )}`}
                      >
                        {renderCategoryIcon(
                          specialist?.specialty || specialist?.title,
                          "w-4 h-4 shrink-0",
                          dbCategories
                        )}
                        <span className="text-body font-semibold text-current">
                          {specialist?.title || specialist?.specialty}
                        </span>
                      </div>
                    )}

                    {Array.isArray(specialist?.selectedAreas) &&
                      specialist.selectedAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {specialist.selectedAreas.map((area: string, idx: number) => {
                            const areaStyles =
                              getCategoryCustomStyles(area, dbCategories) ||
                              specialtyCustomStyles;
                            return (
                              <span
                                key={idx}
                                style={
                                  areaStyles?.color && areaStyles?.bgColor
                                    ? {
                                        backgroundColor: areaStyles.bgColor,
                                        color: areaStyles.color,
                                        borderColor: areaStyles.borderColor,
                                      }
                                    : undefined
                                }
                                className={`h-6 px-2.5 inline-flex items-center rounded-full text-meta font-medium font-sans border select-none ${getCategoryPillClass(
                                  area || specialist?.specialty,
                                  dbCategories
                                )}`}
                              >
                                {area}
                              </span>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </ProfileSectionCard>

                {/* Card 1: Sobre mi Práctica */}
                <ProfileSectionCard
                  title="Sobre mi práctica"
                  isPublic={isPublic}
                  isEmpty={!hasPracticeAbout}
                  onEdit={onEditSpecialistPractice}
                  editTitle="Editar sobre mi práctica"
                  emptyActionLabel="Contar sobre tu práctica"
                >
                  <div className="flex flex-col gap-2.5">
                    {specialist?.bio && (
                      <p className="text-body text-slate-600 whitespace-pre-wrap">
                        {specialist.bio}
                      </p>
                    )}

                    {specialist?.institution && (
                      <p className="text-meta text-slate-500">
                        {specialist.institution}
                      </p>
                    )}

                    {(specialist?.instagramUrl ||
                      specialist?.linkedinUrl ||
                      specialist?.websiteUrl) && (
                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        {specialist?.instagramUrl && (
                          <a
                            href={normalizeUrl(specialist.instagramUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-meta text-slate-600 hover:text-slate-900 font-medium"
                          >
                            Instagram
                          </a>
                        )}
                        {specialist?.linkedinUrl && (
                          <a
                            href={normalizeUrl(specialist.linkedinUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-meta text-slate-600 hover:text-slate-900 font-medium"
                          >
                            LinkedIn
                          </a>
                        )}
                        {specialist?.websiteUrl && (
                          <a
                            href={normalizeUrl(specialist.websiteUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-meta text-slate-600 hover:text-slate-900 font-medium"
                          >
                            Sitio web
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </ProfileSectionCard>

                {/* Card 2: Espacios de Atención */}
                <ProfileSectionCard
                  title="Espacios de atención"
                  isPublic={isPublic}
                  isEmpty={spaces.length === 0}
                  onEdit={onEditSpecialistSpaces}
                  editTitle="Editar espacios de atención"
                  emptyActionLabel="Agregar espacio de atención"
                >
                  <div className="divide-y divide-slate-100">
                    {spaces.map((space: any) => {
                      const formattedAddress = formatSpaceAddress(
                        space.address,
                        space.city,
                        space.country
                      );
                      const metaParts = [formattedAddress, space.phone].filter(Boolean);

                      return (
                        <div
                          key={space.id}
                          className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <h4 className="text-body font-semibold text-slate-900">
                              {space.name}
                            </h4>
                            {space.googleMapsUrl && (
                              <a
                                href={space.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-meta text-slate-600 hover:text-slate-900 font-medium shrink-0"
                              >
                                Ver mapa
                              </a>
                            )}
                          </div>

                          {space.description && (
                            <p className="text-body text-slate-600">{space.description}</p>
                          )}

                          {(metaParts.length > 0 || space.website) && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-slate-500">
                              {metaParts.length > 0 && (
                                <span>{metaParts.join(" · ")}</span>
                              )}
                              {space.website && (
                                <a
                                  href={normalizeUrl(space.website)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 hover:text-slate-900 font-medium"
                                >
                                  Sitio web
                                </a>
                              )}
                            </div>
                          )}

                          {space.services && space.services.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {space.services.map((service: any) => (
                                <span
                                  key={service.id}
                                  className="h-6 px-2.5 inline-flex items-center rounded-full bg-slate-50 border border-slate-200/80 text-meta text-slate-600"
                                >
                                  {service.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ProfileSectionCard>

                {/* Card 3: Cursos & Talleres */}
                <ProfileSectionCard
                  title="Cursos y talleres"
                  isPublic={isPublic}
                  isEmpty={courses.length === 0}
                  onEdit={onEditSpecialistCourses}
                  editTitle="Editar cursos y talleres"
                  emptyActionLabel="Agregar curso o taller"
                >
                  <div className="divide-y divide-slate-100">
                    {courses.map((course: any) => {
                      const metaLine = [course.modality, course.institution]
                        .filter(Boolean)
                        .join(" · ");

                      return (
                        <div
                          key={course.id || course.name}
                          className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <h4 className="text-body font-semibold text-slate-900">
                              {course.name}
                            </h4>
                            {course.url && (
                              <a
                                href={normalizeUrl(course.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-meta text-slate-600 hover:text-slate-900 font-medium shrink-0"
                              >
                                Ver curso
                              </a>
                            )}
                          </div>

                          {metaLine && (
                            <p className="text-meta text-slate-500">{metaLine}</p>
                          )}

                          {course.description && (
                            <p className="text-body text-slate-600 whitespace-pre-wrap">
                              {course.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ProfileSectionCard>
              </div>

              {/* SIDEBAR COLUMN (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-5">
                <ProfileSectionCard
                  title="Sesión introductoria"
                  isPublic={isPublic}
                  isEmpty={
                    isPublic
                      ? !hasAvailability ||
                        (!loadingSessions &&
                          availableDates.length === 0 &&
                          !myActiveSession)
                      : !hasAvailability
                  }
                  onEdit={onEditSpecialistAvailability}
                  editTitle="Editar disponibilidad de sesión introductoria"
                  emptyActionLabel="Configurar horarios disponibles"
                >
                  {!isPublic ? (
                    <div className="flex flex-col gap-2">
                      {activeAvailability.map((slot: any, idx: number) => (
                        <div
                          key={`${slot.dayOfWeek}-${idx}`}
                          className="flex items-center justify-between py-1.5 text-meta text-slate-700"
                        >
                          <span className="font-semibold text-slate-900">
                            {FULL_DAY_LABELS[slot.dayOfWeek] ?? `Día ${slot.dayOfWeek}`}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                      ))}
                      <Button
                        variant="soft"
                        size="sm"
                        fullWidth
                        onClick={() => router.push("/sesiones?tab=recibidas")}
                        className="mt-2 gap-1.5"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Gestionar solicitudes</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowSessionGuide(true)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-transparent border-none p-1 cursor-pointer font-jakarta"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>¿Cómo funcionan las sesiones?</span>
                      </button>
                    </div>
                  ) : myActiveSession ? (
                    <div className="flex flex-col gap-3.5">
                      <div
                        className={`rounded-xl border p-3.5 flex flex-col gap-1.5 ${
                          myActiveSession.status === "accepted"
                            ? "bg-emerald-50/70 border-emerald-200/80"
                            : "bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        <span
                          className={`text-label ${
                            myActiveSession.status === "accepted"
                              ? "text-emerald-700"
                              : "text-slate-700"
                          }`}
                        >
                          {myActiveSession.status === "accepted"
                            ? "Sesión confirmada"
                            : "Solicitud pendiente de confirmación"}
                        </span>
                        <span className="text-body font-semibold text-slate-900 capitalize">
                          {formatShortSessionDate(myActiveSession.scheduledDate)} ·{" "}
                          {myActiveSession.startTime} hs
                        </span>
                        <span className="text-meta text-slate-500">
                          {myActiveSession.status === "accepted"
                            ? "Ya tienes el horario reservado con este especialista."
                            : "Te avisaremos cuando el especialista confirme tu solicitud."}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={() => router.push("/sesiones")}
                      >
                        Ver en Mis sesiones
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      <p className="text-body text-slate-600">
                        Conoce a {profile.first_name || "el especialista"} en una
                        videollamada corta de 15 minutos.
                      </p>

                      {availableDates.length > 0 && (
                        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                          <span className="text-label text-slate-500">
                            Próximos días disponibles
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {availableDates.slice(0, 6).map((day) => (
                              <button
                                key={day.dateKey}
                                type="button"
                                onClick={() => {
                                  setSelectedDateKeyForModal(day.dateKey);
                                  setIsSchedulerOpen(true);
                                }}
                                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-slate-900 hover:bg-slate-50 px-2 py-2.5 text-slate-900 transition-all font-jakarta cursor-pointer shadow-none"
                              >
                                <span className="text-meta text-slate-500">
                                  {day.dayLabel}
                                </span>
                                <span className="text-xs font-bold mt-0.5">
                                  {day.dayNumber} {day.monthShort}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        className="gap-2"
                        disabled={loadingSessions || availableDates.length === 0}
                        onClick={() => {
                          setSelectedDateKeyForModal(
                            availableDates[0]?.dateKey || null
                          );
                          setIsSchedulerOpen(true);
                        }}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Elegir horario</span>
                      </Button>

                      <button
                        type="button"
                        onClick={() => setShowSessionGuide(true)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-transparent border-none p-1 cursor-pointer font-jakarta"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>¿Cómo funciona?</span>
                      </button>
                    </div>
                  )}
                </ProfileSectionCard>
              </div>
            </>
          ) : (
            <>
              {/* PERSONAL TAB: MAIN COLUMN (lg:col-span-8) */}
              {(!isPublic ||
                Boolean(profile.bio) ||
                (Array.isArray(profile.prompts) && profile.prompts.length > 0)) && (
                <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-5">
                  <ProfileAboutSection
                    bio={profile.bio}
                    isPublic={isPublic}
                    onEdit={onEditBio}
                    firstName={profile.first_name}
                  />

                  <ProfileCompletionCard
                    prompts={profile.prompts}
                    isPublic={isPublic}
                    onEditPrompts={onEditPrompts}
                    firstName={profile.first_name}
                  />
                </div>
              )}

              {/* PERSONAL TAB: SIDEBAR COLUMN (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-5">
                <ProfileInterestsSection
                  interests={profile.interests}
                  otherInterests={profile.other_interests}
                  isPublic={isPublic}
                  onEdit={onEditInterests}
                  firstName={profile.first_name}
                />

                {!isPublic && membershipCard ? membershipCard : null}

                {!isPublic && onSignOut && (
                  <div className="w-full flex justify-center pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSignOut}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      Cerrar sesión
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <IntroSessionGuideModal
        isOpen={showSessionGuide}
        onClose={() => setShowSessionGuide(false)}
        defaultTab={isPublic ? "miembros" : "especialistas"}
      />
    </div>
  );
}
