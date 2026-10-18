const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const SUPABASE_URL = 'https://kyrszgvhmzpwsguxebpt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

function generateSlug(title, id) {
  if (!title) return id || String(Date.now());
  const clean = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return clean.substring(0, 80) + '-' + (id ? id.substring(0, 8) : Math.random().toString(36).substring(2, 6));
}

async function migrate() {
  console.log('Starting migration from Supabase to main PostgreSQL DB...');

  // 1. Migrate Events
  console.log('\n--- 1. Migrating Events ---');
  const { data: supabaseEvents, error: eventsErr } = await supabase
    .from('events')
    .select('*');

  if (eventsErr) {
    console.error('Error fetching Supabase events:', eventsErr.message);
  } else if (supabaseEvents) {
    console.log(`Fetched ${supabaseEvents.length} events from Supabase.`);

    let eventsCount = 0;
    for (const ev of supabaseEvents) {
      const dateVal = ev.date ? new Date(ev.date) : null;
      const validDate = dateVal && !isNaN(dateVal.getTime()) ? dateVal : null;
      const isUpcoming = ev.is_upcoming !== undefined ? Boolean(ev.is_upcoming) : true;
      const slug = ev.slug || generateSlug(ev.title, ev.id);

      // Check if event exists by id or youtube_id or slug
      let existing = null;
      if (ev.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ev.id)) {
        existing = await prisma.event.findUnique({ where: { id: ev.id } });
      }
      if (!existing && ev.youtube_id) {
        existing = await prisma.event.findUnique({ where: { youtubeId: ev.youtube_id } });
      }
      if (!existing && slug) {
        existing = await prisma.event.findUnique({ where: { slug } });
      }

      if (existing) {
        await prisma.event.update({
          where: { id: existing.id },
          data: {
            title: ev.title,
            description: ev.description || '',
            date: validDate,
            timeText: ev.time_text || null,
            location: ev.location || null,
            speakerName: ev.speaker_name || null,
            speakerBio: ev.speaker_bio || null,
            category: ev.category || null,
            coverUrl: ev.cover_url || null,
            link: ev.link || null,
            isUpcoming,
          },
        });
      } else {
        await prisma.event.create({
          data: {
            ...(ev.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ev.id) ? { id: ev.id } : {}),
            youtubeId: ev.youtube_id || null,
            slug,
            title: ev.title,
            description: ev.description || '',
            date: validDate,
            timeText: ev.time_text || null,
            location: ev.location || null,
            speakerName: ev.speaker_name || null,
            speakerBio: ev.speaker_bio || null,
            category: ev.category || null,
            coverUrl: ev.cover_url || null,
            link: ev.link || null,
            isUpcoming,
          },
        });
      }
      eventsCount++;
    }
    console.log(`Successfully migrated ${eventsCount} events.`);
  }

  // 2. Migrate Contacts / Guests
  console.log('\n--- 2. Migrating Contacts / Event Guests ---');
  const { data: supabaseContacts, error: contactsErr } = await supabase
    .from('contacts')
    .select('*');

  const contactIdMap = new Map(); // maps Supabase contact id -> Postgres guest id

  if (contactsErr) {
    console.warn('Contacts table warning:', contactsErr.message);
  } else if (supabaseContacts) {
    console.log(`Fetched ${supabaseContacts.length} contacts from Supabase.`);

    for (const c of supabaseContacts) {
      if (!c.email) continue;
      const cleanEmail = c.email.trim().toLowerCase();

      const guest = await prisma.eventGuest.upsert({
        where: { email: cleanEmail },
        update: {
          firstName: c.first_name || 'Guest',
          lastName: c.last_name || '',
          city: c.city || null,
          marketingConsent: c.marketing_consent ?? true,
          isGuest: true,
        },
        create: {
          email: cleanEmail,
          firstName: c.first_name || 'Guest',
          lastName: c.last_name || '',
          city: c.city || null,
          marketingConsent: c.marketing_consent ?? true,
          isGuest: true,
        },
      });

      if (c.id) {
        contactIdMap.set(c.id, guest.id);
      }
    }
    console.log(`Successfully migrated ${supabaseContacts.length} contacts as Guests.`);
  }

  // 3. Migrate Inscriptions
  console.log('\n--- 3. Migrating Event Inscriptions ---');
  const { data: supabaseInscriptions, error: insErr } = await supabase
    .from('event_inscriptions')
    .select('*');

  if (insErr) {
    console.warn('Event inscriptions warning:', insErr.message);
  } else if (supabaseInscriptions) {
    console.log(`Fetched ${supabaseInscriptions.length} inscriptions from Supabase.`);

    let insCount = 0;
    for (const ins of supabaseInscriptions) {
      const guestId = contactIdMap.get(ins.contact_id) || ins.contact_id;
      const eventId = ins.event_id;

      if (!guestId || !eventId) continue;

      // Verify guest and event exist in Postgres
      const guestExists = await prisma.eventGuest.findUnique({ where: { id: guestId } });
      const eventExists = await prisma.event.findUnique({ where: { id: eventId } });

      if (guestExists && eventExists) {
        await prisma.eventInscription.upsert({
          where: {
            eventId_guestId: {
              eventId,
              guestId,
            },
          },
          update: {
            attended: Boolean(ins.attended),
          },
          create: {
            eventId,
            guestId,
            attended: Boolean(ins.attended),
          },
        });
        insCount++;
      }
    }
    console.log(`Successfully migrated ${insCount} event inscriptions.`);
  }

  // 4. Migrate Contact Messages
  console.log('\n--- 4. Migrating Contact Messages ---');
  const { data: supabaseMessages, error: msgErr } = await supabase
    .from('contact_messages')
    .select('*');

  if (msgErr) {
    console.warn('Contact messages warning:', msgErr.message);
  } else if (supabaseMessages) {
    console.log(`Fetched ${supabaseMessages.length} contact messages from Supabase.`);

    for (const msg of supabaseMessages) {
      await prisma.contactMessage.create({
        data: {
          nombre: msg.nombre || '',
          apellido: msg.apellido || '',
          email: msg.email ? msg.email.trim().toLowerCase() : '',
          telefono: msg.telefono || null,
          pais: msg.pais || null,
          motivo: msg.motivo || '',
          mensaje: msg.mensaje || '',
        },
      });
    }
    console.log(`Successfully migrated ${supabaseMessages.length} contact messages.`);
  }

  console.log('\nMigration from Supabase to main PostgreSQL DB finished successfully!');
}

migrate()
  .catch((e) => {
    console.error('Migration failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
