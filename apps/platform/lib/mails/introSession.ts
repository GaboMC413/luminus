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
  const safeDate = escapeHtml(friendlyDate);
  const safeTime = escapeHtml(startTime);
  const safeTz = escapeHtml(timezone);
  const safeNote = note ? escapeHtml(note) : "";
  const safeLink = meetingLink ? escapeHtml(meetingLink) : "";

  const ctaUrl =
    (variant === "accepted_requester" || variant === "accepted_specialist") &&
    isHttpUrl(meetingLink)
      ? meetingLink!.trim()
      : `${PLATFORM_APP_URL}${actionPath || "/sesiones"}`;

  let heading = "";
  let intro = "";
  let ctaLabel = "Ver mis sesiones";
  let showGuide = false;

  switch (variant) {
    case "requested_specialist":
      heading = "Nueva solicitud de sesión introductoria";
      intro = `<strong>${safeCounterparty}</strong> solicitó una sesión introductoria gratuita de 15 minutos contigo.`;
      ctaLabel = "Revisar solicitud";
      showGuide = true;
      break;
    case "requested_requester":
      heading = "Recibimos tu solicitud de sesión";
      intro = `Enviamos tu solicitud a <strong>${safeCounterparty}</strong>. Te avisaremos apenas la confirme para enviarte el enlace de acceso.`;
      ctaLabel = "Ver mis sesiones";
      showGuide = true;
      break;
    case "accepted_requester":
      heading = "¡Tu sesión introductoria está confirmada!";
      intro = `<strong>${safeCounterparty}</strong> confirmó tu sesión introductoria de 15 minutos. Ya tienes todo listo para conectarte.`;
      ctaLabel = isHttpUrl(meetingLink) ? "Unirse a la sesión" : "Ver detalle de la sesión";
      showGuide = true;
      break;
    case "accepted_specialist":
      heading = "Confirmaste una sesión introductoria";
      intro = `Confirmaste la sesión de 15 minutos con <strong>${safeCounterparty}</strong>. Aquí tienes el resumen y tu enlace de acceso como anfitrión.`;
      ctaLabel = isHttpUrl(meetingLink) ? "Entrar como anfitrión" : "Ver mis sesiones";
      break;
    case "declined_requester":
      heading = "Horario no disponible";
      intro = `<strong>${safeCounterparty}</strong> no pudo confirmar la sesión solicitada para este horario.`;
      ctaLabel = "Explorar especialistas";
      break;
    case "cancelled":
      heading = "Sesión cancelada";
      intro = `<strong>${safeCounterparty}</strong> canceló la sesión introductoria programada. El horario quedó liberado.`;
      ctaLabel = "Ver mis sesiones";
      break;
  }

  const summaryBox = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 22px 0; text-align: left;">
      <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">
        Detalle del encuentro
      </p>
      <p style="margin: 0 0 4px 0; font-size: 15px; color: #0f172a; font-weight: 600;">
        ${safeDate} · ${safeTime}
      </p>
      <p style="margin: 0; font-size: 13px; color: #475569;">
        Duración estimada: 15 minutos · Zona horaria: ${safeTz}
      </p>
      ${
        safeNote
          ? `<p style="margin: 12px 0 0 0; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #334155;"><strong>Nota:</strong> "${safeNote}"</p>`
          : ""
      }
      ${
        safeLink && !isHttpUrl(meetingLink)
          ? `<p style="margin: 12px 0 0 0; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;"><strong>Cómo conectarse:</strong> ${safeLink}</p>`
          : ""
      }
    </div>
  `;

  const guideBox = showGuide
    ? `
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 20px 0; text-align: left;">
      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
        Qué es y qué no es esta sesión
      </p>
      <p style="margin: 0 0 8px 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        <strong>Qué es:</strong> Una charla inicial gratuita de 15 minutos para conocerse, contar qué buscas y ver si hay afinidad para trabajar juntos.
      </p>
      <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        <strong>Qué no es:</strong> No es una consulta médica, psicológica ni terapéutica, ni un servicio prestado por LUMINUS.
      </p>
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
      <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155;">Hola ${safeRecipient},</p>
      <h1 style="margin: 0 0 12px 0; font-size: 22px; line-height: 1.3; font-weight: 700; color: #0f172a;">
        ${heading}
      </h1>
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155;">
        ${intro}
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
