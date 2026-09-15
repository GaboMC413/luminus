"use client";

import React, { useState, useRef, useEffect } from "react";
import { PostItem } from "./mockPostsData";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { INTEREST_CATEGORIES, ADMIN_COMMUNITY_CATEGORIES } from "@/utils/constants";
import { uploadPostImage, validatePostImageFile } from "@/lib/uploadPostImage";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostItem;
  onSavePost: (updatedPost: PostItem) => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function markdownToHtml(md: string): string {
  if (!md) return "";
  let html = md;
  // Replace links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  // Bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  // Italic *text*
  html = html.replace(/\*([^*]+)\*/g, "<i>$1</i>");

  const lines = html.split("\n");
  let inUl = false;
  let inOl = false;
  const processedLines: string[] = [];

  for (const line of lines) {
    const ulMatch = line.match(/^[•\-\*]\s+(.*)$/);
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (ulMatch) {
      if (inOl) {
        processedLines.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        processedLines.push("<ul>");
        inUl = true;
      }
      processedLines.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (inUl) {
        processedLines.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        processedLines.push("<ol>");
        inOl = true;
      }
      processedLines.push(`<li>${olMatch[2]}</li>`);
    } else {
      if (inUl) {
        processedLines.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        processedLines.push("</ol>");
        inOl = false;
      }
      processedLines.push(line);
    }
  }
  if (inUl) processedLines.push("</ul>");
  if (inOl) processedLines.push("</ol>");

  return processedLines
    .join("<br>")
    .replace(/(<\/ul>|<\/ol>)<br>/g, "$1")
    .replace(/<br>(<ul>|<ol>)/g, "$1");
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

export function EditPostModal({ isOpen, onClose, post, onSavePost }: EditPostModalProps) {
  const [postTitle, setPostTitle] = useState(post.title || "");
  const [postText, setPostText] = useState(post.content || "");
  const [imagePreview, setImagePreview] = useState<string | null>(post.imageUrl || null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(post.imageUrl || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imageError, setImageError] = useState<string | null>(null);

  const [youtubeUrl, setYoutubeUrl] = useState(
    post.youtubeUrl || (post.youtubeId ? `https://www.youtube.com/watch?v=${post.youtubeId}` : "")
  );
  const [tempYoutubeUrl, setTempYoutubeUrl] = useState("");
  const [youtubeId, setYoutubeId] = useState<string | null>(post.youtubeId || null);

  const initialAdminCat = ADMIN_COMMUNITY_CATEGORIES.find(
    (c) => c.title === post.area || (post.areas || []).includes(c.title)
  )?.title || null;

  const initialThematicCat = INTEREST_CATEGORIES.find(
    (c) => c.title === post.area || (post.areas || []).includes(c.title)
  )?.title || null;

  const [selectedAdminCategory, setSelectedAdminCategory] = useState<string | null>(initialAdminCat);
  const [isAdminCategoryOpen, setIsAdminCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialThematicCat);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    (post.areas || []).filter((a) => a !== initialAdminCat && a !== initialThematicCat)
  );
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showTagPills, setShowTagPills] = useState(Boolean(post.areas && post.areas.length > 0));

  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const adminCategoryDropdownRef = useRef<HTMLDivElement>(null);

  // Sync state with post props when modal opens or post changes
  useEffect(() => {
    if (isOpen) {
      setPostTitle(post.title || "");
      setPostText(post.content || "");
      setImagePreview(post.imageUrl || null);
      setUploadedImageUrl(post.imageUrl || null);
      setYoutubeId(post.youtubeId || null);
      setYoutubeUrl(
        post.youtubeUrl || (post.youtubeId ? `https://www.youtube.com/watch?v=${post.youtubeId}` : "")
      );

      const adminCat = ADMIN_COMMUNITY_CATEGORIES.find(
        (c) => c.title === post.area || (post.areas || []).includes(c.title)
      )?.title || null;

      const thematicCat = INTEREST_CATEGORIES.find(
        (c) => c.title === post.area || (post.areas || []).includes(c.title)
      )?.title || null;

      setSelectedAdminCategory(adminCat);
      setSelectedCategory(thematicCat);
      setSelectedAreas(
        (post.areas || []).filter((a) => a !== adminCat && a !== thematicCat)
      );
      setShowTagPills(Boolean(post.areas && post.areas.length > 0));
      setImageError(null);

      // Populate rich text editor with converted HTML
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = markdownToHtml(post.content || "");
        }
      }, 0);
    }
  }, [isOpen, post]);

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
      const cleanHtml = doc.body.innerHTML;
      document.execCommand("insertHTML", false, cleanHtml);
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

  const isAdmin = Boolean(
    post.isAuthorAdmin ||
    (typeof window !== "undefined" && localStorage.getItem("luminus_user_role") === "ADMIN")
  );

  const activeCategoryObj = [...INTEREST_CATEGORIES, ...ADMIN_COMMUNITY_CATEGORIES].find((cat) => cat.title === selectedCategory);

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setUploadedImageUrl(null);
    setIsUploadingImage(false);
    setUploadProgressText("");
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    const validation = validatePostImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "Archivo no permitido.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
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
        (status: string) => setUploadProgressText(status),
        (percent: number) => setUploadProgress(percent)
      );
      setUploadedImageUrl(result.publicUrl);
    } catch (err: any) {
      console.error("Error uploading post image:", err);
      setImageError(err?.message || "Error al procesar o subir la imagen.");
    } finally {
      setIsUploadingImage(false);
      setUploadProgressText("");
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
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setIsYoutubeModalOpen(false);
  };

  const handleToggleArea = (item: string) => {
    setSelectedAreas((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage) return;
    if (!isAdmin && !selectedCategory) return;

    const rawHtml = editorRef.current ? editorRef.current.innerHTML : postText;
    const markdownContent = htmlToMarkdown(rawHtml);
    const trimmed = markdownContent.trim();
    const trimmedTitle = postTitle.trim();
    const finalImageUrl = uploadedImageUrl || imagePreview || undefined;
    if (!trimmed && !trimmedTitle && !finalImageUrl && !youtubeId) return;

    const allAreas: string[] = [];
    if (selectedAdminCategory) allAreas.push(selectedAdminCategory);
    if (selectedCategory) allAreas.push(selectedCategory);
    for (const area of selectedAreas) {
      if (!allAreas.includes(area)) {
        allAreas.push(area);
      }
    }

    const mainCategory = selectedAdminCategory || selectedCategory || undefined;

    const updatedPost: PostItem = {
      ...post,
      title: trimmedTitle || undefined,
      content: trimmed,
      area: mainCategory,
      areas: allAreas,
      imageUrl: finalImageUrl,
      youtubeId: youtubeId || undefined,
      youtubeUrl: youtubeUrl || undefined,
    };

    onSavePost(updatedPost);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar publicación"
        subtitle="Modifica los detalles de tu publicación."
        hideDividers
        disableInnerScroll
        maxWidth="620px"
        headerClassName="px-5 sm:px-6 pt-5 sm:pt-6 pb-2"
        contentClassName="px-5 sm:px-6 py-2"
        footerClassName="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex flex-col-reverse sm:flex-row items-stretch gap-2.5 sm:gap-3 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSave}
              disabled={
                isUploadingImage ||
                (!isAdmin && !selectedCategory) ||
                (!postText.trim() && !postTitle.trim() && !imagePreview && !youtubeId)
              }
              title={!isAdmin && !selectedCategory ? "Selecciona una categoría para publicar" : undefined}
              className="w-full sm:flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {/* 1. Título de la publicación */}
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Título de la publicación"
            className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-base font-normal font-sans text-slate-700 placeholder:text-slate-400 transition-colors bg-white"
          />

          {/* 2. Selectores de Categoría */}
          {isAdmin ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Selector Institucional */}
              <div ref={adminCategoryDropdownRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminCategoryOpen(!isAdminCategoryOpen);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-400 flex items-center justify-between text-base font-normal font-sans text-left transition-colors cursor-pointer outline-none"
                >
                  <span className={`text-sm sm:text-base font-normal font-sans truncate ${selectedAdminCategory ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                    {selectedAdminCategory || "Categoría institucional"}
                  </span>
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    className={`transition-transform duration-200 shrink-0 ${selectedAdminCategory ? "text-slate-600" : "text-slate-400"} ${isAdminCategoryOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M1.5 2L6 6.5L10.5 2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isAdminCategoryOpen && (
                  <div className="absolute top-[calc(100%+5px)] left-0 w-full bg-white rounded-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150 max-h-[260px] overflow-y-auto custom-scrollbar shadow-none">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminCategory(null);
                        setIsAdminCategoryOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm font-sans flex items-center justify-between hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer ${
                        selectedAdminCategory === null ? "font-medium text-slate-900 bg-slate-100/70" : "text-slate-500"
                      }`}
                    >
                      <span>Sin categoría institucional</span>
                      {selectedAdminCategory === null && (
                        <span className="material-symbols-outlined text-[18px] text-slate-700">check</span>
                      )}
                    </button>

                    <div className="border-t border-slate-100" />

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
                          className={`w-full px-4 py-2.5 text-left text-base font-normal font-sans flex items-center justify-between hover:bg-slate-50 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer ${
                            isSelected ? "font-medium text-slate-900 bg-slate-100" : "text-slate-600"
                          }`}
                        >
                          <span>{cat.title}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[18px] text-slate-800">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selector de Temática */}
              <div ref={categoryDropdownRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsAdminCategoryOpen(false);
                  }}
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-400 flex items-center justify-between text-base font-normal font-sans text-left transition-colors cursor-pointer outline-none"
                >
                  <span className={`text-sm sm:text-base font-normal font-sans truncate ${selectedCategory ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                    {selectedCategory || "Temática"}
                  </span>
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    className={`transition-transform duration-200 shrink-0 ${selectedCategory ? "text-slate-600" : "text-slate-400"} ${isCategoryOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M1.5 2L6 6.5L10.5 2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-[calc(100%+5px)] left-0 w-full bg-white rounded-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150 max-h-[260px] overflow-y-auto custom-scrollbar shadow-none">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedAreas([]);
                        setShowTagPills(false);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm font-sans flex items-center justify-between hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer ${
                        selectedCategory === null ? "font-medium text-slate-900 bg-slate-100/70" : "text-slate-500"
                      }`}
                    >
                      <span>Sin temática</span>
                      {selectedCategory === null && (
                        <span className="material-symbols-outlined text-[18px] text-slate-700">check</span>
                      )}
                    </button>

                    <div className="border-t border-slate-100" />

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
                          className={`w-full px-4 py-2.5 text-left text-base font-normal font-sans flex items-center justify-between hover:bg-slate-50 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer ${
                            isSelected ? "font-medium text-emerald-700 bg-emerald-50/50" : "text-slate-500"
                          }`}
                        >
                          <span>{cat.title}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Selector único para miembros no admin */
            <div ref={categoryDropdownRef} className="relative w-full">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-400 flex items-center justify-between text-base font-normal font-sans text-left transition-colors cursor-pointer outline-none"
              >
                <span className={`text-base font-normal font-sans ${selectedCategory ? "text-slate-700" : "text-slate-400"}`}>
                  {selectedCategory || "Seleccionar temática"}
                </span>
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  className={`transition-transform duration-200 shrink-0 ${selectedCategory ? "text-slate-600" : "text-slate-400"} ${isCategoryOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M1.5 2L6 6.5L10.5 2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isCategoryOpen && (
                <div className="absolute top-[calc(100%+5px)] left-0 w-full bg-white rounded-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150 max-h-[280px] overflow-y-auto custom-scrollbar shadow-none">
                  {INTEREST_CATEGORIES.map((cat, idx) => {
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
                        className={`w-full px-4 py-2.5 text-left text-base font-normal font-sans flex items-center justify-between hover:bg-slate-50 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer ${
                          idx === 0 ? "first:rounded-t-2xl" : ""
                        } ${isSelected ? "font-medium text-emerald-700 bg-emerald-50/50" : "text-slate-500"}`}
                      >
                        <span>{cat.title}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[18px] text-emerald-600">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Main Writing Card Container */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col focus-within:border-slate-400 transition-colors">
            {/* Top Bar: Formatting Tools */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 bg-white">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatDoc("bold");
                }}
                title="Negrita (Ctrl+B)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800 hover:text-black hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer font-bold text-base font-sans leading-none"
              >
                B
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatDoc("italic");
                }}
                title="Cursiva (Ctrl+I)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800 hover:text-black hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer italic font-serif font-bold text-base leading-none"
              >
                I
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatDoc("underline");
                }}
                title="Subrayado (Ctrl+U)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800 hover:text-black hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer underline font-medium text-base font-sans leading-none"
              >
                U
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatDoc("insertUnorderedList");
                }}
                title="Lista con viñetas"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800 hover:text-black hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="9" x2="21" y1="6" y2="6" />
                  <line x1="9" x2="21" y1="12" y2="12" />
                  <line x1="9" x2="21" y1="18" y2="18" />
                  <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatDoc("insertOrderedList");
                }}
                title="Lista numerada"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800 hover:text-black hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="10" x2="21" y1="6" y2="6" />
                  <line x1="10" x2="21" y1="12" y2="12" />
                  <line x1="10" x2="21" y1="18" y2="18" />
                  <path d="M4 6h1v4" strokeWidth="1.8" />
                  <path d="M4 10h2" strokeWidth="1.8" />
                  <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeWidth="1.8" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleOpenLinkModal();
                }}
                title="Insertar enlace"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800 hover:text-black hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
            </div>

            {/* Middle: ContentEditable editor with reliable placeholder overlay */}
            <div className="p-4 pr-2.5 relative min-h-[150px] max-h-[260px] sm:max-h-[300px] overflow-y-auto visible-scrollbar">
              {(!postText || postText.trim() === "") && (
                <div
                  onClick={() => editorRef.current?.focus()}
                  className="absolute top-4 left-4 text-base font-normal font-sans text-slate-400 pointer-events-none select-none"
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
                className="w-full min-h-[120px] text-base font-normal font-sans text-slate-700 outline-none p-0 bg-transparent leading-relaxed cursor-text [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_a]:text-slate-900 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2"
              />
            </div>

            {/* Bottom Bar inside Card: # Agregar etiquetas */}
            <div className="px-4 py-3 border-t border-slate-100 flex flex-col gap-2.5 bg-white">
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
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors border-none bg-transparent cursor-pointer p-0 select-none font-jakarta"
                >
                  <svg
                    className="w-4 h-4 text-slate-700 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" x2="20" y1="9" y2="9" />
                    <line x1="4" x2="20" y1="15" y2="15" />
                    <line x1="10" x2="8" y1="3" y2="21" />
                    <line x1="16" x2="14" y1="3" y2="21" />
                  </svg>
                  <span>Agregar etiquetas</span>
                  {selectedCategory && (
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      className={`transition-transform duration-200 text-slate-400 ${
                        showTagPills ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Inline Tag Pills if category is chosen */}
              {selectedCategory && activeCategoryObj && showTagPills && (
                <div className="flex flex-wrap gap-1.5 pt-1 animate-in fade-in duration-150">
                  {activeCategoryObj.items.map((item) => {
                    const isSelected = selectedAreas.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleArea(item)}
                        className={`h-7 px-3 rounded-full text-xs font-medium transition-all cursor-pointer select-none font-sans flex items-center gap-1.5 shrink-0 border ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                        title={isSelected ? `Quitar #${item}` : `Agregar #${item}`}
                      >
                        <span>#{item}</span>
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-white/80 hover:text-white shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Image Preview if uploaded */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/80">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full max-h-[240px] object-cover"
              />

              {isUploadingImage && (
                <div className="absolute inset-0 bg-zinc-900/65 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 text-white px-6 text-center select-none animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span className="text-xs font-semibold font-jakarta tracking-wide">
                      Subiendo imagen...
                    </span>
                    <span className="text-xs font-bold font-jakarta text-white/90">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="w-40 max-w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${Math.min(100, Math.max(5, uploadProgress))}%` }}
                    />
                  </div>
                </div>
              )}

              {!isUploadingImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-zinc-900/70 hover:bg-zinc-900 text-white flex items-center justify-center cursor-pointer border-none transition-colors"
                  title="Quitar imagen"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
          )}

          {/* Image error alert if any */}
          {imageError && (
            <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-sans flex items-start gap-2 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[16px] shrink-0 text-rose-500 mt-0.5">
                error
              </span>
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="font-semibold font-jakarta text-rose-900">
                  No se pudo cargar la imagen
                </span>
                <span>{imageError}</span>
              </div>
              <button
                type="button"
                onClick={() => setImageError(null)}
                className="w-4 h-4 text-rose-400 hover:text-rose-700 border-none bg-transparent cursor-pointer p-0"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}

          {/* YouTube Video Preview if added */}
          {youtubeId && (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-200 aspect-video max-h-[240px]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title="Vista previa de video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-none"
              />
              <button
                type="button"
                onClick={() => {
                  setYoutubeId(null);
                  setYoutubeUrl("");
                }}
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-zinc-900/70 hover:bg-zinc-900 text-white flex items-center justify-center cursor-pointer border-none transition-colors"
                title="Quitar video"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>
          )}

          {/* 4. Action Strip: "Agregar a tu publicación" with Luminus palette icons */}
          <div className="mt-1 w-full px-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800 font-jakarta select-none">
              Agregar a tu publicación
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {/* Imagen pill button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-full flex items-center gap-1.5 sm:gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all cursor-pointer border-none active:scale-95 select-none"
                title="Agregar foto o imagen"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="text-xs sm:text-[13px] font-semibold font-jakarta text-emerald-700">
                  Imagen
                </span>
              </button>

              {/* Video pill button */}
              <button
                type="button"
                onClick={handleOpenYoutubeModal}
                className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-full flex items-center gap-1.5 sm:gap-2 bg-rose-50 hover:bg-rose-100 text-[#FF4B4B] transition-all cursor-pointer border-none active:scale-95 select-none"
                title="Agregar video de YouTube"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="15" x="2" y="4.5" rx="3" ry="3" />
                  <polygon points="10 9 15 12 10 15" fill="currentColor" />
                </svg>
                <span className="text-xs sm:text-[13px] font-semibold font-jakarta text-[#FF4B4B]">
                  Video
                </span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Submodal: Agregar video de YouTube */}
      <Modal
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        title="Agregar video de YouTube"
        maxWidth="460px"
        headerClassName="px-5 py-3.5 border-b border-zinc-100"
        contentClassName="p-5 flex flex-col gap-4"
        footerClassName="px-5 py-3.5 border-t border-zinc-100 flex items-center gap-3 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsYoutubeModalOpen(false)}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSaveYoutubeVideo}
              disabled={!extractYouTubeId(tempYoutubeUrl.trim())}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Agregar video
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveYoutubeVideo} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 font-jakarta ml-1">
              Enlace del video
            </label>
            <input
              type="url"
              value={tempYoutubeUrl}
              onChange={(e) => setTempYoutubeUrl(e.target.value)}
              placeholder="Pega el enlace de YouTube"
              autoFocus
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-base font-normal font-sans text-slate-700 placeholder:text-slate-400 transition-colors bg-white"
            />
          </div>

          {tempYoutubeUrl.trim() && !extractYouTubeId(tempYoutubeUrl.trim()) && (
            <p className="text-xs text-rose-500 font-sans ml-1">
              Por favor ingresa un enlace válido de YouTube.
            </p>
          )}
        </form>
      </Modal>

      {/* Submodal: Agregar enlace */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setSavedRange(null);
        }}
        title="Agregar enlace"
        maxWidth="460px"
        headerClassName="px-5 py-3.5 border-b border-zinc-100"
        contentClassName="p-5 flex flex-col gap-4"
        footerClassName="px-5 py-3.5 border-t border-zinc-100 flex items-center gap-3 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsLinkModalOpen(false);
                setSavedRange(null);
              }}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSaveLink}
              disabled={!linkUrl.trim()}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Agregar enlace
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveLink} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 font-jakarta ml-1">Enlace</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Pega un enlace"
              autoFocus
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-base font-normal font-sans text-slate-700 placeholder:text-slate-400 transition-colors bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 font-jakarta ml-1">
              Texto visible
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Escribe cómo quieres mostrarlo"
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-base font-normal font-sans text-slate-700 placeholder:text-slate-400 transition-colors bg-white"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
