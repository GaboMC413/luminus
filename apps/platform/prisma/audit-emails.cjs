const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITING SENT EMAIL LOGS IN DATABASE ---');

  const emailLogs = await prisma.sentEmailLog.findMany({
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total Sent Email Logs: ${emailLogs.length}`);
  emailLogs.forEach((log, idx) => {
    console.log(`[${idx + 1}] To: ${log.recipient} | Subject: "${log.subject}" | Date: ${log.createdAt.toISOString()}`);
  });

  const inscriptions = await prisma.eventInscription.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`\nTotal Event Inscriptions: ${inscriptions.length}`);
  inscriptions.forEach((ins, idx) => {
    console.log(`[${idx + 1}] To: ${ins.guestEmail} | Name: ${ins.guestFirstName} ${ins.guestLastName} | Date: ${ins.createdAt.toISOString()}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
