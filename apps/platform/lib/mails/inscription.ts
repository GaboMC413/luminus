import { renderEmailLayout, LOGO_IMAGE_URL } from "./EmailLayout";

export interface EventInscriptionEmailOptions {
  firstName?: string;
  eventTitle?: string;
  eventCoverUrl?: string | null;
  eventDate?: string | null;
  timeText?: string | null;
  speakerName?: string | null;
  youtubeUrl?: string | null;
  eventSlug?: string | null;
}

function parseCalendarDate(dateStr?: string | Date | null): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  const str = String(dateStr).trim();
  if (!str) return null;

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateSpanish(dateString?: string | null): string {
  if (!dateString) return "Próximamente";
  try {
    const d = parseCalendarDate(dateString);
    if (d && !isNaN(d.getTime())) {
      const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
      const day = d.getDate();
      const month = d.toLocaleDateString("es-ES", { month: "long" });
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      return `${capitalizedWeekday} ${day} de ${capitalizedMonth}`;
    }
  } catch (e) {}
  return dateString;
}

export function renderEventRegistrationEmailHtml(data: EventInscriptionEmailOptions): string {
  const firstName = data.firstName || "Usuario";
  const eventTitle = data.eventTitle || "Taller de Bienestar LUMINUS";
  const formattedDate = formatDateSpanish(data.eventDate);
  const formattedTime = data.timeText || "18:00 hs (GMT-3)";
  
  let youtubeLink = "https://www.youtube.com/@luminus_latam";
  if (data.youtubeUrl && data.youtubeUrl.trim()) {
    const rawYt = data.youtubeUrl.trim();
    if (rawYt.startsWith("http://") || rawYt.startsWith("https://")) {
      youtubeLink = rawYt;
    } else {
      youtubeLink = `https://www.youtube.com/watch?v=${rawYt}`;
    }
  }

  const coverImageUrl = data.eventCoverUrl || LOGO_IMAGE_URL;

  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      ¡Hola ${firstName}!
    </h1>

    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 6px 0; text-align: center;">
      Te has inscripto a la entrevista online <strong>${eventTitle}</strong>.
    </p>

    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 28px 0; text-align: center;">
      Podrás ver el estreno el ${formattedDate} a las ${formattedTime}.
    </p>

    <!-- Web-styled Event Card: Centered typography & button -->
    <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: center;">
      ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none; border-top-left-radius: 15px; border-top-right-radius: 15px;" />` : ''}
      
      <div style="padding: 24px 24px 28px 24px; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 700; line-height: 1.3; color: #0f172a; margin: 0 0 10px 0; text-align: center;">
          ${eventTitle}
        </h2>
        
        ${data.speakerName ? `<p style="font-size: 16px; font-weight: 600; color: #334155; margin: 0 0 6px 0; text-align: center;">Con ${data.speakerName}</p>` : ''}
        
        <p style="font-size: 15px; font-weight: 500; color: #64748b; margin: 0 0 22px 0; text-align: center;">
          ${formattedDate} • ${formattedTime}
        </p>
        
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
          <a href="${youtubeLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-size: 15px; font-weight: 600; text-align: center;">
            Ver en YouTube
          </a>
        </div>
      </div>
    </div>

    <!-- BANNER OSCURO: Conoce la plataforma de LUMINUS -->
    <div style="background-color: #000000; border-radius: 20px; overflow: hidden; padding: 0; margin-top: 28px; color: #ffffff; text-align: left;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        <tr>
          <!-- Imagen a la Izquierda sin padding y más grande -->
          <td width="210" valign="bottom" align="left" style="padding: 0; margin: 0; line-height: 0; width: 210px;">
            <img 
              src="https://luminuslatam.com/Photos/Luminus%20app%20-%20buscar%20especialistas%20y%20comunidad.png" 
              alt="LUMINUS App" 
              width="210" 
              style="width: 210px; max-width: 210px; height: auto; display: block; border: 0; outline: none; margin: 0; padding: 0;" 
            />
          </td>
          
          <!-- Texto & Botón Blanco a la Derecha -->
          <td valign="middle" style="padding: 24px 24px 24px 16px; text-align: left;">
            <h3 style="font-size: 17px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; line-height: 1.3; text-align: left;">
              Conoce la plataforma de LUMINUS
            </h3>
            <p style="font-size: 13.5px; line-height: 1.5; color: #94a3b8; margin: 0 0 18px 0; text-align: left;">
              Un espacio para conectar con especialistas, acceder a contenidos y participar de nuevas experiencias pensadas para tu bienestar.
            </p>
            <div style="text-align: left;">
              <a href="https://app.luminuslatam.com/" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0f172a; text-decoration: none; padding: 11px 22px; border-radius: 12px; font-size: 13.5px; font-weight: 700; text-align: center;">
                Ingresar a la plataforma
              </a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;



  return renderEmailLayout({
    title: `[LUMINUS] Confirmación de inscripción: ${eventTitle}`,
    contentHtml,
    alignCenter: true,
  });
}

export function renderEventLiveEmailHtml(data: EventInscriptionEmailOptions): string {
  const firstName = data.firstName || "Usuario";
  const eventTitle = data.eventTitle || "Taller de Bienestar LUMINUS";
  const formattedDate = formatDateSpanish(data.eventDate);
  const formattedTime = data.timeText || "18:00 hs (GMT-3)";
  
  let youtubeLink = "https://www.youtube.com/@luminus_latam";
  if (data.youtubeUrl && data.youtubeUrl.trim()) {
    const rawYt = data.youtubeUrl.trim();
    if (rawYt.startsWith("http://") || rawYt.startsWith("https://")) {
      youtubeLink = rawYt;
    } else {
      youtubeLink = `https://www.youtube.com/watch?v=${rawYt}`;
    }
  }

  const coverImageUrl = data.eventCoverUrl || LOGO_IMAGE_URL;

  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      ¡Hola ${firstName}!
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #334155; font-weight: 500; margin: 0 0 28px 0; text-align: center;">
      <strong>${eventTitle}</strong>${data.speakerName ? `, con ${data.speakerName}` : ""}, ya está disponible en nuestro canal de YouTube.
    </p>

    <!-- Web-styled Event Card: Centered typography & button -->
    <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: center;">
      ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none; border-top-left-radius: 15px; border-top-right-radius: 15px;" />` : ''}
      
      <div style="padding: 24px 24px 28px 24px; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 700; line-height: 1.3; color: #0f172a; margin: 0 0 10px 0; text-align: center;">
          ${eventTitle}
        </h2>
        
        ${data.speakerName ? `<p style="font-size: 16px; font-weight: 600; color: #334155; margin: 0 0 6px 0; text-align: center;">Con ${data.speakerName}</p>` : ''}
        
        <p style="font-size: 15px; font-weight: 500; color: #64748b; margin: 0 0 22px 0; text-align: center;">
          ${formattedDate} • ${formattedTime}
        </p>
        
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
          <a href="${youtubeLink}" target="_blank" style="display: inline-block; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-size: 15px; font-weight: 700; text-align: center;">
            Ver ahora en YouTube
          </a>
        </div>
      </div>
    </div>

    <!-- BANNER OSCURO VERTICAL: Conoce la plataforma de LUMINUS -->
    <div style="background-color: #000000; border-radius: 20px; overflow: hidden; padding: 32px 24px; margin-top: 36px; color: #ffffff; text-align: center;">
      <h3 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 10px 0; line-height: 1.3; text-align: center;">
        Conoce la plataforma de LUMINUS
      </h3>
      
      <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 auto 24px auto; max-width: 440px; text-align: center;">
        Un espacio para conectar con especialistas, acceder a contenidos y participar de nuevas experiencias pensadas para tu bienestar.
      </p>

      <div style="margin-bottom: 24px; text-align: center;">
        <img 
          src="https://luminuslatam.com/Photos/Luminus%20app%20-%20buscar%20especialistas%20y%20comunidad.png" 
          alt="LUMINUS App" 
          style="width: 100%; max-width: 320px; height: auto; display: block; margin: 0 auto; border: 0; outline: none;" 
        />
      </div>

      <div style="text-align: center;">
        <a href="https://app.luminuslatam.com/" target="_blank" style="display: inline-block; background-color: #ffffff !important; color: #000000 !important; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; text-align: center;">
          Ingresar a la plataforma
        </a>
      </div>
    </div>
  `;

  return renderEmailLayout({
    title: `[LUMINUS] ¡Ya está online!: ${eventTitle}`,
    contentHtml,
    alignCenter: true,
  });
}

