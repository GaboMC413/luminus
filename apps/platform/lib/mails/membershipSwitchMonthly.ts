import { renderEmailLayout, PLATFORM_APP_URL } from "./EmailLayout";

export interface MembershipSwitchMonthlyEmailOptions {
  name?: string;
  periodEndDate?: string;
}

export function renderMembershipSwitchMonthlyEmailHtml({
  name = "Usuario",
  periodEndDate = "el fin de tu ciclo anual actual",
}: MembershipSwitchMonthlyEmailOptions = {}): string {
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      Cambio de ciclo programado
    </h1>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 16px 0; color: #334155; text-align: center;">
      Hola <strong style="color: #0f172a;">${name}</strong>, hemos programado el cambio de tu suscripción a la modalidad mensual.
    </p>

    <!-- Ficha de detalle del cambio programado -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
      <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">
        ¿Cómo se aplicará esta transición?
      </p>
      <ul style="margin: 0; padding-left: 18px; font-size: 13.5px; line-height: 1.6; color: #475569;">
        <li>Tu suscripción anual ya abonada continúa vigente con todos sus beneficios hasta el <strong>${periodEndDate}</strong>.</li>
        <li>A partir de esa fecha, tu plan pasará a ser <strong>Mecenas Mensual por USD 5 / mes</strong> con renovación mensual.</li>
        <li>No se te cobrará ningún importe adicional hasta que venza tu período anual actual.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${PLATFORM_APP_URL}/perfil-usuario/configuracion" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center;">
        Gestionar mi suscripción
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "Cambio de plan programado: Mecenas Mensual",
    preheader: "Tu plan cambiará a mensual al finalizar tu ciclo anual actual.",
    contentHtml,
    alignCenter: true,
  });
}
