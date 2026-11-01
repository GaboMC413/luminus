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
