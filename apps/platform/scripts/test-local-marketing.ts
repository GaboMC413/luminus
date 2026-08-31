import {
  getLocalContacts,
  saveLocalContact,
  getLocalCampaigns,
  saveLocalCampaign,
  addLocalSendLog,
  getLocalSendLogs,
} from "../lib/local-marketing/store";
import { renderTemplateVariables } from "../lib/local-marketing/sender";

async function runTest() {
  console.log("🧪 Probando el almacén local de Email Marketing...");

  // 1. Guardar contacto de prueba
  const contact = saveLocalContact({
    email: "test.local.marketing@example.com",
    firstName: "Gabriel",
    lastName: "Prueba",
    tags: ["Prueba Local", "VIP"],
    notes: "Contacto de prueba en .local-data/",
  });
  console.log("✅ Contacto guardado:", contact.email, "| ID:", contact.id);

  // 2. Verificar lectura de contactos
  const contacts = getLocalContacts();
  console.log(`✅ Total de contactos en almacén local: ${contacts.length}`);

  // 3. Probar render de plantilla
  const htmlTemplate = "<p>Hola {{nombre}} {{apellido}}, tu email es {{email}}. Desuscribir: {{link_desuscripcion}}</p>";
  const rendered = renderTemplateVariables(htmlTemplate, contact);
  console.log("✅ HTML Renderizado:", rendered);

  // 4. Guardar borrador de campaña
  const campaign = saveLocalCampaign({
    subject: "Boletín de Prueba Local",
    fromEmail: "info@luminuslatam.com",
    fromName: "LUMINUS LATAM",
    htmlContent: rendered,
    targetTags: ["Prueba Local"],
    status: "DRAFT",
  });
  console.log("✅ Campaña guardada:", campaign.subject, "| ID:", campaign.id);

  // 5. Añadir log de auditoría
  const log = addLocalSendLog({
    campaignId: campaign.id,
    recipientEmail: contact.email,
    recipientName: `${contact.firstName} ${contact.lastName}`,
    status: "SUCCESS",
    messageId: "local-msg-test-12345",
  });
  console.log("✅ Log registrado:", log.status, "| MessageId:", log.messageId);

  console.log("✨ ¡Todas las pruebas del motor local pasaron con éxito!");
}

runTest().catch((err) => {
  console.error("❌ ERROR EN TEST LOCAL:", err);
  process.exit(1);
});
