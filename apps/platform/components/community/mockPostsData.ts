export interface PostComment {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  authorLocation?: string;
  date: string;
  content: string;
}

export interface PostItem {
  id: string;
  authorId?: string;
  title?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  authorLocation?: string;
  isOfficial?: boolean;
  date: string;
  imageUrl?: string;
  imageAlt?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  area?: string;
  areas?: string[];
  content: string;
  status?: "approved" | "pending" | "rejected";
  likesCount?: number;
  isLiked?: boolean;
  comments: PostComment[];
}

export const INITIAL_MOCK_POSTS: PostItem[] = [];

export const POSTS_STORAGE_KEY = "luminus_community_posts_data_v1";

const LEGACY_MOCK_IDS = new Set([
  "post-1",
  "post-2",
  "post-3",
  "post-pending-1",
  "post-pending-2",
]);

const LEGACY_MOCK_AUTHORS = new Set([
  "Equipo Luminus",
  "Dra. Valeria Gómez",
  "Santiago Morales",
  "Lic. Martín Navarro",
  "Camila Rivas",
  "Elena Benítez",
  "Dr. Gonzalo Varela",
  "Lucía Fernández",
]);

export function getStoredCommunityPosts(): PostItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any fake/mock post items
      const realOnly = parsed.filter((p: PostItem) => {
        if (!p || !p.id) return false;
        if (LEGACY_MOCK_IDS.has(p.id)) return false;
        if (p.authorId?.startsWith("mock-")) return false;
        if (LEGACY_MOCK_AUTHORS.has(p.authorName)) return false;
        return true;
      });

      // Update localStorage if mock posts were purged
      if (realOnly.length !== parsed.length) {
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(realOnly));
      }

      return realOnly;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredCommunityPosts(posts: PostItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error("Failed to save community posts to localStorage", err);
  }
}
