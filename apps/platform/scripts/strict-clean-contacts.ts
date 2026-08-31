import fs from "fs";
import path from "path";

// Diccionario estricto para categorización de profesiones
function normalizeProfession(raw: string): string {
  if (!raw) return "";
  const s = raw.toLowerCase().trim();

  // Basura / Comentarios / Preguntas a ignorar
  if (
    s.length <= 1 ||
    ["no", "si", "ok", "nn", "c", "b", "it", "mi", "mis", "ki", "dos", "info", "ooo", "hila", "35.0", "...", "hshdhd", "hjklll", "fhjkk", "fghhh", "ksks", "b c. k", "z,"].includes(s) ||
    s.includes("parqueadero") ||
    s.includes("dolores en el pecho") ||
    s.includes("pregunta") ||
    s.includes("imagen") ||
    s.includes("novio") ||
    s.includes("por favor") ||
    s.includes("conferencia") ||
    s.startsWith("3.")
  ) {
    return "";
  }

  // 1. Médicos / Doctores
  if (
    s.includes("médic") ||
    s.includes("medico") ||
    s.includes("medica") ||
    s.includes("doctor") ||
    s.includes("dokter") ||
    s.includes("pediatra") ||
    s.includes("dermatolog") ||
    s.includes("anestesiolog") ||
    s.includes("geriatra") ||
    s.includes("internista") ||
    s.includes("neuropediatra") ||
    s.includes("md docente") ||
    s.includes("med ")
  ) {
    return "Médico / Doctor";
  }

  // 2. Psicólogos
  if (s.includes("psicól") || s.includes("psicol") || s.includes("psicopeda")) {
    return "Psicólogo";
  }

  // 3. Nutricionistas
  if (s.includes("nutricion") || s.includes("alimentos")) {
    return "Nutricionista";
  }

  // 4. Odontólogos / Dentistas
  if (s.includes("odontól") || s.includes("odontol") || s.includes("dentista")) {
    return "Odontólogo";
  }

  // 5. Fisioterapeutas / Kinesiólogos
  if (s.includes("fisioterap") || s.includes("kinesiól") || s.includes("kinesiol") || s.includes("reflexolog") || s.includes("perfusionista")) {
    return "Fisioterapeuta / Kinesiólogo";
  }

  // 6. Enfermeros / Auxiliares
  if (s.includes("enfermer") || s.includes("bacteriol") || s.includes("farmacia") || s.includes("instrumentadora") || s.includes("cuidador") || s.includes("acompañante")) {
    return "Enfermero / Auxiliar Salud";
  }

  // 7. Terapeutas Holísticos
  if (s.includes("terapeuta") || s.includes("terapista") || s.includes("tanatol") || s.includes("health coach") || s.includes("healt coach") || s.includes("cosmetol") || s.includes("esteticista")) {
    return "Terapeuta Holístico / Coach";
  }

  // 8. Docentes / Educadores
  if (s.includes("docente") || s.includes("profesor") || s.includes("profesora") || s.includes("maestr") || s.includes("educad") || s.includes("orientador")) {
    return "Docente / Educador";
  }

  // 9. Abogados / Politólogos / Sociales
  if (s.includes("abogad") || s.includes("lawyer") || s.includes("politól") || s.includes("politol") || s.includes("trabajadora social") || s.includes("sociól")) {
    return "Abogado / Ciencias Sociales";
  }

  // 10. Gestión / Administración / RRHH
  if (
    s.includes("admin") ||
    s.includes("gerente") ||
    s.includes("director") ||
    s.includes("jefe") ||
    s.includes("rrhh") ||
    s.includes("humana") ||
    s.includes("gestión") ||
    s.includes("gestion") ||
    s.includes("analista") ||
    s.includes("coordinador") ||
    s.includes("ceo") ||
    s.includes("comercial") ||
    s.includes("mercadeo") ||
    s.includes("consultor") ||
    s.includes("supervisor")
  ) {
    return "Gestión / Administración";
  }

  // 11. Estudiantes
  if (s.includes("estudiant") || s.includes("practicante") || s.includes("investigad")) {
    return "Estudiante / Investigador";
  }

  // 12. Independiente / Emprendedor / Otros
  if (s.includes("emprend") || s.includes("dueñ") || s.includes("propietari") || s.includes("independiente")) {
    return "Emprendedor / Independiente";
  }

  // Si es un rol reconocible capitalizarlo limpiamente
  if (raw.length <= 35 && !raw.includes("http") && !raw.includes("?")) {
    return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1);
  }

  return "";
}

function extractEventTags(rawTags: string[], notesStr: string): string[] {
  const combined = (rawTags.join(" ") + " " + notesStr).toLowerCase();
  const eventTags: string[] = [];

  if (combined.includes("flores que curan") || combined.includes("ferrando") || combined.includes("bioenergética") || combined.includes("bioenergetica")) {
    eventTags.push("Evento: Flores que curan");
  }
  if (combined.includes("té como vínculo") || combined.includes("te como vinculo") || combined.includes("monica devoto") || combined.includes("mónica devoto") || combined.includes("el té")) {
    eventTags.push("Evento: Té como vínculo terapéutico");
  }
  if (combined.includes("segunda oportunidad") || combined.includes("hacer por el otro")) {
    eventTags.push("Evento: Segunda oportunidad");
  }
  if (combined.includes("poder del corazón") || combined.includes("poder del corazon") || combined.includes("corazon")) {
    eventTags.push("Evento: El poder del corazón");
  }

  return Array.from(new Set(eventTags));
}

async function runStrictCleanup() {
  const workspaceRoot = "c:\\Users\\gabri\\OneDrive\\Escritorio\\Trabajo\\LUMINUS\\Web - App\\luminus";
  const dataDir = path.join(workspaceRoot, ".local-data", "email-marketing");
  const contactsFile = path.join(dataDir, "contacts.json");
  const backupDir = path.join(dataDir, "backups");

  if (!fs.existsSync(contactsFile)) {
    console.error("❌ No se encontró contacts.json");
    return;
  }

  // 1. Respaldo de Seguridad
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `contacts-backup-strict-${timestamp}.json`);
  fs.copyFileSync(contactsFile, backupPath);
  console.log(`🔒 Copia de seguridad creada en: ${backupPath}`);

  // 2. Procesar contactos
  const contacts = JSON.parse(fs.readFileSync(contactsFile, "utf8"));
  console.log(`📊 Limpiando estrictamente ${contacts.length} contactos...`);

  let totalProfessionsCategorized = 0;
  let totalTagsPurged = 0;

  const cleanedContacts = contacts.map((c: any) => {
    // Normalizar Profesión
    const rawProfessionSource = c.profession || (c.tags || []).join(" ") || "";
    const cleanProfession = normalizeProfession(rawProfessionSource);
    if (cleanProfession) totalProfessionsCategorized++;

    // Extraer únicamente etiquetas de Eventos válidas
    const eventTags = extractEventTags(c.tags || [], c.notes || "");
    if ((c.tags || []).length > eventTags.length) {
      totalTagsPurged += (c.tags || []).length - eventTags.length;
    }

    // Limpiar notas (remover preguntas o comentarios inservibles)
    let cleanNotes = c.notes || "";
    if (
      cleanNotes.includes("parqueadero") ||
      cleanNotes.includes("dolores en el pecho") ||
      cleanNotes.includes("pregunta") ||
      cleanNotes.includes("imagen")
    ) {
      cleanNotes = "";
    }

    return {
      ...c,
      profession: cleanProfession,
      tags: eventTags,
      notes: cleanNotes,
    };
  });

  // 3. Guardar cambios
  fs.writeFileSync(contactsFile, JSON.stringify(cleanedContacts, null, 2), "utf8");

  // Muestreo de etiquetas únicas resultantes
  const finalTagsSet = new Set<string>();
  cleanedContacts.forEach((c: any) => (c.tags || []).forEach((t: string) => finalTagsSet.add(t)));

  const finalProfessionsMap: Record<string, number> = {};
  cleanedContacts.forEach((c: any) => {
    if (c.profession) {
      finalProfessionsMap[c.profession] = (finalProfessionsMap[c.profession] || 0) + 1;
    }
  });

  console.log("\n🎉 ESTRUCTURACIÓN Y DEPURACIÓN ESTRICTA FINALIZADA:");
  console.log(`- Total de contactos procesados: ${cleanedContacts.length}`);
  console.log(`- Contactos con profesión categorizada: ${totalProfessionsCategorized}`);
  console.log(`- Total de etiquetas únicas actuales: ${finalTagsSet.size}`);
  console.log("\nEtiquetas Únicas Resultantes en la Base:");
  Array.from(finalTagsSet).forEach((tag) => console.log(`  - "${tag}"`));

  console.log("\nDistribución de Profesiones Estandarizadas:");
  Object.entries(finalProfessionsMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([prof, count]) => console.log(`  - ${prof}: ${count} contactos`));
}

runStrictCleanup().catch((err) => {
  console.error("❌ ERROR EN LIMPIEZA ESTRICTA:", err);
  process.exit(1);
});
