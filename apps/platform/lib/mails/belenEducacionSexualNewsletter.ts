/**
 * Plantilla de Email Marketing: Educación Sexual con Belén Pittamiglio & Cierre Plataforma LUMINUS
 * Ubicación: apps/platform/lib/mails/belenEducacionSexualNewsletter.ts
 */

export function renderBelenEducacionSexualNewsletterHtml(options?: {
  nombre?: string;
  unsubscribeUrl?: string;
  previewText?: string;
}) {
  const unsubscribeUrl = options?.unsubscribeUrl || "{{link_desuscripcion}}";
  const nombre = options?.nombre || "{{nombre}}";
  const previewText =
    options?.previewText ||
    "Una mirada sobre educación sexual, vínculos y bienestar.";

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
    <p style="margin: 0 0 16px 0;">Hola ${nombre},</p>
    
    <p style="margin: 0 0 24px 0;">
      Esta semana conversamos con Belén Pittamiglio sobre educación sexual, un tema que atraviesa mucho más que las relaciones sexuales: también tiene que ver con conocer nuestro cuerpo, aprender a comunicarnos, construir vínculos y saber dónde buscar información confiable.
    </p>

    <div style="margin-top: 20px; text-align: left;">
      <p style="margin: 0; font-weight: bold; color: #000000; font-size: 16px;">Gabriel Medero</p>
      <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: normal; font-style: italic; color: #000000;">Director General de LUMINUS</p>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 32px 0;" />

  <!-- SECCIÓN 1: ENTREVISTA BELÉN PITTAMIGLIO -->
  <div style="margin-bottom: 36px;">
    <h1 style="font-size: 22px; font-weight: bold; color: #000000; margin: 0 0 20px 0; line-height: 1.3;">
      Más información no siempre significa mejor educación sexual
    </h1>

    <!-- FOTO DEL ARTÍCULO / ENTREVISTA -->
    <div style="border-radius: 16px; overflow: hidden; margin-bottom: 24px; text-align: center; background-color: #f8fafc;">
      <a href="https://youtu.be/gD5co15_iVk?si=-OE0QRFgV3jAmHGK" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/mailing229imagearticle2.png" alt="Más información no siempre significa mejor educación sexual" width="548" style="width: 100%; max-width: 540px; height: auto; display: block; margin: 0 auto; border: 0; border-radius: 16px;" />
      </a>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      Hoy es más fácil que nunca encontrar información sobre sexualidad. Redes sociales, podcasts, buscadores e inteligencia artificial ofrecen respuestas inmediatas sobre el cuerpo, los vínculos, el deseo o el consentimiento.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      El problema es que tener acceso a contenido no significa necesariamente saber interpretarlo. Muchas veces falta contexto, no sabemos si una fuente es confiable o si esa información aplica realmente a nuestra edad, situación o experiencia.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      Por eso, la educación sexual no debería limitarse a transmitir datos. También implica aprender a preguntar, conversar, reconocer lo que no sabemos y buscar respuestas en espacios seguros y confiables. Hablar sobre sexualidad sigue siendo una herramienta fundamental para conocernos mejor y construir vínculos más conscientes.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      En nuestra entrevista con Belén Pittamiglio profundizamos sobre este tema y otros desafíos de la educación sexual actual.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 20px 0;">
      Mira la entrevista completa en nuestro canal de YouTube.
    </p>

    <!-- BOTÓN YOUTUBE -->
    <div style="text-align: center; margin-bottom: 12px;">
      <a href="https://youtu.be/gD5co15_iVk?si=-OE0QRFgV3jAmHGK" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: normal; text-align: center; border: 0;">
        Ver entrevista en YouTube
      </a>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 36px 0;" />

  <!-- SECCIÓN 2: PLATAFORMA CIERRE -->
  <div style="margin-bottom: 36px;">
    <h2 style="font-size: 22px; font-weight: bold; color: #000000; margin: 0 0 20px 0; line-height: 1.3;">
      Un espacio para descubrir, participar y conectar
    </h2>

    <!-- FOTO BANNER DE LA PLATAFORMA -->
    <div style="border-radius: 16px; overflow: hidden; margin-bottom: 24px; text-align: center; background-color: #f8fafc;">
      <a href="https://luminuslatam.com/" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/mialing229imagepaltform.png" alt="Plataforma LUMINUS" width="548" style="width: 100%; max-width: 540px; height: auto; display: block; margin: 0 auto; border: 0; border-radius: 16px;" />
      </a>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      En LUMINUS puedes participar en la red y encontrar propuestas vinculadas a distintas formas de bienestar.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      Dentro de la plataforma puedes crear tu perfil, conocer lo que otros integrantes están compartiendo y descubrir actividades, entrevistas, contenidos e iniciativas que pueden ayudarte a explorar nuevos intereses o profundizar en temas que ya forman parte de tu vida.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
      La idea es simple: reunir en un mismo lugar distintas formas de aprender, participar y acercarte al bienestar desde lo que tiene sentido para ti.
    </p>

    <p style="font-size: 16px; font-weight: bold; line-height: 1.6; color: #000000; margin: 0 0 24px 0;">
      Registrarte es gratis y puedes empezar a explorar la red desde hoy.
    </p>

    <!-- BOTÓN PLATAFORMA -->
    <div style="text-align: center;">
      <a href="https://luminuslatam.com/" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: normal; text-align: center; border: 0;">
        Registrarme gratis
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
      <a href="https://www.youtube.com/@luminus_latam" target="_blank" style="display: inline-block; margin: 0 10px; color: #000000; text-decoration: none;" aria-label="YouTube">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
      </a>
      <a href="https://www.instagram.com/luminus_latam/" target="_blank" style="display: inline-block; margin: 0 10px; color: #000000; text-decoration: none;" aria-label="Instagram">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://www.linkedin.com/in/gabrielmedcap/" target="_blank" style="display: inline-block; margin: 0 10px; color: #000000; text-decoration: none;" aria-label="LinkedIn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      </a>
    </div>

    <!-- Desuscripción -->
    <p style="margin: 16px 0 0 0; font-size: 14px; font-weight: normal; color: #000000; text-align: center;">
      <a href="${unsubscribeUrl}" style="color: #000000; text-decoration: underline;">Desuscribirme de estos correos</a>
    </p>
  </div>
</div>`;
}
