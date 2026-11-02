"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, Check, Hash, X } from "lucide-react";
import { PostItem } from "./mockPostsData";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { INTEREST_CATEGORIES, ADMIN_COMMUNITY_CATEGORIES } from "@/utils/constants";
import { uploadPostImage, validatePostImageFile } from "@/lib/uploadPostImage";
import { ComposerToolbar } from "./molecules/ComposerToolbar";
import { MediaAttachmentStrip } from "./molecules/MediaAttachmentStrip";

interface CreatePostCardProps {
  currentUserProfile?: any;
  onAddPost: (newPost: PostItem) => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function htmlToMarkdown(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html;
  const temp = document.createElement("div");
  temp.innerHTML = html;

  function traverse(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    let inner = "";
    el.childNodes.forEach((child) => {
      inner += traverse(child);
    });

    switch (tag) {
      case "b":
      case "strong":
        return inner.trim() ? `**${inner.trim()}**` : "";
      case "i":
      case "em":
        return inner.trim() ? `*${inner.trim()}*` : "";
      case "u":
        return inner.trim() ? `<u>${inner.trim()}</u>` : "";
      case "a": {
        const href = el.getAttribute("href") || "";
        return href ? `[${inner || href}](${href})` : inner;
      }
      case "li": {
        const parentTag = el.parentElement?.tagName.toLowerCase();
        if (parentTag === "ol") {
          const index = Array.from(el.parentElement?.children || []).indexOf(el) + 1;
          return `${index}. ${inner.trim()}\n`;
        }
        return `• ${inner.trim()}\n`;
      }
      case "ul":
      case "ol":
        return `${inner}\n`;
      case "p":
      case "div":
        return inner ? `${inner}\n` : "\n";
      case "br":
        return "\n";
      default:
        return inner;
    }
  }

  return traverse(temp).replace(/\n{3,}/g, "\n\n").trim();
}

export function CreatePostCard({ currentUserProfile, onAddPost }: CreatePostCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [showTagPills, setShowTagPills] = useState(false);

  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tempYoutubeUrl, setTempYoutubeUrl] = useState("");
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAdminCategoryOpen, setIsAdminCategoryOpen] = useState(false);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const adminCategoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (adminCategoryDropdownRef.current && !adminCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsAdminCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const imgs = editorRef.current.querySelectorAll("img, picture, svg, video, audio, object, embed");
    if (imgs.length > 0) {
      imgs.forEach((el) => el.remove());
    }
    const innerText = editorRef.current.innerText || "";
    const cleanText = innerText.replace(/\u200B/g, "").trim();
    setPostText(cleanText ? editorRef.current.innerHTML : "");
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith("image/")) {
          e.preventDefault();
          return;
        }
      }
    }

    const items = e.clipboardData?.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          return;
        }
      }
    }

    const html = e.clipboardData?.getData("text/html");
    if (html) {
      e.preventDefault();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      doc.querySelectorAll("img, picture, svg, video, audio, object, embed").forEach((el) => el.remove());
      doc.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("style");
        el.removeAttribute("class");
        el.removeAttribute("color");
        el.removeAttribute("bgcolor");
      });
      document.execCommand("insertHTML", false, doc.body.innerHTML);
      handleEditorInput();
      return;
    }

    const text = e.clipboardData?.getData("text/plain");
    if (text) {
      e.preventDefault();
      document.execCommand("insertText", false, text);
      handleEditorInput();
    }
  };

  const formatDoc = (cmd: string, val: string = "") => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    handleEditorInput();
  };

  const handleOpenLinkModal = () => {
    if (typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
        setSavedRange(sel.getRangeAt(0).cloneRange());
        setLinkText(sel.toString().trim());
      } else {
        setSavedRange(null);
        setLinkText("");
      }
    }
    setLinkUrl("");
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = linkUrl.trim();
    if (!finalUrl) return;

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const displayText = linkText.trim() || finalUrl;

    if (editorRef.current) {
      editorRef.current.focus();
      if (typeof window !== "undefined") {
        const sel = window.getSelection();
        if (savedRange && sel) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        }
      }
      const anchorHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
      document.execCommand("insertHTML", false, anchorHtml);
      handleEditorInput();
    }

    setIsLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
    setSavedRange(null);
  };

  const userName = currentUserProfile
    ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() || "Usuario"
    : "Usuario";

  const userAvatar = currentUserProfile?.profile_picture_url;

  const isAdmin = Boolean(
    currentUserProfile?.role === "ADMIN" ||
    currentUserProfile?.role === "admin" ||
    (typeof window !== "undefined" && localStorage.getItem("luminus_user_role") === "ADMIN")
  );

  const activeCategoryObj = [...INTEREST_CATEGORIES, ...ADMIN_COMMUNITY_CATEGORIES].find(
    (cat) => cat.title === selectedCategory
  );

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setUploadedImageUrl(null);
    setIsUploadingImage(false);
    setImageError(null);
  };

  const handleImageFileChange = async (file: File) => {
    setImageError(null);

    const validation = validatePostImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "Archivo no permitido.");
      return;
    }

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadedImageUrl(null);
    setYoutubeId(null);
    setYoutubeUrl("");

    setIsUploadingImage(true);
    setUploadProgress(10);
    try {
      const result = await uploadPostImage(
        file,
        undefined,
        (percent) => setUploadProgress(percent)
      );
      setUploadedImageUrl(result.publicUrl);
    } catch (err: any) {
      console.error("Error uploading post image:", err);
      setImageError(err?.message || "Error al procesar o subir la imagen.");
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleOpenYoutubeModal = () => {
    setTempYoutubeUrl(youtubeUrl);
    setIsYoutubeModalOpen(true);
  };

  const handleSaveYoutubeVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(tempYoutubeUrl.trim());
    if (id) {
      setYoutubeId(id);
      setYoutubeUrl(tempYoutubeUrl.trim());
      setUploadedImageUrl(null);
      setImagePreview(null);
    }
    setIsYoutubeModalOpen(false);
  };

  const handleToggleArea = (item: string) => {
    setSelectedAreas((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage) return;
    if (!isAdmin && !selectedCategory) return;
    if (imagePreview && !uploadedImageUrl) {
      setImageError("Por favor espera a que la imagen termine de subirse o vuelve a seleccionarla.");
      return;
    }

    const rawHtml = editorRef.current ? editorRef.current.innerHTML : postText;
    const markdownContent = htmlToMarkdown(rawHtml);
    const trimmed = markdownContent.trim();
    const trimmedTitle = postTitle.trim();
    const finalImageUrl = uploadedImageUrl || undefined;
    if (!trimmed && !trimmedTitle && !finalImageUrl && !youtubeId) return;

    const allAreas: string[] = [];
    if (selectedAdminCategory) allAreas.push(selectedAdminCategory);
    if (selectedCategory) allAreas.push(selectedCategory);
    for (const area of selectedAreas) {
      if (!allAreas.includes(area)) {
        allAreas.push(area);
      }
    }

    let userLocation: string | undefined = undefined;
    const userCity = currentUserProfile?.city?.trim();
    const userCountry = currentUserProfile?.country?.trim();
    if (userCity && userCountry) {
      userLocation = `${userCity}, ${userCountry}`;
    } else if (userCity || userCountry) {
      userLocation = userCity || userCountry;
    }

    const mainCategory = selectedAdminCategory || selectedCategory || undefined;

    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      authorId: currentUserProfile?.id || currentUserProfile?.user_id || "current-user",
      title: trimmedTitle || undefined,
      authorName: userName,
      authorAvatar: userAvatar,
      authorRole: "Miembro",
      authorLocation: userLocation,
      date: "Hoy",
      imageUrl: finalImageUrl,
      youtubeId: youtubeId || undefined,
      youtubeUrl: youtubeUrl || undefined,
      area: mainCategory,
      areas: allAreas,
      content: trimmed,
      likesCount: 0,
      isLiked: false,
      comments: [],
    };

    onAddPost(newPost);
    clearStateAndClose();
  };

  const clearStateAndClose = () => {
    setPostTitle("");
    setPostText("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setUploadedImageUrl(null);
    setIsUploadingImage(false);
    setImageError(null);
    setYoutubeId(null);
    setYoutubeUrl("");
    setSelectedAdminCategory(null);
    setIsAdminCategoryOpen(false);
    setSelectedCategory(null);
    setSelectedAreas([]);
    setShowTagPills(false);
    setIsCategoryOpen(false);
    setIsModalOpen(false);
  };

  const handleResetAndCloseModal = () => {
    handleRemoveImage();
    clearStateAndClose();
  };

  return (
    <>
      {/* 1. Trigger Card / Input Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 text-left transition-all duration-150 active:scale-[0.99] cursor-pointer flex items-center justify-between group outline-none select-none"
        title="Crear una publicación"
      >
        <span className="text-sm font-normal text-slate-500 font-sans">
          Crear una publicación
        </span>
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0" strokeWidth={2} />
      </button>

      {/* 2. Main Composer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleResetAndCloseModal}
        title="Crear publicación"
        subtitle="Comparte tus reflexiones o preguntas con la comunidad"
        maxWidth="580px"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={handleResetAndCloseModal}
              className="w-full sm:w-auto sm:min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSubmit}
              disabled={
                isUploadingImage ||
                Boolean(imagePreview && !uploadedImageUrl) ||
                (!isAdmin && !selectedCategory) ||
                (!postText.trim() && !postTitle.trim() && !imagePreview && !youtubeId)
              }
              title={!isAdmin && !selectedCategory ? "Selecciona una categoría para publicar" : undefined}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Publicar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {/* Post Title Field (Unified h-11 rounded-xl standard) */}
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Título de la publicación"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm font-sans text-slate-900 placeholder:text-slate-400 transition-colors bg-white"
          />

          {/* Category Selectors */}
          {isAdmin ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Institutional Category */}
              <div ref={adminCategoryDropdownRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminCategoryOpen(!isAdminCategoryOpen);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 flex items-center justify-between text-sm font-sans text-left transition-colors cursor-pointer outline-none"
                >
                  <span className={`truncate ${selectedAdminCategory ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                    {selectedAdminCategory || "Categoría institucional"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${isAdminCategoryOpen ? "rotate-180" : ""}`} />
                </button>

                {isAdminCategoryOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[240px] overflow-y-auto shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminCategory(null);
                        setIsAdminCategoryOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-sans flex items-center justify-between hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer ${
                        selectedAdminCategory === null ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-500"
                      }`}
                    >
                      <span>Sin categoría institucional</span>
                      {selectedAdminCategory === null && <Check className="w-3.5 h-3.5 text-slate-700" />}
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    {ADMIN_COMMUNITY_CATEGORIES.map((cat) => {
                      const isSelected = selectedAdminCategory === cat.title;
                      return (
                        <button
                          key={cat.title}
                          type="button"
                          onClick={() => {
                            setSelectedAdminCategory(cat.title);
                            setIsAdminCategoryOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-sans flex items-center justify-between hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer ${
                            isSelected ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-600"
                          }`}
                        >
                          <span>{cat.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Topic Category */}
              <div ref={categoryDropdownRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsAdminCategoryOpen(false);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 flex items-center justify-between text-sm font-sans text-left transition-colors cursor-pointer outline-none"
                >
                  <span className={`truncate ${selectedCategory ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                    {selectedCategory || "Temática"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${isCategoryOpen ? "rotate-180" : ""}`} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[240px] overflow-y-auto shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedAreas([]);
                        setShowTagPills(false);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-sans flex items-center justify-between hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer ${
                        selectedCategory === null ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-500"
                      }`}
                    >
                      <span>Sin temática</span>
                      {selectedCategory === null && <Check className="w-3.5 h-3.5 text-slate-700" />}
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    {INTEREST_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.title;
                      return (
                        <button
                          key={cat.title}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.title);
                            setSelectedAreas([]);
                            setShowTagPills(true);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-sans flex items-center justify-between hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer ${
                            isSelected ? "font-semibold text-emerald-700 bg-emerald-50/50" : "text-slate-600"
                          }`}
                        >
                          <span>{cat.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Single Category Selector for Regular Members */
            <div ref={categoryDropdownRef} className="relative w-full">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 flex items-center justify-between text-sm font-sans text-left transition-colors cursor-pointer outline-none"
              >
                <span className={`truncate ${selectedCategory ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                  {selectedCategory || "Seleccionar temática"}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[240px] overflow-y-auto shadow-lg">
                  {INTEREST_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.title;
                    return (
                      <button
                        key={cat.title}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.title);
                          setSelectedAreas([]);
                          setShowTagPills(true);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-sans flex items-center justify-between hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer ${
                          isSelected ? "font-semibold text-emerald-700 bg-emerald-50/50" : "text-slate-600"
                        }`}
                      >
                        <span>{cat.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Main Writing Container */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col focus-within:border-slate-400 transition-colors">
            {/* 1. Molecule: Format Toolbar */}
            <ComposerToolbar onFormat={formatDoc} onInsertLink={handleOpenLinkModal} />

            {/* 2. ContentEditable Editor Area */}
            <div className="p-3.5 relative min-h-[140px] max-h-[260px] overflow-y-auto">
              {(!postText || postText.trim() === "") && (
                <div
                  onClick={() => editorRef.current?.focus()}
                  className="absolute top-3.5 left-3.5 text-sm font-sans text-slate-400 pointer-events-none select-none"
                >
                  Cuéntanos qué quieres compartir
                </div>
              )}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onPaste={handleEditorPaste}
                onDrop={(e) => {
                  if (e.dataTransfer?.files?.length || e.dataTransfer?.types?.includes("Files")) {
                    e.preventDefault();
                  }
                }}
                className="w-full min-h-[120px] text-sm font-sans text-slate-800 outline-none p-0 bg-transparent leading-relaxed cursor-text [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_a]:text-slate-900 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2"
              />
            </div>

            {/* 3. Bottom Tags Toggle Strip */}
            <div className="px-3.5 py-2.5 border-t border-slate-100 flex flex-col gap-2 bg-white">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedCategory) {
                      setIsCategoryOpen(true);
                    } else {
                      setShowTagPills((prev) => !prev);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors border-none bg-transparent cursor-pointer p-0 select-none font-jakarta"
                >
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>Agregar etiquetas</span>
                  {selectedCategory && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showTagPills ? "rotate-180" : ""}`} />
                  )}
                </button>
              </div>

              {selectedCategory && activeCategoryObj && showTagPills && (
                <div className="flex flex-wrap gap-1.5 pt-1 animate-in fade-in duration-150">
                  {activeCategoryObj.items.map((item) => {
                    const isSelected = selectedAreas.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleArea(item)}
                        className={`h-6 px-2.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none font-sans flex items-center gap-1 shrink-0 border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                        title={isSelected ? `Quitar #${item}` : `Agregar #${item}`}
                      >
                        <span>#{item}</span>
                        {isSelected && <X className="w-3 h-3 text-white/80" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Molecule: Media Attachment & Previews */}
          <MediaAttachmentStrip
            onImageSelected={handleImageFileChange}
            onOpenYoutubeModal={handleOpenYoutubeModal}
            imagePreview={imagePreview}
            uploadedImageUrl={uploadedImageUrl}
            isUploadingImage={isUploadingImage}
            uploadProgress={uploadProgress}
            imageError={imageError}
            onClearImageError={() => setImageError(null)}
            onRemoveImage={handleRemoveImage}
            youtubeId={youtubeId}
            onRemoveYoutube={() => {
              setYoutubeId(null);
              setYoutubeUrl("");
            }}
          />
        </div>
      </Modal>

      {/* Submodal: YouTube Video */}
      <Modal
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        title="Agregar video de YouTube"
        maxWidth="460px"
        headerClassName="px-5 py-4 border-b border-slate-100"
        contentClassName="p-5 flex flex-col gap-4"
        footerClassName="px-5 py-3.5 border-t border-slate-100 flex items-center gap-3 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsYoutubeModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleSaveYoutubeVideo}
              disabled={!extractYouTubeId(tempYoutubeUrl.trim())}
              className="flex-1"
            >
              Agregar video
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveYoutubeVideo} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 font-jakarta">
              Enlace del video
            </label>
            <input
              type="url"
              value={tempYoutubeUrl}
              onChange={(e) => setTempYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm font-sans text-slate-900 placeholder:text-slate-400 bg-white"
            />
          </div>

          {tempYoutubeUrl.trim() && !extractYouTubeId(tempYoutubeUrl.trim()) && (
            <p className="text-xs text-rose-600 font-sans">
              Por favor ingresa un enlace válido de YouTube.
            </p>
          )}
        </form>
      </Modal>

      {/* Submodal: Link */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setSavedRange(null);
        }}
        title="Agregar enlace"
        maxWidth="460px"
        headerClassName="px-5 py-4 border-b border-slate-100"
        contentClassName="p-5 flex flex-col gap-4"
        footerClassName="px-5 py-3.5 border-t border-slate-100 flex items-center gap-3 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => {
                setIsLinkModalOpen(false);
                setSavedRange(null);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleSaveLink}
              disabled={!linkUrl.trim()}
              className="flex-1"
            >
              Agregar enlace
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveLink} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 font-jakarta">
              Enlace
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm font-sans text-slate-900 placeholder:text-slate-400 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 font-jakarta">
              Texto visible
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Texto a mostrar (opcional)"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm font-sans text-slate-900 placeholder:text-slate-400 bg-white"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
