/**
 * Plantilla dedicada para el Mail de Relanzamiento LUMINUS & Newsletter
 * Ubicación: apps/platform/lib/mails/relaunchNewsletter.ts
 */

export function renderRelaunchNewsletterHtml(options?: {
  nombre?: string;
  unsubscribeUrl?: string;
  previewText?: string;
}) {
  const unsubscribeUrl = options?.unsubscribeUrl || "{{link_desuscripcion}}";
  const nombre = options?.nombre || "{{nombre}}";
  const previewText = options?.previewText || "Los enlaces del correo anterior no funcionaban. Te lo reenviamos corregido 💛";

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; color: #000000; text-align: center; border: 0; padding: 32px 16px; box-sizing: border-box;">
  
  <!-- PREHEADER / PREVIEW TEXT -->
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; overflow: hidden; mso-hide: all;">
    ${previewText}
  </span>

  <!-- LOGO HEADER -->
  <div style="margin-bottom: 20px; text-align: center;">
    <a href="https://luminuslatam.com" target="_blank" style="display: inline-block; border: 0; outline: none; text-decoration: none;">
      <img src="https://luminuslatam.com/logo-mails.jpg" alt="LUMINUS" width="160" style="display: block; width: 160px; height: auto; margin: 0 auto; border: 0; outline: none;" />
    </a>
  </div>

  <!-- NOTA DE ACLARACIÓN (DEBAJO DEL LOGO) -->
  <div style="font-size: 15px; line-height: 1.6; color: #000000; margin: 0 0 28px 0; text-align: center; max-width: 480px; margin-left: auto; margin-right: auto;">
    <p style="margin: 0 0 6px 0; font-weight: 700; font-size: 17px; color: #000000;">
      Los nuevos comienzos no siempre salen perfectos.
    </p>
    <p style="margin: 0; color: #000000;">
      En el correo anterior tuvimos un inconveniente y los enlaces no funcionaban correctamente. Ahora sí, te reenviamos el mensaje con todo funcionando para que puedas conocer nuestra nueva etapa. ¡Gracias!
    </p>
  </div>

  <!-- BANNER PRINCIPAL: PLATAFORMA APP (SIN BORDES) -->
  <div style=" border-radius: 20px; overflow: hidden; margin-bottom: 36px; color: #ffffff; text-align: center;">
    <div style="width: 100%; text-align: center; line-height: 0; background-color: #f8fafc; box-sizing: border-box;">
      <a href="https://luminuslatam.com/" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img src="https://luminuslatam.com/Photos/Luminus%20app%20-%20buscar%20especialistas%20y%20comunidad.png" alt="LUMINUS App" style="width: 100%; max-width: 400px; height: auto; display: block; margin: 0 auto; padding: 0; border: 0; outline: none;" />
      </a>
    </div>
    <div style="padding: 28px 24px; text-align: center; background-color: #000000;">
      <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; line-height: 1.3; text-align: center;">
        Una nueva etapa para LUMINUS
      </h1>
      <p style="font-size: 18px; line-height: 1.6; color: #ffffff; margin: 0; text-align: center; max-width: 460px; margin-left: auto; margin-right: auto;">
        Una nueva web, una nueva plataforma y muchas cosas por construir juntos.
      </p>
    </div>
  </div>

  <!-- TEXTO PRINCIPAL DE PRESENTACIÓN -->
  <div style="font-size: 16px; line-height: 1.6; color: #334155; text-align: center; margin-bottom: 32px;">
    <p style="margin: 0 0 16px 0;">
      Desde el comienzo, LUMINUS fue posible gracias a las personas que participaron, compartieron, colaboraron y confiaron en esta iniciativa. Por eso, antes que nada, queremos agradecerte por haber formado parte.
    </p>
    <p style="margin: 0 0 16px 0;">
      Ahora damos un nuevo paso: estamos lanzando una plataforma propia para conectar a nuestra comunidad con personas, especialistas, actividades y nuevas herramientas para el bienestar.
    </p>
    <p style="margin: 0 0 16px 0;">
      Lo que ves hoy es solo el comienzo. La plataforma va a seguir creciendo y sumando nuevas posibilidades durante los próximos meses, y nos encantaría que seas parte de esta nueva etapa desde el principio.
    </p>
    <p style="margin: 0; font-weight: 700; color: #0f172a;">
      Volvamos a encontrarnos en LUMINUS.
    </p>
  </div>

  <!-- BOTÓN PRINCIPAL DE REGISTRO -->
  <div style="text-align: center; margin-bottom: 36px;">
    <a href="https://luminuslatam.com/" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-size: 16px; font-weight: 700; text-align: center; border: 0;">
      Registrarme en LUMINUS
    </a>
  </div>

  <hr style="border: 0; height: 1px; background-color: #f1f5f9; margin: 36px 0;" />

  <!-- SECCIÓN PRÓXIMAS ACTIVIDADES -->
  <div style="margin-bottom: 36px;">
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3; text-align: center;">
      Próximas actividades gratuitas
    </h2>

    <!-- CARD EVENTO 1: VIVIANA PAGLIAROLI (SIN BORDES) -->
    <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; text-align: center; margin-bottom: 24px; border: 0;">
      <a href="https://luminuslatam.com/proximasfechas/pilates-mas-alla-de-la-estetica" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img src="https://luminus-storage-prod-905418193825-us-east-1-an.s3.us-east-1.amazonaws.com/events/covers/pilates-mas-alla-de-la-estetica.jpg" alt="Pilates más allá de la estética" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" />
      </a>
      
      <div style="padding: 24px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; line-height: 1.3; margin: 0 0 8px 0; text-align: center;">
          Pilates más allá de la estética: fuerza, movilidad y salud a largo plazo
        </h3>
        
        <p style="font-size: 16px; font-weight: 600; margin: 0 0 6px 0; text-align: center;">Con Viviana Pagliaroli</p>
        
        <p style="font-size: 15px; font-weight: 500; margin: 0 0 20px 0; text-align: center;">
          Domingo 6 de septiembre • YouTube
        </p>
        
        <a href="https://luminuslatam.com/proximasfechas/pilates-mas-alla-de-la-estetica" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Inscribirme al estreno
        </a>
      </div>
    </div>

    <!-- CARD EVENTO 2: BELÉN PITTAMIGLIO (SIN BORDES) -->
    <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; text-align: center; border: 0;">
      <a href="https://luminuslatam.com/proximasfechas/educacion-sexual-mitos-comunicacion" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img src="https://luminus-storage-prod-905418193825-us-east-1-an.s3.us-east-1.amazonaws.com/events/covers/sexualidad-sin-tabues2.jpg" alt="Sexualidad sin tabúes" style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" />
      </a>
      
      <div style="padding: 24px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; line-height: 1.3; margin: 0 0 8px 0; text-align: center;">
          Sexualidad sin tabúes: cuerpo, vínculos y comunicación
        </h3>
        
        <p style="font-size: 16px; font-weight: 600; margin: 0 0 6px 0; text-align: center;">Con Belén Pittamiglio</p>
        
        <p style="font-size: 15px; font-weight: 500; margin: 0 0 20px 0; text-align: center;">
          Domingo 20 de septiembre • YouTube
        </p>
        
        <a href="https://luminuslatam.com/proximasfechas/educacion-sexual-mitos-comunicacion" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Inscribirme al estreno
        </a>
      </div>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #f1f5f9; margin: 36px 0;" />
  
  <!-- FOOTER OFICIAL -->
  <div style="text-align: center; max-width: 500px; margin: 0 auto; padding: 0;">
    <p style="font-size: 16px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.4; color: #0f172a; text-align: center;">
      Una red para conectar, aprender y cuidar tu bienestar.
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; text-align: center;">
      Conectamos personas y especialistas de distintas áreas en un mismo espacio para compartir experiencias, acceder a nuevas perspectivas y encontrar formas de cuidar el bienestar que se adapten a cada persona y momento de su vida.
    </p>

    <!-- Social Media Icons -->
    <div style="text-align: center; margin-bottom: 22px;">
      <a href="https://www.youtube.com/@luminus_latam" target="_blank" style="display: inline-block; margin: 0 12px; color: #0f172a; text-decoration: none;" aria-label="YouTube">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
      </a>
      <a href="https://www.instagram.com/luminus_latam/" target="_blank" style="display: inline-block; margin: 0 12px; color: #0f172a; text-decoration: none;" aria-label="Instagram">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://www.linkedin.com/in/gabrielmedcap/" target="_blank" style="display: inline-block; margin: 0 12px; color: #0f172a; text-decoration: none;" aria-label="LinkedIn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      </a>
    </div>

    <!-- Desuscripción -->
    <p style="margin: 16px 0 0 0; font-size: 14px; color: #94a3b8; text-align: center;">
      <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Desuscribirme de estos correos</a>
    </p>
  </div>
</div>`;
}
