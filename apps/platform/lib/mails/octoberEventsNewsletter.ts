/**
 * Plantilla de Email Marketing: Calendario de Eventos Octubre (3 Conversaciones)
 * Ubicación: apps/platform/lib/mails/octoberEventsNewsletter.ts
 */

export interface OctoberEventsNewsletterOptions {
  nombre?: string;
  unsubscribeUrl?: string;
  previewText?: string;
}

export function renderOctoberEventsNewsletterHtml(options?: OctoberEventsNewsletterOptions): string {
  const unsubscribeUrl = options?.unsubscribeUrl || "{{link_desuscripcion}}";
  const nombre = options?.nombre || "{{nombre}}";
  const previewText =
    options?.previewText ||
    "Medicina estética consciente, vínculos y emociones, y terapia de flotación en LUMINUS.";

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff !important; color: #000000 !important; text-align: left; border: 0; padding: 32px 16px; box-sizing: border-box;">
  
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

  <!-- INTRODUCCIÓN -->
  <div style="font-size: 16px; line-height: 1.6; color: #000000 !important; margin-bottom: 28px;">
    <p style="margin: 0 0 16px 0; color: #000000 !important;">Hola ${nombre},</p>
    
    <p style="margin: 0 0 16px 0; color: #000000 !important;">
      Octubre llega con tres nuevos estrenos en LUMINUS y tres temas muy distintos entre sí: la relación entre estética y bienestar, las herramientas que pueden ayudarnos a expresar lo que sentimos y una práctica pensada para hacer una pausa frente a tantos estímulos.
    </p>

    <p style="margin: 0 0 0 0; color: #000000 !important;">
      Te compartimos lo que preparamos para este mes:
    </p>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 28px 0 32px 0;" />

  <!-- EVENTO 1: DRA. EVELYN GÓMEZ -->
  <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; margin-bottom: 32px; border: 0;">
    <!-- COVER IMAGE -->
    <a href="https://luminuslatam.com/proximasfechas/verse-bien-sentirse-bien-otra-mirada-sobre-la-medicina-estetica-s5yj" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
      <img 
        src="https://luminus-storage-prod-905418193825-us-east-1-an.s3.us-east-1.amazonaws.com/events/covers/verse-bien-sentirse-bien-otra-mirada-sobre-la-medicina-estetica-s5yj.jpg" 
        alt="Verse bien, sentirse bien: otra mirada sobre la medicina estética" 
        style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" 
      />
    </a>
    
    <div style="padding: 24px 20px 28px 20px; text-align: left;">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; background-color: #e2e8f0; color: #000000 !important; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 14px; border-radius: 12px;">
          📅 Sábado 4 de octubre
        </span>
      </div>

      <h3 style="font-size: 19px; font-weight: 700; line-height: 1.35; color: #000000 !important; margin: 0 0 8px 0;">
        Verse bien, sentirse bien: otra mirada sobre la medicina estética
      </h3>
      
      <p style="font-size: 15px; font-weight: 600; color: #000000 !important; margin: 0 0 4px 0;">
        Junto a la <strong style="color: #000000 !important;">Dra. Evelyn Gómez</strong>
      </p>
      <p style="font-size: 14px; margin: 0 0 14px 0;">
        <a href="https://www.instagram.com/dra.evelyn_gomez/" target="_blank" style="display: inline-block; color: #000000 !important; text-decoration: none; font-weight: 500; vertical-align: middle;">
          <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/RRSS-BotonInstagram.png" alt="Instagram" width="16" height="16" style="display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin-right: 5px; border: 0; outline: none;" /><span style="vertical-align: middle; color: #000000 !important;">@dra.evelyn_gomez</span>
        </a>
      </p>
      
      <p style="font-size: 14.5px; line-height: 1.6; color: #000000 !important; margin: 0 0 22px 0;">
        ¿Qué lugar ocupan nuestras expectativas cuando decidimos cambiar algo de nuestra apariencia? Junto a Evelyn hablamos sobre estándares de belleza, redes sociales, naturalidad y el valor de un criterio médico que no solo indica qué hacer, sino también cuándo es mejor decir que no.
      </p>
      
      <div style="text-align: center;">
        <a href="https://luminuslatam.com/proximasfechas/verse-bien-sentirse-bien-otra-mirada-sobre-la-medicina-estetica-s5yj" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Inscribirme al estreno
        </a>
      </div>
    </div>
  </div>

  <!-- EVENTO 2: PSICO. MATEO GARCÍA -->
  <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; margin-bottom: 32px; border: 0;">
    <!-- COVER IMAGE -->
    <a href="https://luminuslatam.com/proximasfechas/entendernos-una-herramienta-para-hablar-de-lo-que-sentimos-kncb" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
      <img 
        src="https://luminus-storage-prod-905418193825-us-east-1-an.s3.us-east-1.amazonaws.com/events/covers/entendernos-una-herramienta-para-hablar-de-lo-que-sentimos-kncb.jpg" 
        alt="Entendernos: una herramienta para hablar de lo que sentimos" 
        style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" 
      />
    </a>
    
    <div style="padding: 24px 20px 28px 20px; text-align: left;">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; background-color: #e2e8f0; color: #000000 !important; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 14px; border-radius: 12px;">
          📅 Viernes 18 de octubre
        </span>
      </div>

      <h3 style="font-size: 19px; font-weight: 700; line-height: 1.35; color: #000000 !important; margin: 0 0 8px 0;">
        Entendernos: una herramienta para hablar de lo que sentimos
      </h3>
      
      <p style="font-size: 15px; font-weight: 600; color: #000000 !important; margin: 0 0 4px 0;">
        Con el <strong style="color: #000000 !important;">Psico. Mateo García</strong>
      </p>
      <p style="font-size: 14px; margin: 0 0 14px 0;">
        <a href="https://www.instagram.com/psico.mateogarcia/" target="_blank" style="display: inline-block; color: #000000 !important; text-decoration: none; font-weight: 500; vertical-align: middle;">
          <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/RRSS-BotonInstagram.png" alt="Instagram" width="16" height="16" style="display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin-right: 5px; border: 0; outline: none;" /><span style="vertical-align: middle; color: #000000 !important;">@psico.mateogarcia</span>
        </a>
      </p>
      
      <p style="font-size: 14.5px; line-height: 1.6; color: #000000 !important; margin: 0 0 22px 0;">
        A veces no es fácil poner en palabras lo que nos pasa, ni saber qué preguntar cuando queremos acercarnos a alguien. Mateo nos propone pensar en la escucha, las preguntas y la comunicación como herramientas para fortalecer nuestros vínculos. Además, conocemos <em>Entendernos</em>, su proyecto de cartas creado para facilitar esas conversaciones.
      </p>
      
      <div style="text-align: center;">
        <a href="https://luminuslatam.com/proximasfechas/entendernos-una-herramienta-para-hablar-de-lo-que-sentimos-kncb" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Inscribirme al estreno
        </a>
      </div>
    </div>
  </div>

  <!-- EVENTO 3: ANDRÉS BENIA (FLOAT URUGUAY) -->
  <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; margin-bottom: 36px; border: 0;">
    <!-- COVER IMAGE -->
    <a href="https://luminuslatam.com/proximasfechas/terapia-de-flotacion-una-pausa-para-el-cuerpo-y-la-mente-zzpl" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
      <img 
        src="https://luminus-storage-prod-905418193825-us-east-1-an.s3.us-east-1.amazonaws.com/events/covers/35739d40-e22e-4f39-922a-b8240ee38ada.jpg" 
        alt="Terapia de flotación: una pausa para el cuerpo y la mente" 
        style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" 
      />
    </a>
    
    <div style="padding: 24px 20px 28px 20px; text-align: left;">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; background-color: #e2e8f0; color: #000000 !important; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 14px; border-radius: 12px;">
          📅 Sábado 31 de octubre
        </span>
      </div>

      <h3 style="font-size: 19px; font-weight: 700; line-height: 1.35; color: #000000 !important; margin: 0 0 8px 0;">
        Terapia de flotación: una pausa para el cuerpo y la mente
      </h3>
      
      <p style="font-size: 15px; font-weight: 600; color: #000000 !important; margin: 0 0 4px 0;">
        Con <strong style="color: #000000 !important;">Andrés Benia</strong> de Float Uruguay
      </p>
      <p style="font-size: 14px; margin: 0 0 14px 0;">
        <a href="https://www.instagram.com/floaturuguay/" target="_blank" style="display: inline-block; color: #000000 !important; text-decoration: none; font-weight: 500; vertical-align: middle;">
          <img src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/RRSS-BotonInstagram.png" alt="Instagram" width="16" height="16" style="display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin-right: 5px; border: 0; outline: none;" /><span style="vertical-align: middle; color: #000000 !important;">@floaturuguay</span>
        </a>
      </p>
      
      <p style="font-size: 14.5px; line-height: 1.6; color: #000000 !important; margin: 0 0 22px 0;">
        ¿Qué pasa cuando reducimos al mínimo los estímulos que recibimos constantemente? Andrés nos acerca a la terapia de flotación y a la experiencia que desarrollan en Float Uruguay: un entorno diseñado para desconectarse del exterior durante un momento y favorecer la relajación, la meditación y el descanso.
      </p>
      
      <div style="text-align: center;">
        <a href="https://luminuslatam.com/proximasfechas/terapia-de-flotacion-una-pausa-para-el-cuerpo-y-la-mente-zzpl" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Inscribirme al estreno
        </a>
      </div>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 36px 0;" />

  <!-- SECCIÓN CIERRE: TODO LUMINUS EN UN MISMO LUGAR -->
  <div style="margin-bottom: 36px;">
    <h2 style="font-size: 22px; font-weight: bold; color: #000000 !important; margin: 0 0 20px 0; line-height: 1.3;">
      Todo LUMINUS en un mismo lugar
    </h2>

    <div style="border-radius: 16px; overflow: hidden; margin-bottom: 24px; text-align: center; background-color: #f8fafc;">
      <a href="https://luminuslatam.com/" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
        <img 
          src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/mailingeventos1102026.png" 
          alt="Todo LUMINUS en un mismo lugar" 
          width="548" 
          style="width: 100%; max-width: 540px; height: auto; display: block; margin: 0 auto; border: 0; border-radius: 16px;" 
        />
      </a>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #000000 !important; margin: 0 0 16px 0;">
      En nuestra plataforma puedes descubrir próximas actividades, acceder a nuevos contenidos y formar parte de una red vinculada a distintas formas de bienestar.
    </p>

    <p style="font-size: 16px; font-weight: bold; line-height: 1.6; color: #000000 !important; margin: 0 0 24px 0;">
      El registro es gratuito y te permite empezar a explorar LUMINUS desde hoy.
    </p>

    <div style="text-align: center;">
      <a href="https://app.luminuslatam.com/" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
        Registrarme gratis
      </a>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 36px 0;" />
  
  <!-- FOOTER OFICIAL -->
  <div style="text-align: center; max-width: 500px; margin: 0 auto; padding: 0;">
    <p style="font-size: 14px; margin: 0 0 8px 0; line-height: 1.4; color: #000000 !important; text-align: center;">
      Una red para conectar, aprender y cuidar tu bienestar.
    </p>
    <p style="font-size: 12px; font-weight: normal; line-height: 1.5; color: #000000 !important; margin: 0 0 22px 0; text-align: center;">
      Conectamos personas y especialistas de distintas áreas en un mismo espacio para compartir experiencias, acceder a nuevas perspectivas y encontrar formas de cuidar el bienestar que se adapten a cada persona y momento de su vida.
    </p>

    <!-- Social Media Icons -->
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="https://www.youtube.com/@luminus_latam" target="_blank" style="display: inline-block; margin: 0 10px; color: #000000 !important; text-decoration: none;" aria-label="YouTube">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
      </a>
      <a href="https://www.instagram.com/luminus_latam/" target="_blank" style="display: inline-block; margin: 0 10px; color: #000000 !important; text-decoration: none;" aria-label="Instagram">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://www.linkedin.com/in/gabrielmedcap/" target="_blank" style="display: inline-block; margin: 0 10px; color: #000000 !important; text-decoration: none;" aria-label="LinkedIn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      </a>
    </div>

    <!-- Legal Text & Unsubscribe -->
    <p style="margin: 0 0 6px 0; font-size: 12px; color: #000000 !important; text-align: center;">© 2026 LUMINUS Latam. Todos los derechos reservados.</p>
    <p style="margin: 0; font-size: 12px; color: #000000 !important; text-align: center;">
      <a href="${unsubscribeUrl}" target="_blank" style="color: #000000 !important; text-decoration: underline;">Desuscribirme de estos correos</a>
    </p>
  </div>
</div>`;
}
