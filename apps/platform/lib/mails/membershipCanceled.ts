import { renderEmailLayout, PLATFORM_APP_URL } from "./EmailLayout";

export interface MembershipCanceledEmailOptions {
  name?: string;
  accessUntilDate?: string;
}

export function renderMembershipCanceledEmailHtml({
  name = "Usuario",
  accessUntilDate = "el fin de tu ciclo de facturación actual",
}: MembershipCanceledEmailOptions = {}): string {
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      Cancelación de membresía confirmada
    </h1>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 16px 0; color: #334155; text-align: center;">
      Hola <strong style="color: #0f172a;">${name}</strong>, te confirmamos que tu membresía Mecenas ha sido cancelada y no se renovará de forma automática.
    </p>

    <!-- Ficha de vigencia de acceso -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
      <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">
        Información importante sobre tu acceso:
      </p>
      <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.6; color: #475569;">
        <li>Tu acceso completo como Mecenas se mantendrá activo hasta el <strong>${accessUntilDate}</strong> (fin del período ya abonado).</li>
        <li>A partir de esa fecha, no se realizarán nuevos cobros en tu tarjeta.</li>
        <li>Tu cuenta pasará automáticamente al plan gratuito. Tu perfil, contactos y publicaciones seguirán intactos.</li>
      </ul>
    </div>

    <p style="font-size: 15px; line-height: 1.65; margin: 0 0 28px 0; color: #334155; text-align: center;">
      Queremos agradecerte sinceramente por el tiempo en que nos acompañaste como Mecenas y por haber apoyado esta red. Las puertas de LUMINUS siempre estarán abiertas para cuando desees volver a sumarte.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${PLATFORM_APP_URL}/perfil-usuario/configuracion" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center;">
        Ir a mi cuenta
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "Confirmación de cancelación de membresía",
    preheader: "Tu suscripción a Mecenas no se renovará al finalizar tu ciclo actual.",
    contentHtml,
    alignCenter: true,
  });
}
