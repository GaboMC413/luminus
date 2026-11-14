export const LATAM_COUNTRIES = [
  "Argentina",
  "Chile",
  "Uruguay",
  "Paraguay",
  "Bolivia",
  "Perú",
  "Peru",
  "Colombia",
  "Ecuador",
  "Venezuela",
  "México",
  "Mexico",
  "Costa Rica",
  "Panamá",
  "Panama",
  "Guatemala",
  "El Salvador",
  "Honduras",
  "Nicaragua",
  "República Dominicana",
  "Republica Dominicana",
  "Puerto Rico",
  "Cuba",
  "Brasil",
  "Brazil",
];

export const LATAM_COUNTRY_CODES = new Set([
  "AR", "CL", "UY", "PY", "BO", "PE", "CO", "EC", "VE",
  "MX", "CR", "PA", "GT", "SV", "HN", "NI", "DO", "PR", "CU", "BR"
]);

/**
 * Standardizes a location string to always format as "City, Country"
 * e.g., "Palermo, Buenos Aires, Argentina" -> "Palermo, Argentina"
 *       "Montevideo, Uruguay" -> "Montevideo, Uruguay"
 *       "20 de Noviembre, México" -> "20 de Noviembre, México"
 */
export function formatLocationDisplay(location?: string | null): string {
  if (!location) return "";
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return location.trim();
  return `${parts[0]}, ${parts[parts.length - 1]}`;
}

/**
 * Formats a physical space address cleanly without Google Places duplicate artifacts
 * (e.g. "Departamento de ...", repeated city or country).
 * e.g. ("Juan D. Jackson 1220, 11200 Montevideo, Departamento de Montevideo, Uruguay", "Montevideo", "Uruguay")
 *   -> "Juan D. Jackson 1220, 11200 Montevideo, Uruguay"
 */
export function formatSpaceAddress(
  address?: string | null,
  city?: string | null,
  country?: string | null
): string {
  const cleanAddr = (address || "").trim();
  const cleanCity = (city || "").trim();
  const cleanCountry = (country || "").trim();

  if (!cleanAddr && !cleanCity && !cleanCountry) return "";
  if (!cleanAddr) {
    return [cleanCity, cleanCountry].filter(Boolean).join(", ");
  }

  // Split address into comma-separated segments
  const rawParts = cleanAddr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // Filter out redundant administrative subdivision segments (Departamento de ..., Provincia de ..., etc.)
  const adminRegex = /^(departamento|provincia|estado|regi[oó]n)\s+(de\s+|metropolitana\b)/i;
  const filteredParts = rawParts.filter((part) => !adminRegex.test(part));

  // Build a normalized representation to check for existing city and country
  const fullTextNormalized = filteredParts.join(" ").toLowerCase();

  const finalParts = [...filteredParts];

  // Append city only if not already present in the address
  if (cleanCity && !fullTextNormalized.includes(cleanCity.toLowerCase())) {
    finalParts.push(cleanCity);
  }

  // Append country only if not already present in the address
  if (cleanCountry && !fullTextNormalized.includes(cleanCountry.toLowerCase())) {
    finalParts.push(cleanCountry);
  }

  // Deduplicate case-insensitively while preserving original casing
  const uniqueParts: string[] = [];
  for (const part of finalParts) {
    if (!uniqueParts.some((existing) => existing.toLowerCase() === part.toLowerCase())) {
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(", ");
}

/**
 * Reordena las predicciones de Google Places para que los países de Latinoamérica aparezcan primero.
 */
export function sortLatamFirst<T extends { description?: string; secondary_text?: string; structured_formatting?: { secondary_text?: string } }>(
  items: T[]
): T[] {
  if (!items || items.length === 0) return items;

  const isLatam = (item: T): boolean => {
    const textToCheck = [
      item.secondary_text,
      item.structured_formatting?.secondary_text,
      item.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return LATAM_COUNTRIES.some((country) =>
      textToCheck.includes(country.toLowerCase())
    );
  };

  const latamItems: T[] = [];
  const otherItems: T[] = [];

  for (const item of items) {
    if (isLatam(item)) {
      latamItems.push(item);
    } else {
      otherItems.push(item);
    }
  }

  return [...latamItems, ...otherItems];
}
