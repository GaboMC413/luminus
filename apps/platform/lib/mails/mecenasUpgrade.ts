import { renderEmailLayout, PLATFORM_APP_URL } from "./EmailLayout";

export interface MecenasUpgradeEmailOptions {
  name?: string;
  interval?: "month" | "year" | "monthly" | "annual";
}

export function renderMecenasUpgradeEmailHtml({
  name = "Usuario",
  interval = "month",
}: MecenasUpgradeEmailOptions = {}): string {
  const isAnnual = interval === "year" || interval === "annual";

  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #0f172a; text-align: center;">
      Gracias por dar el paso
    </h1>

    <p style="font-size: 15.5px; line-height: 1.65; margin: 0 0 16px 0; color: #334155; text-align: center;">
      Hola <strong style="color: #0f172a;">${name}</strong>, gracias por convertirte en Mecenas de LUMINUS.
    </p>

    <p style="font-size: 15px; line-height: 1.65; margin: 0 0 24px 0; color: #334155; text-align: center;">
      Sabemos que ya formas parte de nuestra comunidad. Que hoy elijas dar este paso y apoyar activamente este espacio tiene un significado y un valor inmenso para todos nosotros.
    </p>

    <!-- Carta sobre el sentido del Mecenazgo -->
    <div style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 24px 0; text-align: left;">
      <p style="margin: 0 0 14px 0;">
        Al convertirte en Mecenas, formas parte de quienes impulsan nuestra visión y hacen posible que llegue a más personas en Latinoamérica.
      </p>
      <p style="margin: 0 0 14px 0;">
        Creemos en el valor de una red donde el conocimiento, las experiencias y las conexiones humanas puedan encontrarse de manera auténtica. Un lugar donde el bienestar se aborde desde diferentes perspectivas, donde los especialistas puedan compartir lo que saben y donde cada persona tenga la libertad de descubrir su propio camino.
      </p>
      <p style="margin: 0 0 14px 0;">
        Tu compromiso nos permite fortalecer esa visión, ampliar las posibilidades de encuentro y preservar aquello que consideramos esencial: una experiencia cercana, independiente y centrada en las personas.
      </p>
      <p style="margin: 0 0 14px 0;">
        Para nosotros, contar contigo como Mecenas tiene un significado especial. Representa la confianza en una manera diferente de acercarnos al bienestar y en el valor de conectar a quienes tienen algo que compartir con quienes desean descubrirlo.
      </p>
      <p style="margin: 0;">
        Gracias por elegir impulsar LUMINUS y formar parte de lo que representa.
      </p>
    </div>

    <!-- Ficha de la suscripción activada -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
      <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 14px;">
        <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b;">
          Tu suscripción activa
        </span>
        <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">
          ${isAnnual ? "Mecenas Anual — USD 45 / año" : "Mecenas Mensual — USD 5 / mes"}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #334155;">Plan contratado:</td>
          <td style="padding: 6px 0; text-align: right; color: #0f172a;">${isAnnual ? "Anual (Ahorras USD 15)" : "Mensual"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #334155;">Renovación:</td>
          <td style="padding: 6px 0; text-align: right; color: #0f172a;">Automática ${isAnnual ? "anual" : "mensual"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #334155;">Flexibilidad:</td>
          <td style="padding: 6px 0; text-align: right; color: #0f172a;">Cancela cuando quieras</td>
        </tr>
      </table>

      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #64748b; line-height: 1.5;">
        Puedes gestionar tu suscripción, descargar facturas o actualizar tu medio de pago desde tu <a href="${PLATFORM_APP_URL}/perfil-usuario/configuracion" target="_blank" style="color: #0f172a; font-weight: 600; text-decoration: underline;">panel de configuración</a>.
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${PLATFORM_APP_URL}/inicio" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; text-align: center;">
        Continuar en LUMINUS
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "Gracias por dar el paso: ya eres Mecenas de LUMINUS",
    preheader: "Tu apoyo fortalece nuestra red de bienestar en Latinoamérica.",
    contentHtml,
    alignCenter: true,
  });
}
