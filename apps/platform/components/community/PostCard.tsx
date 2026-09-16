"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostItem, PostComment } from "./mockPostsData";
import { InterestPill } from "@/components/ui/InterestPill";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CommunityReportModal } from "./CommunityReportModal";
import { EditPostModal } from "./EditPostModal";

function formatCityCountry(loc?: string): string {
  if (!loc) return "";
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return loc;
  // Keeps only City and Country (parts[0] and parts[parts.length - 1]), omitting state/department
  return `${parts[0]}, ${parts[parts.length - 1]}`;
}

interface PostCardProps {
  post: PostItem;
  currentUserProfile?: any;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (updatedPost: PostItem) => void;
  onTogglePin?: (postId: string) => void;
  hideActions?: boolean;
}

export function PostCard({ post, currentUserProfile, onDeletePost, onEditPost, onTogglePin, hideActions }: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Author & Menu state
  const [showPostMenu, setShowPostMenu] = useState(false);
  const postMenuRef = useRef<HTMLDivElement>(null);

  // Edit & Delete & Report Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "comment";
    id: string;
    author?: string;
  }>({ type: "post", id: post.id, author: post.authorName });

  // Click outside to close post menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setShowPostMenu(false);
      }
    }
    if (showPostMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPostMenu]);

  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setLikesCount(post.likesCount || 0);
  }, [post.id, post.likesCount, post.isLiked]);

  useEffect(() => {
    setComments(post.comments || []);
  }, [post.id, post.comments]);

  const isOfficialAccount = Boolean(
    post.isOfficial ||
    post.authorName?.toLowerCase() === "luminus" ||
    post.authorId === "mock-luminus" ||
    post.authorId === "50d13047-bab8-44f1-9541-a821113845cc"
  );

  const rawLocation = isOfficialAccount
    ? "Cuenta Oficial"
    : post.authorLocation || (post.authorRole && post.authorRole !== "Miembro" ? post.authorRole : "Montevideo, Uruguay");
  const authorSubtitle = formatCityCountry(rawLocation);

  const hasMedia = Boolean(post.youtubeId || (post.imageUrl && !imgError));
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (!isExpanded) {
        // Measure real DOM height: only overflowing if scrollHeight exceeds clientHeight by > 4px
        const isClamped = el.scrollHeight > el.clientHeight + 4;
        setHasOverflow(isClamped);
      }
    };

    checkOverflow();

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [post.content, isExpanded, hasMedia]);

  const currentUserId = currentUserProfile?.id || currentUserProfile?.user_id;
  const currentUserName = currentUserProfile
    ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() || "Tú"
    : "Tú";

  const isPostAuthor = Boolean(
    (post.authorId && currentUserId && post.authorId === currentUserId) ||
    (post.authorId === "current-user") ||
    (post.authorName && currentUserName && post.authorName.toLowerCase() === currentUserName.toLowerCase())
  );

  const userCity = currentUserProfile?.city?.trim();
  const userCountry = currentUserProfile?.country?.trim();
  let currentUserLocation = "Montevideo, Uruguay";
  if (userCity && userCountry) {
    currentUserLocation = `${userCity}, ${userCountry}`;
  } else if (currentUserProfile?.location) {
    currentUserLocation = formatCityCountry(currentUserProfile.location);
  } else if (userCity || userCountry) {
    currentUserLocation = userCity || userCountry;
  }

  const isAdmin = Boolean(
    currentUserProfile?.role === "ADMIN" ||
    currentUserProfile?.role === "admin" ||
    (typeof window !== "undefined" && localStorage.getItem("luminus_user_role") === "ADMIN")
  );

  const isAuthorAdmin = Boolean(
    post.isAuthorAdmin ||
    post.isOfficial ||
    (isPostAuthor && isAdmin) ||
    post.authorName?.toLowerCase() === "luminus" ||
    post.authorId === "mock-luminus" ||
    post.authorId === "50d13047-bab8-44f1-9541-a821113845cc"
  );

  const handlePostAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOfficialAccount) {
      return;
    }
    if (isPostAuthor || post.authorId === "current-user") {
      router.push("/perfil-usuario");
    } else {
      const targetId = post.authorId || post.authorName;
      router.push(`/comunidad/public-profile?id=${encodeURIComponent(targetId)}`);
    }
  };

  const handleCommentAuthorClick = (e: React.MouseEvent, comment: PostComment) => {
    e.stopPropagation();
    const isOfficialComment = Boolean(
      (comment as any).isOfficial ||
      comment.authorName?.toLowerCase() === "luminus" ||
      comment.authorId === "mock-luminus" ||
      comment.authorId === "50d13047-bab8-44f1-9541-a821113845cc"
    );
    if (isOfficialComment) {
      return;
    }
    const isCurrent = Boolean(
      (comment.authorId && currentUserId && comment.authorId === currentUserId) ||
      (comment.authorId === "current-user") ||
      (comment.authorName && currentUserName && comment.authorName.toLowerCase() === currentUserName.toLowerCase())
    );
    if (isCurrent) {
      router.push("/perfil-usuario");
    } else {
      const targetId = comment.authorId || comment.authorName;
      router.push(`/comunidad/public-profile?id=${encodeURIComponent(targetId)}`);
    }
  };

  const handleToggleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      const res = await fetch(`/api/comunidad/posts/${post.id}/likes`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.liked === "boolean") {
          setIsLiked(data.liked);
        }
        if (typeof data.likesCount === "number") {
          setLikesCount(data.likesCount);
        }
      } else {
        // Revert on failure
        setIsLiked(!nextLiked);
        setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentText(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    const maxHeight = 115; // ~5 lines of text
    if (target.scrollHeight > maxHeight) {
      target.style.height = `${maxHeight}px`;
      target.style.overflowY = "auto";
    } else {
      target.style.height = `${target.scrollHeight}px`;
      target.style.overflowY = "hidden";
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment(e);
    }
  };

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    // Temporary optimistic comment
    const tempComment: PostComment = {
      id: `c-${Date.now()}`,
      authorId: currentUserId || "current-user",
      authorName: currentUserName,
      authorAvatar: currentUserProfile?.profile_picture_url,
      authorRole: "Miembro",
      authorLocation: currentUserLocation,
      date: "Hace un momento",
      content: trimmed,
    };

    setComments((prev) => [...prev, tempComment]);
    setNewCommentText("");
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = "auto";
      commentTextareaRef.current.style.overflowY = "hidden";
    }
    setShowComments(true);

    try {
      const res = await fetch(`/api/comunidad/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) =>
            prev.map((c) => (c.id === tempComment.id ? data.comment : c))
          );
        }
      }
    } catch (err) {
      console.error("Error adding comment to post:", err);
    }
  };

  // Inline markdown parser for bold, italic, underline, links, and URL badges
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s]+|\*\*[^*]+\*\*|\*[^*]+\*|<u>.*?<\/u>)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Markdown link: [label](url)
      const mdLinkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
      if (mdLinkMatch) {
        const [, label, url] = mdLinkMatch;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-semibold text-slate-900 underline underline-offset-2 decoration-slate-900 hover:text-slate-600 hover:decoration-slate-600 transition-colors mx-0.5 cursor-pointer"
            title={url}
          >
            <span>{label}</span>
            <svg
              className="w-3.5 h-3.5 shrink-0 text-slate-800 inline-block -mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        );
      }

      // Raw URL
      if (/^https?:\/\/[^\s]+$/.test(part)) {
        let displayLabel = part;
        try {
          const parsed = new URL(part);
          displayLabel = parsed.hostname.replace(/^www\./, "") + (parsed.pathname !== "/" ? parsed.pathname : "");
          if (displayLabel.length > 28) {
            displayLabel = displayLabel.slice(0, 25) + "...";
          }
        } catch {
          displayLabel = "Ver enlace";
        }
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-semibold text-slate-900 underline underline-offset-2 decoration-slate-900 hover:text-slate-600 hover:decoration-slate-600 transition-colors mx-0.5 cursor-pointer"
            title={part}
          >
            <span>{displayLabel}</span>
            <svg
              className="w-3.5 h-3.5 shrink-0 text-slate-800 inline-block -mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        );
      }

      // Bold: **text**
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={index} className="font-bold text-slate-900 font-sans">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *text*
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return (
          <em key={index} className="italic text-slate-800 font-sans">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Underline: <u>text</u>
      if (part.startsWith("<u>") && part.endsWith("</u>") && part.length >= 7) {
        return (
          <span key={index} className="underline underline-offset-2 decoration-slate-400">
            {part.slice(3, -4)}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  // Helper to render text with markdown and URLs converted into stylish pill badges
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");

    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          const bulletMatch = line.match(/^([•\-])\s+(.*)$/);
          const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);

          if (bulletMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-slate-400 select-none text-xs leading-relaxed">•</span>
                <div className="flex-1 leading-relaxed">{parseInlineMarkdown(bulletMatch[2])}</div>
              </div>
            );
          }

          if (numberMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-xs font-semibold text-slate-400 select-none leading-relaxed font-jakarta">
                  {numberMatch[1]}.
                </span>
                <div className="flex-1 leading-relaxed">{parseInlineMarkdown(numberMatch[2])}</div>
              </div>
            );
          }

          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          return (
            <p key={idx} className="leading-relaxed">
              {parseInlineMarkdown(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <article
      className={`bg-white rounded-2xl border border-zinc-200 flex flex-col shadow-none transition-all ${
        showPostMenu ? "relative z-40 overflow-visible" : "overflow-hidden"
      }`}
    >
      {/* 1. Header: Author info and Post date */}
      <div className="px-4 pt-3.5 pb-2.5 sm:px-5 sm:pt-4 sm:pb-3 flex items-center justify-between gap-3">
        <div
          onClick={isOfficialAccount ? undefined : handlePostAuthorClick}
          className={`flex items-center gap-3 min-w-0 ${isOfficialAccount ? "cursor-default select-none" : "cursor-pointer group/author"
            }`}
          title={isOfficialAccount ? undefined : `Ver perfil de ${post.authorName}`}
        >
          {/* Author avatar */}
          <div className={`w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center shrink-0 transition-colors duration-200 ${isOfficialAccount ? "" : "group-hover/author:border-slate-200"
            }`}>
            {post.authorAvatar && !avatarError ? (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
            )}
          </div>

          {/* Author details */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-bold text-slate-900 font-jakarta truncate ${isOfficialAccount ? "" : "group-hover/author:underline"
                }`}>
                {post.authorName}
              </span>
              {post.isOfficial && (
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold uppercase tracking-wider font-jakarta">
                  Oficial
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium font-sans">
              <span className="truncate max-w-[180px] sm:max-w-[240px] text-slate-500">
                {authorSubtitle}
              </span>
              <span>•</span>
              {/* Post date */}
              <span className="text-slate-400 whitespace-nowrap">{post.date}</span>
            </div>
          </div>
        </div>

        {/* Post Actions & Pin Indicator */}
        <div className="flex items-center gap-1 shrink-0">
          {post.isPinned && (
            <div
              className="flex items-center justify-center w-8 h-8 text-slate-400 select-none"
              title="Publicación fijada"
            >
              <span className="material-symbols-rounded text-slate-400 text-[18px] rotate-45">
                push_pin
              </span>
            </div>
          )}

          {!hideActions && (
            <div ref={postMenuRef} className="relative z-50 flex items-center">
              <button
                type="button"
                onClick={() => setShowPostMenu((prev) => !prev)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all border-none cursor-pointer bg-transparent ${showPostMenu ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                aria-label="Opciones"
                title="Opciones"
              >
                <span className="material-symbols-rounded text-slate-400 hover:text-black transition-colors text-[20px]">
                  more_vert
                </span>
              </button>

              {showPostMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200/90 rounded-2xl overflow-hidden z-[100] shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  {isAdmin && isAuthorAdmin && onTogglePin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        onTogglePin(post.id);
                      }}
                      className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left border-b border-slate-100"
                    >
                      <span className="material-symbols-rounded text-[18px] text-slate-500 group-hover:text-slate-900 transition-colors rotate-45">
                        {post.isPinned ? "keep_off" : "push_pin"}
                      </span>
                      <span className="font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                        {post.isPinned ? "Desfijar publicación" : "Fijar publicación"}
                      </span>
                    </button>
                  )}
                  {isPostAuthor ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPostMenu(false);
                          setIsEditModalOpen(true);
                        }}
                        className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-slate-50 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                      >
                        <span className="material-symbols-rounded text-slate-500 group-hover:text-slate-900 text-[18px] transition-colors">
                          edit
                        </span>
                        <span className="font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                          Editar
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPostMenu(false);
                          setIsDeleteConfirmOpen(true);
                        }}
                        className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                      >
                        <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">
                          delete
                        </span>
                        <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">
                          Eliminar
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        setReportTarget({ type: "post", id: post.id, author: post.authorName });
                        setIsReportModalOpen(true);
                      }}
                      className="group w-full flex items-center gap-2.5 px-[14px] py-[14px] text-sm hover:bg-[#FF4B4B]/10 transition-colors border-none outline-none cursor-pointer bg-transparent text-left"
                    >
                      <span className="material-symbols-rounded text-slate-500 group-hover:text-[#FF4B4B] text-[18px] transition-colors">
                        flag
                      </span>
                      <span className="font-semibold text-slate-500 group-hover:text-[#FF4B4B] transition-colors">
                        Reportar
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Content Order: MEDIA FIRST (YouTube video or Image if present) */}
      {post.youtubeId ? (
        <div className="px-4 sm:px-5 pb-3">
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-100">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>
        </div>
      ) : post.imageUrl && !imgError ? (
        <div className="px-4 sm:px-5 pb-3">
          <div className="w-full max-h-[380px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
            <img
              src={post.imageUrl}
              alt={post.imageAlt || "Imagen de la publicación"}
              className="w-full h-full object-cover max-h-[380px]"
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      ) : null}

      {/* Optional Post Title for Announcement Board Style */}
      {post.title && (
        <h3 className="px-4 sm:px-5 pb-1.5 text-base sm:text-[17px] font-bold text-slate-900 font-jakarta leading-snug">
          {post.title}
        </h3>
      )}

      {/* 3. Text content (with markdown support, subtle links, and real DOM overflow clamping) */}
      <div className="px-4 sm:px-5 pb-3 text-sm text-slate-700 font-sans leading-relaxed">
        <div
          ref={contentRef}
          className={`relative overflow-hidden transition-all duration-300 ${!isExpanded ? (hasMedia ? "max-h-[50px]" : "max-h-[165px]") : "max-h-none"
            }`}
        >
          {renderFormattedContent(post.content)}
          {!isExpanded && hasOverflow && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>
        {hasOverflow && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="mt-1.5 text-xs text-slate-400 hover:text-slate-600 hover:underline font-sans border-none bg-transparent p-0 cursor-pointer select-none transition-colors block"
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      {/* 4. Area / Interest Pills at the end of the post (small) */}
      {((post.areas && post.areas.length > 0) || post.area) && (
        <div className="px-4 sm:px-5 pb-3 flex flex-wrap items-center gap-1.5">
          {(post.areas && post.areas.length > 0 ? post.areas : [post.area!]).map((areaTag) => (
            <InterestPill key={areaTag} interest={areaTag} size="sm" />
          ))}
        </div>
      )}

      {/* 4. Action Buttons: Like & Comment (Icon + Number only, no text) */}
      {!hideActions && (
        <div className={`p-1.5 sm:p-2 border-t border-zinc-100 flex items-center gap-1.5 ${showComments ? "border-b border-zinc-100 bg-slate-50/40" : ""
          }`}>
          {/* Like button */}
          <button
            type="button"
            onClick={handleToggleLike}
            aria-label={isLiked ? "Ya no me gusta" : "Me gusta"}
            className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-semibold font-jakarta transition-all cursor-pointer border-none select-none ${isLiked
              ? "bg-rose-50 text-rose-600 font-bold"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <span
              className="material-symbols-outlined text-[19px]"
              style={{
                fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              favorite
            </span>
            {likesCount > 0 && (
              <span className={`text-xs font-bold ${isLiked ? "text-rose-600" : "text-slate-700"}`}>
                {likesCount}
              </span>
            )}
          </button>

          {/* Comment toggle button */}
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            aria-label="Comentarios"
            className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-semibold font-jakarta transition-all cursor-pointer border-none select-none ${showComments
              ? "bg-slate-200/60 text-slate-900 font-bold"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <span className="material-symbols-outlined text-[19px]">chat_bubble_outline</span>
            {comments.length > 0 && (
              <span className={`text-xs font-bold ${showComments ? "text-slate-900" : "text-slate-700"}`}>
                {comments.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 5. Comments Section */}
      {!hideActions && showComments && (
        <div className="px-4 sm:px-5 py-3 bg-slate-50/70 flex flex-col gap-3">
          {/* List of existing comments (Read mode with actions) */}
          {comments.length > 0 && (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => {
                const commentLoc = formatCityCountry(
                  comment.authorLocation || (comment.authorRole && comment.authorRole !== "Miembro" ? comment.authorRole : "Montevideo, Uruguay")
                );

                const isCommentAuthor = Boolean(
                  (comment.authorId && currentUserId && comment.authorId === currentUserId) ||
                  (comment.authorId === "current-user") ||
                  (comment.authorName && currentUserName && comment.authorName.toLowerCase() === currentUserName.toLowerCase())
                );

                const isOfficialComment = Boolean(
                  (comment as any).isOfficial ||
                  comment.authorName?.toLowerCase() === "luminus" ||
                  comment.authorId === "mock-luminus" ||
                  comment.authorId === "50d13047-bab8-44f1-9541-a821113845cc"
                );

                return (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2.5 sm:gap-3 group/comment"
                  >
                    {/* Avatar */}
                    <div
                      onClick={isOfficialComment ? undefined : (e) => handleCommentAuthorClick(e, comment)}
                      className={`w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center shrink-0 transition-colors duration-200 ${isOfficialComment ? "cursor-default" : "cursor-pointer hover:border-slate-200"
                        }`}
                      title={isOfficialComment ? undefined : `Ver perfil de ${comment.authorName}`}
                    >
                      {comment.authorAvatar ? (
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                      )}
                    </div>

                    {/* Content without frame, directly in background */}
                    <div className="flex-1 min-w-0 flex flex-col pt-0.5 relative pr-6">
                      <div className="flex items-baseline gap-2 flex-wrap leading-tight">
                        <span
                          onClick={isOfficialComment ? undefined : (e) => handleCommentAuthorClick(e, comment)}
                          className={`text-xs font-bold text-slate-900 font-sans ${isOfficialComment ? "cursor-default select-none" : "cursor-pointer hover:underline"
                            }`}
                          title={isOfficialComment ? undefined : `Ver perfil de ${comment.authorName}`}
                        >
                          {comment.authorName}
                        </span>
                        {commentLoc && (
                          <span className="text-xs text-slate-400 font-normal font-sans">
                            {commentLoc}
                          </span>
                        )}
                        {comment.date && (
                          <>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-xs text-slate-400 font-normal font-sans">
                              {comment.date}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-700 font-sans leading-snug">
                        {parseInlineMarkdown(comment.content)}
                      </div>

                      {/* Action: Delete if author, Report if not author (appears on hover) */}
                      <div className="absolute right-0 top-0 flex items-center opacity-0 group-hover/comment:opacity-100 transition-opacity">
                        {isCommentAuthor ? (
                          <button
                            type="button"
                            onClick={() => {
                              setComments((prev) => prev.filter((c) => c.id !== comment.id));
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-colors border-none bg-transparent cursor-pointer p-0"
                            title="Eliminar"
                            aria-label="Eliminar"
                          >
                            <span className="material-symbols-rounded text-[15px]">delete</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReportTarget({ type: "comment", id: comment.id, author: comment.authorName });
                              setIsReportModalOpen(true);
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-colors border-none bg-transparent cursor-pointer p-0"
                            title="Reportar"
                            aria-label="Reportar"
                          >
                            <span className="material-symbols-rounded text-[15px]">flag</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form to add a new comment (Auto-expanding up to 5 lines with inline Comentar button) */}
          <form
            onSubmit={handleAddComment}
            className="flex items-start gap-2.5 sm:gap-3"
          >
            {/* Current user avatar */}
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
              {currentUserProfile?.profile_picture_url ? (
                <img
                  src={currentUserProfile.profile_picture_url}
                  alt={currentUserName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
              )}
            </div>

            {/* Auto-growing Textarea container with button inside */}
            <div className="flex-1 min-w-0 bg-white rounded-xl border border-zinc-200/80 focus-within:border-slate-800 transition-all flex items-end gap-2 pl-3.5 pr-2 py-1.5 sm:py-2 min-h-[44px]">
              <textarea
                ref={commentTextareaRef}
                rows={1}
                value={newCommentText}
                onChange={handleCommentChange}
                onKeyDown={handleCommentKeyDown}
                placeholder="Escribe un comentario..."
                style={{ overflowY: "hidden" }}
                className="flex-1 min-w-0 bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-sans leading-snug max-h-[115px] visible-scrollbar p-0 block my-auto"
              />

              {/* Standardized Comentar button inside the input */}
              <Button
                variant="primary"
                type="submit"
                disabled={!newCommentText.trim()}
                className="!w-auto !h-8 sm:!h-[34px] !px-3.5 !text-xs !font-semibold !rounded-lg shrink-0 self-end"
              >
                Comentar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Post Modal (Exact same modal as publicar, pre-filled with post data) */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post}
        onSavePost={(updatedPost) => {
          onEditPost?.(updatedPost);
          setIsEditModalOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="¿Eliminar publicación?"
        maxWidth="400px"
        footerClassName="px-5 py-3.5 border-t border-zinc-100 flex flex-row items-center gap-2.5 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1 !h-9 sm:!h-10 !text-xs sm:!text-[13px] !font-medium !rounded-[12px]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                onDeletePost?.(post.id);
              }}
              className="flex-1 !h-9 sm:!h-10 !text-xs sm:!text-[13px] !font-medium !bg-rose-600 hover:!bg-rose-700 !text-white !rounded-[12px]"
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 font-sans leading-relaxed py-1">
          Esta acción no se puede deshacer. Tu publicación se eliminará de la comunidad.
        </p>
      </Modal>

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
        authorName={reportTarget.author}
      />
    </article>
  );
}
