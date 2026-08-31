import fs from "fs";
import path from "path";

function toTitleCase(str: string): string {
  if (!str) return "";
  const cleaned = str.replace(/["'\[\]]/g, "").trim();
  if (!cleaned) return "";

  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2 && ["de", "la", "del", "el", "y", "los", "las", "da", "do", "dos", "van", "von"].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

const COUNTRY_MAP: Record<string, string> = {
  AR: "Argentina",
  ARGENTINA: "Argentina",
  CO: "Colombia",
  COLOMBIA: "Colombia",
  CL: "Chile",
  CHILE: "Chile",
  UY: "Uruguay",
  URUGUAY: "Uruguay",
  MX: "México",
  MEXICO: "México",
  ES: "España",
  ESPAÑA: "España",
  PE: "Perú",
  PERU: "Perú",
  EC: "Ecuador",
  ECUADOR: "Ecuador",
  PY: "Paraguay",
  PARAGUAY: "Paraguay",
  VE: "Venezuela",
  VENEZUELA: "Venezuela",
  BO: "Bolivia",
  BOLIVIA: "Bolivia",
  CR: "Costa Rica",
  "COSTA RICA": "Costa Rica",
  US: "Estados Unidos",
  USA: "Estados Unidos",
};

async function migrateContacts() {
  const dataDir = path.join(process.cwd(), "..", "..", ".local-data", "email-marketing");
  const contactsFile = path.join(dataDir, "contacts.json");
  const backupDir = path.join(dataDir, "backups");

  if (!fs.existsSync(contactsFile)) {
    console.error("❌ No se encontró el archivo de contactos en:", contactsFile);
    return;
  }

  // 1. Crear copia de respaldo
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `contacts-backup-${timestamp}.json`);
  fs.copyFileSync(contactsFile, backupFile);
  console.log(`🔒 Copia de seguridad guardada en: ${backupFile}`);

  // 2. Leer contactos
  const rawData = fs.readFileSync(contactsFile, "utf8");
  const contacts = JSON.parse(rawData);
  console.log(`📊 Procesando ${contacts.length} contactos...`);

  let titleCasedNamesCount = 0;
  let countryExtractedCount = 0;
  let sourceExtractedCount = 0;
  let professionExtractedCount = 0;

  const cleanedContacts = contacts.map((c: any) => {
    // Normalizar nombre y apellido
    const oldFirstName = c.firstName || "";
    const oldLastName = c.lastName || "";
    const newFirstName = toTitleCase(oldFirstName);
    const newLastName = toTitleCase(oldLastName);

    if (newFirstName !== oldFirstName || newLastName !== oldLastName) {
      titleCasedNamesCount++;
    }

    // Extraer País
    let country = c.country || "";
    const rawTags = c.tags || [];

    if (!country) {
      for (const t of rawTags) {
        const upperT = String(t).trim().toUpperCase();
        if (COUNTRY_MAP[upperT]) {
          country = COUNTRY_MAP[upperT];
          countryExtractedCount++;
          break;
        }
      }
    }

    // Extraer Origen
    let source = c.source || "";
    if (!source) {
      const tagsStr = rawTags.join(" ");
      if (tagsStr.includes("HubSpot Export") || tagsStr.includes("hubspot")) {
        source = "HubSpot";
      } else if (tagsStr.includes("Leads") || tagsStr.includes(".csv") || tagsStr.includes(".xls")) {
        source = "Meta Ads";
      } else if (tagsStr.includes("Luminus App") || tagsStr.includes("App")) {
        source = "LUMINUS App";
      } else {
        source = "CSV / Manual";
      }
      sourceExtractedCount++;
    }

    // Extraer Profesión de notas o etiquetas
    let profession = c.profession || "";
    let city = c.city || "";
    let cleanNotes = c.notes || "";

    if (!profession && cleanNotes.includes("Profesión:")) {
      const match = cleanNotes.match(/Profesión:\s*([^|]+)/i);
      if (match && match[1]) {
        profession = match[1].trim();
        professionExtractedCount++;
      }
    }
    if (!profession && cleanNotes.includes("Cargo:")) {
      const match = cleanNotes.match(/Cargo:\s*([^|]+)/i);
      if (match && match[1]) {
        profession = match[1].trim();
      }
    }
    if (!city && cleanNotes.includes("Ciudad:")) {
      const match = cleanNotes.match(/Ciudad:\s*([^|]+)/i);
      if (match && match[1]) {
        city = match[1].trim();
      }
    }

    // Limpiar y consolidar etiquetas (remover etiquetas temporales de archivos y códigos de país)
    const cleanTags: string[] = [];
    for (const t of rawTags) {
      const tagStr = String(t).trim();
      const upperT = tagStr.toUpperCase();

      // Ignorar nombres de archivos de importación y códigos de país ya migrados
      if (
        tagStr.startsWith("Importación") ||
        tagStr.endsWith(".csv") ||
        tagStr.endsWith(".xls") ||
        tagStr.endsWith(".xlsx") ||
        tagStr === "HubSpot Export" ||
        tagStr === "Pagada" ||
        tagStr === "Luminus App" ||
        COUNTRY_MAP[upperT]
      ) {
        continue;
      }

      // Conservar temas y eventos de valor
      if (tagStr.length > 0 && !cleanTags.includes(tagStr)) {
        cleanTags.push(tagStr);
      }
    }

    return {
      ...c,
      firstName: newFirstName,
      lastName: newLastName,
      country,
      city,
      profession,
      source,
      tags: cleanTags,
    };
  });

  // 3. Guardar archivo limpio
  fs.writeFileSync(contactsFile, JSON.stringify(cleanedContacts, null, 2), "utf8");

  console.log("✨ MIGRACIÓN Y LIMPIEZA FINALIZADA CON ÉXITO:");
  console.log(`- Total de contactos procesados: ${cleanedContacts.length}`);
  console.log(`- Nombres corregidos a Title Case: ${titleCasedNamesCount}`);
  console.log(`- Países extraídos a la columna dedicada: ${countryExtractedCount}`);
  console.log(`- Orígenes categorizados a la columna dedicada: ${sourceExtractedCount}`);
  console.log(`- Profesiones extraídas a la columna dedicada: ${professionExtractedCount}`);
}

migrateContacts().catch((err) => {
  console.error("❌ ERROR EN MIGRACIÓN:", err);
  process.exit(1);
});
