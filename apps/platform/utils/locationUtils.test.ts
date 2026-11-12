import { describe, it, expect } from "vitest";
import { formatSpaceAddress, formatLocationDisplay } from "./locationUtils";

describe("locationUtils", () => {
  describe("formatLocationDisplay", () => {
    it("formats standard City, Country location string", () => {
      expect(formatLocationDisplay("Palermo, Buenos Aires, Argentina")).toBe("Palermo, Argentina");
      expect(formatLocationDisplay("Montevideo, Uruguay")).toBe("Montevideo, Uruguay");
    });

    it("handles single-part or empty locations", () => {
      expect(formatLocationDisplay("Uruguay")).toBe("Uruguay");
      expect(formatLocationDisplay("")).toBe("");
      expect(formatLocationDisplay(null)).toBe("");
    });
  });

  describe("formatSpaceAddress", () => {
    it("strips 'Departamento de ...' and prevents appending duplicate city and country", () => {
      const rawAddress = "Juan D. Jackson 1220, 11200 Montevideo, Departamento de Montevideo, Uruguay";
      const result = formatSpaceAddress(rawAddress, "Montevideo", "Uruguay");
      expect(result).toBe("Juan D. Jackson 1220, 11200 Montevideo, Uruguay");
    });

    it("appends city and country when missing from the address", () => {
      const rawAddress = "Av. Corrientes 1234";
      const result = formatSpaceAddress(rawAddress, "Buenos Aires", "Argentina");
      expect(result).toBe("Av. Corrientes 1234, Buenos Aires, Argentina");
    });

    it("handles empty address by combining city and country", () => {
      expect(formatSpaceAddress("", "Montevideo", "Uruguay")).toBe("Montevideo, Uruguay");
      expect(formatSpaceAddress(null, "Santiago", "Chile")).toBe("Santiago, Chile");
    });

    it("handles completely empty inputs safely", () => {
      expect(formatSpaceAddress(null, null, null)).toBe("");
      expect(formatSpaceAddress("", "", "")).toBe("");
    });
  });
});
