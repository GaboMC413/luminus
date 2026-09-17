/**
 * Plantilla de Email Marketing: Entrevista Belén Pittamiglio & Nuevo Feed de LUMINUS
 * Ubicación: apps/platform/lib/mails/belenNewsletter.ts
 */

export function renderBelenNewsletterHtml(options?: {
  nombre?: string;
  unsubscribeUrl?: string;
  previewText?: string;
}) {
  const unsubscribeUrl = options?.unsubscribeUrl || "{{link_desuscripcion}}";
  const nombre = options?.nombre || "{{nombre}}";
  const previewText =
    options?.previewText ||
    "Este domingo estrenamos una entrevista con Belén Pittamiglio y te presentamos el nuevo feed de la red.";

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; color: #000000; text-align: left; border: 0; padding: 32px 16px; box-sizing: border-box;">
  
  <!-- PREHEADER / PREVIEW TEXT -->
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; overflow: hidden; mso-hide: all;">
    ${previewText}
  </span>

  <!-- LOGO HEADER -->
  <div style="margin-bottom: 32px; text-align: center;">
    <a href="https://luminuslatam.com" target="_blank" style="display: inline-block; border: 0; outline: none; text-decoration: none;">
      <img src="https://luminuslatam.com/logo-mails.jpg" alt="LUMINUS" width="160" style="display: block; width: 160px; height: auto; margin: 0 auto; border: 0; outline: none;" />
    </a>
  </div>

  <!-- INTRODUCCIÓN DE GABRIEL -->
  <div style="font-size: 16px; line-height: 1.6; color: #000000; margin-bottom: 32px;">
    <p style="margin: 0 0 16px 0;">Hola ${nombre}, espero que estés muy bien.</p>
    
    <p style="margin: 0 0 16px 0;">
      Hablar de bienestar también implica animarnos a conversar sobre temas que muchas veces evitamos. Tener información clara puede ayudarnos a conocer mejor nuestro cuerpo, nuestros vínculos y también la forma en que nos relacionamos con los demás.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Esta semana queremos abrir una de esas conversaciones.
    </p>

    <div style="margin-top: 20px; text-align: right;">
      <p style="margin: 0; font-weight: bold; color: #000000; font-size: 16px;">Gabriel Medero</p>
      <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: normal; font-style: italic; color: #000000;">Director General de LUMINUS</p>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 32px 0;" />

  <!-- SECCIÓN 1: ENTREVISTA BELÉN PITTAMIGLIO -->
  <div style="margin-bottom: 36px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #000000; margin: 0 0 6px 0; line-height: 1.3;">
      Sexualidad sin tabúes: cuerpo, vínculos y comunicación
    </h1>
    <p style="font-size: 16px; font-weight: normal; font-style: italic; color: #000000; margin: 0 0 20px 0;">
      Con Belén Pittamiglio
    </p>

    <!-- FOTO PORTADA DE BELÉN -->
    <div style="border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
      <a href="https://luminuslatam.com/proximasfechas/educacion-sexual-mitos-comunicacion" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img src="https://luminus-storage-prod-905418193825-us-east-1-an.s3.us-east-1.amazonaws.com/events/covers/sexualidad-sin-tabues2.jpg" alt="Sexualidad sin tabúes - Belén Pittamiglio" style="width: 100%; height: auto; display: block; margin: 0 auto; border: 0; border-radius: 16px;" />
      </a>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      Este domingo estrenamos una nueva entrevista de LUMINUS junto a Belén Pittamiglio, educadora sexual y orientadora en sexología.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      Conversamos sobre sexualidad desde una mirada mucho más amplia que la prevención o las relaciones sexuales: hablamos del conocimiento del cuerpo, las emociones, el deseo, los vínculos y la importancia de aprender a comunicarnos.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      También abordamos algunos de los mitos que todavía persisten, la desinformación que circula en redes sociales y el desafío de acompañar a niños y adolescentes con información clara y adecuada para cada etapa.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 20px 0;">
      Belén cuenta con formación de posgrado en Sexología y Promoción de la Salud y trabaja en educación sexual con adolescentes, adultos y familias desde una mirada integral, basada en evidencia y libre de prejuicios.
    </p>

    <!-- BLOQUE DESTACADO DE ESTRENO -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px; margin: 28px 0 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000000; line-height: 1.5;">
        Domingo 20 de septiembre<br />
        Estreno online por YouTube
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 20px 0; text-align: center;">
      Inscríbete gratis para acceder al estreno y sumarte a una conversación sobre todas esas charlas sobre sexualidad que todavía nos debemos.
    </p>

    <!-- BOTÓN YOUTUBE / EVENTO -->
    <div style="text-align: center; margin-bottom: 12px;">
      <a href="https://luminuslatam.com/proximasfechas/educacion-sexual-mitos-comunicacion" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: normal; text-align: center; border: 0;">
        Inscribirme al estreno
      </a>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 36px 0;" />

  <!-- SECCIÓN 2: NUEVO FEED DE LUMINUS -->
  <div style="margin-bottom: 36px;">
    <h2 style="font-size: 22px; font-weight: bold; color: #000000; margin: 0 0 20px 0; line-height: 1.3;">
      Hay una nueva forma de participar en LUMINUS
    </h2>

    <!-- FOTO BANNER DE LA PLATAFORMA -->
    <div style="border-radius: 16px; overflow: hidden; margin-bottom: 20px;">
      <a href="https://app.luminuslatam.com/auth/registrarse" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/email17sep2026plataforma.jpg" alt="Nuevo Feed de LUMINUS" style="width: 100%; height: auto; display: block; margin: 0 auto; border: 0; border-radius: 16px;" />
      </a>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      La plataforma ahora cuenta con un nuevo feed, un espacio donde puedes descubrir contenidos, actividades, propuestas de especialistas y publicaciones de otras personas que forman parte de la red.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      También puedes compartir tus propias iniciativas, ideas o recursos para que otros puedan descubrirlos.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      Queremos que sea un espacio donde entrar a LUMINUS no sea solamente buscar algo, sino también encontrar nuevas conversaciones, personas y propuestas vinculadas al bienestar.
    </p>

    <p style="font-size: 16px; font-weight: bold; line-height: 1.6; color: #000000; margin: 0 0 24px 0;">
      Registrarte es gratis y te permite empezar a explorar y participar desde hoy.
    </p>

    <!-- BOTÓN PLATAFORMA -->
    <div style="text-align: center;">
      <a href="https://app.luminuslatam.com/auth/registrarse" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: normal; text-align: center; border: 0;">
        Conocer el nuevo feed
      </a>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 36px 0;" />
  
  <!-- FOOTER OFICIAL -->
  <div style="text-align: center; max-width: 500px; margin: 0 auto; padding: 0;">
    <p style="font-size: 14px; margin: 0 0 8px 0; line-height: 1.4; color: #000000; text-align: center;">
      Una red para conectar, aprender y cuidar tu bienestar.
    </p>
    <p style="font-size: 12px; font-weight: normal; line-height: 1.5; color: #000000; margin: 0 0 22px 0; text-align: center;">
      Conectamos personas y especialistas de distintas áreas en un mismo espacio para compartir experiencias, acceder a nuevas perspectivas y encontrar formas de cuidar el bienestar que se adapten a cada persona y momento de su vida.
    </p>

    <!-- Social Media Icons -->
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="https://www.instagram.com/luminus_latam/" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;" aria-label="Instagram">
        <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/RRSS-BotonInstagram.png" alt="Instagram" width="32" height="32" style="display: inline-block; width: 32px; height: 32px; border: 0; outline: none; vertical-align: middle;" />
      </a>
      <a href="https://www.youtube.com/@luminus_latam" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;" aria-label="YouTube">
        <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/RRSS-BotonYoutube-1.png" alt="YouTube" width="32" height="32" style="display: inline-block; width: 32px; height: 32px; border: 0; outline: none; vertical-align: middle;" />
      </a>
      <a href="https://www.linkedin.com/in/gabrielmedcap/" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;" aria-label="LinkedIn">
        <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/RRSS-BotonLinkedIn-2.png" alt="LinkedIn" width="32" height="32" style="display: inline-block; width: 32px; height: 32px; border: 0; outline: none; vertical-align: middle;" />
      </a>
    </div>

    <!-- Desuscripción -->
    <p style="margin: 16px 0 0 0; font-size: 14px; font-weight: normal; color: #000000; text-align: center;">
      <a href="${unsubscribeUrl}" style="color: #000000; text-decoration: underline;">Desuscribirme de estos correos</a>
    </p>
  </div>
</div>`;
}
