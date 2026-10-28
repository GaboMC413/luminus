import { describe, it, expect } from "vitest";
import { formatPostDate, serializePost } from "./posts";

describe("formatPostDate", () => {
  it("formats current year date correctly", () => {
    const now = new Date();
    const day = now.getDate();
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const month = months[now.getMonth()];
    expect(formatPostDate(now)).toBe(`${day} de ${month}`);
  });

  it("formats previous year date correctly", () => {
    const pastDate = new Date(2023, 4, 15);
    expect(formatPostDate(pastDate)).toBe("15 de may de 2023");
  });

  it("handles null or empty date gracefully", () => {
    expect(formatPostDate(null)).toBe("");
    expect(formatPostDate("invalid-date")).toBe("");
  });
});

describe("serializePost", () => {
  it("correctly transforms raw DB post to PostItem", () => {
    const rawPost = {
      id: "test-post-uuid-1",
      userId: "user-uuid-123",
      title: "Publicación de prueba",
      content: "Contenido de la publicación",
      imageUrl: "https://example.com/image.jpg",
      imageAlt: "Test image",
      youtubeUrl: null,
      youtubeId: null,
      category: "Salud Mental",
      tags: ["Salud Mental", "Bienestar"],
      status: "approved",
      createdAt: new Date(),
      user: {
        email: "carlos@example.com",
        profile: {
          firstName: "Carlos",
          lastName: "Rodríguez",
          fullName: "Carlos Rodríguez",
          avatarUrl: "https://example.com/avatar.jpg",
          profession: "Psicólogo",
          city: "Montevideo",
          country: "Uruguay",
        },
      },
      likes: [{ userId: "user-uuid-123" }],
      comments: [
        {
          id: "comment-1",
          userId: "user-uuid-456",
          content: "Excelente aporte!",
          createdAt: new Date(),
          user: {
            email: "maria@example.com",
            profile: {
              firstName: "María",
              lastName: "Gómez",
              avatarUrl: null,
              profession: null,
              city: "Canelones",
              country: "Uruguay",
            },
          },
        },
      ],
    };

    const serialized = serializePost(rawPost, "user-uuid-123");

    expect(serialized.id).toBe("test-post-uuid-1");
    expect(serialized.authorId).toBe("user-uuid-123");
    expect(serialized.title).toBe("Publicación de prueba");
    expect(serialized.authorName).toBe("Carlos Rodríguez");
    expect(serialized.authorRole).toBe("Psicólogo");
    expect(serialized.authorLocation).toBe("Montevideo, Uruguay");
    expect(serialized.imageUrl).toBe("https://example.com/image.jpg");
    expect(serialized.area).toBe("Salud Mental");
    expect(serialized.areas).toEqual(["Salud Mental", "Bienestar"]);
    expect(serialized.status).toBe("approved");
    expect(serialized.isPinned).toBe(false);
    expect(serialized.pinnedAt).toBeUndefined();
    expect(serialized.isAuthorAdmin).toBe(false);
    expect(serialized.likesCount).toBe(1);
    expect(serialized.isLiked).toBe(true);

    expect(serialized.comments.length).toBe(1);
    expect(serialized.comments[0].authorName).toBe("María Gómez");
    expect(serialized.comments[0].content).toBe("Excelente aporte!");
  });

  it("correctly handles pinned post with admin author", () => {
    const pinnedDate = new Date("2026-09-14T20:00:00.000Z");
    const rawPost = {
      id: "admin-post-1",
      userId: "admin-123",
      content: "Anuncio importante",
      status: "approved",
      isPinned: true,
      pinnedAt: pinnedDate,
      createdAt: new Date(),
      user: {
        role: "ADMIN",
        email: "admin@luminus.com",
        profile: {
          firstName: "Admin",
          lastName: "Luminus",
        },
      },
    };

    const serialized = serializePost(rawPost);
    expect(serialized.isPinned).toBe(true);
    expect(serialized.pinnedAt).toBe("2026-09-14T20:00:00.000Z");
    expect(serialized.isAuthorAdmin).toBe(true);
  });
});
