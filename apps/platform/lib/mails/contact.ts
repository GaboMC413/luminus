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
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 20px 0; color: #0f172a; text-align: left;">Nuevo Mensaje de Contacto</h1>

    <div style="margin-bottom: 16px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #475569;">Motivo</div>
      <div style="font-size: 15px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${data.motivo}</div>
    </div>

    <div style="margin-bottom: 16px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #475569;">Nombre completo</div>
      <div style="font-size: 15px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${data.nombre} ${data.apellido}</div>
    </div>

    <div style="margin-bottom: 16px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #475569;">Correo Electrónico</div>
      <div style="font-size: 15px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${data.email}</div>
    </div>

    <div style="margin-bottom: 16px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #475569;">Teléfono</div>
      <div style="font-size: 15px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${data.telefono || "No proporcionado"}</div>
    </div>

    <div style="margin-bottom: 16px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #475569;">País</div>
      <div style="font-size: 15px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${data.pais || "No especificado"}</div>
    </div>

    <div style="margin-bottom: 16px; text-align: left;">
      <div style="font-size: 12px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #475569;">Mensaje</div>
      <div style="font-size: 15px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; white-space: pre-wrap; color: #0f172a;">${data.mensaje}</div>
    </div>
  `;

  return renderEmailLayout({
    title: `[LUMINUS Contacto] ${data.motivo} - ${data.nombre} ${data.apellido}`,
    contentHtml,
    alignCenter: false, // Exception: keep contact email structured left-aligned
  });
}
