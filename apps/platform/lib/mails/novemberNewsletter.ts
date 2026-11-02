/**
 * Plantilla de Email Marketing: Novedades LUMINUS (Canal Instagram, Romina Acosta y Andrés Benia)
 * Ubicación: apps/platform/lib/mails/novemberNewsletter.ts
 */

export interface NovemberNewsletterOptions {
  nombre?: string;
  unsubscribeUrl?: string;
  previewText?: string;
}

export function renderNovemberNewsletterHtml(options?: NovemberNewsletterOptions): string {
  const unsubscribeUrl = options?.unsubscribeUrl || "{{link_desuscripcion}}";
  const nombre = options?.nombre || "{{nombre}}";
  const previewText =
    options?.previewText ||
    "Canal de Instagram de LUMINUS, nutrición deportiva con Romina Acosta y terapia de flotación.";

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
    <p style="margin: 0 0 16px 0; color: #000000 !important;">¡Hola ${nombre}!</p>
    
    <p style="margin: 0; color: #000000 !important;">
      Esta semana tenemos varias novedades para compartir contigo: un espacio para mantenernos conectados, una conversación sobre alimentación y rendimiento, y una experiencia que nos invita a hacer una pausa.
    </p>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 28px 0 32px 0;" />

  <!-- NOVEDAD 1: CANAL DE INSTAGRAM -->
  <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; margin-bottom: 32px; border: 0;">
    <!-- COVER IMAGE -->
    <a href="https://www.instagram.com/channel/DRFbsMR7bOjLfCv8/" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
      <img 
        src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/Octubre/2oct1.jpg" 
        alt="Todas las novedades de LUMINUS, en un solo lugar" 
        style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" 
      />
    </a>
    
    <div style="padding: 24px 20px 28px 20px; text-align: left;">
      <p style="margin: 0 0 6px 0; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b !important;">
        Comunidad
      </p>
      <h3 style="font-size: 19px; font-weight: 700; line-height: 1.35; color: #000000 !important; margin: 0 0 14px 0;">
        Todas las novedades de LUMINUS, en un solo lugar
      </h3>
      
      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 14px 0;">
        Creamos Novedades LUMINUS, nuestro canal de Instagram, para compartir las próximas actividades, entrevistas y encuentros de la red.
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 22px 0;">
        Únete para recibir las actualizaciones directamente en Instagram y enterarte a tiempo de las experiencias en las que te gustaría participar.
      </p>
      
      <div style="text-align: center;">
        <a href="https://www.instagram.com/channel/DRFbsMR7bOjLfCv8/" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Unirme al canal de Instagram
        </a>
      </div>
    </div>
  </div>

  <!-- NOVEDAD 2: ROMINA ACOSTA -->
  <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; margin-bottom: 32px; border: 0;">
    <!-- COVER IMAGE -->
    <a href="https://luminuslatam.com/proximasfechas/comer-mejor-rendir-mas-las-claves-de-la-nutricion-deportiva-nddm" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
      <img 
        src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/Octubre/2oct2.jpg" 
        alt="Comer mejor, rendir más: las claves de la nutrición deportiva" 
        style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" 
      />
    </a>
    
    <div style="padding: 24px 20px 28px 20px; text-align: left;">
      <p style="margin: 0 0 6px 0; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b !important;">
        Próximo estreno
      </p>
      <h3 style="font-size: 19px; font-weight: 700; line-height: 1.35; color: #000000 !important; margin: 0 0 6px 0;">
        Comer mejor, rendir más: las claves de la nutrición deportiva
      </h3>
      
      <p style="font-size: 15px; color: #475569 !important; margin: 0 0 14px 0; font-weight: 500;">
        Con Romina Acosta
      </p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 14px 0;">
        ¿Qué tan importante es la alimentación para nuestra energía y rendimiento físico?
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 14px 0;">
        En nuestra próxima entrevista conversamos con Romina Acosta, nutricionista especializada en nutrición deportiva, sobre el papel de la alimentación en el entrenamiento, los mitos relacionados con las proteínas y los carbohidratos, y la importancia de desarrollar hábitos sostenibles.
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 22px 0;">
        Una conversación tanto para quienes entrenan regularmente como para quienes buscan mejorar su alimentación y bienestar.
      </p>
      
      <div style="text-align: center;">
        <a href="https://luminuslatam.com/proximasfechas/comer-mejor-rendir-mas-las-claves-de-la-nutricion-deportiva-nddm" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Conocer el próximo estreno
        </a>
      </div>
    </div>
  </div>

  <!-- NOVEDAD 3: ANDRÉS BENIA -->
  <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; margin-bottom: 36px; border: 0;">
    <!-- COVER IMAGE -->
    <a href="https://www.youtube.com/watch?v=kyashFm0MhU" target="_blank" style="display: block; border: 0; outline: none; text-decoration: none;">
      <img 
        src="https://kyrszgvhmzpwsguxebpt.supabase.co/storage/v1/object/public/mailing/Octubre/2oct3.jpg" 
        alt="Terapia de flotación: una pausa para el cuerpo y la mente" 
        style="width: 100%; max-height: 320px; object-fit: cover; display: block; border: 0; outline: none;" 
      />
    </a>
    
    <div style="padding: 24px 20px 28px 20px; text-align: left;">
      <p style="margin: 0 0 6px 0; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b !important;">
        Ya disponible
      </p>
      <h3 style="font-size: 19px; font-weight: 700; line-height: 1.35; color: #000000 !important; margin: 0 0 6px 0;">
        Terapia de flotación: una pausa para el cuerpo y la mente
      </h3>
      
      <p style="font-size: 15px; color: #475569 !important; margin: 0 0 14px 0; font-weight: 500;">
        Con Andrés Benia
      </p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 14px 0;">
        ¿Cómo sería desconectarnos por un momento de todos los estímulos que nos rodean?
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 14px 0;">
        En nuestra última entrevista conversamos con Andrés Benia, fundador de Float Uruguay, sobre la terapia de flotación, cómo funciona esta experiencia y su relación con la meditación, el descanso y la conexión entre cuerpo y mente.
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #000000 !important; margin: 0 0 22px 0;">
        Si todavía no has visto la entrevista, puedes disfrutar de la conversación completa en YouTube.
      </p>
      
      <div style="text-align: center;">
        <a href="https://www.youtube.com/watch?v=kyashFm0MhU" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #000000 !important; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center; border: 0;">
          Ver entrevista en YouTube
        </a>
      </div>
    </div>
  </div>

  <hr style="border: 0; height: 1px; background-color: #e2e8f0; margin: 36px 0;" />
  
  <!-- FOOTER OFICIAL -->
  <div style="text-align: center; max-width: 500px; margin: 0 auto; padding: 0;">
    <p style="font-size: 14px; margin: 0 0 8px 0; line-height: 1.4; color: #000000 !important; font-weight: 600; text-align: center;">
      Una red de bienestar para Latinoamérica.
    </p>
    <p style="font-size: 12px; font-weight: normal; line-height: 1.5; color: #000000 !important; margin: 0 0 22px 0; text-align: center;">
      LUMINUS conecta personas, especialistas e iniciativas de diferentes áreas, facilitando el acceso a conocimientos, experiencias y nuevas formas de entender el bienestar. Una red donde las conexiones generan posibilidades para todos sus integrantes.
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
