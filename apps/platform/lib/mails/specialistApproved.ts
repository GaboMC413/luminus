import {
  renderEmailLayout,
  PLATFORM_APP_URL,
  WEBSITE_URL,
} from "./EmailLayout";

export interface SpecialistApprovedEmailOptions {
  name?: string;
  title?: string | null;
  specialty?: string | null;
  selectedAreas?: string[];
  clinicName?: string | null;
  coursesCount?: number;
}

export const SPECIALIST_APPROVED_EMAIL_SUBJECT =
  "Te damos la bienvenida como Especialista en LUMINUS";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderSpecialistApprovedEmailHtml(
  options: SpecialistApprovedEmailOptions = {}
): string {
  const safeName = escapeHtml(options.name?.trim() || "Especialista");
  const safeTitle = options.title?.trim() ? escapeHtml(options.title.trim()) : null;
  const safeSpecialty = options.specialty?.trim()
    ? escapeHtml(options.specialty.trim())
    : null;
  const safeAreas = Array.isArray(options.selectedAreas)
    ? options.selectedAreas
        .map((a) => String(a || "").trim())
        .filter(Boolean)
        .map(escapeHtml)
    : [];
  const safeClinicName = options.clinicName?.trim()
    ? escapeHtml(options.clinicName.trim())
    : null;
  const coursesCount =
    typeof options.coursesCount === "number" && options.coursesCount > 0
      ? options.coursesCount
      : 0;

  const summaryRows: Array<{ label: string; value: string }> = [];
  if (safeTitle) {
    summaryRows.push({ label: "Título profesional:", value: safeTitle });
  }
  if (safeSpecialty) {
    summaryRows.push({ label: "Especialidad:", value: safeSpecialty });
  }
  if (safeAreas.length > 0) {
    summaryRows.push({
      label: "Áreas de acompañamiento:",
      value: safeAreas.join(" · "),
    });
  }
  if (safeClinicName) {
    summaryRows.push({ label: "Espacio registrado:", value: safeClinicName });
  }
  if (coursesCount > 0) {
    summaryRows.push({
      label: "Propuestas formativas:",
      value: `${coursesCount} ${coursesCount === 1 ? "curso registrado" : "cursos registrados"}`,
    });
  }

  const summaryCardHtml =
    summaryRows.length > 0
      ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
      <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px;">
        <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b;">
          Resumen de tu perfil aprobado
        </span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
        ${summaryRows
          .map(
            (row) => `
        <tr>
          <td style="padding: 6px 12px 6px 0; font-weight: 600; color: #334155; vertical-align: top; white-space: nowrap;">${row.label}</td>
          <td style="padding: 6px 0; text-align: right; color: #0f172a; vertical-align: top;">${row.value}</td>
        </tr>`
          )
          .join("")}
      </table>
    </div>
  `
      : "";

  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      Ya eres Especialista en LUMINUS
    </h1>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 16px 0; color: #334155; text-align: center;">
      Hola <strong style="color: #0f172a;">${safeName}</strong>, tu postulación fue aprobada y nos alegra darte la bienvenida a la <strong style="color: #0f172a;">Red de Especialistas LUMINUS</strong>.
    </p>

    <p style="font-size: 15px; line-height: 1.65; margin: 0 0 24px 0; color: #334155; text-align: left;">
      Nuestro Consejo de Expertos validó tu perfil profesional. A partir de ahora tu propuesta forma parte de un espacio dedicado al bienestar en Latinoamérica, pensado para que más personas puedan descubrir tu enfoque y conectar contigo — manteniendo siempre tu identidad y total independencia profesional.
    </p>

    ${summaryCardHtml}

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
      <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 16px 0;">
        ¿Qué puedes hacer ahora en la plataforma?
      </p>

      <div style="margin-bottom: 14px;">
        <strong style="color: #0f172a; font-size: 14px;">• Tu perfil público:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Revisa y actualiza tu biografía, formación y enlaces cuando lo necesites.</span>
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="color: #0f172a; font-size: 14px;">• Sesiones introductorias de 15 minutos:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Activa o ajusta tu disponibilidad para que los miembros puedan solicitar un primer encuentro contigo.</span>
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="color: #0f172a; font-size: 14px;">• Espacios y cursos:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Gestiona la información de tu consultorio, clínica o propuestas formativas.</span>
      </div>

      <div style="margin-bottom: 0;">
        <strong style="color: #0f172a; font-size: 14px;">• Comunidad y entrevistas:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Participa en grupos temáticos y futuras instancias de visibilidad dentro de la red.</span>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${PLATFORM_APP_URL}/perfil-usuario" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center;">
        Ver mi perfil de especialista
      </a>
    </div>

    <p style="font-size: 12.5px; line-height: 1.55; color: #64748b; text-align: left; margin: 0;">
      Tu participación se rige por nuestras <a href="${WEBSITE_URL}/legal/condiciones-especialistas" target="_blank" style="color: #0f172a; font-weight: 600; text-decoration: underline;">Condiciones para Especialistas</a>. Si necesitas ayuda o quieres actualizar algún dato, puedes escribirnos desde <a href="${PLATFORM_APP_URL}/contacto" target="_blank" style="color: #0f172a; font-weight: 600; text-decoration: underline;">Contacto</a>.
    </p>
  `;

  return renderEmailLayout({
    title: SPECIALIST_APPROVED_EMAIL_SUBJECT,
    preheader:
      "Ya formas parte de la Red de Especialistas LUMINUS. Conoce tu resumen y los próximos pasos.",
    contentHtml,
    alignCenter: true,
  });
}
