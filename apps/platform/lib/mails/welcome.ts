import { renderEmailLayout, PLATFORM_APP_URL } from "./EmailLayout";

export function renderWelcomeEmailHtml(name: string = "Usuario"): string {
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      Te damos la bienvenida a LUMINUS
    </h1>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 20px 0; color: #334155; text-align: center;">
      Hola <strong style="color: #0f172a;">${name}</strong>, nos alegra darte la bienvenida a esta red creada para conectar, aprender y cuidar tu bienestar.
    </p>

    <!-- Tarjeta de descubrimiento (alineada a las tarjetas de bienvenida del onboarding) -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
      <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 16px 0;">
        ¿Qué puedes descubrir en LUMINUS?
      </p>

      <div style="margin-bottom: 14px;">
        <strong style="color: #0f172a; font-size: 14px;">• Conoce Especialistas:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Profesionales de distintas áreas de la salud y el bienestar para guiarte.</span>
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="color: #0f172a; font-size: 14px;">• Conecta con Personas:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Comparte experiencias y conversaciones con personas afines en un entorno seguro.</span>
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="color: #0f172a; font-size: 14px;">• Descubre Experiencias:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Participa en actividades, encuentros y talleres en vivo.</span>
      </div>

      <div style="margin-bottom: 0;">
        <strong style="color: #0f172a; font-size: 14px;">• Accede a Contenidos:</strong>
        <span style="color: #475569; font-size: 14px; line-height: 1.5;"> Entrevistas, recursos y perspectivas para acompañar tu día a día.</span>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${PLATFORM_APP_URL}/inicio" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center;">
        Ingresar a la red
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "Te damos la bienvenida a LUMINUS",
    preheader: "Una red para conectar, aprender y cuidar tu bienestar.",
    contentHtml,
    alignCenter: true,
  });
}
