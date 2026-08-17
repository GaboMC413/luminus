const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually to avoid external dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    });
  }
}

// Download image helper returning a buffer
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: Status ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// Get thumbnail buffer with fallback to hqdefault
async function getYoutubeThumbnailBuffer(youtubeId) {
  const maxResUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
  const hqUrl = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  
  try {
    return await downloadImage(maxResUrl);
  } catch (err) {
    try {
      // Fall back to HQ thumbnail if Max Resolution is not available
      return await downloadImage(hqUrl);
    } catch (hqErr) {
      console.error(`  Failed to download thumbnail for video ID: ${youtubeId}`);
      return null;
    }
  }
}

async function main() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key if available, otherwise fall back to anon key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Supabase credentials not found in .env.local");
    console.error("Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.");
    process.exit(1);
  }

  console.log("Initializing Supabase Client...");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const jsonPath = path.join(__dirname, '..', 'data', 'youtube_videos.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: JSON file not found at ${jsonPath}`);
    console.error("Please run the scraper script first: node scripts/fetch_videos.js");
    process.exit(1);
  }

  const videos = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${videos.length} videos from JSON file.`);

  console.log("\n=== Starting Import to Supabase ===");
  let successCount = 0;
  let errorCount = 0;

  for (const video of videos) {
    const youtubeId = video.youtube_id;
    console.log(`\nProcessing: ${youtubeId} - "${video.title.substring(0, 45)}..."`);
    
    let coverUrl = null;

    if (youtubeId) {
      const fileName = `${youtubeId}.jpg`;
      const imgBuffer = await getYoutubeThumbnailBuffer(youtubeId);
      
      if (imgBuffer) {
        console.log(`  Uploading cover to Supabase Storage: ${fileName}`);
        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(fileName, imgBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`  Storage upload failed for ${youtubeId}:`, uploadError.message);
        } else {
          // Retrieve public URL
          const { data: publicUrlData } = supabase.storage
            .from('event-covers')
            .getPublicUrl(fileName);
            
          coverUrl = publicUrlData.publicUrl;
          console.log(`  Successfully uploaded. Public URL: ${coverUrl}`);
        }
      }
    }

    // Map JSON fields to database columns
    const dbRecord = {
      youtube_id: youtubeId,
      title: video.title,
      description: video.description,
      link: video.link,
      date: video.date,
      speaker_name: video.speaker_name,
      category: video.category, // Map category field
      cover_url: coverUrl // Save the bucket public URL
    };
    
    // Upsert based on unique youtube_id conflict target
    const { error: dbError } = await supabase
      .from('events')
      .upsert(dbRecord, { onConflict: 'youtube_id' });

    if (dbError) {
      console.error(`  Error upserting to DB:`, dbError.message);
      errorCount++;
    } else {
      console.log(`  Successfully upserted record to database.`);
      successCount++;
    }
  }

  console.log("\n=== Seeding & Upload Summary ===");
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log("================================");
}

main().catch(err => {
  console.error("Seed script crash:", err);
});
