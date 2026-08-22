import { renderEmailLayout } from "./EmailLayout";

export interface ContactNotificationEmailOptions {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  pais?: string;
  motivo: string;
  mensaje: string;
}

export function renderContactNotificationEmailHtml(data: ContactNotificationEmailOptions): string {
  const contentHtml = `
    <!-- Top Operational Badge -->
    <div style="margin-bottom: 20px; text-align: left;">
      <span style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 5px 12px; border-radius: 20px; border: 1px solid #cbd5e1;">
        Nuevo contacto desde la Web
      </span>
    </div>

    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 6px 0; color: #0f172a; text-align: left;">
      ${data.nombre} ${data.apellido}
    </h1>
    
    <p style="font-size: 14px; color: #64748b; margin: 0 0 22px 0; text-align: left;">
      Se ha puesto en contacto a través de la web.
    </p>

    <!-- Data Summary Table Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 110px;">Motivo:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${data.motivo}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
          <td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Teléfono:</td>
          <td style="padding: 6px 0; color: #0f172a;">${data.telefono || "No proporcionado"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">País:</td>
          <td style="padding: 6px 0; color: #0f172a;">${data.pais || "No especificado"}</td>
        </tr>
      </table>
    </div>

    <!-- Message Content Box -->
    <div style="margin-bottom: 28px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; color: #475569;">MENSAJE:</div>
      <div style="font-size: 14.5px; line-height: 1.6; background-color: #ffffff; padding: 18px 20px; border-radius: 14px; border: 1px solid #e2e8f0; white-space: pre-wrap; color: #1e293b; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
${data.mensaje}
      </div>
    </div>
  `;

  return renderEmailLayout({
    title: `[LUMINUS WEB] ${data.motivo} - ${data.nombre} ${data.apellido}`,
    contentHtml,
    alignCenter: false,
  });
}
