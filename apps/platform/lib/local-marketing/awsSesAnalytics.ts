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

export async function syncAwsSuppressionListToLocalContacts(): Promise<{
  syncedCount: number;
  totalSuppressed: number;
}> {
  try {
    const sesClient = getSesV2Client();
    const response = await sesClient.send(new ListSuppressedDestinationsCommand({ PageSize: 100 }));
    
    const summaries = response.SuppressedDestinationSummaries || [];
    const suppressedEmails = new Set(summaries.map((s) => s.EmailAddress?.toLowerCase().trim()).filter(Boolean));

    if (suppressedEmails.size === 0) {
      return { syncedCount: 0, totalSuppressed: 0 };
    }

    const contacts = getLocalContacts();
    let syncedCount = 0;

    contacts.forEach((c) => {
      if (suppressedEmails.has(c.email.toLowerCase().trim())) {
        if (!c.unsubscribed) {
          saveLocalContact({
            ...c,
            unsubscribed: true,
            tags: Array.from(new Set([...(c.tags || []), "bounced"])),
          });
          syncedCount++;
        }
      }
    });

    return {
      syncedCount,
      totalSuppressed: suppressedEmails.size,
    };
  } catch (error) {
    console.error("[AWS SES SUPPRESSION SYNC ERROR]:", error);
    return { syncedCount: 0, totalSuppressed: 0 };
  }
}
