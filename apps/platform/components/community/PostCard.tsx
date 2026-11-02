"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PostItem, PostComment } from "./mockPostsData";
import { InterestPill } from "@/components/ui/InterestPill";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CommunityReportModal } from "./CommunityReportModal";
import { EditPostModal } from "./EditPostModal";
import { formatLocationDisplay } from "@/utils/locationUtils";
import { formatPostDate } from "@/lib/community/posts";
import { PostAuthorHeader, MenuActionItem } from "./molecules/PostAuthorHeader";
import { PostActionBar } from "./molecules/PostActionBar";
import { CommentInputBox } from "./molecules/CommentInputBox";
import { ExternalLink, Pin, Pencil, Trash2, Flag, Send } from "lucide-react";

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

  // Edit & Delete & Report Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "comment";
    id: string;
    author?: string;
  }>({ type: "post", id: post.id, author: post.authorName });

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
  const authorSubtitle = formatLocationDisplay(rawLocation);
  const displayDate = formatPostDate(post.createdAt || post.date);

  const hasMedia = Boolean(post.youtubeId || (post.imageUrl && !imgError));
  const { isTruncatable, truncatedText } = useMemo(() => {
    const limit = hasMedia ? 90 : 170;
    const cleanContent = post.content.trim();
    const hasMultipleParagraphs = cleanContent.includes("\n\n") || cleanContent.split("\n").filter(Boolean).length > 2;

    if (cleanContent.length <= limit && !hasMultipleParagraphs) {
      return { isTruncatable: false, truncatedText: cleanContent };
    }

    let cut = limit;
    if (cleanContent.length > limit) {
      const lastSpace = cleanContent.lastIndexOf(" ", limit);
      if (lastSpace > limit * 0.6) {
        cut = lastSpace;
      }
    } else if (hasMultipleParagraphs) {
      const firstBreak = cleanContent.indexOf("\n");
      if (firstBreak !== -1 && firstBreak < limit) {
        cut = firstBreak;
      }
    }

    const sliced = cleanContent.slice(0, cut).replace(/\n+/g, " ").trimEnd();
    return { isTruncatable: true, truncatedText: sliced };
  }, [post.content, hasMedia]);

  const currentUserId = currentUserProfile?.id || currentUserProfile?.user_id;
  const currentUserName = currentUserProfile
    ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() || "Tú"
    : "Tú";

  const currentUserLocation = useMemo(() => {
    const city = currentUserProfile?.city?.trim();
    const country = currentUserProfile?.country?.trim();
    if (city && country) return `${city}, ${country}`;
    return city || country || "Montevideo, Uruguay";
  }, [currentUserProfile]);

  const isPostAuthor = Boolean(
    (post.authorId && currentUserId && post.authorId === currentUserId) ||
    (post.authorId === "current-user") ||
    (post.authorName && currentUserName && post.authorName.toLowerCase() === currentUserName.toLowerCase())
  );

  const isAdmin = Boolean(
    currentUserProfile?.role === "ADMIN" ||
    currentUserProfile?.role === "admin" ||
    (typeof window !== "undefined" && localStorage.getItem("luminus_user_role") === "ADMIN")
  );

  const isAuthorAdmin = Boolean(
    post.isOfficial ||
    post.authorRole?.toLowerCase() === "administrador" ||
    post.authorRole?.toLowerCase() === "admin" ||
    post.authorName?.toLowerCase() === "luminus" ||
    post.authorId === "mock-luminus" ||
    post.authorId === "50d13047-bab8-44f1-9541-a821113845cc"
  );

  const handlePostAuthorClick = () => {
    if (isOfficialAccount) return;
    if (isPostAuthor || post.authorId === "current-user") {
      router.push("/perfil-usuario");
    } else {
      const targetId = post.authorId || post.authorName;
      router.push(`/inicio/public-profile?id=${encodeURIComponent(targetId)}`);
    }
  };

  const handleCommentAuthorClick = (comment: PostComment) => {
    const isOfficialComment = Boolean(
      (comment as any).isOfficial ||
      comment.authorName?.toLowerCase() === "luminus" ||
      comment.authorId === "mock-luminus" ||
      comment.authorId === "50d13047-bab8-44f1-9541-a821113845cc"
    );
    if (isOfficialComment) return;

    const isCurrent = Boolean(
      (comment.authorId && currentUserId && comment.authorId === currentUserId) ||
      (comment.authorId === "current-user") ||
      (comment.authorName && currentUserName && comment.authorName.toLowerCase() === currentUserName.toLowerCase())
    );
    if (isCurrent) {
      router.push("/perfil-usuario");
    } else {
      const targetId = comment.authorId || comment.authorName;
      router.push(`/inicio/public-profile?id=${encodeURIComponent(targetId)}`);
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
    const maxHeight = 115;
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

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s]+|\*\*[^*]+\*\*|\*[^*]+\*|<u>.*?<\/u>)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

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
            className="inline-flex items-center gap-1 font-semibold text-slate-900 underline underline-offset-2 decoration-slate-900 hover:text-slate-600 transition-colors mx-0.5 cursor-pointer"
            title={url}
          >
            <span>{label}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-700 shrink-0 inline-block -mt-0.5" />
          </a>
        );
      }

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
            className="inline-flex items-center gap-1 font-semibold text-slate-900 underline underline-offset-2 decoration-slate-900 hover:text-slate-600 transition-colors mx-0.5 cursor-pointer"
            title={part}
          >
            <span>{displayLabel}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-700 shrink-0 inline-block -mt-0.5" />
          </a>
        );
      }

      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={index} className="font-bold text-slate-900 font-sans">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return (
          <em key={index} className="italic text-slate-800 font-sans">
            {part.slice(1, -1)}
          </em>
        );
      }

      if (part.startsWith("<u>") && part.endsWith("</u>") && part.length >= 7) {
        return (
          <span key={index} className="underline text-slate-800 font-sans">
            {part.slice(3, -4)}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-1.5">
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
            return <div key={idx} className="h-1" />;
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

  // Build Contextual Menu Actions for PostAuthorHeader
  const menuActions: MenuActionItem[] = useMemo(() => {
    if (hideActions) return [];
    const actions: MenuActionItem[] = [];

    if (isAdmin && isAuthorAdmin && onTogglePin) {
      actions.push({
        label: post.isPinned ? "Desfijar publicación" : "Fijar publicación",
        icon: <Pin className="w-3.5 h-3.5 text-slate-500" />,
        onClick: () => onTogglePin(post.id),
      });
    }

    if (isPostAuthor || (isAdmin && isAuthorAdmin)) {
      actions.push({
        label: "Editar",
        icon: <Pencil className="w-3.5 h-3.5 text-slate-500" />,
        onClick: () => setIsEditModalOpen(true),
      });
      actions.push({
        label: "Eliminar",
        icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
        onClick: () => setIsDeleteConfirmOpen(true),
        variant: "destructive",
      });
    } else if (isAdmin) {
      actions.push({
        label: "Eliminar",
        icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
        onClick: () => setIsDeleteConfirmOpen(true),
        variant: "destructive",
      });
    } else {
      actions.push({
        label: "Reportar",
        icon: <Flag className="w-3.5 h-3.5 text-rose-600" />,
        onClick: () => {
          setReportTarget({ type: "post", id: post.id, author: post.authorName });
          setIsReportModalOpen(true);
        },
        variant: "destructive",
      });
    }

    return actions;
  }, [hideActions, isAdmin, isAuthorAdmin, onTogglePin, isPostAuthor, post.id, post.isPinned, post.authorName]);

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 flex flex-col shadow-none overflow-hidden">
      {/* 1. Molecule: Author Header */}
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <PostAuthorHeader
          authorName={post.authorName}
          authorAvatar={post.authorAvatar}
          authorSubtitle={authorSubtitle}
          displayDate={displayDate}
          isPinned={post.isPinned}
          isOfficial={isOfficialAccount}
          onAuthorClick={isOfficialAccount ? undefined : handlePostAuthorClick}
          menuActions={menuActions}
        />
      </div>

      {/* 2. Media: YouTube video or Image if present */}
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

      {/* Optional Post Title */}
      {post.title && (
        <h3 className="px-4 sm:px-5 pb-2 text-base font-bold text-slate-900 font-jakarta leading-snug">
          {post.title}
        </h3>
      )}

      {/* 3. Text content */}
      <div
        className={`px-4 sm:px-5 text-sm text-slate-700 font-sans leading-relaxed ${
          ((post.areas && post.areas.length > 0) || post.area) ? "pb-3" : "pb-4"
        }`}
      >
        {!isExpanded && isTruncatable ? (
          <p className="leading-relaxed">
            {parseInlineMarkdown(truncatedText)}
            <span className="text-slate-400 select-none">... </span>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline cursor-pointer border-none bg-transparent p-0 select-none font-jakarta ml-1"
            >
              Ver más
            </button>
          </p>
        ) : (
          <>
            {renderFormattedContent(post.content)}
            {isTruncatable && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors block cursor-pointer border-none bg-transparent p-0 select-none font-jakarta"
              >
                Ver menos
              </button>
            )}
          </>
        )}
      </div>

      {/* 4. Area / Interest Pills */}
      {((post.areas && post.areas.length > 0) || post.area) && (
        <div className="px-4 sm:px-5 pb-3.5 flex flex-wrap items-center gap-1.5">
          {(post.areas && post.areas.length > 0 ? post.areas : [post.area!]).map((areaTag) => (
            <InterestPill key={areaTag} interest={areaTag} size="sm" />
          ))}
        </div>
      )}

      {/* 5. Molecule: Post Action Bar (Like & Comments) */}
      {!hideActions && (
        <div className="px-4 sm:px-5 pb-3">
          <PostActionBar
            isLiked={isLiked}
            likesCount={likesCount}
            commentsCount={comments.length}
            onToggleLike={handleToggleLike}
            onToggleComments={() => setShowComments((prev) => !prev)}
            showComments={showComments}
          />
        </div>
      )}

      {/* 6. Comments Section — Clean Thread Stream (No heavy boxes) */}
      {!hideActions && showComments && (
        <div className="px-4 sm:px-5 pt-2 pb-4 border-t border-slate-100 flex flex-col gap-3 bg-slate-50/40">
          {/* List of existing comments as fluid thread rows */}
          {comments.length > 0 && (
            <div className="divide-y divide-slate-100">
              {comments.map((comment) => {
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
                  <div key={comment.id} className="py-2.5 flex items-start gap-3 group/comment first:pt-1 last:pb-1">
                    <div
                      onClick={isOfficialComment ? undefined : () => handleCommentAuthorClick(comment)}
                      className={isOfficialComment ? "shrink-0 mt-0.5" : "cursor-pointer hover:opacity-90 shrink-0 mt-0.5"}
                      title={isOfficialComment ? undefined : `Ver perfil de ${comment.authorName}`}
                    >
                      <UserAvatar
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        size="md"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                      {/* Name + Dot + Date together */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span
                            onClick={isOfficialComment ? undefined : () => handleCommentAuthorClick(comment)}
                            className={`text-sm font-semibold text-slate-900 font-jakarta truncate ${
                              isOfficialComment ? "cursor-default select-none" : "cursor-pointer hover:text-slate-700 transition-colors"
                            }`}
                          >
                            {comment.authorName}
                          </span>
                          {comment.date && (
                            <>
                              <span className="text-slate-300 select-none text-[10px]">•</span>
                              <span className="text-xs font-normal text-slate-400 font-sans shrink-0">
                                {formatPostDate(comment.createdAt || comment.date)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Hover actions (Delete / Report) */}
                        <div className="opacity-0 group-hover/comment:opacity-100 transition-opacity shrink-0">
                          {isCommentAuthor ? (
                            <button
                              type="button"
                              onClick={() => {
                                setComments((prev) => prev.filter((c) => c.id !== comment.id));
                              }}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors border-none bg-transparent cursor-pointer p-0"
                              title="Eliminar comentario"
                              aria-label="Eliminar comentario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReportTarget({ type: "comment", id: comment.id, author: comment.authorName });
                                setIsReportModalOpen(true);
                              }}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors border-none bg-transparent cursor-pointer p-0"
                              title="Reportar comentario"
                              aria-label="Reportar comentario"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment text */}
                      <div className="text-sm text-slate-700 font-sans leading-relaxed mt-0.5 break-words [overflow-wrap:anywhere]">
                        {parseInlineMarkdown(comment.content)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Molecule: CommentInputBox */}
          <CommentInputBox
            userAvatar={currentUserProfile?.profile_picture_url}
            userName={currentUserName}
            value={newCommentText}
            onChange={setNewCommentText}
            onSubmit={handleAddComment}
          />
        </div>
      )}

      {/* Edit Post Modal */}
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
        footerClassName="px-5 py-3.5 border-t border-slate-100 flex flex-row items-center gap-2.5 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="md"
              type="button"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                onDeletePost?.(post.id);
              }}
              className="flex-1"
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
