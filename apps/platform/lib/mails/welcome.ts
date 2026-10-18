import { renderEmailLayout, PLATFORM_APP_URL } from "./EmailLayout";

export function renderWelcomeEmailHtml(name: string = "Usuario"): string {
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 20px 0; color: #0f172a; text-align: center;">
      Te damos la bienvenida a LUMINUS.
    </h1>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 20px 0; color: #334155; text-align: center;">
      Hola <strong style="color: #0f172a;">${name}</strong>, nos alegra acompañarte en este espacio creado para conectar, aprender y explorar nuevas formas de cuidar tu bienestar integral.
    </p>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 28px 0; color: #334155; text-align: center;">
      En LUMINUS podrás descubrir profesionales, eventos y conversaciones pensados para cada etapa y momento de tu vida.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${PLATFORM_APP_URL}/" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center;">
        Ingresar
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "¡Te damos la bienvenida a LUMINUS!",
    contentHtml,
    alignCenter: true,
  });
}
