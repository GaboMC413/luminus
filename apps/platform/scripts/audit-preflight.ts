import { getLocalContacts, getLocalCampaigns, getLocalSendLogs } from "../lib/local-marketing/store";
import { filterUnsubscribedEmails } from "./local-unsubscribe-helper";
import prisma from "../lib/db";

async function main() {
  const allContacts = getLocalContacts();
  const campaigns = getLocalCampaigns();
  const belenCmp = campaigns.find((c) => c.id === "cmp_belen_pittamiglio_2026");

  const activeContacts = allContacts.filter(
    (c) => (c.status ? c.status === "ACTIVE" : !c.unsubscribed && !c.bounced) && c.email.includes("@")
  );
  const unsubscribedLocal = allContacts.filter((c) => c.unsubscribed || c.status === "UNSUBSCRIBED");
  const bouncedLocal = allContacts.filter((c) => c.bounced || c.status === "BOUNCED");

  let dbUnsubscribedCount = 0;
  try {
    dbUnsubscribedCount = await prisma.unsubscribedEmail.count();
  } catch (e) {
    dbUnsubscribedCount = -1;
  }

  let finalEligibleCount = activeContacts.length;
  try {
    const eligibleEmails = await filterUnsubscribedEmails(activeContacts.map((c) => c.email));
    finalEligibleCount = eligibleEmails.length;
  } catch (e) {}

  const countryCounts: Record<string, number> = {};
  for (const c of activeContacts) {
    const country = c.country || "Sin especificar";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  }

  console.log("=== AUDITORIA DE AUDIENCIA Y CONTACTOS ===");
  console.log("Total contactos en base local:", allContacts.length);
  console.log("Contactos activos:", activeContacts.length);
  console.log("Contactos desuscritos (Local):", unsubscribedLocal.length);
  console.log("Contactos rebotados (Local):", bouncedLocal.length);
  console.log("Desuscritos registrados en PostgreSQL:", dbUnsubscribedCount);
  console.log("Destinatarios netos a recibir el correo:", finalEligibleCount);
  console.log("Distribución geográfica:", Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 7));

  console.log("\n=== AUDITORIA DE CONFIGURACION DE CAMPANA ===");
  console.log("ID Campaña:", belenCmp?.id);
  console.log("Asunto:", belenCmp?.subject);
  console.log("Preheader:", belenCmp?.previewText);
  console.log("Remitente:", `${belenCmp?.fromName} <${belenCmp?.fromEmail}>`);
  console.log("Estado:", belenCmp?.status);
  console.log("Audiencia objetivo:", belenCmp?.audienceName || "Todos los contactos");

  const html = belenCmp?.htmlContent || "";
  const hrefMatches = html.match(/href="([^"]*)"/g) || [];
  const srcMatches = html.match(/src="([^"]*)"/g) || [];

  console.log("\n=== AUDITORIA DE ENLACES E IMAGENES ===");
  console.log("Enlaces encontrados en HTML:", Array.from(new Set(hrefMatches)));
  console.log("Imágenes encontradas en HTML:", Array.from(new Set(srcMatches)));
  console.log("Index of <svg:", html.indexOf("<svg"));
  if (html.indexOf("<svg") >= 0) {
    console.log("SVG snippet:", html.substring(html.indexOf("<svg") - 50, html.indexOf("<svg") + 150));
  }
  console.log("¿Hay SVG residuales?:", html.includes("<svg"));
  console.log("¿Variable nombre presente?:", html.includes("{{nombre}}"));
  console.log("¿Variable desuscripción presente?:", html.includes("{{link_desuscripcion}}"));
}

main().catch(console.error);
