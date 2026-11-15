import { describe, it, expect, vi } from "vitest";
import { slugifyProfileName, generateUniqueUserSlug } from "./slug";

describe("slugifyProfileName", () => {
  it("normalizes accents, spaces, and casing into a clean slug", () => {
    expect(slugifyProfileName("María José", "Pérez Gómez")).toBe("maria-jose-perez-gomez");
    expect(slugifyProfileName("Gabriel", "Medero")).toBe("gabriel-medero");
  });

  it("avoids reserved route segments like 'completar'", () => {
    expect(slugifyProfileName("Completar", "")).toBe("completar-perfil");
  });

  it("falls back to 'miembro' when empty", () => {
    expect(slugifyProfileName("", "")).toBe("miembro");
    expect(slugifyProfileName(null, undefined)).toBe("miembro");
  });
});

describe("generateUniqueUserSlug", () => {
  it("returns base slug when not taken", async () => {
    const prismaMock = {
      user: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as any;

    const slug = await generateUniqueUserSlug(prismaMock, "Gabriel", "Medero");
    expect(slug).toBe("gabriel-medero");
  });

  it("appends incremental suffix on collision", async () => {
    const prismaMock = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          { slug: "gabriel-medero" },
          { slug: "gabriel-medero-2" },
        ]),
      },
    } as any;

    const slug = await generateUniqueUserSlug(prismaMock, "Gabriel", "Medero");
    expect(slug).toBe("gabriel-medero-3");
  });
});
