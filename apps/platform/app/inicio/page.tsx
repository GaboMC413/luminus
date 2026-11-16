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
import { LatestSpecialistsCarousel, SpecialistCarouselItem } from "@/components/community/LatestSpecialistsCarousel";
import { RecentRecordingsCarousel } from "@/components/community/RecentRecordingsCarousel";
import { FeedAnnouncementCard } from "@/components/community/FeedAnnouncementCard";
import { RecordingItem } from "@/components/events/RecordingCard";
import { Button } from "@/components/ui/Button";
import { CardHeader } from "@/components/ui/CardHeader";
import { User, GraphStar, UserRoundGroup, HeartHandshake, HouseHeart, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { formatLocationDisplay } from "@/utils/locationUtils";
import {
  getCachedData,
  setCachedData,
  fetchWithCache,
} from "@/lib/clientCache";

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
  const [posts, setPosts] = useState<PostItem[]>(
    () => getCachedData<PostItem[]>("/api/comunidad/posts") ?? []
  );
  const [postsLoading, setPostsLoading] = useState<boolean>(
    () => !getCachedData<PostItem[]>("/api/comunidad/posts")
  );
  const [toastState, setToastState] = useState<{
    title: string;
    message: string;
    type?: "success" | "error";
  } | null>(null);

  const fetchPosts = async (force = false) => {
    try {
      if (!getCachedData<PostItem[]>("/api/comunidad/posts")) {
        setPostsLoading(true);
      }
      const fetchedPosts = await fetchWithCache(
        "/api/comunidad/posts",
        async () => {
          const res = await fetch("/api/comunidad/posts");
          if (!res.ok) return getCachedData<PostItem[]>("/api/comunidad/posts") ?? [];
          const data = await res.json();
          return (data.posts || []) as PostItem[];
        },
        { ttlMs: 60_000, force }
      );
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error loading community posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(false);
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
  const [users, setUsers] = useState<any[]>(
    () => getCachedData<any[]>("/api/comunidad?limit=12") ?? []
  );
  const [loading, setLoading] = useState<boolean>(
    () => !getCachedData<any[]>("/api/comunidad?limit=12")
  );

  // Upcoming Events state (for feed carousel)
  const [events, setEvents] = useState<CommunityEventItem[]>(
    () => getCachedData<CommunityEventItem[]>("/api/events") ?? []
  );
  const [eventsLoading, setEventsLoading] = useState<boolean>(
    () => !getCachedData<CommunityEventItem[]>("/api/events")
  );

  // Latest Specialists state (for feed carousel)
  const [specialists, setSpecialists] = useState<SpecialistCarouselItem[]>(
    () => getCachedData<SpecialistCarouselItem[]>("/api/especialistas") ?? []
  );
  const [specialistsLoading, setSpecialistsLoading] = useState<boolean>(
    () => !getCachedData<SpecialistCarouselItem[]>("/api/especialistas")
  );

  // Recent Recordings state (for feed carousel)
  const [recordings, setRecordings] = useState<RecordingItem[]>(
    () => getCachedData<RecordingItem[]>("/api/events?type=past") ?? []
  );
  const [recordingsLoading, setRecordingsLoading] = useState<boolean>(
    () => !getCachedData<RecordingItem[]>("/api/events?type=past")
  );

  // User Profile & Connections state
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(
    () => getCachedData<any>("/api/profile")?.profile ?? null
  );
  const [profileImgError, setProfileImgError] = useState(false);
  const [userConnections, setUserConnections] = useState<any[]>(() => {
    const cached = getCachedData<any>("/api/connections");
    return cached ? cached.contacts || cached.connections || [] : [];
  });
  const [followedSpecialists, setFollowedSpecialists] = useState<any[]>(
    () => getCachedData<any[]>("/api/follows") ?? []
  );
  const [connectionsLoading, setConnectionsLoading] = useState<boolean>(
    () => !getCachedData<any>("/api/connections") && !getCachedData<any[]>("/api/follows")
  );

  // Load Current User Profile
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const data = await fetchWithCache(
          "/api/profile",
          async () => {
            const res = await fetch("/api/profile");
            if (res.status === 401 || res.status === 403) {
              router.replace("/auth/iniciar-sesion");
              return null;
            }
            if (!res.ok) return getCachedData<any>("/api/profile") ?? null;
            return res.json();
          },
          { ttlMs: 120_000 }
        );
        if (data?.profile) {
          setCurrentUserProfile(data.profile);
        }
      } catch (err) {
        console.error("Error loading current user profile:", err);
      }
    }
    loadCurrentUser();
  }, [router]);

  // Load Connections & Followed Specialists
  useEffect(() => {
    async function loadConnections() {
      try {
        if (!getCachedData<any>("/api/connections")) {
          setConnectionsLoading(true);
        }
        const [connData, followData] = await Promise.all([
          fetchWithCache(
            "/api/connections",
            async () => {
              const connRes = await fetch("/api/connections");
              if (connRes.status === 401 || connRes.status === 403) {
                router.replace("/auth/iniciar-sesion");
                return null;
              }
              if (!connRes.ok) return getCachedData<any>("/api/connections") ?? null;
              return connRes.json();
            },
            { ttlMs: 60_000 }
          ),
          fetchWithCache(
            "/api/follows",
            async () => {
              const followRes = await fetch("/api/follows");
              if (followRes.status === 401 || followRes.status === 403) {
                router.replace("/auth/iniciar-sesion");
                return [];
              }
              if (!followRes.ok) return getCachedData<any[]>("/api/follows") ?? [];
              const parsed = await followRes.json();
              return parsed.following || [];
            },
            { ttlMs: 60_000 }
          ),
        ]);
        if (connData) {
          setUserConnections(connData.contacts || connData.connections || []);
        }
        if (followData) {
          setFollowedSpecialists(followData);
        }
      } catch (err) {
        console.error("Error loading user connections:", err);
      } finally {
        setConnectionsLoading(false);
      }
    }
    loadConnections();
  }, [router]);

  // Active Mutual Contacts (deduplicated by user.id)
  const activeConnections = useMemo(() => {
    const accepted = userConnections.filter((c: any) => c.status === "accepted");
    const sorted = accepted.sort((a: any, b: any) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
    const seen = new Set<string>();
    return sorted.filter((c: any) => {
      const uid = c?.user?.id;
      if (!uid || seen.has(uid)) return false;
      seen.add(uid);
      return true;
    });
  }, [userConnections]);


  // Fetch Latest 10 Members for right sidebar and mobile carousel
  useEffect(() => {
    async function fetchLatestMembers() {
      try {
        if (!getCachedData<any[]>("/api/comunidad?limit=12")) {
          setLoading(true);
        }
        const members = await fetchWithCache(
          "/api/comunidad?limit=12",
          async () => {
            const res = await fetch("/api/comunidad?limit=12");
            if (res.status === 401 || res.status === 403) {
              router.replace("/auth/iniciar-sesion");
              return [];
            }
            if (!res.ok) return getCachedData<any[]>("/api/comunidad?limit=12") ?? [];
            const data = await res.json();
            return data.users || [];
          },
          { ttlMs: 60_000 }
        );
        setUsers(members);
      } catch (err: any) {
        console.error("Error al cargar miembros de la comunidad:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestMembers();
  }, [router]);

  // Fetch Upcoming Events, Latest Specialists, and Recent Recordings for feed carousels
  useEffect(() => {
    async function fetchFeedCarousels() {
      try {
        if (!getCachedData<CommunityEventItem[]>("/api/events")) setEventsLoading(true);
        if (!getCachedData<SpecialistCarouselItem[]>("/api/especialistas")) setSpecialistsLoading(true);
        if (!getCachedData<RecordingItem[]>("/api/events?type=past")) setRecordingsLoading(true);

        const [upcoming, fetchedSpecialists, pastRecordings] = await Promise.all([
          fetchWithCache(
            "/api/events",
            async () => {
              const res = await fetch("/api/events");
              if (!res.ok) return getCachedData<CommunityEventItem[]>("/api/events") ?? [];
              const data = await res.json();
              return (data.events || []) as CommunityEventItem[];
            },
            { ttlMs: 60_000 }
          ),
          fetchWithCache(
            "/api/especialistas",
            async () => {
              const res = await fetch("/api/especialistas");
              if (!res.ok) return getCachedData<SpecialistCarouselItem[]>("/api/especialistas") ?? [];
              const data = await res.json();
              return (data.specialists || []) as SpecialistCarouselItem[];
            },
            { ttlMs: 60_000 }
          ),
          fetchWithCache(
            "/api/events?type=past",
            async () => {
              const res = await fetch("/api/events?type=past");
              if (!res.ok) return getCachedData<RecordingItem[]>("/api/events?type=past") ?? [];
              const data = await res.json();
              return (data.events || []) as RecordingItem[];
            },
            { ttlMs: 60_000 }
          ),
        ]);

        setEvents(upcoming);
        setSpecialists(fetchedSpecialists);
        setRecordings(pastRecordings);
      } catch (err) {
        console.error("Error al cargar carruseles de la comunidad:", err);
      } finally {
        setEventsLoading(false);
        setSpecialistsLoading(false);
        setRecordingsLoading(false);
      }
    }
    fetchFeedCarousels();
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
          createdAt: newPost.createdAt,
          postAsOfficial: newPost.isOfficial,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post && (data.post.status === "approved" || !data.post.status)) {
          setPosts((prev) => {
            const next = [data.post, ...prev].sort((a, b) => {
              if ((b.isPinned ? 1 : 0) !== (a.isPinned ? 1 : 0)) {
                return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
              }
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
            setCachedData("/api/comunidad/posts", next);
            return next;
          });
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
          setPosts((prev) => {
            const next = prev.map((p) => {
              if (p.id === postId) return data.post;
              if (data.post.isPinned && p.isPinned) {
                return { ...p, isPinned: false, pinnedAt: undefined };
              }
              return p;
            });
            setCachedData("/api/comunidad/posts", next);
            return next;
          });
        }
      } else {
        const errData = await res.json().catch(() => null);
        setToastState({
          title: "Error",
          message: errData?.message || "No se pudo actualizar el estado de fijado.",
          type: "error",
        });
        fetchPosts(true);
      }
    } catch (err) {
      console.error("Error toggling pin status:", err);
      fetchPosts(true);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/comunidad/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => {
          const next = prev.filter((p) => p.id !== postId);
          setCachedData("/api/comunidad/posts", next);
          return next;
        });
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
    setPosts((prev) => {
      const next = prev.map((p) => (p.id === updatedPost.id ? updatedPost : p));
      setCachedData("/api/comunidad/posts", next);
      return next;
    });

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
          setPosts((prev) => {
            const next = prev.map((p) => (p.id === updatedPost.id ? data.post : p));
            setCachedData("/api/comunidad/posts", next);
            return next;
          });
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

  const isProfileLoading = !currentUserProfile && loading;

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
              {isProfileLoading ? (
                <div className="flex flex-col items-center gap-1.5 w-full py-0.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 w-full">
                  <h3
                    className="font-jakarta text-sm font-semibold text-slate-900 line-clamp-1 hover:text-slate-600 transition-colors cursor-pointer"
                    onClick={() => router.push("/perfil-usuario")}
                  >
                    {currentUserProfile
                      ? `${currentUserProfile.first_name || ""} ${currentUserProfile.last_name || ""}`.trim() ||
                      "Usuario sin nombre"
                      : "Usuario"}
                  </h3>
                  <p className="font-sans text-xs text-slate-500 font-medium truncate max-w-full">
                    {formatLocationDisplay(
                      currentUserProfile?.city && currentUserProfile?.country
                        ? `${currentUserProfile.city}, ${currentUserProfile.country}`
                        : currentUserProfile?.location || currentUserProfile?.city || currentUserProfile?.country
                    ) || "Montevideo, Uruguay"}
                  </p>
                </div>
              )}

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
              <div className="grid grid-cols-5 gap-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="w-full aspect-square rounded-xl" />
                ))}
              </div>
            ) : activeConnections.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center font-sans">
                Aún no tienes contactos en tu red.
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {activeConnections.slice(0, 15).map((conn: any) => (
                  <div
                    key={conn.user.id}
                    onClick={() => router.push(`/perfil/${(conn.user as any).slug || conn.user.id}?from=inicio`)}
                    className="relative group cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors duration-200 flex items-center justify-center">
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

            {!connectionsLoading && followedSpecialists.length > 0 && (
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-500 font-jakarta">
                  Especialistas que sigo
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {followedSpecialists.slice(0, 10).map((item: any) => (
                    <div
                      key={item.user.id}
                      onClick={() => router.push(`/perfil/${(item.user as any).slug || item.user.id}?from=inicio`)}
                      className="relative group cursor-pointer"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors duration-200 flex items-center justify-center">
                        {item.user.avatar ? (
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                <GraphStar className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/inicio/miembros")}
                title="Miembros"
                aria-label="Miembros"
                className="w-11 h-11 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-none active:scale-95"
              >
                <UserRoundGroup className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Posts Stream & Embedded Carousels / Announcements */}
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
                <LatestSpecialistsCarousel specialists={specialists} loading={specialistsLoading} />
                <RecentRecordingsCarousel recordings={recordings} loading={recordingsLoading} />
                <EmptyState
                  title="No hay publicaciones visibles aún"
                  description="Sé la primera persona en compartir una reflexión, pregunta o experiencia con la comunidad."
                />
              </div>
            ) : (
              (() => {
                const feedSlots: Record<number, React.ReactNode> = {
                  0: (
                    <div className="md:hidden">
                      <MobileMembersCarousel members={users} loading={loading} />
                    </div>
                  ),
                  1: <UpcomingEventsCarousel events={events} loading={eventsLoading} />,
                  2: <LatestSpecialistsCarousel specialists={specialists} loading={specialistsLoading} />,
                  3: <RecentRecordingsCarousel recordings={recordings} loading={recordingsLoading} />,
                  4: (
                    <FeedAnnouncementCard
                      eyebrow="Especialistas LUMINUS"
                      title="Sé especialista en LUMINUS"
                      description="Comparte tu práctica, acompaña a personas de toda LATAM y forma parte de nuestra red de bienestar."
                      ctaLabel="Postularme"
                      ctaHref="/especialistas/unirme"
                      icon={HeartHandshake}
                    />
                  ),
                  5: (
                    <FeedAnnouncementCard
                      eyebrow="Espacios LUMINUS"
                      title="Suma tu espacio a LUMINUS"
                      description="¿Tienes o conoces un centro, consultorio o espacio de bienestar? Cuéntanos para sumarlo a la plataforma."
                      ctaLabel="Sumar espacio"
                      ctaHref="/contacto?motivo=espacios"
                      icon={HouseHeart}
                    />
                  ),
                  6: (
                    <FeedAnnouncementCard
                      eyebrow="Tu opinión nos importa"
                      title="¿Quieres sugerir algo?"
                      description="Ponte en contacto con nosotros para compartir ideas, mejoras o propuestas para la comunidad."
                      ctaLabel="Escríbenos"
                      ctaHref="/contacto?motivo=comentarios"
                      icon={MessageSquare}
                    />
                  ),
                };

                const trailingSlots = Object.entries(feedSlots)
                  .filter(([idx]) => Number(idx) >= publicPosts.length)
                  .map(([idx, node]) => <Fragment key={`slot-trailing-${idx}`}>{node}</Fragment>);

                return (
                  <>
                    {publicPosts.map((post, idx) => (
                      <Fragment key={post.id}>
                        <PostCard
                          post={post}
                          currentUserProfile={currentUserProfile}
                          onDeletePost={handleDeletePost}
                          onEditPost={handleEditPost}
                          onTogglePin={handleTogglePin}
                        />
                        {feedSlots[idx]}
                      </Fragment>
                    ))}
                    {trailingSlots}
                  </>
                );
              })()
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
