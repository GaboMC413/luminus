import { PostItem, PostComment } from "@/components/community/mockPostsData";

const MONTH_NAMES_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

export function formatPostDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const day = d.getDate();
  const month = MONTH_NAMES_ES[d.getMonth()];

  if (sameYear) {
    return `${day} de ${month}`;
  }
  return `${day} de ${month} de ${d.getFullYear()}`;
}

export function serializePost(rawPost: any, currentUserId?: string): PostItem {
  const profile = rawPost.user?.profile;
  const authorName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    profile?.fullName ||
    rawPost.user?.email?.split("@")[0] ||
    "Usuario";

  const authorLocation = [profile?.city, profile?.country].filter(Boolean).join(", ");

  const comments: PostComment[] = (rawPost.comments || []).map((c: any) => {
    const cProfile = c.user?.profile;
    const cName =
      [cProfile?.firstName, cProfile?.lastName].filter(Boolean).join(" ").trim() ||
      cProfile?.fullName ||
      c.user?.email?.split("@")[0] ||
      "Usuario";

    const cLocation = [cProfile?.city, cProfile?.country].filter(Boolean).join(", ");

    return {
      id: c.id,
      authorId: c.userId,
      authorName: cName,
      authorAvatar: cProfile?.avatarUrl || undefined,
      authorRole: cProfile?.profession || "Miembro",
      authorLocation: cLocation || undefined,
      date: formatPostDate(c.createdAt),
      content: c.content,
    };
  });

  const likesList = rawPost.likes || [];
  const isLiked = currentUserId ? likesList.some((l: any) => l.userId === currentUserId) : false;

  return {
    id: rawPost.id,
    authorId: rawPost.userId,
    title: rawPost.title || undefined,
    authorName,
    authorAvatar: profile?.avatarUrl || undefined,
    authorRole: profile?.profession || "Miembro",
    authorLocation: authorLocation || undefined,
    date: formatPostDate(rawPost.createdAt),
    imageUrl: rawPost.imageUrl || undefined,
    imageAlt: rawPost.imageAlt || undefined,
    youtubeUrl: rawPost.youtubeUrl || undefined,
    youtubeId: rawPost.youtubeId || undefined,
    area: rawPost.category || undefined,
    areas: Array.isArray(rawPost.tags) ? rawPost.tags : [],
    content: rawPost.content,
    status: rawPost.status,
    isPinned: Boolean(rawPost.isPinned),
    pinnedAt: rawPost.pinnedAt ? new Date(rawPost.pinnedAt).toISOString() : undefined,
    isAuthorAdmin: rawPost.user?.role === "ADMIN",
    likesCount: likesList.length,
    isLiked,
    comments,
  };
}
