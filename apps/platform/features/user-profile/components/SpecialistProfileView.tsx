"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Clock,
  Globe,
  HelpCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProfileSectionCard } from "@/components/ui/ProfileSectionCard";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { IntroSessionScheduler } from "./IntroSessionScheduler";
import { IntroSessionGuideModal } from "./IntroSessionGuideModal";
import { CourseDetailModal, type CourseDetailItem } from "../modals/CourseDetailModal";
import { SpaceDetailModal, type SpaceDetailItem } from "../modals/SpaceDetailModal";
import { ProfileHeroHeader } from "./ProfileHeroHeader";
import { OwnPublicProfileBanner } from "./OwnPublicProfileBanner";
import { ProfileAboutSection } from "./ProfileAboutSection";
import { ProfileInterestsSection } from "./ProfileInterestsSection";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { formatSpaceAddress } from "@/utils/locationUtils";
import { resolveSocialHref } from "@/utils/socialLinks";
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
  return resolveSocialHref("website", url);
}

function InstagramIcon({ className = "w-3.5 h-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const SPACE_TYPE_LABELS: Record<string, string> = {
  CONSULTORIO: "Consultorio",
  CENTRO: "Centro / Clínica",
  ESTUDIO: "Estudio / Sala",
  ONLINE: "Atención Online",
};

function formatSpaceType(spaceType?: string | null, customSpaceType?: string | null) {
  if (customSpaceType?.trim()) return customSpaceType.trim();
  if (!spaceType) return null;
  if (spaceType === "OTRO" || spaceType === "Otro") return null;
  return SPACE_TYPE_LABELS[spaceType] || spaceType;
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

interface SpecialistProfileViewProps {
  profile: any;
  isPublic?: boolean;
  onConnect?: () => void;
  onFollow?: () => void;
  followLoading?: boolean;
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
  onEditSpecialistSpecialty?: () => void;
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
  onFollow,
  followLoading = false,
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
  onEditSpecialistSpecialty,
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
  const [selectedCourse, setSelectedCourse] = useState<CourseDetailItem | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<SpaceDetailItem | null>(null);
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

  const hasBio = Boolean(specialist?.bio?.trim());
  const hasInstitution = Boolean(specialist?.institution?.trim());
  const socialLinks = [
    specialist?.instagramUrl && {
      key: "instagram",
      label: "Instagram",
      href: resolveSocialHref("instagram", specialist.instagramUrl),
      icon: InstagramIcon,
    },
    specialist?.linkedinUrl && {
      key: "linkedin",
      label: "LinkedIn",
      href: resolveSocialHref("linkedin", specialist.linkedinUrl),
      icon: LinkedInIcon,
    },
    specialist?.websiteUrl && {
      key: "website",
      label: "Sitio web",
      href: resolveSocialHref("website", specialist.websiteUrl),
      icon: Globe,
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;

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
        onFollow={onFollow}
        followLoading={followLoading}
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
        isPublic={isPublic}
        onEditProfile={onEditProfile}
        onEditPhoto={onEditPhoto}
        onEditCover={onEditCover}
        onBack={onBack}
        backLabel={backLabel}
      />

      {/* 2. Balanced 8:4 Grid Content Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isPublic && Boolean(profile?.is_own_profile) && (
          <OwnPublicProfileBanner className="mt-4 sm:mt-5" />
        )}

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
                  isPublic={isPublic}
                  isEmpty={!hasPracticeHeader}
                  onEdit={onEditSpecialistSpecialty}
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
                        className={`flex items-center gap-2 ${!isPublic ? "pr-11" : ""} ${getCategoryTextClass(
                          specialist?.specialty || specialist?.title,
                          dbCategories
                        )}`}
                      >
                        {renderCategoryIcon(
                          specialist?.specialty || specialist?.title,
                          "w-5 h-5 shrink-0",
                          dbCategories
                        )}
                        <span className="text-base font-jakarta font-bold text-current leading-snug">
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
                  <div className="flex flex-col gap-5">
                    {hasBio && (
                      <p className="text-body text-slate-600 whitespace-pre-wrap">
                        {specialist.bio}
                      </p>
                    )}

                    {hasInstitution && (
                      <div className="flex flex-col gap-3.5">
                        <h4 className="text-title-section text-slate-900 font-bold">
                          Formación
                        </h4>
                        <p className="text-body text-slate-600">
                          {specialist.institution}
                        </p>
                      </div>
                    )}

                    {socialLinks.length > 0 && (
                      <div className="flex flex-col gap-3.5">
                        <h4 className="text-title-section text-slate-900 font-bold">
                          Redes sociales
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                          {socialLinks.map((item) => {
                            const Icon = item.icon;
                            return (
                              <a
                                key={item.key}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200/80 hover:border-slate-900 font-jakarta text-xs font-semibold transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                              >
                                <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors shrink-0" />
                                <span>{item.label}</span>
                              </a>
                            );
                          })}
                        </div>
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
                  <div className="flex flex-col gap-3.5">
                    {spaces.map((space: any) => {
                      const spaceTypeLabel = formatSpaceType(
                        space.spaceType,
                        space.customSpaceType
                      );
                      const formattedAddress = formatSpaceAddress(
                        space.address,
                        space.city,
                        space.country
                      );
                      const locationSummary =
                        [space.city, space.country].filter(Boolean).join(", ") ||
                        formattedAddress;
                      const previewServices = (space.services || []).slice(0, 2);
                      const extraServicesCount = Math.max(
                        0,
                        (space.services || []).length - previewServices.length
                      );

                      return (
                        <button
                          key={space.id || space.name}
                          type="button"
                          onClick={() => setSelectedSpace(space)}
                          className="group w-full text-left bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 cursor-pointer"
                        >
                          <div className="relative w-full sm:w-56 md:w-64 aspect-video shrink-0 rounded-xl bg-slate-100 overflow-hidden">
                            {space.coverUrl ? (
                              <img
                                src={space.coverUrl}
                                alt={space.name}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-400">
                                <MapPin className="w-6 h-6 stroke-[1.75]" />
                                {space.city && (
                                  <span className="text-meta text-slate-500 font-medium">
                                    {space.city}
                                  </span>
                                )}
                              </div>
                            )}

                            {spaceTypeLabel && (
                              <span className="absolute top-2 left-2 h-6 px-2.5 inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm text-meta text-slate-700 font-medium">
                                {spaceTypeLabel}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <h4 className="text-title-section text-slate-900 font-semibold line-clamp-1">
                              {space.name}
                            </h4>

                            {locationSummary && (
                              <div className="flex items-center gap-1.5 text-meta text-slate-500 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{locationSummary}</span>
                              </div>
                            )}

                            {space.description && (
                              <p className="text-body text-slate-600 line-clamp-2">
                                {space.description}
                              </p>
                            )}

                            {previewServices.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                {previewServices.map((service: any) => (
                                  <span
                                    key={service.id || service.name}
                                    className="h-6 px-2.5 inline-flex items-center rounded-full bg-white text-meta text-slate-600"
                                  >
                                    {service.name}
                                  </span>
                                ))}
                                {extraServicesCount > 0 && (
                                  <span className="text-meta text-slate-400 font-medium px-1">
                                    +{extraServicesCount}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="mt-auto pt-1 flex items-center justify-between text-label text-slate-500 group-hover:text-slate-900 transition-colors">
                              <span>Ver espacio y mapa</span>
                              <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </button>
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
                  <div className="flex flex-col gap-3.5">
                    {courses.map((course: any) => {
                      const typeLabel = formatCourseType(course.type);
                      const metaLine = [course.modality, course.institution]
                        .filter(Boolean)
                        .join(" · ");

                      return (
                        <button
                          key={course.id || course.name}
                          type="button"
                          onClick={() => setSelectedCourse(course)}
                          className="group w-full text-left bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 cursor-pointer"
                        >
                          <div className="relative w-full sm:w-56 md:w-64 aspect-video shrink-0 rounded-xl bg-slate-100 overflow-hidden">
                            {course.coverUrl ? (
                              <img
                                src={course.coverUrl}
                                alt={course.name}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <BookOpen className="w-6 h-6 stroke-[1.75]" />
                              </div>
                            )}

                            {typeLabel && (
                              <span className="absolute top-2 left-2 h-6 px-2.5 inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm text-meta text-slate-700 font-medium">
                                {typeLabel}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <h4 className="text-title-section text-slate-900 font-semibold line-clamp-2">
                              {course.name}
                            </h4>

                            {metaLine && (
                              <p className="text-meta text-slate-500 truncate">
                                {metaLine}
                              </p>
                            )}

                            {course.description && (
                              <p className="text-body text-slate-600 line-clamp-2">
                                {course.description}
                              </p>
                            )}

                            <div className="mt-auto pt-1 flex items-center justify-between text-label text-slate-500 group-hover:text-slate-900 transition-colors">
                              <span>Ver detalles</span>
                              <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </button>
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
                  emptyActionLabel="Añadir horarios"
                >
                  {!isPublic ? (
                    <div className="flex flex-col gap-2">
                      {activeAvailability.map((slot: any, idx: number) => (
                        <div
                          key={`${slot.dayOfWeek}-${idx}`}
                          className="flex items-center justify-between py-1.5 text-body"
                        >
                          <span className="font-medium text-slate-900">
                            {FULL_DAY_LABELS[slot.dayOfWeek] ?? `Día ${slot.dayOfWeek}`}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-slate-500 tabular-nums">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                      ))}
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => router.push("/sesiones?tab=recibidas")}
                        className="mt-2 gap-1.5"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Ver mis sesiones</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => setShowSessionGuide(true)}
                        className="gap-1.5 text-slate-500 hover:text-slate-900"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>¿Cómo funcionan las sesiones?</span>
                      </Button>
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

                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => setShowSessionGuide(true)}
                        className="gap-1.5 text-slate-500 hover:text-slate-900"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>¿Cómo funciona?</span>
                      </Button>
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

      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />

      <SpaceDetailModal
        space={selectedSpace}
        onClose={() => setSelectedSpace(null)}
      />
    </div>
  );
}
