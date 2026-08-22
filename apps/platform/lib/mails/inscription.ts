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

export function formatDateSpanish(dateString?: string | null): string {
  if (!dateString) return "Próximamente";
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
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
  `;

  return renderEmailLayout({
    title: `[LUMINUS] Confirmación de inscripción: ${eventTitle}`,
    contentHtml,
    alignCenter: true,
  });
}
