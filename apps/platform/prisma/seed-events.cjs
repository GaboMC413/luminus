const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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
  return clean.substring(0, 80) + '-' + (id ? id.substring(0, 8) : Math.random().toString(36).substring(2, 7));
}

async function seed() {
  console.log('Seeding events into PostgreSQL database...');

  const jsonPath = path.join(__dirname, '..', '..', 'marketing', 'data', 'youtube_videos.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('youtube_videos.json not found at:', jsonPath);
    process.exit(1);
  }

  const videos = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${videos.length} videos from JSON.`);

  let inserted = 0;
  let updated = 0;

  const now = new Date();

  for (const item of videos) {
    const youtubeId = item.youtube_id || null;
    const coverUrl = item.cover_url || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg` : null);
    const dateVal = item.date ? new Date(item.date) : null;
    const isUpcoming = Boolean(
      item.is_upcoming === true ||
      (item.is_upcoming !== false && dateVal && !isNaN(dateVal.getTime()) && dateVal >= now)
    );

    const slug = generateSlug(item.title, youtubeId);

    if (youtubeId) {
      const existing = await prisma.event.findUnique({
        where: { youtubeId },
      });

      if (existing) {
        await prisma.event.update({
          where: { youtubeId },
          data: {
            title: item.title,
            description: item.description || '',
            date: dateVal && !isNaN(dateVal.getTime()) ? dateVal : null,
            speakerName: item.speaker_name || null,
            category: item.category || null,
            coverUrl: coverUrl,
            link: item.link || null,
            isUpcoming,
          },
        });
        updated++;
      } else {
        await prisma.event.create({
          data: {
            youtubeId,
            slug,
            title: item.title,
            description: item.description || '',
            date: dateVal && !isNaN(dateVal.getTime()) ? dateVal : null,
            speakerName: item.speaker_name || null,
            category: item.category || null,
            coverUrl: coverUrl,
            link: item.link || null,
            isUpcoming,
          },
        });
        inserted++;
      }
    }
  }

  console.log(`Seeding complete! Inserted: ${inserted}, Updated: ${updated}`);
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
