import { describe, expect, it } from "vitest";
import {
  isValidUrl,
  normalizeInstagramInput,
  normalizeLinkedinInput,
  normalizeWebsiteUrl,
  normalizeSocialLinkByPlatform,
  resolveSocialHref,
  stripInstagramPrefix,
  stripLinkedinInPrefix,
  stripHttpsPrefix,
} from "./socialLinks";

describe("isValidUrl", () => {
  it("accepts valid http/https and domain URLs", () => {
    expect(isValidUrl("https://tusitio.com")).toBe(true);
    expect(isValidUrl("http://tusitio.com/perfil")).toBe(true);
    expect(isValidUrl("tusitio.com")).toBe(true);
    expect(isValidUrl("www.linkedin.com/in/gabriela")).toBe(true);
  });

  it("rejects bare words without TLD, spaces, and unsafe schemes", () => {
    expect(isValidUrl("ggabo33")).toBe(false);
    expect(isValidUrl("@ggabo33")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });
});

describe("normalizeInstagramInput", () => {
  it("normalizes bare usernames and @handles to canonical Instagram URLs", () => {
    expect(normalizeInstagramInput("ggabo33")).toBe("https://www.instagram.com/ggabo33");
    expect(normalizeInstagramInput("@ggabo33")).toBe("https://www.instagram.com/ggabo33");
    expect(normalizeInstagramInput("  @dr.ana_garcia  ")).toBe("https://www.instagram.com/dr.ana_garcia");
  });

  it("normalizes full Instagram URLs with or without protocol/www/query", () => {
    expect(normalizeInstagramInput("instagram.com/ggabo33")).toBe("https://www.instagram.com/ggabo33");
    expect(normalizeInstagramInput("https://www.instagram.com/ggabo33/?igsh=123")).toBe(
      "https://www.instagram.com/ggabo33"
    );
    expect(normalizeInstagramInput("https://instagr.am/ggabo33/")).toBe(
      "https://www.instagram.com/ggabo33"
    );
  });

  it("rejects non-Instagram domains, reserved paths, and invalid handles", () => {
    expect(normalizeInstagramInput("https://google.com/ggabo33")).toBeNull();
    expect(normalizeInstagramInput("https://instagram.com/p/abc123")).toBeNull();
    expect(normalizeInstagramInput("user name")).toBeNull();
    expect(normalizeInstagramInput("user..name")).toBeNull();
    expect(normalizeInstagramInput(".username")).toBeNull();
    expect(normalizeInstagramInput("")).toBeNull();
  });
});

describe("normalizeLinkedinInput", () => {
  it("normalizes LinkedIn slugs and URLs", () => {
    expect(normalizeLinkedinInput("tuperfil")).toBe("https://www.linkedin.com/in/tuperfil");
    expect(normalizeLinkedinInput("linkedin.com/in/tuperfil")).toBe(
      "https://linkedin.com/in/tuperfil"
    );
    expect(normalizeLinkedinInput("https://www.linkedin.com/in/tuperfil/")).toBe(
      "https://www.linkedin.com/in/tuperfil/"
    );
  });

  it("rejects non-LinkedIn domains or root URL without profile path", () => {
    expect(normalizeLinkedinInput("https://google.com/in/tuperfil")).toBeNull();
    expect(normalizeLinkedinInput("https://linkedin.com/")).toBeNull();
    expect(normalizeLinkedinInput("invalid space")).toBeNull();
  });
});

describe("normalizeWebsiteUrl", () => {
  it("prepends https:// when missing and preserves valid URLs", () => {
    expect(normalizeWebsiteUrl("tusitio.com")).toBe("https://tusitio.com");
    expect(normalizeWebsiteUrl("https://tusitio.com/hola")).toBe("https://tusitio.com/hola");
    expect(normalizeWebsiteUrl("ggabo33")).toBeNull();
  });
});

describe("normalizeSocialLinkByPlatform", () => {
  it("dispatches by platform name", () => {
    expect(normalizeSocialLinkByPlatform("Instagram", "ggabo33")).toBe(
      "https://www.instagram.com/ggabo33"
    );
    expect(normalizeSocialLinkByPlatform("LinkedIn", "tuperfil")).toBe(
      "https://www.linkedin.com/in/tuperfil"
    );
    expect(normalizeSocialLinkByPlatform("Website", "tusitio.com")).toBe("https://tusitio.com");
  });
});

describe("resolveSocialHref", () => {
  it("defensively resolves legacy bare Instagram handles on render", () => {
    expect(resolveSocialHref("instagram", "ggabo33")).toBe("https://www.instagram.com/ggabo33");
    expect(resolveSocialHref("instagram", "@ggabo33")).toBe("https://www.instagram.com/ggabo33");
    expect(resolveSocialHref("website", "tusitio.com")).toBe("https://tusitio.com");
    expect(resolveSocialHref("website", "notadomain")).toBe("#");
  });
});

describe("prefix stripping helpers", () => {
  it("strips prefixes cleanly for prefixed input fields", () => {
    expect(stripInstagramPrefix("https://www.instagram.com/ggabo33/")).toBe("ggabo33");
    expect(stripInstagramPrefix("@ggabo33")).toBe("ggabo33");
    expect(stripLinkedinInPrefix("https://www.linkedin.com/in/tuperfil/")).toBe("tuperfil");
    expect(stripHttpsPrefix("https://tusitio.com")).toBe("tusitio.com");
  });
});
