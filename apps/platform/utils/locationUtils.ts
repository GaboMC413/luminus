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
