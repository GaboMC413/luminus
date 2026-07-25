"use client";

import { useState } from "react";
import { AdminCategory, AdminSuggestion } from "../../types";
import { formatDate } from "../../utils";

interface CategoriesTabProps {
  categories: AdminCategory[];
  suggestions: AdminSuggestion[];
  setCategories: React.Dispatch<React.SetStateAction<AdminCategory[]>>;
  setSuggestions: React.Dispatch<React.SetStateAction<AdminSuggestion[]>>;
  fetchCategoriesData: () => Promise<void>;
}

export function CategoriesTab({
  categories,
  suggestions,
  setCategories,
  setSuggestions,
  fetchCategoriesData,
}: CategoriesTabProps) {
  const [categorySubTab, setCategorySubTab] = useState<"lista" | "sugerencias">("lista");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [isEditingAreas, setIsEditingAreas] = useState(false);
  const [editingInterestId, setEditingInterestId] = useState<string | null>(null);
  const [editingInterestValue, setEditingInterestValue] = useState("");
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editingAreaValue, setEditingAreaValue] = useState("");
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    category: Partial<AdminCategory> | null;
  }>({ isOpen: false, category: null });
  const [suggestionModal, setSuggestionModal] = useState<{
    isOpen: boolean;
    suggestion: AdminSuggestion | null;
    selectedCatId: string;
    targetType: "USER_INTEREST" | "SPECIALIST_AREA";
  }>({ isOpen: false, suggestion: null, selectedCatId: "", targetType: "USER_INTEREST" });
  const [newInterestText, setNewInterestText] = useState<{ [key: string]: string }>({});
  const [newAreaText, setNewAreaText] = useState<{ [key: string]: string }>({});

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null;

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryModal.category?.name?.trim()) return;

    try {
      const url = "/api/admin/categories";
      const method = categoryModal.category.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryModal.category),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al guardar categoría.");
        return;
      }

      setCategoryModal({ isOpen: false, category: null });
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("¿Seguro que deseas eliminar esta categoría y todos sus elementos vinculados?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al eliminar categoría.");
        return;
      }
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleAddInterest(categoryId: string) {
    const text = newInterestText[categoryId]?.trim();
    if (!text) return;

    try {
      const res = await fetch("/api/admin/categories/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al agregar interés.");
        return;
      }
      setNewInterestText({ ...newInterestText, [categoryId]: "" });
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleSaveInterestName(id: string, name: string) {
    if (!name.trim()) return;
    try {
      await fetch("/api/admin/categories/interests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: name.trim() }),
      });
      setEditingInterestId(null);
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleDeleteInterest(id: string) {
    if (!confirm("¿Eliminar este interés de usuario?")) return;
    try {
      await fetch(`/api/admin/categories/interests?id=${id}`, { method: "DELETE" });
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleAddSpecialistArea(categoryId: string) {
    const text = newAreaText[categoryId]?.trim();
    if (!text) return;

    try {
      const res = await fetch("/api/admin/categories/specialist-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al agregar área.");
        return;
      }
      setNewAreaText({ ...newAreaText, [categoryId]: "" });
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleSaveSpecialistAreaName(id: string, name: string) {
    if (!name.trim()) return;
    try {
      await fetch("/api/admin/categories/specialist-areas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: name.trim() }),
      });
      setEditingAreaId(null);
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleDeleteSpecialistArea(id: string) {
    if (!confirm("¿Eliminar esta área de especialista?")) return;
    try {
      await fetch(`/api/admin/categories/specialist-areas?id=${id}`, { method: "DELETE" });
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleProcessSuggestion(id: string, action: "approve" | "reject") {
    if (action === "approve") {
      const sugg = suggestions.find((s) => s.id === id);
      if (!sugg) return;
      setSuggestionModal({
        isOpen: true,
        suggestion: sugg,
        selectedCatId: categories[0]?.id || "",
        targetType: sugg.type === "SPECIALIST_AREA" ? "SPECIALIST_AREA" : "USER_INTEREST",
      });
      return;
    }

    if (!confirm("¿Rechazar esta sugerencia?")) return;
    try {
      const res = await fetch("/api/admin/categories/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al rechazar.");
        return;
      }
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  async function handleConfirmApproveSuggestion() {
    if (!suggestionModal.suggestion || !suggestionModal.selectedCatId) return;
    try {
      const res = await fetch("/api/admin/categories/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: suggestionModal.suggestion.id,
          action: "approve",
          categoryId: suggestionModal.selectedCatId,
          targetType: suggestionModal.targetType,
          customName: suggestionModal.suggestion.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error al aprobar.");
        return;
      }
      setSuggestionModal({
        isOpen: false,
        suggestion: null,
        selectedCatId: "",
        targetType: "USER_INTEREST",
      });
      await fetchCategoriesData();
    } catch {
      alert("Error de conexión.");
    }
  }

  return (
    <div className="mx-auto flex max-w-[1350px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight font-jakarta">Categorías</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {categorySubTab === "lista"
              ? `${categories.length} ${
                  categories.length === 1 ? "categoría registrada" : "categorías registradas"
                }`
              : `${suggestions.length} ${
                  suggestions.length === 1 ? "sugerencia registrada" : "sugerencias registradas"
                }`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCategorySubTab("lista")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none ${
                categorySubTab === "lista"
                  ? "bg-white text-slate-950 font-bold shadow-none"
                  : "bg-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Categorías Generales ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setCategorySubTab("sugerencias")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none outline-none flex items-center gap-1.5 ${
                categorySubTab === "sugerencias"
                  ? "bg-white text-slate-950 font-bold shadow-none"
                  : "bg-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Sugerencias ("Otros")
              {suggestions.filter((s) => s.status === "pending").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                  {suggestions.filter((s) => s.status === "pending").length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setCategoryModal({
                isOpen: true,
                category: {
                  name: "",
                  icon: "label",
                  iconFilled: true,
                  color: "#3B82F6",
                  bgColor: "#DBEAFE",
                },
              })
            }
            className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none h-10"
          >
            <span className="material-symbols-rounded text-[18px]">add</span>
            Nueva Categoría
          </button>
        </div>
      </header>

      {categorySubTab === "lista" ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="grid grid-cols-[1.4fr_2fr_2fr_130px] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
            <span>Categoría</span>
            <span>Intereses de Usuario</span>
            <span>Áreas de Especialista</span>
            <span className="text-right">Acciones</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <span className="material-symbols-rounded text-[48px] mb-3 text-slate-300">category</span>
                <p className="text-sm font-medium">No hay categorías registradas.</p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="grid w-full grid-cols-[1.4fr_2fr_2fr_130px] items-center px-4 py-3.5 text-left text-[14px] transition hover:bg-slate-50 bg-white cursor-pointer"
                >
                  {/* Category info */}
                  <div className="flex items-center gap-3 pr-2 min-w-0">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center border shrink-0"
                      style={{
                        backgroundColor: category.bgColor || "#F1F5F9",
                        color: category.color || "#0F172A",
                        borderColor: `${category.color}40`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={category.iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {category.icon || "label"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-900 truncate leading-snug">
                        {category.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 block truncate">
                        {category.slug}
                      </span>
                    </div>
                  </div>

                  {/* User Interests summary */}
                  <div className="flex flex-wrap items-center gap-1.5 pr-2 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px] shrink-0">
                      {category.interests?.length || 0}
                    </span>
                    {(category.interests || []).slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border truncate max-w-[120px] ${
                          item.isActive
                            ? "bg-slate-50 border-slate-200 text-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-400 line-through"
                        }`}
                      >
                        {item.name}
                      </span>
                    ))}
                    {(category.interests?.length || 0) > 3 && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        +{category.interests.length - 3} más
                      </span>
                    )}
                  </div>

                  {/* Specialist Areas summary */}
                  <div className="flex flex-wrap items-center gap-1.5 pr-2 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px] shrink-0">
                      {category.specialistAreas?.length || 0}
                    </span>
                    {(category.specialistAreas || []).slice(0, 3).map((area) => (
                      <span
                        key={area.id}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700 truncate max-w-[120px]"
                      >
                        {area.name}
                      </span>
                    ))}
                    {(category.specialistAreas?.length || 0) > 3 && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        +{category.specialistAreas.length - 3} más
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer transition-colors"
                    >
                      Gestionar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-8 px-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                      title="Eliminar categoría"
                    >
                      <span className="material-symbols-rounded text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Subtab: Sugerencias "Otros" Moderation Queue */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Bandeja de Sugerencias de Usuarios y Especialistas
            </h3>
            <span className="text-xs text-slate-500">
              Entradas en "Otro" / "Otros" que requieren aprobación del administrador.
            </span>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No hay sugerencias registradas por los usuarios.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {suggestions.map((sugg) => (
                <div
                  key={sugg.id}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">"{sugg.name}"</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sugg.type === "SPECIALIST_AREA"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {sugg.type === "SPECIALIST_AREA" ? "Área Especialista" : "Interés Usuario"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sugg.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : sugg.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {sugg.status === "pending"
                          ? "Pendiente"
                          : sugg.status === "approved"
                          ? `Aprobado (${sugg.categoryName || ""})`
                          : "Rechazado"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Sugerido por:{" "}
                      <span className="font-medium text-slate-700">
                        {sugg.user?.fullName || sugg.user?.email || "Usuario"}
                      </span>{" "}
                      • {formatDate(sugg.createdAt)}
                    </div>
                  </div>

                  {sugg.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleProcessSuggestion(sugg.id, "reject")}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer border-none"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProcessSuggestion(sugg.id, "approve")}
                        className="px-4 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold cursor-pointer border-none"
                      >
                        Aprobar e Incorporar...
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage Category Modal (Items & Areas editing) */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: selectedCategory.bgColor || "#F1F5F9",
                    color: selectedCategory.color || "#0F172A",
                    borderColor: `${selectedCategory.color}40`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={selectedCategory.iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {selectedCategory.icon || "label"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedCategory.name}</h3>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({ isOpen: true, category: selectedCategory })}
                      className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                      title="Editar ajustes de categoría"
                    >
                      <span className="material-symbols-rounded text-[15px]">edit</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {selectedCategory.slug}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: selectedCategory.color }}
                        title={`Color: ${selectedCategory.color}`}
                      />
                      <span
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: selectedCategory.bgColor }}
                        title={`Fondo: ${selectedCategory.bgColor}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setIsEditingInterests(false);
                  setIsEditingAreas(false);
                  setEditingInterestId(null);
                  setEditingAreaId(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg border-none bg-transparent cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Section 1: User Interests */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Intereses de Usuario ({selectedCategory.interests?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingInterests(!isEditingInterests)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    isEditingInterests
                      ? "bg-black text-white border-black"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                  title="Editar sección de intereses"
                >
                  <span className="material-symbols-rounded text-[18px]">edit</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(selectedCategory.interests || []).map((item) => (
                  <div
                    key={item.id}
                    className="h-8 px-3 rounded-full border border-slate-200 bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    {editingInterestId === item.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingInterestValue}
                        onChange={(e) => setEditingInterestValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveInterestName(item.id, editingInterestValue);
                          if (e.key === "Escape") setEditingInterestId(null);
                        }}
                        onBlur={() => handleSaveInterestName(item.id, editingInterestValue)}
                        className="h-6 w-28 px-1.5 border border-slate-900 rounded bg-white text-slate-900 font-sans text-xs focus:outline-none"
                      />
                    ) : (
                      <>
                        <span>{item.name}</span>
                        {isEditingInterests && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingInterestId(item.id);
                                setEditingInterestValue(item.name);
                              }}
                              className="p-0.5 opacity-40 hover:opacity-100 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center"
                              title="Editar nombre"
                            >
                              <svg
                                className="w-2.5 h-2.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInterest(item.id)}
                              className="p-0.5 opacity-40 hover:opacity-100 hover:text-rose-600 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center text-[11px]"
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {isEditingInterests && (
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    value={newInterestText[selectedCategory.id] || ""}
                    onChange={(e) =>
                      setNewInterestText({ ...newInterestText, [selectedCategory.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddInterest(selectedCategory.id);
                      }
                    }}
                    placeholder="Agregar nuevo interés de usuario..."
                    className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-black bg-slate-50 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInterest(selectedCategory.id)}
                    className="h-9 px-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer border-none transition-colors shrink-0"
                  >
                    + Agregar
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Specialist Areas */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Áreas de Especialista ({selectedCategory.specialistAreas?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingAreas(!isEditingAreas)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    isEditingAreas
                      ? "bg-black text-white border-black"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                  title="Editar sección de áreas"
                >
                  <span className="material-symbols-rounded text-[18px]">edit</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(selectedCategory.specialistAreas || []).map((area) => (
                  <div
                    key={area.id}
                    className="h-8 px-3 rounded-full border border-slate-200 bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    {editingAreaId === area.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingAreaValue}
                        onChange={(e) => setEditingAreaValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveSpecialistAreaName(area.id, editingAreaValue);
                          if (e.key === "Escape") setEditingAreaId(null);
                        }}
                        onBlur={() => handleSaveSpecialistAreaName(area.id, editingAreaValue)}
                        className="h-6 w-28 px-1.5 border border-slate-900 rounded bg-white text-slate-900 font-sans text-xs focus:outline-none"
                      />
                    ) : (
                      <>
                        <span>{area.name}</span>
                        {isEditingAreas && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAreaId(area.id);
                                setEditingAreaValue(area.name);
                              }}
                              className="p-0.5 opacity-40 hover:opacity-100 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center"
                              title="Editar nombre"
                            >
                              <svg
                                className="w-2.5 h-2.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSpecialistArea(area.id)}
                              className="p-0.5 opacity-40 hover:opacity-100 hover:text-rose-600 cursor-pointer border-none bg-transparent text-slate-700 flex items-center justify-center text-[11px]"
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {isEditingAreas && (
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    value={newAreaText[selectedCategory.id] || ""}
                    onChange={(e) => setNewAreaText({ ...newAreaText, [selectedCategory.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpecialistArea(selectedCategory.id);
                      }
                    }}
                    placeholder="Agregar nueva área de especialista..."
                    className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-black bg-slate-50 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSpecialistArea(selectedCategory.id)}
                    className="h-9 px-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer border-none transition-colors shrink-0"
                  >
                    + Agregar
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer border-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal (Create / Edit) */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {categoryModal.category?.id ? "Editar Categoría" : "Nueva Categoría General"}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModal({ isOpen: false, category: null })}
                className="text-slate-400 hover:text-slate-600 text-lg border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={categoryModal.category?.name || ""}
                  onChange={(e) =>
                    setCategoryModal({
                      ...categoryModal,
                      category: { ...categoryModal.category, name: e.target.value },
                    })
                  }
                  placeholder="Ej: Crecimiento Personal"
                  className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ícono Material Symbol
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={categoryModal.category?.icon || "label"}
                    onChange={(e) =>
                      setCategoryModal({
                        ...categoryModal,
                        category: { ...categoryModal.category, icon: e.target.value },
                      })
                    }
                    placeholder="Ej: sunny, mood, spa"
                    className="flex-1 min-w-0 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black font-mono"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={categoryModal.category?.iconFilled ?? true}
                      onChange={(e) =>
                        setCategoryModal({
                          ...categoryModal,
                          category: { ...categoryModal.category, iconFilled: e.target.checked },
                        })
                      }
                      className="rounded text-black focus:ring-black"
                    />
                    Relleno (Filled)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                    Color Principal
                  </label>
                  <div className="flex items-center gap-2 min-w-0">
                    <label
                      className="relative h-10 w-10 rounded-xl border border-slate-200/80 cursor-pointer overflow-hidden shrink-0 transition-transform active:scale-95 shadow-none"
                      style={{ backgroundColor: categoryModal.category?.color || "#3B82F6" }}
                      title="Seleccionar color principal"
                    >
                      <input
                        type="color"
                        value={categoryModal.category?.color || "#3B82F6"}
                        onChange={(e) =>
                          setCategoryModal({
                            ...categoryModal,
                            category: { ...categoryModal.category, color: e.target.value },
                          })
                        }
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={categoryModal.category?.color || "#3B82F6"}
                      onChange={(e) =>
                        setCategoryModal({
                          ...categoryModal,
                          category: { ...categoryModal.category, color: e.target.value },
                        })
                      }
                      className="flex-1 min-w-0 h-10 px-2 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                    Color Fondo
                  </label>
                  <div className="flex items-center gap-2 min-w-0">
                    <label
                      className="relative h-10 w-10 rounded-xl border border-slate-200/80 cursor-pointer overflow-hidden shrink-0 transition-transform active:scale-95 shadow-none"
                      style={{ backgroundColor: categoryModal.category?.bgColor || "#DBEAFE" }}
                      title="Seleccionar color de fondo"
                    >
                      <input
                        type="color"
                        value={categoryModal.category?.bgColor || "#DBEAFE"}
                        onChange={(e) =>
                          setCategoryModal({
                            ...categoryModal,
                            category: { ...categoryModal.category, bgColor: e.target.value },
                          })
                        }
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={categoryModal.category?.bgColor || "#DBEAFE"}
                      onChange={(e) =>
                        setCategoryModal({
                          ...categoryModal,
                          category: { ...categoryModal.category, bgColor: e.target.value },
                        })
                      }
                      className="flex-1 min-w-0 h-10 px-2 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, category: null })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer border-none"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suggestion Approval Modal */}
      {suggestionModal.isOpen && suggestionModal.suggestion && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Aprobar e Incorporar Sugerencia</h3>
              <button
                type="button"
                onClick={() =>
                  setSuggestionModal({
                    isOpen: false,
                    suggestion: null,
                    selectedCatId: "",
                    targetType: "USER_INTEREST",
                  })
                }
                className="text-slate-400 hover:text-slate-600 text-lg border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Texto Sugerido:
                </span>
                <span className="font-bold text-slate-900 text-base">"{suggestionModal.suggestion.name}"</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tipo de Destino *
                </label>
                <select
                  value={suggestionModal.targetType}
                  onChange={(e) =>
                    setSuggestionModal({ ...suggestionModal, targetType: e.target.value as any })
                  }
                  className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white"
                >
                  <option value="USER_INTEREST">Interés de Usuario</option>
                  <option value="SPECIALIST_AREA">Área de Especialista</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Categoría Destino *
                </label>
                <select
                  value={suggestionModal.selectedCatId}
                  onChange={(e) =>
                    setSuggestionModal({ ...suggestionModal, selectedCatId: e.target.value })
                  }
                  className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setSuggestionModal({
                      isOpen: false,
                      suggestion: null,
                      selectedCatId: "",
                      targetType: "USER_INTEREST",
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproveSuggestion}
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer border-none"
                >
                  Aprobar e Incorporar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
