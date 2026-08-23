export function getSafeRedirectUrl(
  urlParam?: string | null,
  fallback: string = "/comunidad"
): string {
  if (!urlParam) return fallback;

  // Trim and decode URL if necessary
  const trimmed = urlParam.trim();

  // Ensure it is a relative path starting with a single '/' and not '//' or '/\'
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\")
  ) {
    return trimmed;
  }

  return fallback;
}
