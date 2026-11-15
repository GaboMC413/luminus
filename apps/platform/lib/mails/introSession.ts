import {
  PLATFORM_APP_URL,
  WEBSITE_URL,
  renderEmailLayout,
} from "./EmailLayout";

export type IntroSessionEmailVariant =
  | "requested_specialist"
  | "requested_requester"
  | "accepted_requester"
  | "accepted_specialist"
  | "declined_requester"
  | "cancelled";

export interface IntroSessionEmailOptions {
  variant: IntroSessionEmailVariant;
  recipientName: string;
  counterpartyName: string;
  friendlyDate: string;
  startTime: string;
  timezone: string;
  note?: string;
  meetingLink?: string;
  actionPath?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isHttpUrl(value?: string): boolean {
  return Boolean(value && /^https?:\/\//i.test(value.trim()));
}

function capitalizeFirst(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function getIntroSessionEmailSubject(
  options: IntroSessionEmailOptions
): string {
  const { variant, counterpartyName, friendlyDate, startTime } = options;
  switch (variant) {
    case "requested_specialist":
      return `Nueva solicitud de sesión introductoria de ${counterpartyName}`;
    case "requested_requester":
      return `Recibimos tu solicitud de sesión con ${counterpartyName}`;
    case "accepted_requester":
      return `Sesión confirmada con ${counterpartyName} (${friendlyDate}, ${startTime})`;
    case "accepted_specialist":
      return `Confirmaste tu sesión con ${counterpartyName} (${friendlyDate}, ${startTime})`;
    case "declined_requester":
      return `Actualización sobre tu solicitud con ${counterpartyName}`;
    case "cancelled":
      return `Sesión cancelada (${friendlyDate}, ${startTime})`;
  }
}

export function renderIntroSessionEmailHtml(
  options: IntroSessionEmailOptions
): string {
  const {
    variant,
    recipientName,
    counterpartyName,
    friendlyDate,
    startTime,
    timezone,
    note,
    meetingLink,
    actionPath,
  } = options;

  const safeRecipient = escapeHtml(recipientName || "Hola");
  const safeCounterparty = escapeHtml(counterpartyName || "Especialista");
  const safeDate = escapeHtml(capitalizeFirst(friendlyDate));
  const safeTime = escapeHtml(startTime);
  const safeTz = escapeHtml(timezone || "Hora local");
  const safeNote = note ? escapeHtml(note) : "";

  const isAcceptedVariant =
    variant === "accepted_requester" || variant === "accepted_specialist";
  const effectiveMeetingLink = isAcceptedVariant ? meetingLink : undefined;
  const safeLink = effectiveMeetingLink ? escapeHtml(effectiveMeetingLink) : "";

  const ctaUrl =
    isAcceptedVariant && isHttpUrl(effectiveMeetingLink)
      ? effectiveMeetingLink!.trim()
      : `${PLATFORM_APP_URL}${actionPath || "/sesiones"}`;

  let heading = "";
  let intro = "";
  let ctaLabel = "Ver mis sesiones";
  let showGuide = false;
  let noteLabel = `Mensaje de ${safeCounterparty}`;

  switch (variant) {
    case "requested_specialist":
      heading = "Nueva solicitud de sesión introductoria";
      intro = `<strong>${safeCounterparty}</strong> solicitó una sesión introductoria gratuita de 15 minutos contigo.`;
      ctaLabel = "Revisar solicitud";
      showGuide = true;
      noteLabel = `Mensaje de ${safeCounterparty}`;
      break;
    case "requested_requester":
      heading = "Recibimos tu solicitud de sesión";
      intro = `enviamos tu solicitud a <strong>${safeCounterparty}</strong>. Te avisaremos apenas la confirme para enviarte el enlace de acceso.`;
      ctaLabel = "Ver mis sesiones";
      showGuide = true;
      noteLabel = "Tu mensaje";
      break;
    case "accepted_requester":
      heading = "¡Tu sesión introductoria está confirmada!";
      intro = `<strong>${safeCounterparty}</strong> confirmó tu sesión introductoria de 15 minutos. Ya tienes todo listo para conectarte.`;
      ctaLabel = isHttpUrl(effectiveMeetingLink)
        ? "Unirse a la sesión"
        : "Ver detalle de la sesión";
      showGuide = true;
      noteLabel = `Mensaje de ${safeCounterparty}`;
      break;
    case "accepted_specialist":
      heading = "Confirmaste una sesión introductoria";
      intro = `confirmaste la sesión de 15 minutos con <strong>${safeCounterparty}</strong>. Aquí tienes el resumen y tu enlace de acceso.`;
      ctaLabel = isHttpUrl(effectiveMeetingLink)
        ? "Unirse a la sesión"
        : "Ver mis sesiones";
      noteLabel = "Tu mensaje";
      break;
    case "declined_requester":
      heading = "Horario no disponible";
      intro = `<strong>${safeCounterparty}</strong> no pudo confirmar la sesión solicitada para este horario.`;
      ctaLabel = "Explorar especialistas";
      noteLabel = `Motivo o sugerencia de ${safeCounterparty}`;
      break;
    case "cancelled":
      heading = "Sesión cancelada";
      intro = `<strong>${safeCounterparty}</strong> canceló la sesión introductoria programada. El horario quedó liberado.`;
      ctaLabel = "Ver mis sesiones";
      noteLabel = `Mensaje de ${safeCounterparty}`;
      break;
  }

  const summaryBox = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 22px 0; text-align: center;">
      <p style="margin: 0; font-size: 13px; color: #047857; font-weight: 600;">
        15 minutos con ${safeCounterparty}
      </p>
      <p style="margin: 6px 0 0 0; font-size: 14px; color: #334155; font-weight: 600;">
        ${safeDate}
      </p>
      <p style="margin: 4px 0 0 0; font-size: 20px; color: #0f172a; font-weight: 700;">
        ${safeTime} hs
      </p>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">
        ${safeTz}
      </p>
      ${
        safeNote
          ? `<div style="margin: 14px 0 0 0; padding-top: 14px; border-top: 1px solid #e2e8f0; text-align: left;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #64748b;">${noteLabel}</p>
              <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-wrap;">${safeNote}</p>
            </div>`
          : ""
      }
      ${
        isAcceptedVariant && safeLink && !isHttpUrl(effectiveMeetingLink)
          ? `<div style="margin: 14px 0 0 0; padding-top: 14px; border-top: 1px solid #e2e8f0; text-align: left;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #64748b;">Cómo conectarse</p>
              <p style="margin: 0; font-size: 14px; color: #0f172a;">${safeLink}</p>
            </div>`
          : ""
      }
    </div>
  `;

  const isSpecialistRecipient = variant === "requested_specialist";
  const whatItIsText = isSpecialistRecipient
    ? "Un primer contacto breve (15 min) y gratuito para conocer a un miembro interesado y contarle cómo trabajas."
    : "Una charla introductoria de 15 minutos sin costo para conocerse, contar qué buscas y ver si el enfoque del especialista encaja contigo.";
  const whatItIsNotText = isSpecialistRecipient
    ? "No es una consulta paga ni un servicio supervisado por LUMINUS. Los acuerdos u honorarios posteriores son independientes entre tú y el miembro."
    : "No es una consulta completa, diagnóstico ni tratamiento. Cualquier servicio posterior se acuerda por fuera de LUMINUS.";

  const guideBox = showGuide
    ? `
    <div style="margin: 22px 0;">
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 13px 16px; margin: 0 0 10px 0; text-align: left;">
        <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #064e3b;">
          <strong style="color: #059669;">&#10003;</strong>&nbsp;&nbsp;${whatItIsText}
        </p>
      </div>
      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 13px 16px; margin: 0; text-align: left;">
        <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #881337;">
          <strong style="color: #e11d48;">&#10005;</strong>&nbsp;&nbsp;${whatItIsNotText}
        </p>
      </div>
    </div>
  `
    : "";

  const legalFooter = `
    <p style="margin: 22px 0 0 0; font-size: 12.5px; line-height: 1.55; color: #64748b; text-align: left;">
      LUMINUS facilita únicamente la conexión inicial y el envío del enlace. Los especialistas actúan de forma independiente y LUMINUS no interviene ni es responsable por los servicios, asistencia, puntualidad o fallos técnicos de conexión. Funcionalidad en etapa de pruebas (<a href="${WEBSITE_URL}/legal/sesiones-introductorias" style="color: #0f172a; text-decoration: underline;">Condiciones de Sesiones Introductorias</a> · <a href="${PLATFORM_APP_URL}/contacto" style="color: #0f172a; text-decoration: underline;">Contacto</a>).
    </p>
  `;

  const contentHtml = `
    <div style="text-align: left;">
      <h1 style="margin: 0 0 12px 0; font-size: 22px; line-height: 1.3; font-weight: 700; color: #0f172a;">
        ${heading}
      </h1>
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155;">
        Hola ${safeRecipient}, ${intro}
      </p>
      ${summaryBox}
      <div style="text-align: center; margin: 26px 0 8px 0;">
        <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 10px;">
          ${ctaLabel}
        </a>
      </div>
      ${guideBox}
      ${legalFooter}
    </div>
  `;

  return renderEmailLayout({
    title: heading,
    contentHtml,
    alignCenter: false,
    preheader: `${heading} · ${friendlyDate} ${startTime}`,
  });
}
