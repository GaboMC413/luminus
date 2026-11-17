import { describe, expect, it } from "vitest";
import { decodeCsvBuffer, parseLeadsCsv } from "./parseLeadsCsv";

describe("parseLeadsCsv", () => {
  it("parses Meta Lead Ads tab-separated CSV with accented headers and quoted fields", () => {
    const tsv = [
      "id\tcreated_time\tPriority\tcorreo_electrónico\tnombre_completo\tciudad\tpaís",
      'l:1\t2026-11-16T23:16:44-03:00\t"High Intent"\trfiore1956@gmail.com\t"Rita FIore"\tMontevideo\tUY',
      'l:2\t2026-11-16T12:30:19-03:00\t"High Intent"\tcharruacolonia25@gmail.com\t"Gaby Roxana Rodriguez Grimalt"\t"Colonia del Sacramento, Uruguay"\tUY',
      'l:3\t2026-11-12T06:47:37-03:00\t\trositojacqueline62@gmail.com\t"Jeanne Jacqueline Rosito Martinez"\t.\tUY',
    ].join("\n");

    const result = parseLeadsCsv(tsv);

    expect(result.totalDataRows).toBe(3);
    expect(result.skippedCount).toBe(0);
    expect(result.duplicateCount).toBe(0);
    expect(result.rows).toHaveLength(3);

    expect(result.rows[0]).toEqual({
      email: "rfiore1956@gmail.com",
      firstName: "Rita",
      lastName: "FIore",
      city: "Montevideo",
      country: "UY",
      createdAt: "2026-11-17T02:16:44.000Z",
    });

    expect(result.rows[1].city).toBe("Colonia del Sacramento, Uruguay");
    expect(result.rows[2].city).toBeUndefined();
    expect(result.rows[2].state).toBeUndefined();
  });

  it("parses comma-separated CSV, deduplicates emails, and skips invalid rows", () => {
    const csv = [
      "email,first_name,last_name,city,country",
      "Ana@Example.com,Ana,Perez,Salto,UY",
      "ana@example.com,Ana,Duplicate,Salto,UY",
      "not-an-email,Bad,Row,Montevideo,UY",
    ].join("\n");

    const result = parseLeadsCsv(csv);

    expect(result.rows).toEqual([
      {
        email: "ana@example.com",
        firstName: "Ana",
        lastName: "Perez",
        city: "Salto",
        country: "UY",
      },
    ]);
    expect(result.duplicateCount).toBe(1);
    expect(result.skippedCount).toBe(1);
  });

  it("decodes UTF-16LE buffers with BOM", () => {
    const text = "email\tnombre_completo\ntest@example.com\tJuan";
    const buf = new ArrayBuffer(2 + text.length * 2);
    const view = new Uint8Array(buf);
    view[0] = 0xff;
    view[1] = 0xfe;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      view[2 + i * 2] = code & 0xff;
      view[2 + i * 2 + 1] = code >> 8;
    }

    expect(decodeCsvBuffer(buf)).toBe(text);
  });

  it("throws a clear error when no email column is present", () => {
    expect(() => parseLeadsCsv("nombre_completo,ciudad\nAna,Montevideo")).toThrow(/email/i);
  });
});
