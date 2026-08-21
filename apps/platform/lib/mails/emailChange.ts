import { renderEmailLayout } from "./EmailLayout";

export function renderEmailChangeVerificationHtml(code: string = "654321"): string {
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">Confirma tu nuevo email</h1>
    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 24px 0; color: #334155; text-align: center;">
      Recibimos una solicitud para cambiar la dirección de correo electrónico vinculada a tu cuenta LUMINUS.
    </p>

    <div style="text-align: center;">
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 24px; font-size: 30px; font-weight: 800; letter-spacing: 8px; display: inline-block; margin: 0 0 24px 0; font-family: monospace; color: #0f172a; text-align: center;">${code}</div>
    </div>

    <p style="font-size: 13.5px; opacity: 0.7; margin: 0 0 24px 0; line-height: 1.5; color: #64748b; text-align: center;">Este código vence en 15 minutos. Si no solicitaste este cambio, tu correo actual permanecerá sin modificaciones.</p>
  `;

  return renderEmailLayout({
    title: "Confirma tu nuevo email - LUMINUS",
    contentHtml,
    alignCenter: true,
  });
}
