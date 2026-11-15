import { renderEmailLayout, LOGO_IMAGE_URL } from "./EmailLayout";
import { formatEventDateTime, resolveEventUtcDate } from "../eventDateUtils";

export interface EventInscriptionEmailOptions {
  firstName?: string;
  eventTitle?: string;
  eventCoverUrl?: string | null;
  eventDate?: string | null;
  timeText?: string | null;
  speakerName?: string | null;
  youtubeUrl?: string | null;
  eventSlug?: string | null;
  location?: string | null;
  userTimezone?: string | null;
  source?: "platform" | "web";
}

const DEFAULT_EVENT_TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Resolves a direct event join/watch URL if provided.
 * Returns null when no link is configured yet (never fabricates a generic channel link).
 */
export function resolveDirectEventLink(rawUrl?: string | null): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://www.youtube.com/watch?v=${trimmed}`;
}

/**
 * Formats event date and time consistently in the target timezone (defaulting to GMT-3).
 */
export function formatEventDateAndTime(
  dateString?: string | null,
  timeText?: string | null,
  userTimezone?: string | null
): { formattedDate: string; formattedTime: string } {
  const targetTz = userTimezone?.trim() || DEFAULT_EVENT_TIMEZONE;
  const dtFormatted = formatEventDateTime(dateString, timeText, targetTz);

  if (!dateString) {
    return {
      formattedDate: "Próximamente",
      formattedTime: dtFormatted.timeString,
    };
  }

  try {
    const utcDate = resolveEventUtcDate(dateString, timeText);
    if (utcDate && !isNaN(utcDate.getTime())) {
      const dtf = new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: targetTz,
      });
      const parts = dtf.formatToParts(utcDate);
      const partMap: Record<string, string> = {};
      for (const p of parts) {
        partMap[p.type] = p.value;
      }
      const weekday = partMap.weekday || "";
      const day = partMap.day || String(utcDate.getDate());
      const month = partMap.month || "";
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

      return {
        formattedDate: `${capitalizedWeekday} ${day} de ${capitalizedMonth}`,
        formattedTime: dtFormatted.timeString,
      };
    }
  } catch {
    // Fallback below
  }

  return {
    formattedDate: dateString,
    formattedTime: dtFormatted.timeString,
  };
}

function renderPlatformPromoBanner(): string {
  return `
    <!-- BANNER PLATAFORMA LUMINUS: IMAGEN ARRIBA EN FONDO GRIS + BLOQUE NEGRO ABAJO CON TEXTO BLANCO Y BOTÓN BLANCO PURO -->
    <div style="border-radius: 20px; overflow: hidden; margin-top: 36px;">
      <!-- Parte 1: Imagen arriba con fondo gris -->
      <div style="background-color: #f8fafc; padding: 28px 24px 0 24px; text-align: center;">
        <img 
          src="https://luminuslatam.com/Photos/Luminus%20app%20-%20buscar%20especialistas%20y%20comunidad.png" 
          alt="LUMINUS App" 
          style="width: 100%; max-width: 320px; height: auto; display: block; margin: 0 auto; border: 0; outline: none;" 
        />
      </div>
      
      <!-- Parte 2: Bloque negro abajo con texto blanco puro grande y botón blanco puro -->
      <div style="background-color: #000000; padding: 28px 24px 32px 24px; text-align: center; color: #ffffff !important;">
        <h3 style="font-size: 22px; font-weight: 700; color: #ffffff !important; margin: 0 0 10px 0; line-height: 1.3; text-align: center;">
          Conoce la plataforma de LUMINUS
        </h3>
        
        <p style="font-size: 15px; line-height: 1.6; color: #ffffff !important; margin: 0 auto 24px auto; max-width: 440px; text-align: center;">
          Un espacio para conectar con especialistas, acceder a contenidos y participar de nuevas experiencias pensadas para tu bienestar.
        </p>

        <div style="text-align: center;">
          <a href="https://app.luminuslatam.com/" target="_blank" style="display: inline-block; background-color: #ffffff !important; color: #000000 !important; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 700; text-align: center; border: 0;">
            Ingresar a la plataforma
          </a>
        </div>
      </div>
    </div>
  `;
}

export function renderEventRegistrationEmailHtml(data: EventInscriptionEmailOptions): string {
  const firstName = data.firstName || "Usuario";
  const eventTitle = data.eventTitle || "Evento de Bienestar LUMINUS";
  const { formattedDate, formattedTime } = formatEventDateAndTime(
    data.eventDate,
    data.timeText,
    data.userTimezone
  );
  const eventLocation = data.location || "Evento online";
  const directLink = resolveDirectEventLink(data.youtubeUrl);
  const coverImageUrl = data.eventCoverUrl || LOGO_IMAGE_URL;
  const isPlatformUser = data.source === "platform";

  const coverHtml = coverImageUrl
    ? directLink
      ? `<a href="${directLink}" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;"><img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" /></a>`
      : `<img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" />`
    : "";

  const actionHtml = directLink
    ? `
        <a href="${directLink}" target="_blank" style="display: inline-block; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Unirse al evento
        </a>
        <p style="font-size: 13px; line-height: 1.5; color: #475569 !important; margin: 14px 0 0 0; text-align: center;">
          El enlace estará activo en la fecha y horario del evento.
        </p>
      `
    : `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; text-align: center;">
          <p style="font-size: 14px; line-height: 1.5; color: #334155 !important; margin: 0; font-weight: 500;">
            El enlace de acceso se habilitará antes del comienzo y te lo enviaremos por email.${
              isPlatformUser ? " También podrás verlo en Mis inscripciones dentro de la plataforma." : ""
            }
          </p>
        </div>
      `;

  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #000000 !important; text-align: center;">
      ¡Hola ${firstName}!
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #000000 !important; font-weight: 500; margin: 0 0 6px 0; text-align: center;">
      Tu inscripción a <strong style="color: #000000 !important;">${eventTitle}</strong> está confirmada.
    </p>

    <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 28px 0; text-align: center;">
      Te esperamos el ${formattedDate} a las ${formattedTime}.
    </p>

    <!-- Official Newsletter Card: #f8fafc, border-radius 20px, border 0 -->
    <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; text-align: center; margin-bottom: ${isPlatformUser ? "0" : "36px"}; border: 0;">
      ${coverHtml}
      
      <div style="padding: 24px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; line-height: 1.3; color: #000000 !important; margin: 0 0 8px 0; text-align: center;">
          ${eventTitle}
        </h3>
        
        ${data.speakerName ? `<p style="font-size: 16px; font-weight: 600; color: #000000 !important; margin: 0 0 6px 0; text-align: center;">Con ${data.speakerName}</p>` : ""}
        
        <p style="font-size: 15px; font-weight: 500; color: #000000 !important; margin: 0 0 20px 0; text-align: center;">
          ${formattedDate} • ${formattedTime} • ${eventLocation}
        </p>
        
        ${actionHtml}
      </div>
    </div>

    ${isPlatformUser ? "" : renderPlatformPromoBanner()}
  `;

  return renderEmailLayout({
    title: `Confirmación de inscripción: ${eventTitle}`,
    preheader: `${formattedDate} • ${formattedTime}`,
    contentHtml,
    alignCenter: true,
  });
}

export function renderEventLiveEmailHtml(data: EventInscriptionEmailOptions): string {
  const firstName = data.firstName || "Usuario";
  const eventTitle = data.eventTitle || "Evento de Bienestar LUMINUS";
  const { formattedDate, formattedTime } = formatEventDateAndTime(
    data.eventDate,
    data.timeText,
    data.userTimezone
  );
  const eventLocation = data.location || "Evento online";
  const directLink = resolveDirectEventLink(data.youtubeUrl);
  const coverImageUrl = data.eventCoverUrl || LOGO_IMAGE_URL;
  const isPlatformUser = data.source === "platform";

  const coverHtml = coverImageUrl
    ? directLink
      ? `<a href="${directLink}" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;"><img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" /></a>`
      : `<img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" />`
    : "";

  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #000000 !important; text-align: center;">
      ¡Hola ${firstName}!
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #000000 !important; font-weight: 500; margin: 0 0 28px 0; text-align: center;">
      <strong style="color: #000000 !important;">${eventTitle}</strong>${data.speakerName ? `, con ${data.speakerName},` : ""} ya está disponible para que te unas.
    </p>

    <!-- Official Newsletter Card: #f8fafc, border-radius 20px, border 0 -->
    <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; text-align: center; margin-bottom: ${isPlatformUser ? "0" : "36px"}; border: 0;">
      ${coverHtml}
      
      <div style="padding: 24px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; line-height: 1.3; color: #000000 !important; margin: 0 0 8px 0; text-align: center;">
          ${eventTitle}
        </h3>
        
        ${data.speakerName ? `<p style="font-size: 16px; font-weight: 600; color: #000000 !important; margin: 0 0 6px 0; text-align: center;">Con ${data.speakerName}</p>` : ""}
        
        <p style="font-size: 15px; font-weight: 500; color: #000000 !important; margin: 0 0 20px 0; text-align: center;">
          ${formattedDate} • ${formattedTime} • ${eventLocation}
        </p>
        
        ${
          directLink
            ? `<a href="${directLink}" target="_blank" style="display: inline-block; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
                Unirse al evento
              </a>`
            : ""
        }
      </div>
    </div>

    ${isPlatformUser ? "" : renderPlatformPromoBanner()}
  `;

  return renderEmailLayout({
    title: `Ya puedes unirte: ${eventTitle}`,
    preheader: `${formattedDate} • ${formattedTime}`,
    contentHtml,
    alignCenter: true,
  });
}
