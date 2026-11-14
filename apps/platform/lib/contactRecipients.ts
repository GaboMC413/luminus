import { prisma } from "@/lib/db";

const DEFAULT_RECIPIENTS = [
  "gabrielmedcap@hotmail.com",
  "info@luminuslatam.com",
];

let tableInitialized = false;

export async function ensureContactRecipientsTable(): Promise<void> {
  if (tableInitialized) return;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS contact_notification_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    tableInitialized = true;
  } catch (err) {
    console.error("[contactRecipients] Error creating table:", err);
  }
}

export async function getContactRecipients(): Promise<string[]> {
  await ensureContactRecipientsTable();

  try {
    const rows = await prisma.$queryRawUnsafe<{ email: string }[]>(`
      SELECT email FROM contact_notification_recipients ORDER BY created_at ASC;
    `);

    if (rows && rows.length > 0) {
      return rows.map((r) => r.email.toLowerCase().trim());
    }

    // Seed defaults si la tabla está vacía
    for (const email of DEFAULT_RECIPIENTS) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO contact_notification_recipients (email) VALUES ($1) ON CONFLICT (email) DO NOTHING;`,
        email.toLowerCase().trim()
      );
    }

    return DEFAULT_RECIPIENTS;
  } catch (err) {
    console.error("[contactRecipients] Error fetching recipients:", err);
    return DEFAULT_RECIPIENTS;
  }
}

export async function addContactRecipient(email: string): Promise<string[]> {
  await ensureContactRecipientsTable();
  const cleanEmail = email.toLowerCase().trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Formato de correo electrónico inválido.");
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO contact_notification_recipients (email) VALUES ($1) ON CONFLICT (email) DO NOTHING;`,
    cleanEmail
  );

  return getContactRecipients();
}

export async function removeContactRecipient(email: string): Promise<string[]> {
  await ensureContactRecipientsTable();
  const cleanEmail = email.toLowerCase().trim();

  await prisma.$executeRawUnsafe(
    `DELETE FROM contact_notification_recipients WHERE LOWER(email) = $1;`,
    cleanEmail
  );

  return getContactRecipients();
}
