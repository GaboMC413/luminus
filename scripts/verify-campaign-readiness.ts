import fs from 'fs';
import path from 'path';

// Parse env manually
['apps/platform/.env', 'apps/platform/.env.local'].forEach(rel => {
  const envPath = path.join(__dirname, '..', rel);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    });
  }
});

import { getLocalContacts } from '../apps/platform/lib/local-marketing/store';
import { prisma } from '../apps/platform/lib/db';

async function main() {
  const contacts = getLocalContacts();
  const total = contacts.length;
  const active = contacts.filter(c => (c.status ? c.status === 'ACTIVE' : !c.unsubscribed && !c.bounced) && c.email.includes('@'));
  const unsubscribed = contacts.filter(c => c.status === 'UNSUBSCRIBED' || c.unsubscribed);
  const bounced = contacts.filter(c => c.status === 'BOUNCED' || c.bounced);

  // Check unique emails in active list
  const uniqueEmails = new Set(active.map(c => c.email.toLowerCase().trim()));

  // Check DB unsubscribed
  let dbUnsubs: any[] = [];
  try {
    dbUnsubs = await prisma.unsubscribedEmail.findMany();
  } catch (e) {
    console.warn('DB check note:', e);
  }
  const dbUnsubSet = new Set(dbUnsubs.map(u => u.email.toLowerCase().trim()));

  const finalEligible = [...uniqueEmails].filter(email => !dbUnsubSet.has(email));

  console.log('=== CAMPAIGN READINESS AUDIT ===');
  console.log('Total contactos en base local:', total);
  console.log('Contactos activos:', active.length);
  console.log('Contactos desuscritos (excluidos):', unsubscribed.length);
  console.log('Contactos rebotados / con reclamos (excluidos):', bounced.length);
  console.log('Desuscripciones registradas en PostgreSQL:', dbUnsubs.length);
  console.log('Destinatarios únicos y limpios listos para envío:', finalEligible.length);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
