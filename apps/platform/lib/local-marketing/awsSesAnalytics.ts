import { getSesV2Client } from "@/lib/mails/sesClient";
import { GetAccountCommand, ListSuppressedDestinationsCommand } from "@aws-sdk/client-sesv2";
import { getLocalContacts, saveLocalContact } from "./store";

export interface AwsAccountMetrics {
  sentLast24Hours: number;
  max24HourSend: number;
  maxSendRate: number;
  productionAccessEnabled: boolean;
  sendingEnabled: boolean;
}

export async function getAwsSesAccountMetrics(): Promise<AwsAccountMetrics | null> {
  try {
    const sesClient = getSesV2Client();
    const response = await sesClient.send(new GetAccountCommand({}));

    return {
      sentLast24Hours: response.SendQuota?.SentLast24Hours || 0,
      max24HourSend: response.SendQuota?.Max24HourSend || 50000,
      maxSendRate: response.SendQuota?.MaxSendRate || 14,
      productionAccessEnabled: !!response.ProductionAccessEnabled,
      sendingEnabled: response.SendingEnabled !== false,
    };
  } catch (error) {
    console.error("[AWS SES ANALYTICS ERROR]: Failed to fetch account metrics:", error);
    return null;
  }
}

export interface SuppressionSyncResult {
  syncedCount: number;
  totalSuppressed: number;
  complaintsCount: number;
  bouncesCount: number;
}

export async function syncAwsSuppressionListToLocalContacts(): Promise<SuppressionSyncResult> {
  try {
    const sesClient = getSesV2Client();
    const suppressedMap = new Map<string, { reason: string; date?: string }>();

    let nextToken: string | undefined = undefined;

    do {
      const response = await sesClient.send(
        new ListSuppressedDestinationsCommand({
          PageSize: 100,
          NextToken: nextToken,
        })
      );

      const summaries = response.SuppressedDestinationSummaries || [];
      for (const summary of summaries) {
        if (summary.EmailAddress) {
          const emailNorm = summary.EmailAddress.toLowerCase().trim();
          suppressedMap.set(emailNorm, {
            reason: summary.Reason || "BOUNCE",
            date: summary.LastUpdateTime ? new Date(summary.LastUpdateTime).toLocaleDateString("es-AR") : undefined,
          });
        }
      }

      nextToken = response.NextToken;
    } while (nextToken);

    if (suppressedMap.size === 0) {
      return { syncedCount: 0, totalSuppressed: 0, complaintsCount: 0, bouncesCount: 0 };
    }

    let complaintsCount = 0;
    let bouncesCount = 0;
    suppressedMap.forEach(({ reason }) => {
      if (reason.toUpperCase() === "COMPLAINT") {
        complaintsCount++;
      } else {
        bouncesCount++;
      }
    });

    const contacts = getLocalContacts();
    const existingEmails = new Set(contacts.map((c) => c.email.toLowerCase().trim()));
    let syncedCount = 0;

    // Actualizar contactos existentes que estén en la lista de supresión
    contacts.forEach((c) => {
      const emailNorm = c.email.toLowerCase().trim();
      const suppressedInfo = suppressedMap.get(emailNorm);

      if (suppressedInfo) {
        const isComplaint = suppressedInfo.reason.toUpperCase() === "COMPLAINT";
        const reasonTag = isComplaint ? "complaint" : "bounced";
        const newTags = Array.from(new Set([...(c.tags || []), "desuscrito", reasonTag]));
        const reasonText = isComplaint ? "Reporte de Abuso / Queja en Yahoo/Gmail" : "Rebote de entrega (Bounce)";
        const noteDetail = `[AWS SES Sync] Suprimido automáticamente por ${reasonText}${suppressedInfo.date ? ` el ${suppressedInfo.date}` : ""}.`;

        if (!c.unsubscribed || !c.tags?.includes(reasonTag)) {
          saveLocalContact({
            ...c,
            unsubscribed: true,
            tags: newTags,
            notes: c.notes ? `${c.notes}\n${noteDetail}` : noteDetail,
          });
          syncedCount++;
        }
      }
    });

    // Guardar direcciones suprimidas que aún no existen en contactos locales para proteger envíos futuros
    suppressedMap.forEach(({ reason, date }, email) => {
      if (!existingEmails.has(email)) {
        const isComplaint = reason.toUpperCase() === "COMPLAINT";
        const reasonTag = isComplaint ? "complaint" : "bounced";
        const reasonText = isComplaint ? "Reporte de Abuso / Queja" : "Rebote (Bounce)";

        saveLocalContact({
          email,
          firstName: "Contacto",
          lastName: "Suprimido (AWS)",
          tags: ["desuscrito", reasonTag, "AWS SES"],
          unsubscribed: true,
          source: "AWS SES Suppression Sync",
          notes: `[AWS SES Sync] Registrado automáticamente por ${reasonText}${date ? ` el ${date}` : ""}.`,
        });
        syncedCount++;
      }
    });

    return {
      syncedCount,
      totalSuppressed: suppressedMap.size,
      complaintsCount,
      bouncesCount,
    };
  } catch (error) {
    console.error("[AWS SES SUPPRESSION SYNC ERROR]:", error);
    return { syncedCount: 0, totalSuppressed: 0, complaintsCount: 0, bouncesCount: 0 };
  }
}

