export function sanitizeMessageBody(text: string): string {
  if (!text) return "";

  let sanitized = text;
  let previous;
  const tagRegex = /<[^>]*>/g;

  // Recursively strip HTML tags to prevent nested tag injection
  do {
    previous = sanitized;
    sanitized = sanitized.replace(tagRegex, "");
  } while (sanitized !== previous);

  // Collapse consecutive newlines to a maximum of 3
  sanitized = sanitized.replace(/\n{4,}/g, "\n\n\n");

  return sanitized.trim();
}
