"use client";

import { useState, useMemo } from "react";
import { AdminSpecialist, AdminPostulation, AdminUser, AdminTab } from "../../types";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { fieldValue, formatShortTime } from "../../utils";
import { AdminBadge, AdminCard, AdminDetailRow } from "../AdminDesignSystem";

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface SpecialistsTabProps {
  specialists: AdminSpecialist[];
  postulations: AdminPostulation[];
  users: AdminUser[];
  setSpecialists: React.Dispatch<React.SetStateAction<AdminSpecialist[]>>;
  setPostulations: React.Dispatch<React.SetStateAction<AdminPostulation[]>>;
  specialistSubTab: "lista" | "postulaciones";
  setSpecialistSubTab: (tab: "lista" | "postulaciones") => void;
  selectedSpecialistUserId: string | null;
  setSelectedSpecialistUserId: (id: string | null) => void;
  setSelectedId: (id: string) => void;
  setUserSubTab: (tab: "activos" | "cerradas" | "deshabilitados") => void;
  setActiveTab: (tab: AdminTab) => void;
}

export function SpecialistsTab({
  specialists,
  postulations,
  users,
  setSpecialists,
  setPostulations,
  specialistSubTab,
  setSpecialistSubTab,
  selectedSpecialistUserId,
  setSelectedSpecialistUserId,
  setSelectedId,
  setUserSubTab,
  setActiveTab,
}: SpecialistsTabProps) {
  const [specialistSearch, setSpecialistSearch] = useState("");
  const [postulationSearch, setPostulationSearch] = useState("");
  const [selectedPostulationId, setSelectedPostulationId] = useState<string>(postulations[0]?.id ?? "");
  const [expandedCourseIdx, setExpandedCourseIdx] = useState<number | null>(null);

  const [isEditingSpecialist, setIsEditingSpecialist] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Filtered specialists based on search text
  const filteredSpecialists = useMemo(() => {
    return specialists.filter((spec) => {
      if (!specialistSearch.trim()) return true;

      const query = specialistSearch.trim().toLowerCase();
      const full = spec.user.profile.fullName || `${spec.user.profile.firstName} ${spec.user.profile.lastName}`;
      const matchUser = full.toLowerCase().includes(query) || spec.user.email.toLowerCase().includes(query);
      const matchSpecialty = (spec.specialty || "").toLowerCase().includes(query);
      const matchTitle = (spec.title || "").toLowerCase().includes(query);
      const matchClinic = (spec.clinicName || "").toLowerCase().includes(query);

      return matchUser || matchSpecialty || matchTitle || matchClinic;
    });
  }, [specialists, specialistSearch]);

  // Filtered postulations based on search text
  const filteredPostulations = useMemo(() => {
    return postulations.filter((post) => {
      if (!postulationSearch.trim()) return true;

      const query = postulationSearch.trim().toLowerCase();
      const full = post.user.profile.fullName || `${post.user.profile.firstName} ${post.user.profile.lastName}`;
      const matchUser = full.toLowerCase().includes(query) || post.user.email.toLowerCase().includes(query);
      const matchSpecialty = (post.specialty || "").toLowerCase().includes(query);
      const matchTitle = (post.title || "").toLowerCase().includes(query);

      return matchUser || matchSpecialty || matchTitle;
    });
  }, [postulations, postulationSearch]);

  const selectedSpecialist =
    specialists.find((s) => s.userId === selectedSpecialistUserId) ?? filteredSpecialists[0] ?? null;

  const selectedPostulation =
    postulations.find((p) => p.id === selectedPostulationId) ?? filteredPostulations[0] ?? null;

  async function handleRemoveSpecialist(userId: string) {
    if (!confirm("¿Estás seguro de que deseas remover a este usuario como especialista?")) return;
    setIsProcessingAction(true);
    try {
      const response = await fetch("/api/admin/especialistas/postulations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Error al remover especialista.");
        return;
      }

      setSpecialists((prev) => prev.filter((s) => s.userId !== userId));
    } catch {
      alert("Error de conexión al remover especialista.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function updateSelectedSpecialist(formData: FormData) {
    if (!selectedSpecialist) return;
    setIsProcessingAction(true);

    const payload = {
      userId: selectedSpecialist.userId,
      specialty: String(formData.get("specialty") || ""),
      title: String(formData.get("title") || ""),
      clinicName: String(formData.get("clinicName") || ""),
      bio: String(formData.get("bio") || ""),
      linkedinUrl: String(formData.get("linkedinUrl") || ""),
      instagramUrl: String(formData.get("instagramUrl") || ""),
      websiteUrl: String(formData.get("websiteUrl") || ""),
    };

    try {
      const response = await fetch("/api/admin/especialistas/postulations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Error al actualizar especialista.");
        return;
      }

      setSpecialists((prev) =>
        prev.map((s) => (s.userId === selectedSpecialist.userId ? { ...s, ...payload } : s))
      );
      setIsEditingSpecialist(false);
    } catch {
      alert("Error de conexión al actualizar especialista.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handlePostulationAction(postulationId: string, action: "accept" | "decline") {
    setIsProcessingAction(true);
    try {
      const response = await fetch("/api/admin/especialistas/postulations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postulationId, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Error al procesar la aplicación.");
        return;
      }

      const acceptedPostulation = postulations.find((p) => p.id === postulationId);
      setPostulations((prev) => prev.filter((p) => p.id !== postulationId));

      if (action === "accept" && acceptedPostulation) {
        // Map Spanish day names to numbers
        const dayMap: Record<string, number> = {
          "lunes": 0, "lun": 0,
          "martes": 1, "mar": 1,
          "miércoles": 2, "miercoles": 2, "mie": 2,
          "jueves": 3, "jue": 3,
          "viernes": 4, "vie": 4,
          "sábado": 5, "sabado": 5, "sab": 5,
          "domingo": 6, "dom": 6
        };

        const initialSpaces = acceptedPostulation.clinicData ? [
          {
            name: acceptedPostulation.clinicData.clinicName || "Consultorio principal",
            spaceType: acceptedPostulation.clinicData.spaceType || null,
            categoryArea: acceptedPostulation.clinicData.categoryArea || null,
            address: acceptedPostulation.clinicData.clinicAddress || null,
            city: acceptedPostulation.clinicData.clinicCity || null,
            country: acceptedPostulation.clinicData.clinicCountry || null,
            phone: acceptedPostulation.clinicData.clinicPhone || null,
            website: acceptedPostulation.clinicData.clinicWebsite || null,
            availability: acceptedPostulation.sessionsData?.enabled && Array.isArray(acceptedPostulation.sessionsData.selectedDays)
              ? acceptedPostulation.sessionsData.selectedDays.map((day: string) => {
                  const cleanedName = day.trim().toLowerCase();
                  return {
                    dayOfWeek: dayMap[cleanedName] !== undefined ? dayMap[cleanedName] : 0,
                    startTime: acceptedPostulation.sessionsData.startTime || "09:00",
                    endTime: acceptedPostulation.sessionsData.endTime || "18:00",
                  };
                })
              : []
          }
        ] : [];

        const initialCourses = Array.isArray(acceptedPostulation.courses)
          ? acceptedPostulation.courses.map((c: any) => ({
              name: c.name || "Curso",
              type: c.type || null,
              description: c.description || "",
              modality: c.modality || null,
              url: c.url || null,
              coverUrl: c.coverUrl || null,
              institution: c.institution || null,
            }))
          : [];

        setSpecialists((prev) => [
          {
            userId: acceptedPostulation.userId,
            specialty: acceptedPostulation.specialty,
            title: acceptedPostulation.title,
            clinicName: acceptedPostulation.clinicName,
            bio: acceptedPostulation.bio,
            linkedinUrl: acceptedPostulation.linkedinUrl,
            instagramUrl: acceptedPostulation.instagramUrl,
            websiteUrl: acceptedPostulation.websiteUrl,
            institution: acceptedPostulation.institution,
            selectedAreas: acceptedPostulation.selectedAreas,
            resumeUrl: acceptedPostulation.resumeUrl,
            spaces: initialSpaces,
            courses: initialCourses,
            createdAt: acceptedPostulation.createdAt,
            user: acceptedPostulation.user,
          },
          ...prev,
        ]);
      }
    } catch {
      alert("Error de conexión al procesar aplicación.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  return (
    <div className="w-full p-6 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col box-border">
      {/* 2-Column Master-Detail Grid: Identical structure and top-alignment to UsersTab */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] gap-6 items-start flex-1 min-h-0 h-full">
        {/* Left Side: Heading + Unified List Card */}
        <div className="flex flex-col gap-4 min-w-0 h-full overflow-hidden">
          {/* Page Heading Area inside Left Column */}
          <div className="shrink-0">
            <h1 className="text-[28px] font-bold leading-tight font-jakarta text-slate-900">
              Especialistas
            </h1>
            <p className="mt-0.5 text-[14px] text-slate-500 font-sans">
              Administra los especialistas registrados y las aplicaciones pendientes.
            </p>
          </div>

          {/* Unified List Card (Especialistas or Aplicaciones) */}
          {specialistSubTab === "lista" ? (
            <AdminCard className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Toolbar inside card */}
              <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-3 shrink-0">
                {/* Single 2-State Action Button */}
                <button
                  type="button"
                  onClick={() => setSpecialistSubTab("postulaciones")}
                  className="h-10 px-3.5 rounded-xl bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all duration-300"
                  title="Ver aplicaciones pendientes"
                >
                  <span>Aplicaciones</span>
                  {postulations.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                      {postulations.length}
                    </span>
                  )}
                </button>

                {/* Search Field */}
                <div className="flex-1 min-w-0">
                  <InputField
                    value={specialistSearch}
                    onChange={(event) => setSpecialistSearch(event.target.value)}
                    placeholder="Buscar especialistas"
                    className="!w-full !h-10 text-xs"
                  />
                </div>

                {/* Filter Button */}
                <button
                  type="button"
                  title="Filtros"
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-all duration-300"
                >
                  <span className="material-symbols-rounded text-[19px] block">
                    instant_mix
                  </span>
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  title="Descargar"
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-all duration-300"
                >
                  <span className="material-symbols-rounded text-[19px] block">
                    download
                  </span>
                </button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[45%_30%_25%] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
                <span>Especialista</span>
                <span>Título</span>
                <span>Ciudad</span>
              </div>

              {/* Table Rows with Inner Scroll */}
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                {filteredSpecialists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <span
                      className="material-symbols-outlined text-[44px] mb-2 text-slate-300 block select-none"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                    >
                      heart_smile
                    </span>
                    <p className="text-sm font-medium">No se encontraron especialistas.</p>
                  </div>
                ) : (
                  filteredSpecialists.map((spec) => {
                    const active = spec.userId === selectedSpecialist?.userId;

                    return (
                      <button
                        key={spec.userId}
                        type="button"
                        onClick={() => {
                          setSelectedSpecialistUserId(spec.userId);
                          setIsEditingSpecialist(false);
                        }}
                        className={`grid w-full grid-cols-[45%_30%_25%] items-center px-4 py-3.5 text-left text-[14px] transition outline-none cursor-pointer border-y-0 border-r-0 ${active
                          ? "bg-slate-100/90 font-semibold border-l-4 border-slate-900"
                          : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                          }`}
                      >
                        {/* Specialist User Info */}
                        <span className="flex min-w-0 items-center gap-3 pr-2">
                          <span className="relative shrink-0">
                            {spec.user.profile.avatarUrl ? (
                              <img
                                src={spec.user.profile.avatarUrl}
                                alt=""
                                className="h-9 w-9 rounded-xl object-cover shrink-0"
                              />
                            ) : (
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase shrink-0">
                                {(spec.user.profile.fullName || spec.user.email)
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </span>
                            )}
                            <span
                              className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none"
                              title="Especialista"
                            >
                              <span
                                className="material-symbols-outlined text-[13px] leading-none block"
                                style={{
                                  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20",
                                }}
                              >
                                heart_smile
                              </span>
                            </span>
                          </span>
                          <span className="min-w-0 pr-1">
                            <span className={`block truncate ${active ? "font-bold text-slate-950" : "font-semibold text-slate-900"}`}>
                              {fieldValue(
                                spec.user.profile.fullName ||
                                `${spec.user.profile.firstName} ${spec.user.profile.lastName}`
                              )}
                            </span>
                            <span className="block truncate text-[12px] text-slate-500">
                              {spec.user.email}
                            </span>
                          </span>
                        </span>

                        {/* Título */}
                        <span className="truncate text-slate-900 text-xs font-semibold pr-2">
                          {fieldValue(spec.title)}
                        </span>

                        {/* Ciudad */}
                        <span className="truncate text-slate-600 text-xs font-medium pr-2">
                          {fieldValue(spec.user.profile.city)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </AdminCard>
          ) : (
            <AdminCard className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Toolbar inside card for Aplicaciones */}
              <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-3 shrink-0">
                {/* Single 2-State Action Button */}
                <button
                  type="button"
                  onClick={() => setSpecialistSubTab("lista")}
                  className="h-10 px-3.5 rounded-xl bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all duration-300"
                  title="Ver lista de especialistas"
                >
                  <span>Lista de Especialistas</span>
                </button>

                {/* Search Field */}
                <div className="flex-1 min-w-0">
                  <InputField
                    value={postulationSearch}
                    onChange={(event) => setPostulationSearch(event.target.value)}
                    placeholder="Buscar aplicaciones"
                    className="!w-full !h-10 text-xs"
                  />
                </div>

                {/* Filter Button */}
                <button
                  type="button"
                  title="Filtros"
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-all duration-300"
                >
                  <span className="material-symbols-rounded text-[19px] block">
                    instant_mix
                  </span>
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  title="Descargar"
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-all duration-300"
                >
                  <span className="material-symbols-rounded text-[19px] block">
                    download
                  </span>
                </button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[45%_30%_25%] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
                <span>Aspirante</span>
                <span>Título</span>
                <span>Fecha</span>
              </div>

              {/* Table Rows with Inner Scroll */}
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                {filteredPostulations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <span className="material-symbols-rounded text-[44px] mb-2 text-slate-300">
                      assignment
                    </span>
                    <p className="text-sm font-medium">No hay aplicaciones pendientes de revisión.</p>
                  </div>
                ) : (
                  filteredPostulations.map((post) => {
                    const active = post.id === selectedPostulation?.id;

                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          setSelectedPostulationId(post.id);
                          setExpandedCourseIdx(null);
                        }}
                        className={`grid w-full grid-cols-[45%_30%_25%] items-center px-4 py-3.5 text-left text-[14px] transition outline-none cursor-pointer border-y-0 border-r-0 ${active
                          ? "bg-slate-100/90 font-semibold border-l-4 border-slate-900"
                          : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                          }`}
                      >
                        {/* Aspirante Info */}
                        <span className="flex min-w-0 items-center gap-3 pr-2">
                          <span className="relative shrink-0">
                            {post.user.profile.avatarUrl ? (
                              <img
                                src={post.user.profile.avatarUrl}
                                alt=""
                                className="h-9 w-9 rounded-xl object-cover shrink-0"
                              />
                            ) : (
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase shrink-0">
                                {(post.user.profile.fullName || post.user.email)
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 pr-1">
                            <span className={`block truncate ${active ? "font-bold text-slate-950" : "font-semibold text-slate-900"}`}>
                              {fieldValue(
                                post.user.profile.fullName ||
                                `${post.user.profile.firstName} ${post.user.profile.lastName}`
                              )}
                            </span>
                            <span className="block truncate text-[12px] text-slate-500">
                              {post.user.email}
                            </span>
                          </span>
                        </span>

                        {/* Título */}
                        <span className="truncate text-slate-900 text-xs font-semibold pr-2">
                          {fieldValue(post.title)}
                        </span>

                        {/* Fecha */}
                        <span className="text-slate-500 font-sans text-xs">
                          {formatShortTime(post.createdAt)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </AdminCard>
          )}
        </div>

        {/* Right Side: Expanded Detail Panel (starts at top level with Heading!) */}
        {specialistSubTab === "lista" ? (
          selectedSpecialist ? (
            <AdminCard className="flex flex-col min-w-0 h-full overflow-hidden">
              {/* Header Profile Summary */}
              <div className="border-b border-slate-200/80 p-6 bg-white shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      {selectedSpecialist.user.profile.avatarUrl ? (
                        <img
                          src={selectedSpecialist.user.profile.avatarUrl}
                          alt=""
                          className="h-16 w-16 rounded-2xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-600 uppercase text-2xl shrink-0">
                          {(
                            selectedSpecialist.user.profile.fullName || selectedSpecialist.user.email
                          )
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                      )}
                      <span
                        className="absolute -bottom-1 -right-1 text-black leading-none drop-shadow-sm select-none"
                        title="Especialista"
                      >
                        <span
                          className="material-symbols-outlined text-[18px] leading-none block"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                        >
                          heart_smile
                        </span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h2 className="truncate text-lg font-bold text-slate-900 leading-tight font-jakarta">
                        {fieldValue(
                          selectedSpecialist.user.profile.fullName ||
                          `${selectedSpecialist.user.profile.firstName} ${selectedSpecialist.user.profile.lastName}`
                        )}
                      </h2>
                      <p className="truncate text-xs font-medium text-slate-500 mt-1">
                        {selectedSpecialist.user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <AdminBadge variant="specialist">{selectedSpecialist.specialty}</AdminBadge>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingSpecialist((prev) => !prev)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors ${isEditingSpecialist
                      ? "bg-black text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    title={isEditingSpecialist ? "Cancelar edición" : "Editar especialista"}
                  >
                    <span className="material-symbols-rounded text-[18px] block">
                      {isEditingSpecialist ? "close" : "edit"}
                    </span>
                  </button>
                </div>

                {/* Button: Ver perfil de usuario */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const linkedUser = users.find((u) => u.id === selectedSpecialist.userId);
                    if (linkedUser) {
                      setSelectedId(linkedUser.id);
                      setUserSubTab(linkedUser.status === "deleted" ? "cerradas" : linkedUser.status === "disabled" ? "deshabilitados" : "activos");
                      setActiveTab("usuarios");
                    } else {
                      alert("Usuario no encontrado en la lista actual.");
                    }
                  }}
                  className="w-full mt-4 flex items-center justify-center !h-9 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none transition-colors"
                >
                  Ver perfil de usuario
                </Button>
              </div>

              {/* Panel Content with Inner Scroll */}
              {!isEditingSpecialist ? (
                /* Read-Only View */
                <div className="p-6 flex flex-col gap-6 text-sm flex-1 overflow-y-auto min-h-0">
                  {/* Professional Info Section */}
                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Información Profesional
                    </h3>
                    <div className="bg-slate-50/50 rounded-xl p-1 divide-y divide-slate-100">
                      <AdminDetailRow label="Título Profesional" value={fieldValue(selectedSpecialist.title)} />
                      <AdminDetailRow label="Institución" value={fieldValue(selectedSpecialist.institution)} />
                    </div>
                  </div>

                  {/* Areas of accompaniment */}
                  {selectedSpecialist.selectedAreas && Array.isArray(selectedSpecialist.selectedAreas) && selectedSpecialist.selectedAreas.length > 0 && (
                    <div>
                      <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Áreas de Acompañamiento
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSpecialist.selectedAreas.map((area: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume URL */}
                  {selectedSpecialist.resumeUrl && (
                    <div>
                      <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Documentación
                      </h3>
                      <a
                        href={selectedSpecialist.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 font-semibold text-xs transition-colors"
                      >
                        <span className="material-symbols-rounded text-[18px]">picture_as_pdf</span>
                        Ver Currículum Vitae (PDF)
                      </a>
                    </div>
                  )}

                  {/* Spaces / Consultorios */}
                  {selectedSpecialist.spaces && selectedSpecialist.spaces.length > 0 && (
                    <div>
                      <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Espacios y Direcciones
                      </h3>
                      <div className="flex flex-col gap-3">
                        {selectedSpecialist.spaces.map((space: any, idx: number) => (
                          <div key={idx} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-xs text-slate-700">{space.name || `Espacio ${idx + 1}`}</span>
                              <div className="flex gap-1.5 items-center flex-wrap">
                                {space.categoryArea && (
                                  <span className="px-2 py-0.5 bg-amber-100/80 text-amber-800 text-[10px] font-semibold rounded-md">
                                    {space.categoryArea}
                                  </span>
                                )}
                                {space.spaceType && (
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] uppercase font-bold rounded-md">
                                    {space.spaceType}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                              {space.description && <p className="text-slate-600 italic">"{space.description}"</p>}
                              {space.address && <p>📍 {space.address} ({space.city || ""}, {space.country || ""})</p>}
                              {space.phone && <p>📞 {space.phone}</p>}
                              {space.website && <p>🔗 <a href={space.website} target="_blank" rel="noreferrer" className="underline hover:text-black">{space.website}</a></p>}
                            </div>

                            {/* Space Availability */}
                            {space.availability && space.availability.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Horarios de Atención</span>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
                                  {space.availability.map((avail: any, aIdx: number) => (
                                    <div key={aIdx} className="flex justify-between">
                                      <span className="font-medium">{DAY_NAMES[avail.dayOfWeek] || "Día"}:</span>
                                      <span>{avail.startTime} - {avail.endTime}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Biografía y Enfoque
                    </h3>
                    <div className="bg-slate-50/50 rounded-xl p-4">
                      <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedSpecialist.bio || "Sin biografía especificada."}
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Redes y Enlaces
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedSpecialist.linkedinUrl && (
                        <a
                          href={selectedSpecialist.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0077B5] transition-colors font-medium text-[13px]"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                          LinkedIn
                        </a>
                      )}
                      {selectedSpecialist.instagramUrl && (
                        <a
                          href={selectedSpecialist.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#E1306C] transition-colors font-medium text-[13px]"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m4.4 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9m0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m4.7-.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                          </svg>
                          Instagram
                        </a>
                      )}
                      {selectedSpecialist.websiteUrl && (
                        <a
                          href={selectedSpecialist.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-black transition-colors font-medium text-[13px]"
                        >
                          <span className="material-symbols-rounded text-[18px]">language</span>
                          Sitio Web
                        </a>
                      )}
                      {!selectedSpecialist.linkedinUrl &&
                        !selectedSpecialist.instagramUrl &&
                        !selectedSpecialist.websiteUrl && (
                          <span className="text-[13px] text-slate-400 italic">Sin redes agregadas</span>
                        )}
                    </div>
                  </div>

                  {/* Courses Section */}
                  {selectedSpecialist.courses &&
                    Array.isArray(selectedSpecialist.courses) &&
                    selectedSpecialist.courses.length > 0 && (
                      <div>
                        <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Cursos Creados ({selectedSpecialist.courses.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpecialist.courses.map((course: any, idx: number) => (
                            <a
                              key={idx}
                              href={course.url || course.coverUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 text-[12.5px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200"
                              title={course.description || course.name || course.title}
                            >
                              {course.name || course.title || `Curso ${idx + 1}`}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Remove Specialist Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialist(selectedSpecialist.userId)}
                      disabled={isProcessingAction}
                      className="w-full text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 py-2.5 rounded-xl border border-rose-200/50 cursor-pointer transition disabled:opacity-50"
                    >
                      Remover Especialista
                    </button>
                  </div>
                </div>
              ) : (
                /* Specialist Edit Form */
                <form
                  key={selectedSpecialist.userId}
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateSelectedSpecialist(new FormData(event.currentTarget));
                  }}
                  className="p-6 flex flex-col gap-6 text-sm flex-1 overflow-y-auto min-h-0"
                >
                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Información Profesional
                    </h3>
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Especialidad</span>
                        <InputField
                          name="specialty"
                          defaultValue={selectedSpecialist.specialty}
                          className="!h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Título Profesional</span>
                        <InputField name="title" defaultValue={selectedSpecialist.title} className="!h-9 text-xs" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Consultorio / Espacio</span>
                        <InputField
                          name="clinicName"
                          defaultValue={selectedSpecialist.clinicName || ""}
                          className="!h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Biografía y Enfoque
                    </h3>
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                      <textarea
                        name="bio"
                        defaultValue={selectedSpecialist.bio || ""}
                        rows={3}
                        placeholder="Escribe la biografía del especialista..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-medium outline-none resize-none min-h-[72px] bg-white focus:border-slate-800 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Redes y Enlaces
                    </h3>
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">LinkedIn URL</span>
                        <InputField
                          name="linkedinUrl"
                          defaultValue={selectedSpecialist.linkedinUrl || ""}
                          className="!h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Instagram URL</span>
                        <InputField
                          name="instagramUrl"
                          defaultValue={selectedSpecialist.instagramUrl || ""}
                          className="!h-9 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase text-slate-400">Sitio Web URL</span>
                        <InputField
                          name="websiteUrl"
                          defaultValue={selectedSpecialist.websiteUrl || ""}
                          className="!h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditingSpecialist(false)}
                      disabled={isProcessingAction}
                      className="!h-10 flex-1 font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessingAction}
                      className="!h-10 flex-1 font-bold bg-black hover:bg-slate-800 text-white shadow-none text-xs"
                    >
                      {isProcessingAction ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              )}
            </AdminCard>
          ) : (
            <AdminCard className="flex items-center justify-center p-8 text-center text-slate-400 h-full min-w-0 overflow-hidden">
              <p className="text-sm font-medium">Selecciona un especialista de la lista para ver los detalles.</p>
            </AdminCard>
          )
        ) : selectedPostulation ? (
          <AdminCard className="flex flex-col min-w-0 h-full overflow-hidden">
            {/* Header Profile Summary */}
            <div className="border-b border-slate-200/80 p-6 bg-white shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    {selectedPostulation.user.profile.avatarUrl ? (
                      <img
                        src={selectedPostulation.user.profile.avatarUrl}
                        alt=""
                        className="h-16 w-16 rounded-2xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-600 uppercase text-2xl shrink-0">
                        {(
                          selectedPostulation.user.profile.fullName || selectedPostulation.user.email
                        )
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="truncate text-lg font-bold text-slate-900 leading-tight font-jakarta">
                      {fieldValue(
                        selectedPostulation.user.profile.fullName ||
                        `${selectedPostulation.user.profile.firstName} ${selectedPostulation.user.profile.lastName}`
                      )}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        const linkedUser = users.find((u) => u.id === selectedPostulation.userId);
                        if (linkedUser) {
                          setSelectedId(linkedUser.id);
                          setUserSubTab(linkedUser.status === "deleted" ? "cerradas" : linkedUser.status === "disabled" ? "deshabilitados" : "activos");
                          setActiveTab("usuarios");
                        } else {
                          alert("Usuario no encontrado en la lista actual.");
                        }
                      }}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-transparent cursor-pointer"
                    >
                      Ver perfil de usuario
                    </button>
                  </div>
                </div>

                {/* Accept & Decline Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePostulationAction(selectedPostulation.id, "decline")}
                    disabled={isProcessingAction}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 h-9 flex items-center justify-center"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePostulationAction(selectedPostulation.id, "accept")}
                    disabled={isProcessingAction}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-900 text-white text-xs font-bold transition active:scale-95 border-none cursor-pointer disabled:opacity-50 h-9 flex items-center justify-center"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Content with Inner Scroll */}
            <div className="p-6 flex flex-col gap-6 text-sm flex-1 overflow-y-auto min-h-0">
              {/* Section 1: Personal and professional information */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-1.5 border-b border-slate-100 font-jakarta">
                  1. Información personal y profesional
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Título profesional</span>
                      <span className="text-sm text-slate-700 font-medium font-jakarta">
                        {selectedPostulation.title ? selectedPostulation.title : <span className="text-slate-400 italic">No provisto</span>}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 font-jakarta">Institución de formación</span>
                      <span className="text-sm text-slate-700 font-medium font-jakarta">
                        {selectedPostulation.institution ? selectedPostulation.institution : <span className="text-slate-400 italic">No provisto</span>}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 font-jakarta">Especialidad principal</span>
                      <span className="text-sm text-slate-700 font-medium font-jakarta">
                        {selectedPostulation.specialty ? selectedPostulation.specialty : <span className="text-slate-400 italic">No provisto</span>}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 font-jakarta">Currículum / CV</span>
                      {selectedPostulation.resumeUrl ? (
                        <a
                          href={selectedPostulation.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-black underline cursor-pointer"
                        >
                          <span className="material-symbols-rounded text-[16px]">picture_as_pdf</span>
                          Ver CV
                        </a>
                      ) : (
                        <span className="text-slate-400 italic font-jakarta">No provisto</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-jakarta">Áreas de acompañamiento</span>
                    {selectedPostulation.selectedAreas && Array.isArray(selectedPostulation.selectedAreas) && selectedPostulation.selectedAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPostulation.selectedAreas.map((area: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic font-jakarta">No provisto</span>
                    )}
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-jakarta">Biografía y enfoque profesional</span>
                    <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 rounded-xl p-3 border border-slate-100/50">
                      {selectedPostulation.bio ? selectedPostulation.bio : <span className="text-slate-400 italic font-jakarta">No provisto</span>}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-jakarta">Redes y enlaces</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedPostulation.linkedinUrl && (
                        <a
                          href={selectedPostulation.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0077B5] transition-colors font-medium text-xs font-jakarta"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                          LinkedIn
                        </a>
                      )}
                      {selectedPostulation.instagramUrl && (
                        <a
                          href={selectedPostulation.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#E1306C] transition-colors font-medium text-xs font-jakarta"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m4.4 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9m0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m4.7-.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                          </svg>
                          Instagram
                        </a>
                      )}
                      {selectedPostulation.websiteUrl && (
                        <a
                          href={selectedPostulation.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-black transition-colors font-medium text-xs font-jakarta"
                        >
                          <span className="material-symbols-rounded text-[16px]">language</span>
                          Sitio Web
                        </a>
                      )}
                      {!selectedPostulation.linkedinUrl &&
                        !selectedPostulation.instagramUrl &&
                        !selectedPostulation.websiteUrl && (
                          <span className="text-slate-400 italic font-jakarta">No provisto</span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Introductory sessions */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-1.5 border-b border-slate-100 font-jakarta">
                  2. Sesiones introductorias
                </h3>
                {selectedPostulation.sessionsData && selectedPostulation.sessionsData.enabled ? (
                  <div className="flex flex-col gap-3 font-jakarta">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ofrece sesiones introductorias:</span>
                      <span className="text-sm font-semibold text-slate-800">Sí</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Días disponibles</span>
                      <span className="text-sm text-slate-700 font-medium">
                        {Array.isArray(selectedPostulation.sessionsData.selectedDays) && selectedPostulation.sessionsData.selectedDays.length > 0
                          ? selectedPostulation.sessionsData.selectedDays.join(", ")
                          : <span className="text-slate-400 italic">No provisto</span>}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Rango horario</span>
                        <span className="text-sm text-slate-700 font-medium">
                          {selectedPostulation.sessionsData.startTime || "09:00"} - {selectedPostulation.sessionsData.endTime || "18:00"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Zona horaria</span>
                        <span className="text-sm text-slate-700 font-medium">
                          {selectedPostulation.sessionsData.timeZone ? selectedPostulation.sessionsData.timeZone : <span className="text-slate-400 italic">No provisto</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 font-jakarta">
                    <p className="text-sm text-slate-500 italic">
                      No ofrece sesiones introductorias.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Professional space */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-1.5 border-b border-slate-100 font-jakarta">
                  3. Espacio profesional
                </h3>
                {selectedPostulation.clinicData && typeof selectedPostulation.clinicData === "object" ? (
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/60 max-w-lg font-jakarta">
                    {selectedPostulation.clinicData.clinicCoverUrl && (
                      <img
                        src={selectedPostulation.clinicData.clinicCoverUrl}
                        alt=""
                        className="w-full h-32 object-cover rounded-xl mb-3 shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <h4 className="font-bold text-sm text-slate-800">
                          {selectedPostulation.clinicData.clinicName || <span className="text-slate-400 italic">No provisto</span>}
                        </h4>
                        <div className="flex gap-1.5 items-center flex-wrap">
                          {selectedPostulation.clinicData.categoryArea && (
                            <span className="px-2 py-0.5 bg-amber-100/80 text-amber-800 text-[10px] font-semibold rounded-md">
                              {selectedPostulation.clinicData.categoryArea}
                            </span>
                          )}
                          {selectedPostulation.clinicData.spaceType && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded-md border border-slate-200/50">
                              {selectedPostulation.clinicData.spaceType}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5">
                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-slate-400 text-[16px]">location_on</span>
                          {selectedPostulation.clinicData.clinicAddress ? (
                            <span>{selectedPostulation.clinicData.clinicAddress} ({selectedPostulation.clinicData.clinicCity || ""}, {selectedPostulation.clinicData.clinicCountry || ""})</span>
                          ) : (
                            <span className="text-slate-400 italic">No provisto</span>
                          )}
                        </p>

                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-slate-400 text-[16px]">phone</span>
                          {selectedPostulation.clinicData.clinicPhone ? (
                            <span>{selectedPostulation.clinicData.clinicPhone}</span>
                          ) : (
                            <span className="text-slate-400 italic">No provisto</span>
                          )}
                        </p>

                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-slate-400 text-[16px]">link</span>
                          {selectedPostulation.clinicData.clinicWebsite ? (
                            <a
                              href={selectedPostulation.clinicData.clinicWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-slate-800 hover:text-black font-semibold"
                            >
                              {selectedPostulation.clinicData.clinicWebsite}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No provisto</span>
                          )}
                        </p>

                        <div className="pt-2 mt-1 border-t border-slate-100">
                          <span className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5 font-jakarta">Descripción</span>
                          <p className="text-slate-700 leading-relaxed font-medium">
                            {selectedPostulation.clinicData.clinicDescription || selectedPostulation.clinicData.description ? (
                              selectedPostulation.clinicData.clinicDescription || selectedPostulation.clinicData.description
                            ) : (
                              <span className="text-slate-400 italic font-jakarta">No provisto</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic font-jakarta">
                    No se agregó ningún espacio profesional.
                  </p>
                )}
              </div>

              {/* Section 4: Courses */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-1.5 border-b border-slate-100 font-jakarta">
                  4. Cursos
                </h3>
                {selectedPostulation.courses && Array.isArray(selectedPostulation.courses) && selectedPostulation.courses.length > 0 ? (
                  <div className="flex flex-col gap-2 max-w-xl font-jakarta">
                    {selectedPostulation.courses.map((course: any, idx: number) => {
                      const isExpanded = expandedCourseIdx === idx;
                      return (
                        <div key={idx} className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => setExpandedCourseIdx(isExpanded ? null : idx)}
                            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
                          >
                            <div>
                              <p className="font-bold text-sm text-slate-800">{course.name || `Curso ${idx + 1}`}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{course.institution || <span className="text-slate-400 italic">No provisto</span>}</p>
                            </div>
                            <span className="material-symbols-rounded text-slate-400 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              expand_more
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-600 bg-slate-50/30">
                              <div>
                                <span className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Descripción del curso</span>
                                <p className="text-slate-700 leading-relaxed font-medium">{course.description || <span className="text-slate-400 italic">No provisto</span>}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Instructor</span>
                                  <span className="text-slate-700 font-medium">{course.instructor || <span className="text-slate-400 italic">No provisto</span>}</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Categoría</span>
                                  <span className="text-slate-700 font-medium">{course.type || course.category || <span className="text-slate-400 italic">No provisto</span>}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Formato</span>
                                  <span className="text-slate-700 font-medium">{course.modality || course.format || <span className="text-slate-400 italic">No provisto</span>}</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-[10px] uppercase text-slate-400 mb-0.5">Información adicional enviada</span>
                                  <span className="text-slate-700 font-medium">{course.additionalInfo || <span className="text-slate-400 italic">No provisto</span>}</span>
                                </div>
                              </div>
                              {course.url && (
                                <div className="mt-2.5">
                                  <a
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-black hover:bg-zinc-900 text-white text-xs font-bold transition cursor-pointer"
                                  >
                                    Ver curso
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic font-jakarta">
                    No se agregaron cursos.
                  </p>
                )}
              </div>
            </div>
          </AdminCard>
        ) : (
          <AdminCard className="flex items-center justify-center p-8 text-center text-slate-400 h-full min-w-0 overflow-hidden">
            <p className="text-sm font-medium">Selecciona una aplicación de la lista para ver los detalles.</p>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
