import { renderEmailLayout } from "./EmailLayout";

export interface RegistrationErrorAlertParams {
  userEmail?: string;
  userName?: string;
  step: string;
  action: string;
  statusCode?: number | string;
  errorMessage: string;
  errorDetails?: string;
  userAgent?: string;
  timestamp: string;
}

export function renderRegistrationErrorAlertEmailHtml(params: RegistrationErrorAlertParams): string {
  const {
    userEmail = "No proporcionado / Anónimo",
    userName = "No registrado aún",
    step,
    action,
    statusCode = "N/A",
    errorMessage,
    errorDetails,
    userAgent = "Desconocido",
    timestamp,
  } = params;

  const contentHtml = `
    <!-- ALERTA DE AUDITORÍA HEADER -->
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 20px;">
          ⚠️ ALERTA DE REGISTRO
        </span>
        <span style="font-size: 13px; color: #991b1b; font-weight: 600;">
          Error detectado durante el registro / onboarding
        </span>
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13.5px; color: #7f1d1d; line-height: 1.4;">
        Un usuario ha experimentado un fallo técnico en la plataforma. A continuación se presentan los detalles del diagnóstico para auditoría inmediata.
      </p>
    </div>

    <!-- RESUMEN PRINCIPAL DEL USUARIO -->
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="margin-bottom: 20px; border-collapse: collapse; text-align: left;">
      <tr>
        <td style="padding: 10px 14px; background-color: #f8fafc; border-radius: 8px 8px 0 0; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">
          Usuario Afectado
        </td>
        <td style="padding: 10px 14px; background-color: #ffffff; border-radius: 8px 8px 0 0; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a;">
          ${userEmail}
        </td>
      </tr>
      ${userName ? `
      <tr>
        <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-top: none; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">
          Nombre / Apellido
        </td>
        <td style="padding: 10px 14px; background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none; font-size: 13.5px; color: #334155;">
          ${userName}
        </td>
      </tr>
      ` : ""}
      <tr>
        <td style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-top: none; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">
          Paso Afectado
        </td>
        <td style="padding: 10px 14px; background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none; font-size: 13.5px; font-weight: 600; color: #2563eb;">
          ${step}
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background-color: #f8fafc; border-radius: 0 0 0 8px; border: 1px solid #e2e8f0; border-top: none; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">
          Acción / Endpoint
        </td>
        <td style="padding: 10px 14px; background-color: #ffffff; border-radius: 0 0 8px 0; border: 1px solid #e2e8f0; border-top: none; font-size: 13px; font-family: monospace; color: #0f172a;">
          ${action} (HTTP ${statusCode})
        </td>
      </tr>
    </table>

    <!-- DIAGNÓSTICO TÉCNICO -->
    <div style="text-align: left; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">
        MENSAJE DE ERROR TÉCNICO:
      </div>
      <div style="background-color: #0f172a; color: #f8fafc; font-family: monospace; font-size: 12.5px; padding: 14px; border-radius: 8px; line-height: 1.5; white-space: pre-wrap; word-break: break-all;">
        ${errorMessage}
      </div>
    </div>

    ${errorDetails ? `
    <div style="text-align: left; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">
        STACK TRACE / DETALLES ADICIONALES:
      </div>
      <div style="background-color: #f1f5f9; color: #334155; font-family: monospace; font-size: 11.5px; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; white-space: pre-wrap; word-break: break-all;">
        ${errorDetails}
      </div>
    </div>
    ` : ""}

    <!-- DISPOSITIVO Y NAVEGADOR -->
    <div style="text-align: left; margin-bottom: 24px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">
        DISPOSITIVO / TELEMETRÍA:
      </div>
      <div style="font-size: 12px; color: #334155; font-family: monospace;">
        <strong>User-Agent:</strong> ${userAgent}<br />
        <strong>Timestamp:</strong> ${timestamp}
      </div>
    </div>

    <!-- BOTÓN DE ACCIÓN EN ADMIN -->
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://app.luminuslatam.com/admin" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
        Ir al Panel de Administración
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: `⚠️ Alerta de Auditoría: Fallo de registro (${userEmail})`,
    contentHtml,
    alignCenter: false,
  });
}
