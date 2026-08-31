import { NextResponse } from "next/server";
import { bulkImportContacts } from "@/lib/local-marketing/store";
import * as XLSX from "xlsx";

function checkLocalOnly() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    // Obtener todos los archivos adjuntos (soporte para subida múltiple)
    let files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      const singleFile = formData.get("file") as File | null;
      if (singleFile) files = [singleFile];
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se seleccionó ningún archivo." }, { status: 400 });
    }

    let totalItemsFound = 0;
    const allImportItems: { email: string; firstName?: string; lastName?: string; tags?: string[]; notes?: string }[] = [];
    const processedFileNames: string[] = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const workbook = XLSX.read(buffer, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) continue;

        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        if (rows.length < 2) continue;

        const headerRow = rows[0].map((cell: any) => String(cell || "").trim().toLowerCase());

        const emailIdx = headerRow.findIndex((h: string) =>
          ["correo", "email", "e-mail", "mail", "correo electrónico", "correo electronico"].includes(h)
        );
        const firstNameIdx = headerRow.findIndex((h: string) =>
          ["nombre", "first name", "firstname", "nombre de pila"].includes(h)
        );
        const lastNameIdx = headerRow.findIndex((h: string) =>
          ["apellidos", "apellido", "last name", "lastname"].includes(h)
        );
        const countryIdx = headerRow.findIndex((h: string) =>
          ["país/región", "pais/region", "país", "pais", "country"].includes(h)
        );
        const professionIdx = headerRow.findIndex((h: string) =>
          ["profesión", "profesion", "cargo", "job title", "profession"].includes(h)
        );
        const methodIdx = headerRow.findIndex((h: string) =>
          ["metodo de registro", "método de registro", "source", "origen"].includes(h)
        );
        const cityIdx = headerRow.findIndex((h: string) => ["ciudad", "city"].includes(h));
        const interestsIdx = headerRow.findIndex((h: string) => ["intereses", "interests"].includes(h));

        if (emailIdx === -1) continue;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const rawEmail = String(row[emailIdx] || "").trim();
          if (!rawEmail || !rawEmail.includes("@")) continue;

          const firstName = firstNameIdx !== -1 ? String(row[firstNameIdx] || "").trim() : "";
          const lastName = lastNameIdx !== -1 ? String(row[lastNameIdx] || "").trim() : "";
          const country = countryIdx !== -1 ? String(row[countryIdx] || "").trim() : "";
          const profession = professionIdx !== -1 ? String(row[professionIdx] || "").trim() : "";
          const method = methodIdx !== -1 ? String(row[methodIdx] || "").trim() : "";
          const city = cityIdx !== -1 ? String(row[cityIdx] || "").trim() : "";
          const interests = interestsIdx !== -1 ? String(row[interestsIdx] || "").trim() : "";

          const tags = [`Importación ${file.name}`];
          if (country) tags.push(country);
          if (method) tags.push(method);
          if (profession) tags.push(profession.substring(0, 30));

          const notesParts = [];
          if (profession) notesParts.push(`Profesión/Cargo: ${profession}`);
          if (city) notesParts.push(`Ciudad: ${city}`);
          if (interests) notesParts.push(`Intereses: ${interests}`);

          allImportItems.push({
            email: rawEmail,
            firstName,
            lastName,
            tags: Array.from(new Set(tags)),
            notes: notesParts.join(" | "),
          });
          totalItemsFound++;
        }

        processedFileNames.push(file.name);
      } catch (errFile) {
        console.error(`Error al procesar archivo ${file.name}:`, errFile);
      }
    }

    if (allImportItems.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron registros de correos válidos en los archivos seleccionados." },
        { status: 400 }
      );
    }

    const result = bulkImportContacts(allImportItems);

    return NextResponse.json({
      success: true,
      processedFilesCount: processedFileNames.length,
      fileNames: processedFileNames,
      totalItemsFound,
      ...result,
    });
  } catch (err: any) {
    console.error("Error procesando archivos de contactos:", err);
    return NextResponse.json({ error: err.message || "Error al procesar archivos." }, { status: 500 });
  }
}
