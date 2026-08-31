import fs from "fs";
import path from "path";

// Lista blanca estricta de profesiones reales
function strictNormalizeProfession(raw: string): string {
  if (!raw) return "";
  const s = raw.toLowerCase().trim();

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
    s.includes("md") ||
    s.includes("salud") ||
    s.includes("bioquímic") ||
    s.includes("bioquimic") ||
    s.includes("bacteriólog") ||
    s.includes("bacteriolog") ||
    s.includes("tens")
  ) {
    return "Médico / Profesional de Salud";
  }

  // 2. Psicólogos
  if (s.includes("psicól") || s.includes("psicol") || s.includes("psicopeda") || s.includes("psychology")) {
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
  if (s.includes("fisioterap") || s.includes("kinesiól") || s.includes("kinesiol") || s.includes("kine") || s.includes("reflexolog") || s.includes("perfusionista") || s.includes("fonoaudiól")) {
    return "Fisioterapeuta / Kinesiólogo";
  }

  // 6. Enfermeros / Auxiliares
  if (s.includes("enfermer") || s.includes("farmacia") || s.includes("farmaceutic") || s.includes("instrumentadora") || s.includes("cuidador") || s.includes("acompañante")) {
    return "Enfermero / Auxiliar Salud";
  }

  // 7. Terapeutas Holísticos / Coach
  if (s.includes("terapeuta") || s.includes("terapista") || s.includes("tanatol") || s.includes("coach") || s.includes("cosmetol") || s.includes("esteticis") || s.includes("reikista") || s.includes("astrólog") || s.includes("astrolog")) {
    return "Terapeuta Holístico / Coach";
  }

  // 8. Docentes / Educadores
  if (s.includes("docente") || s.includes("profesor") || s.includes("profesora") || s.includes("maestr") || s.includes("educad") || s.includes("orientador") || s.includes("teacher") || s.includes("jtp")) {
    return "Docente / Educador";
  }

  // 9. Abogados / Politólogos / Sociales
  if (s.includes("abogad") || s.includes("lawyer") || s.includes("politól") || s.includes("politol") || s.includes("trabajo social") || s.includes("sociól") || s.includes("sociol")) {
    return "Abogado / Ciencias Sociales";
  }

  // 10. Gestión / Administración / RRHH / Comercial
  if (
    s.includes("admin") ||
    s.includes("admon") ||
    s.includes("adm") ||
    s.includes("gerente") ||
    s.includes("director") ||
    s.includes("jefe") ||
    s.includes("rrhh") ||
    s.includes("humana") ||
    s.includes("gestión") ||
    s.includes("gestion") ||
    s.includes("analista") ||
    s.includes("coordinador") ||
    s.includes("coordinator") ||
    s.includes("management") ||
    s.includes("manager") ||
    s.includes("ceo") ||
    s.includes("comercial") ||
    s.includes("mercadeo") ||
    s.includes("consultor") ||
    s.includes("supervisor") ||
    s.includes("ejecutiv") ||
    s.includes("ventas") ||
    s.includes("vendedor") ||
    s.includes("asesor") ||
    s.includes("closer") ||
    s.includes("broker") ||
    s.includes("ing") ||
    s.includes("software") ||
    s.includes("arquitect")
  ) {
    return "Gestión / Administración / Profesional";
  }

  // 11. Estudiantes / Investigación
  if (s.includes("estudiant") || s.includes("practicante") || s.includes("investigad") || s.includes("research") || s.includes("alumno")) {
    return "Estudiante / Investigador";
  }

  // 12. Empresarios / Emprendedores
  if (s.includes("emprend") || s.includes("dueñ") || s.includes("owner") || s.includes("propietari") || s.includes("independiente") || s.includes("fundador") || s.includes("comerciante")) {
    return "Emprendedor / Independiente";
  }

  // 13. Arte / Diseño / Comunicación
  if (s.includes("artista") || s.includes("artist") || s.includes("diseña") || s.includes("comunica") || s.includes("periodista") || s.includes("fotógraf") || s.includes("productor")) {
    return "Arte / Diseño / Comunicación";
  }

  // 14. Jubilados / Pensionados / Hogar
  if (s.includes("jubilad") || s.includes("pensionad") || s.includes("retired") || s.includes("ama de casa") || s.includes("hogar")) {
    return "Jubilado / Hogar";
  }

  // CUALQUIER OTRA COSA ES DESECHADA (retorna cadena vacía)
  return "";
}

async function purgeProfessions() {
  const workspaceRoot = "c:\\Users\\gabri\\OneDrive\\Escritorio\\Trabajo\\LUMINUS\\Web - App\\luminus";
  const dataDir = path.join(workspaceRoot, ".local-data", "email-marketing");
  const contactsFile = path.join(dataDir, "contacts.json");
  const backupDir = path.join(dataDir, "backups");

  if (!fs.existsSync(contactsFile)) {
    console.error("❌ No se encontró contacts.json");
    return;
  }

  // Copia de seguridad
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `contacts-backup-professions-${timestamp}.json`);
  fs.copyFileSync(contactsFile, backupPath);

  const contacts = JSON.parse(fs.readFileSync(contactsFile, "utf8"));
  let validCount = 0;
  let clearedCount = 0;

  const cleanedContacts = contacts.map((c: any) => {
    const cleanProf = strictNormalizeProfession(c.profession || "");
    if (cleanProf) {
      validCount++;
    } else if (c.profession) {
      clearedCount++;
    }

    return {
      ...c,
      profession: cleanProf,
    };
  });

  fs.writeFileSync(contactsFile, JSON.stringify(cleanedContacts, null, 2), "utf8");

  const professionsMap: Record<string, number> = {};
  cleanedContacts.forEach((c: any) => {
    if (c.profession) {
      professionsMap[c.profession] = (professionsMap[c.profession] || 0) + 1;
    }
  });

  console.log("\n🎉 PURGA DE PROFESIONES FINALIZADA:");
  console.log(`- Contactos procesados: ${cleanedContacts.length}`);
  console.log(`- Contactos con profesión válida estandarizada: ${validCount}`);
  console.log(`- Entradas raras/basura eliminadas de profesión: ${clearedCount}`);
  console.log("\nCatálogo Final Limpio de Profesiones:");
  Object.entries(professionsMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([prof, count]) => console.log(`  - "${prof}": ${count} contactos`));
}

purgeProfessions().catch((err) => {
  console.error("❌ ERROR AL PURGAR PROFESIONES:", err);
  process.exit(1);
});
