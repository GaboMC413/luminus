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
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #000000 !important; text-align: center;">
      ¡Hola ${firstName}!
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #000000 !important; font-weight: 500; margin: 0 0 6px 0; text-align: center;">
      Te has inscripto a la entrevista online <strong style="color: #000000 !important;">${eventTitle}</strong>.
    </p>

    <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 28px 0; text-align: center;">
      Podrás ver el estreno el ${formattedDate}.
    </p>

    <!-- Official Newsletter Card: #f8fafc, border-radius 20px, border 0 -->
    <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; text-align: center; margin-bottom: 36px; border: 0;">
      ${coverImageUrl ? `<a href="${youtubeLink}" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;"><img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" /></a>` : ''}
      
      <div style="padding: 24px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; line-height: 1.3; color: #000000 !important; margin: 0 0 8px 0; text-align: center;">
          ${eventTitle}
        </h3>
        
        ${data.speakerName ? `<p style="font-size: 16px; font-weight: 600; color: #000000 !important; margin: 0 0 6px 0; text-align: center;">Con ${data.speakerName}</p>` : ''}
        
        <p style="font-size: 15px; font-weight: 500; color: #000000 !important; margin: 0 0 20px 0; text-align: center;">
          ${formattedDate} • YouTube
        </p>
        
        <a href="${youtubeLink}" target="_blank" style="display: inline-block; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Ver en YouTube
        </a>
      </div>
    </div>

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

  return renderEmailLayout({
    title: `Confirmación de inscripción: ${eventTitle}`,
    preheader: `Estreno el ${formattedDate}`,
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
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #000000 !important; text-align: center;">
      ¡Hola ${firstName}!
    </h1>

    <p style="font-size: 16px; line-height: 1.6; color: #000000 !important; font-weight: 500; margin: 0 0 28px 0; text-align: center;">
      <strong style="color: #000000 !important;">${eventTitle}</strong>${data.speakerName ? `, con ${data.speakerName}` : ""}, ya está disponible en nuestro canal de YouTube.
    </p>

    <!-- Official Newsletter Card: #f8fafc, border-radius 20px, border 0 -->
    <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; text-align: center; margin-bottom: 36px; border: 0;">
      ${coverImageUrl ? `<a href="${youtubeLink}" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;"><img src="${coverImageUrl}" alt="${eventTitle}" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" /></a>` : ''}
      
      <div style="padding: 24px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; line-height: 1.3; color: #000000 !important; margin: 0 0 8px 0; text-align: center;">
          ${eventTitle}
        </h3>
        
        ${data.speakerName ? `<p style="font-size: 16px; font-weight: 600; color: #000000 !important; margin: 0 0 6px 0; text-align: center;">Con ${data.speakerName}</p>` : ''}
        
        <p style="font-size: 15px; font-weight: 500; color: #000000 !important; margin: 0 0 20px 0; text-align: center;">
          ${formattedDate} • YouTube
        </p>
        
        <a href="${youtubeLink}" target="_blank" style="display: inline-block; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Ver ahora en YouTube
        </a>
      </div>
    </div>

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

  const subjectTitle = data.speakerName
    ? `Ya puedes ver la entrevista con ${data.speakerName}`
    : `Ya puedes ver la entrevista`;

  return renderEmailLayout({
    title: subjectTitle,
    preheader: eventTitle,
    contentHtml,
    alignCenter: true,
  });
}


