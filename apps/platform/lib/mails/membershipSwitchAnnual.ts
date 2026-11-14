import { renderEmailLayout, PLATFORM_APP_URL } from "./EmailLayout";

export interface MembershipSwitchAnnualEmailOptions {
  name?: string;
  effectiveDate?: string;
}

export function renderMembershipSwitchAnnualEmailHtml({
  name = "Usuario",
}: MembershipSwitchAnnualEmailOptions = {}): string {
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      Cambio a Mecenas Anual confirmado
    </h1>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 16px 0; color: #334155; text-align: center;">
      Hola <strong style="color: #0f172a;">${name}</strong>, tu suscripción ha sido actualizada con éxito al plan anual.
    </p>

    <!-- Ficha de resumen del cambio -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
        Mecenas Anual — USD 45 / año
      </div>
      <div style="font-size: 13.5px; color: #059669; font-weight: 600; margin-bottom: 14px;">
        ✓ Ahorras USD 15 al año (equivalente a USD 3.75/mes)
      </div>
      <p style="font-size: 13.5px; line-height: 1.5; color: #475569; margin: 0;">
        Tu nuevo ciclo anual queda registrado con renovación automática cada 12 meses. Puedes consultar tu factura y gestionar los detalles en cualquier momento.
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${PLATFORM_APP_URL}/perfil-usuario/configuracion" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center;">
        Ver mi suscripción
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "Tu suscripción se ha actualizado a Mecenas Anual",
    preheader: "Ahorras USD 15 al año con tu nuevo plan anual en LUMINUS.",
    contentHtml,
    alignCenter: true,
  });
}
