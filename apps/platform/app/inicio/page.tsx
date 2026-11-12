"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { FeedSkeleton, PostCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { PostItem } from "@/components/community/mockPostsData";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { RecentMembersCard } from "@/components/community/RecentMembersCard";
import { MobileMembersCarousel } from "@/components/community/MobileMembersCarousel";
import { UpcomingEventsCarousel, EventItem as CommunityEventItem } from "@/components/community/UpcomingEventsCarousel";
import { Button } from "@/components/ui/Button";
import { CardHeader } from "@/components/ui/CardHeader";
import { User, Users, UserCheck } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { formatLocationDisplay } from "@/utils/locationUtils";

export default function PlatformPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <PlatformContent />
    </Suspense>
  );
}

function PlatformContent() {
  const router = useRouter();

  // Feed Posts state (synced with database - only real approved posts)
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [toastState, setToastState] = useState<{
    title: string;
    message: string;
    type?: "success" | "error";
  } | null>(null);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await fetch(`/api/comunidad/posts?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error loading community posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const publicPosts = useMemo(
    () =>
      posts
        .filter((p) => p.status === "approved" || !p.status)
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)),
    [posts]
  );

  // Identify index of the highlighted/pinned post (or the first post as fallback)
  const highlightedIndex = useMemo(() => {
    const pinnedIdx = publicPosts.findIndex((p) => p.isPinned);
    return pinnedIdx !== -1 ? pinnedIdx : 0;
  }, [publicPosts]);

  // Latest Community Members (for right sidebar and mobile carousel)
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upcoming Events state (for feed carousel)
  const [events, setEvents] = useState<CommunityEventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // User Profile & Connections state
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [profileImgError, setProfileImgError] = useState(false);
  const [userConnections, setUserConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  // Load Current User Profile
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth/iniciar-sesion");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setCurrentUserProfile(data.profile);
        }
      } catch (err) {
        console.error("Error loading current user profile:", err);
      }
    }
    loadCurrentUser();
  }, [router]);

  // Load Connections
  useEffect(() => {
    async function loadConnections() {
      try {
        setConnectionsLoading(true);
        const res = await fetch("/api/connections");
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth/iniciar-sesion");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUserConnections(data.connections || []);
        }
      } catch (err) {
        console.error("Error loading user connections:", err);
      } finally {
        setConnectionsLoading(false);
      }
    }
    loadConnections();
  }, [router]);

  // Active Connections & Pending count
  const activeConnections = useMemo(() => {
    const accepted = userConnections.filter((c: any) => c.status === "accepted");
    return accepted.sort((a: any, b: any) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [userConnections]);

  const pendingIncomingCount = useMemo(() => {
    return userConnections.filter((c: any) => c.status === "pending" && c.direction === "incoming").length;
  }, [userConnections]);

  // Fetch Latest 10 Members for right sidebar and mobile carousel
  useEffect(() => {
    async function fetchLatestMembers() {
      try {
        setLoading(true);
        const res = await fetch(`/api/comunidad?limit=12&_t=${Date.now()}`, { cache: "no-store" });
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth/iniciar-sesion");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err: any) {
        console.error("Error al cargar miembros de la comunidad:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestMembers();
  }, [router]);

  // Fetch Upcoming Events for the feed carousel
  useEffect(() => {
    async function fetchEvents() {
      try {
        setEventsLoading(true);
        const res = await fetch(`/api/events?_t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Error al cargar eventos en la comunidad:", err);
      } finally {
        setEventsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleAddPost = async (newPost: PostItem) => {
    try {
      const res = await fetch("/api/comunidad/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          imageUrl: newPost.imageUrl,
          imageAlt: newPost.imageAlt,
          youtubeUrl: newPost.youtubeUrl,
          youtubeId: newPost.youtubeId,
          category: newPost.area,
          tags: newPost.areas,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post && (data.post.status === "approved" || !data.post.status)) {
          setPosts((prev) => [data.post, ...prev]);
          setToastState({
            title: "¡Publicación creada!",
            message: "Tu publicación ya está disponible para toda la comunidad.",
            type: "success",
          });
        } else {
          setToastState({
            title: "¡Publicación enviada!",
            message: "Tu publicación ha sido enviada con éxito y está en revisión antes de publicarse en la comunidad.",
            type: "success",
          });
        }
      } else {
        const errData = await res.json().catch(() => null);
        setToastState({
          title: "Error al publicar",
          message: errData?.error || "Error al crear la publicación.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error creating community post:", err);
      setToastState({
        title: "Error de conexión",
        message: "Error al conectar con el servidor para publicar.",
        type: "error",
      });
    }
  };

  const handleTogglePin = async (postId: string) => {
    const currentPost = posts.find((p) => p.id === postId);
    const willBePinned = !currentPost?.isPinned;

    // Optimistic update: single pinned post rule
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isPinned: willBePinned,
            pinnedAt: willBePinned ? new Date().toISOString() : undefined,
          };
        }
        if (willBePinned && p.isPinned) {
          // Unpin previous pinned post
          return { ...p, isPinned: false, pinnedAt: undefined };
        }
        return p;
      })
    );

    try {
      const res = await fetch(`/api/comunidad/posts/${postId}/pin`, {
        method: "PATCH",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) =>
            prev.map((p) => {
              if (p.id === postId) return data.post;
              if (data.post.isPinned && p.isPinned) {
                return { ...p, isPinned: false, pinnedAt: undefined };
              }
              return p;
            })
          );
        }
      } else {
        const errData = await res.json().catch(() => null);
        setToastState({
          title: "Error",
          message: errData?.message || "No se pudo actualizar el estado de fijado.",
          type: "error",
        });
        fetchPosts();
      }
    } catch (err) {
      console.error("Error toggling pin status:", err);
      fetchPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/comunidad/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        const errData = await res.json().catch(() => null);
        setToastState({
          title: "Error",
          message: errData?.error || "No se pudo eliminar la publicación.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleEditPost = async (updatedPost: PostItem) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );

    try {
      const res = await fetch(`/api/comunidad/posts/${updatedPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedPost.title,
          content: updatedPost.content,
          imageUrl: updatedPost.imageUrl,
          imageAlt: updatedPost.imageAlt,
          youtubeUrl: updatedPost.youtubeUrl,
          youtubeId: updatedPost.youtubeId,
          category: updatedPost.area,
          tags: updatedPost.areas,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) =>
            prev.map((p) => (p.id === updatedPost.id ? data.post : p))
          );
          setToastState({
            title: "¡Publicación actualizada!",
            message: "Los cambios en tu publicación se guardaron correctamente.",
            type: "success",
          });
        }
      } else {
        const errData = await res.json().catch(() => null);
        setToastState({
          title: "Error al actualizar",
          message: errData?.message || "No se pudo actualizar la publicación.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error updating community post:", err);
      setToastState({
        title: "Error de conexión",
        message: "Error al conectar con el servidor para actualizar.",
        type: "error",
      });
    }
  };

  if (!currentUserProfile && loading) {
    return <FeedSkeleton />;
  }

  return (
    <div className="flex-1 w-full flex flex-col h-full overflow-visible">
      {/* Main 3-Column Layout Container (shadow-none) */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 lg:gap-7 h-full overflow-visible pt-4 pb-12 md:py-6">

        {/* ========================================================================= */}
        {/* COLUMN 1 (LEFT): Current User Profile & Mi Red Card (Preserved)           */}
        {/* ========================================================================= */}
        <div className="hidden md:flex w-[240px] lg:w-[270px] flex-col gap-4 shrink-0 h-fit">
          {/* Card 1: Main Profile Card */}
          <div className="card-surface !p-0 overflow-hidden flex flex-col relative">
            {/* 1. Cover photo */}
            <div className="h-20 w-full relative bg-slate-100 shrink-0">
              {currentUserProfile?.cover_url ? (
                <img
                  src={currentUserProfile.cover_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200/90" />
              )}
            </div>

            {/* 2. Photo */}
            <div className="flex justify-center -mt-12 relative z-10">
              <div className="rounded-2xl overflow-hidden bg-white border-4 border-white shrink-0 flex items-center justify-center shadow-sm">
                <UserAvatar
                  src={currentUserProfile?.profile_picture_url}
                  alt={
                    currentUserProfile
                      ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() || "Usuario"
                      : "Usuario"
                  }
                  size="xl"
                />
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-4 flex flex-col items-center text-center gap-3">
              <div className="flex flex-col items-center gap-1 w-full">
                <h3
                  className="font-jakarta text-sm font-semibold text-slate-900 line-clamp-1 hover:text-slate-600 transition-colors cursor-pointer"
                  onClick={() => router.push("/perfil-usuario")}
                >
                  {currentUserProfile
                    ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() ||
                    "Usuario sin nombre"
                    : "Cargando..."}
                </h3>
                <p className="font-sans text-xs text-slate-500 font-medium truncate max-w-full">
                  {formatLocationDisplay(
                    currentUserProfile?.city && currentUserProfile?.country
                      ? `${currentUserProfile.city}, ${currentUserProfile.country}`
                      : currentUserProfile?.location || currentUserProfile?.city || currentUserProfile?.country
                  ) || "Montevideo, Uruguay"}
                </p>
              </div>

              <Button
                variant="soft"
                size="sm"
                onClick={() => router.push("/perfil-usuario")}
                className="w-full"
              >
                Ir a mi perfil
              </Button>
            </div>
          </div>

          {/* Card 2: Mi Red (Quick connections preview) */}
          <div className="card-surface flex flex-col gap-3">
            <CardHeader title="Mi red" />

            {connectionsLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="w-10 h-10 rounded-xl" />
                ))}
              </div>
            ) : activeConnections.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center font-sans">
                Aún no tienes conexiones.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {activeConnections.slice(0, 12).map((conn: any) => (
                  <div
                    key={conn.id}
                    onClick={() => router.push(`/inicio/public-profile?id=${conn.user.id}&from=inicio`)}
                    className="relative group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors duration-200 flex items-center justify-center shrink-0">
                      {conn.user.avatar ? (
                        <img
                          src={conn.user.avatar}
                          alt={conn.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="soft"
              size="sm"
              onClick={() => router.push("/red")}
              className="w-full"
            >
              Ver mi red
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2 (CENTER): Community Announcements & Posts Feed                   */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 max-w-2xl flex flex-col gap-4">
          {/* Section Heading: Exact canonical in-app page title token */}
          <div className="shrink-0 pt-0.5">
            <h1 className="font-jakarta font-bold text-slate-900 tracking-tight text-xl sm:text-2xl m-0 leading-tight">
              Comunidad
            </h1>
          </div>

          {/* 1. Create Post Input (with mobile quick action square buttons) */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full">
            <div className="flex-1 min-w-0">
              <CreatePostCard
                currentUserProfile={currentUserProfile}
                onAddPost={handleAddPost}
              />
            </div>

            {/* Mobile quick actions: Mi red and Miembros */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => router.push("/red")}
                title="Mi red"
                aria-label="Mi red"
                className="w-11 h-11 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-none active:scale-95"
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/inicio/miembros")}
                title="Miembros"
                aria-label="Miembros"
                className="w-11 h-11 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-none active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Posts Stream & Embedded Carousels in Exact 5-Slot Order */}
          <div className="flex flex-col gap-4">
            {postsLoading ? (
              <div className="flex flex-col gap-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : publicPosts.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="md:hidden">
                  <MobileMembersCarousel members={users} loading={loading} />
                </div>
                <UpcomingEventsCarousel events={events} loading={eventsLoading} />
                <EmptyState
                  title="No hay publicaciones visibles aún"
                  description="Sé la primera persona en compartir una reflexión, pregunta o experiencia con la comunidad."
                />
              </div>
            ) : (
              <>
                {/* Slot 1: Highlighted / Pinned Post (or first post) */}
                {publicPosts[0] && (
                  <PostCard
                    key={publicPosts[0].id}
                    post={publicPosts[0]}
                    currentUserProfile={currentUserProfile}
                    onDeletePost={handleDeletePost}
                    onEditPost={handleEditPost}
                    onTogglePin={handleTogglePin}
                  />
                )}

                {/* Slot 2: New Members Carousel (Mobile only) */}
                <div className="md:hidden">
                  <MobileMembersCarousel members={users} loading={loading} />
                </div>

                {/* Slot 3: User Most Recent Post (Post #2) */}
                {publicPosts[1] && (
                  <PostCard
                    key={publicPosts[1].id}
                    post={publicPosts[1]}
                    currentUserProfile={currentUserProfile}
                    onDeletePost={handleDeletePost}
                    onEditPost={handleEditPost}
                    onTogglePin={handleTogglePin}
                  />
                )}

                {/* Slot 4: Próximas Actividades Carousel */}
                <UpcomingEventsCarousel events={events} loading={eventsLoading} />

                {/* Slot 5: Remaining User Posts (Newest first) */}
                {publicPosts.slice(2).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserProfile={currentUserProfile}
                    onDeletePost={handleDeletePost}
                    onEditPost={handleEditPost}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* COLUMN 3 (RIGHT): Latest 10 Community Members + 'Ver todos los miembros'  */}
        {/* ========================================================================= */}
        <aside className="hidden lg:flex w-[260px] xl:w-[290px] flex-col gap-4 shrink-0 h-fit">
          <RecentMembersCard
            members={users}
            loading={loading}
            onViewAllMembers={() => router.push("/inicio/miembros")}
          />
        </aside>
      </div>

      {/* Floating Notification Toast */}
      <Toast
        isOpen={Boolean(toastState)}
        onClose={() => setToastState(null)}
        title={toastState?.title || "Notificación"}
        message={toastState?.message || ""}
        type={toastState?.type || "success"}
        autoCloseMs={5000}
      />
    </div>
  );
}
