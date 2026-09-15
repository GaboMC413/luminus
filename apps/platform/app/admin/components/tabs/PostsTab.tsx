"use client";

import React, { useState, useMemo } from "react";
import { PostItem } from "@/components/community/mockPostsData";
import { AdminCard, AdminBadge } from "../AdminDesignSystem";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PostCard } from "@/components/community/PostCard";

interface PostsTabProps {
  posts: PostItem[];
  setPosts: React.Dispatch<React.SetStateAction<PostItem[]>>;
  onValidatePost: (postId: string) => void;
  onRejectPost: (postId: string) => void;
  onPausePost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

export function PostsTab({
  posts,
  setPosts,
  onValidatePost,
  onRejectPost,
  onPausePost,
  onDeletePost,
}: PostsTabProps) {
  const [subTab, setSubTab] = useState<"lista" | "pendientes">("lista");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Separate posts by status
  const validatedPosts = useMemo(
    () => posts.filter((p) => p.status === "approved" || !p.status),
    [posts]
  );
  const pendingPosts = useMemo(
    () => posts.filter((p) => p.status === "pending"),
    [posts]
  );

  // Active list based on subtab
  const currentList = subTab === "pendientes" ? pendingPosts : validatedPosts;

  // Selected post object
  const selectedPost = useMemo(() => {
    if (selectedPostId) {
      const found = posts.find((p) => p.id === selectedPostId);
      if (found) return found;
    }
    return currentList[0] || null;
  }, [posts, selectedPostId, currentList]);

  const handleValidate = (postId: string) => {
    onValidatePost(postId);
  };

  const handleRejectConfirm = () => {
    if (selectedPost) {
      onRejectPost(selectedPost.id);
      setIsRejectModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedPost && onDeletePost) {
      onDeletePost(selectedPost.id);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="w-full p-6 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col box-border">
      {/* 2-Column Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-start flex-1 min-h-0 h-full">
        {/* Left Column: Heading + Unified List Card */}
        <div
          className={`${
            showMobileDetail ? "hidden lg:flex" : "flex"
          } flex-col gap-4 min-w-0 h-full overflow-hidden`}
        >
          {/* Page Heading Area inside Left Column */}
          <div className="shrink-0">
            <h1 className="text-[28px] font-bold leading-tight font-jakarta text-slate-900">
              Publicaciones
            </h1>
            <p className="mt-0.5 text-[14px] text-slate-500 font-sans">
              Administra las publicaciones de la comunidad y valida el contenido nuevo.
            </p>
          </div>

          {/* Unified List Card */}
          <AdminCard className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Toolbar inside card: Only the toggle button */}
            <div className="p-4 border-b border-slate-200/80 bg-white flex items-center shrink-0">
              {subTab === "lista" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSubTab("pendientes");
                    setSelectedPostId(pendingPosts[0]?.id || null);
                  }}
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between shrink-0 cursor-pointer transition-all duration-300 font-jakarta"
                  title="Ver publicaciones pendientes de validación"
                >
                  <span>Pendientes de validación</span>
                  {pendingPosts.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                      {pendingPosts.length}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-normal">0 pendientes</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSubTab("lista");
                    setSelectedPostId(validatedPosts[0]?.id || null);
                  }}
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-200/80 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between shrink-0 cursor-pointer transition-all duration-300 font-jakarta"
                  title="Ver lista de publicaciones validadas"
                >
                  <span>Lista de publicaciones</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {validatedPosts.length} publicaciones
                  </span>
                </button>
              )}
            </div>

            {/* Table Header: Autor, Título, Fecha */}
            <div className="grid grid-cols-[38%_44%_18%] border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-500 shrink-0 font-jakarta">
              <span>Autor</span>
              <span>Título</span>
              <span>Fecha</span>
            </div>

            {/* Table Rows with Inner Scroll */}
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0 visible-scrollbar">
              {currentList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span className="material-symbols-rounded text-[44px] mb-2 text-slate-300">
                    {subTab === "pendientes" ? "check_circle" : "post"}
                  </span>
                  <p className="text-sm font-medium font-sans">
                    {subTab === "pendientes"
                      ? "No hay publicaciones pendientes de validación."
                      : "No hay publicaciones validadas aún."}
                  </p>
                </div>
              ) : (
                currentList.map((post) => {
                  const active = post.id === selectedPost?.id;

                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setShowMobileDetail(true);
                      }}
                      className={`grid w-full grid-cols-[38%_44%_18%] items-center px-4 py-3.5 text-left text-[14px] transition outline-none cursor-pointer border-y-0 border-r-0 ${
                        active
                          ? "bg-slate-100/90 font-semibold border-l-4 border-slate-900"
                          : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                      }`}
                    >
                      {/* Author: Avatar + Name */}
                      <span className="flex min-w-0 items-center gap-3 pr-2">
                        <span className="relative shrink-0">
                          {post.authorAvatar ? (
                            <img
                              src={post.authorAvatar}
                              alt=""
                              className="h-9 w-9 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-600 uppercase shrink-0">
                              {(post.authorName || "U").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </span>
                        <span
                          className={`truncate font-jakarta text-xs ${
                            active ? "font-bold text-slate-950" : "font-semibold text-slate-900"
                          }`}
                        >
                          {post.authorName}
                        </span>
                      </span>

                      {/* Title */}
                      <span className="min-w-0 pr-2">
                        <span className="truncate text-slate-900 text-xs font-medium font-jakarta block">
                          {post.title || post.content.slice(0, 45)}
                        </span>
                      </span>

                      {/* Date */}
                      <span className="truncate text-slate-400 text-xs font-sans">
                        {post.date}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right Column: Detail Panel */}
        <div
          className={`${
            showMobileDetail ? "flex" : "hidden lg:flex"
          } flex-col flex-1 min-w-0 h-full overflow-hidden`}
        >
          {selectedPost ? (
            <AdminCard className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
              {/* Mobile Back Button (< lg) */}
              <div className="lg:hidden bg-slate-900 p-3 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMobileDetail(false)}
                  className="flex items-center gap-2 text-xs font-bold text-white hover:text-slate-200 cursor-pointer bg-transparent border-none"
                >
                  <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                  <span>Volver a la lista</span>
                </button>
              </div>

              {/* Status Header Bar */}
              <div className="border-b border-slate-200/80 px-6 py-4 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 font-jakarta">Estado:</span>
                  {selectedPost.status === "pending" ? (
                    <AdminBadge variant="pending">Pendiente de validación</AdminBadge>
                  ) : (
                    <AdminBadge variant="active">Validada / Pública</AdminBadge>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-sans">
                  ID: {selectedPost.id}
                </span>
              </div>

              {/* Centered Real Post Card (No likes, no comments, no options menu) */}
              <div className="p-6 flex flex-col flex-1 overflow-y-auto min-h-0 visible-scrollbar items-center justify-start bg-[#F8FAFC]">
                <div className="w-full max-w-[560px]">
                  <PostCard post={selectedPost} hideActions />
                </div>
              </div>

              {/* Bottom Validation / Rejection Buttons */}
              <div className="border-t border-slate-200/80 p-4 sm:p-5 bg-white shrink-0">
                <div className="w-full max-w-[560px] mx-auto flex items-center gap-3">
                  {selectedPost.status === "pending" ? (
                    <>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setIsRejectModalOpen(true)}
                        className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
                      >
                        Rechazar
                      </Button>
                      <Button
                        variant="primary"
                        type="button"
                        onClick={() => handleValidate(selectedPost.id)}
                        className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
                      >
                        Validar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => {
                          if (onPausePost) {
                            onPausePost(selectedPost.id);
                          } else {
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === selectedPost.id ? { ...p, status: "pending" as const } : p
                              )
                            );
                          }
                        }}
                        className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
                      >
                        Pausar / Despublicar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex-1 !h-11 !text-[13px] !font-medium !bg-rose-600 hover:!bg-rose-700 !text-white !rounded-[12px]"
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </AdminCard>
          ) : (
            <AdminCard className="flex flex-col flex-1 items-center justify-center p-12 text-slate-400 bg-white">
              <span className="material-symbols-rounded text-[48px] mb-2 text-slate-300">
                post
              </span>
              <p className="text-sm font-medium font-sans">
                Selecciona una publicación para ver sus detalles y validarla.
              </p>
            </AdminCard>
          )}
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="¿Rechazar publicación?"
        maxWidth="420px"
        footerClassName="px-5 py-3.5 border-t border-zinc-100 flex items-center gap-3 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleRejectConfirm}
              className="flex-1 !h-11 !text-[13px] !font-medium !bg-rose-600 hover:!bg-rose-700 !text-white !rounded-[12px]"
            >
              Rechazar
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 font-sans leading-relaxed py-1">
          La publicación no será visible en la comunidad y se marcará como rechazada.
        </p>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="¿Eliminar publicación?"
        maxWidth="420px"
        footerClassName="px-5 py-3.5 border-t border-zinc-100 flex items-center gap-3 w-full"
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 !h-11 !text-[13px] !font-medium !rounded-[12px]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="flex-1 !h-11 !text-[13px] !font-medium !bg-rose-600 hover:!bg-rose-700 !text-white !rounded-[12px]"
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 font-sans leading-relaxed py-1">
          Esta acción eliminará la publicación definitivamente de la comunidad.
        </p>
      </Modal>
    </div>
  );
}
