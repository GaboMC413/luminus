const { Client } = require('pg');
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const BUCKET = process.env.S3_AVATAR_BUCKET || process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'luminus-storage-prod-905418193825-us-east-1-an';
const REGION = process.env.AWS_REGION || process.env.S3_AVATAR_REGION || 'us-east-1';
const DRY_RUN = process.argv.includes('--dry-run');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_AVATAR_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_AVATAR_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: REGION,
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      }
    : {}),
});

async function getActiveReferencedKeys(dbName) {
  const baseDbUrl = process.env.DATABASE_URL;
  if (!baseDbUrl) {
    throw new Error('DATABASE_URL environment variable is required.');
  }
  const connectionString = dbName
    ? baseDbUrl.replace(/\/[^/?]+(\?.*)?$/, `/${dbName}$1`)
    : baseDbUrl;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const keys = new Set();

  // 1. Avatars
  const avatars = await client.query("SELECT avatar_url FROM public.user_profiles WHERE avatar_url IS NOT NULL");
  avatars.rows.forEach(r => {
    try {
      if (r.avatar_url && r.avatar_url.startsWith('http')) {
        const p = new URL(r.avatar_url).pathname.replace(/^\/+/, '');
        keys.add(p);
      }
    } catch {}
  });

  // 2. Feed posts
  try {
    const posts = await client.query("SELECT image_url FROM public.community_posts WHERE image_url IS NOT NULL");
    posts.rows.forEach(r => {
      try {
        if (r.image_url && r.image_url.startsWith('http')) {
          const p = new URL(r.image_url).pathname.replace(/^\/+/, '');
          keys.add(p);
        }
      } catch {}
    });
  } catch {}

  // 3. Events
  const events = await client.query("SELECT cover_url FROM public.events WHERE cover_url IS NOT NULL");
  events.rows.forEach(r => {
    try {
      if (r.cover_url && r.cover_url.startsWith('http')) {
        const p = new URL(r.cover_url).pathname.replace(/^\/+/, '');
        keys.add(p);
      }
    } catch {}
  });

  await client.end();
  return keys;
}

async function listAllS3Objects(prefix) {
  let isTruncated = true;
  let token = undefined;
  const items = [];

  while (isTruncated) {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: token,
    }));
    if (res.Contents) items.push(...res.Contents);
    isTruncated = res.IsTruncated;
    token = res.NextContinuationToken;
  }
  return items;
}

async function run() {
  console.log('===========================================================');
  console.log(`SWEEPER DE ARCHIVOS HUÉRFANOS EN S3 (${DRY_RUN ? 'MODO SIMULACIÓN --dry-run' : 'MODO EJECUCIÓN'})`);
  console.log(`Bucket: ${BUCKET}`);
  console.log('===========================================================\n');

  const keysPg = await getActiveReferencedKeys('postgres');
  const keysProd = await getActiveReferencedKeys('luminus_prod');
  const allActiveKeys = new Set([...keysPg, ...keysProd]);

  console.log(`Total de claves activas en uso en Base de Datos: ${allActiveKeys.size}`);

  const prefixes = ['avatars/', 'feed/', 'events/covers/'];
  const orphanObjects = [];
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

  for (const prefix of prefixes) {
    const objects = await listAllS3Objects(prefix);
    for (const obj of objects) {
      // Ignore folder markers
      if (obj.Key.endsWith('/')) continue;

      // Check if referenced in database
      if (!allActiveKeys.has(obj.Key)) {
        // Safety guard: only delete if older than 24 hours to prevent deleting in-flight uploads
        const modified = obj.LastModified ? new Date(obj.LastModified).getTime() : 0;
        if (modified < twentyFourHoursAgo) {
          orphanObjects.push(obj);
          console.log(`[HUÉRFANO > 24h] ${obj.Key} (${obj.Size} bytes, Modificado: ${obj.LastModified})`);
        } else {
          console.log(`[RECIENTE < 24h] Omitido por seguridad (en vuelo): ${obj.Key}`);
        }
      }
    }
  }

  console.log(`\nTotal de archivos huérfanos detectados: ${orphanObjects.length}`);

  if (orphanObjects.length > 0 && !DRY_RUN) {
    for (let i = 0; i < orphanObjects.length; i += 1000) {
      const chunk = orphanObjects.slice(i, i + 1000).map(o => ({ Key: o.Key }));
      await s3.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: chunk },
      }));
    }
    console.log(`¡Eliminados con éxito ${orphanObjects.length} archivos huérfanos de S3!`);
  } else if (DRY_RUN) {
    console.log('Simulación completada. No se borró ningún archivo.');
  } else {
    console.log('El bucket está 100% limpio y optimizado. No hay archivos huérfanos.');
  }
}

run().catch(console.error);
