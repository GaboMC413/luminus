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

export function renderEventRegistrationEmailHtml(data: EventInscriptionEmailOptions): string {
  const firstName = data.firstName || "Usuario";
  const eventTitle = data.eventTitle || "Taller de Bienestar LUMINUS";
  const formattedDate = data.eventDate || "Próximamente";
  const formattedTime = data.timeText || "18:00 hs (GMT-3)";
  const youtubeLink = data.youtubeUrl || (data.eventSlug ? `https://luminuslatam.com/proximasfechas/${data.eventSlug}` : "https://www.youtube.com/@luminus_latam");
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
      
      <div style="padding: 20px 24px 24px 24px; text-align: center;">
        <p style="font-size: 13px; font-weight: 600; color: #64748b; margin: 0 0 8px 0; text-align: center;">
          ${data.speakerName ? `Con ${data.speakerName}` : 'Especialista LUMINUS'} • ${formattedDate}
        </p>
        
        <h2 style="font-size: 20px; font-weight: 700; line-height: 1.35; color: #0f172a; margin: 0 0 20px 0; text-align: center;">
          ${eventTitle}
        </h2>
        
        <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center;">
          <a href="${youtubeLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center;">
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
