export interface ParsedLeadRow {
  email: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt?: string;
}

export interface ParseLeadsCsvResult {
  rows: ParsedLeadRow[];
  skippedCount: number;
  duplicateCount: number;
  totalDataRows: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HEADER_ALIASES: Record<keyof Omit<ParsedLeadRow, "createdAt"> | "fullName" | "createdAt", string[]> = {
  email: ["correo_electronico", "email", "correo", "e_mail"],
  fullName: ["nombre_completo", "full_name", "name"],
  firstName: ["first_name", "nombre", "primer_nombre"],
  lastName: ["last_name", "apellido", "apellidos"],
  city: ["ciudad", "city"],
  state: ["provincia", "estado", "state"],
  country: ["pais", "country"],
  createdAt: ["created_time", "created_at", "fecha"],
};

export function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let text: string;

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    text = new TextDecoder("utf-16le").decode(bytes);
  } else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    text = new TextDecoder("utf-16be").decode(bytes);
  } else {
    text = new TextDecoder("utf-8").decode(bytes);
  }

  return text.replace(/^\uFEFF/, "");
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function detectDelimiter(headerLine: string): string {
  const counts: Record<string, number> = { "\t": 0, ",": 0, ";": 0 };
  let inQuotes = false;

  for (let i = 0; i < headerLine.length; i++) {
    const ch = headerLine[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && ch in counts) {
      counts[ch]++;
    }
  }

  if (counts["\t"] >= counts[","] && counts["\t"] >= counts[";"] && counts["\t"] > 0) return "\t";
  if (counts[";"] > counts[","]) return ";";
  return ",";
}

function parseDelimitedRows(text: string): string[][] {
  const firstNewline = text.search(/\r?\n/);
  const headerLine = firstNewline === -1 ? text : text.slice(0, firstNewline);
  const delimiter = detectDelimiter(headerLine);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function cleanOptionalText(val?: string): string | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();
  if (!trimmed || trimmed === "." || trimmed === "-" || trimmed.toLowerCase() === "n/a") {
    return undefined;
  }
  return trimmed;
}

function splitFullName(fullName: string): { firstName?: string; lastName?: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return {};
  const spaceIdx = trimmed.search(/\s+/);
  if (spaceIdx === -1) return { firstName: trimmed };
  return {
    firstName: trimmed.slice(0, spaceIdx),
    lastName: trimmed.slice(spaceIdx).trim() || undefined,
  };
}

export function parseLeadsCsv(text: string): ParseLeadsCsvResult {
  const table = parseDelimitedRows(text.replace(/^\uFEFF/, ""));
  if (table.length < 2) {
    return { rows: [], skippedCount: 0, duplicateCount: 0, totalDataRows: 0 };
  }

  const headers = table[0].map(normalizeHeader);
  const colIndex = (aliases: string[]) => headers.findIndex((h) => aliases.includes(h));

  const idx = {
    email: colIndex(HEADER_ALIASES.email),
    fullName: colIndex(HEADER_ALIASES.fullName),
    firstName: colIndex(HEADER_ALIASES.firstName),
    lastName: colIndex(HEADER_ALIASES.lastName),
    city: colIndex(HEADER_ALIASES.city),
    state: colIndex(HEADER_ALIASES.state),
    country: colIndex(HEADER_ALIASES.country),
    createdAt: colIndex(HEADER_ALIASES.createdAt),
  };

  if (idx.email === -1) {
    throw new Error("No se encontró la columna de email (correo_electrónico o email).");
  }

  const seenEmails = new Set<string>();
  const rows: ParsedLeadRow[] = [];
  let skippedCount = 0;
  let duplicateCount = 0;
  const totalDataRows = table.length - 1;

  for (let i = 1; i < table.length; i++) {
    const rawRow = table[i];
    const rawEmail = (rawRow[idx.email] || "").trim().toLowerCase();

    if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
      skippedCount++;
      continue;
    }

    if (seenEmails.has(rawEmail)) {
      duplicateCount++;
      continue;
    }
    seenEmails.add(rawEmail);

    let firstName = idx.firstName !== -1 ? cleanOptionalText(rawRow[idx.firstName]) : undefined;
    let lastName = idx.lastName !== -1 ? cleanOptionalText(rawRow[idx.lastName]) : undefined;

    if (!firstName && idx.fullName !== -1) {
      const split = splitFullName(rawRow[idx.fullName] || "");
      firstName = split.firstName;
      lastName = lastName ?? split.lastName;
    }

    const city = idx.city !== -1 ? cleanOptionalText(rawRow[idx.city]) : undefined;
    const state = idx.state !== -1 ? cleanOptionalText(rawRow[idx.state]) : undefined;
    const country = idx.country !== -1 ? cleanOptionalText(rawRow[idx.country]) : undefined;

    let createdAt: string | undefined;
    if (idx.createdAt !== -1) {
      const rawDate = (rawRow[idx.createdAt] || "").trim();
      if (rawDate && !Number.isNaN(Date.parse(rawDate))) {
        createdAt = new Date(rawDate).toISOString();
      }
    }

    rows.push({
      email: rawEmail,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(city ? { city } : {}),
      ...(state ? { state } : {}),
      ...(country ? { country } : {}),
      ...(createdAt ? { createdAt } : {}),
    });
  }

  return { rows, skippedCount, duplicateCount, totalDataRows };
}
