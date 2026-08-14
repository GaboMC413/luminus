const fs = require('fs');
const https = require('https');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => { reject(err); });
  });
}

function parseYtInitialData(html) {
  const start = html.indexOf('ytInitialData = ');
  if (start === -1) return null;
  const jsonStart = start + 'ytInitialData = '.length;
  const end = html.indexOf(';</script>', jsonStart);
  if (end === -1) return null;
  const jsonStr = html.substring(jsonStart, end).trim();
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error parsing JSON:", e.message);
    return null;
  }
}

function extractVideosFromData(data, expectedTabTitles) {
  const videos = [];
  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs;
  if (!tabs) return videos;

  for (const tab of tabs) {
    const tabTitle = tab.tabRenderer?.title;
    if (expectedTabTitles.includes(tabTitle)) {
      console.log(`Extracting from tab: "${tabTitle}"`);
      const items = tab.tabRenderer?.content?.richGridRenderer?.contents;
      if (items) {
        for (const item of items) {
          const lockup = item.richItemRenderer?.content?.lockupViewModel;
          if (lockup) {
            const videoId = lockup.contentId;
            const title = lockup.metadata?.lockupMetadataViewModel?.title?.content || '';
            
            // Extract views and relative time if present
            let views = '';
            let publishTimeText = '';
            const parts = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts;
            if (parts && parts.length > 0) {
              views = parts[0]?.text?.content || '';
              publishTimeText = parts[1]?.text?.content || '';
            }

            videos.push({
              id: videoId,
              title: title,
              publishTimeText: publishTimeText,
              viewCountText: views,
              link: `https://www.youtube.com/watch?v=${videoId}`
            });
          }
        }
      }
    }
  }
  return videos;
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function guessSpeaker(title) {
  if (!title) return '';
  const parts = title.split('|').map(p => p.trim());
  if (parts.length === 1) {
    const dashParts = title.split(' - ').map(p => p.trim());
    if (dashParts.length > 1) {
      const potential = dashParts[dashParts.length - 1];
      if (!potential.toLowerCase().includes('luminus')) {
        return potential;
      }
    }
    return '';
  }
  
  let speaker = parts[parts.length - 1];
  if (speaker.toLowerCase().includes('luminus') && parts.length > 1) {
    speaker = parts[parts.length - 2];
  }
  
  if (speaker.toLowerCase().includes('luminus')) return '';
  return speaker;
}

function autoCategorize(title, description) {
  const content = `${title} ${description}`.toLowerCase();
  
  if (content.includes('nutri') || content.includes('comida') || content.includes('comer') || content.includes('alimenta')) {
    return 'Nutrición';
  }
  if (content.includes('relacion') || content.includes('vinculo') || content.includes('vínculo') || content.includes('pareja') || content.includes('familia') || content.includes('vínculos') || content.includes('vinculos')) {
    return 'Vínculos y Relaciones';
  }
  if (content.includes('respir') || content.includes('medita') || content.includes('mindful') || content.includes('espirit') || content.includes('calma') || content.includes('presencia') || content.includes('mindfulness') || content.includes('zen')) {
    return 'Espiritualidad';
  }
  if (content.includes('físic') || content.includes('fisic') || content.includes('ejercicio') || content.includes('movimiento') || content.includes('postura') || content.includes('corporal') || content.includes('actividad física') || content.includes('actividad fisica')) {
    return 'Movimiento Físico';
  }
  if (content.includes('medicin') || content.includes('intestino') || content.includes('cerebro') || content.includes('salud') || content.includes('longevidad') || content.includes('médico') || content.includes('medico') || content.includes('tratamiento') || content.includes('clínic') || content.includes('clinic')) {
    return 'Salud Integral';
  }
  if (content.includes('té') || content.includes(' te ') || content.includes('terapia') || content.includes('adaptógeno') || content.includes('aromaterapia') || content.includes('astrolog') || content.includes('terapias') || content.includes('astrogenealog')) {
    return 'Terapias Complementarias';
  }
  if (content.includes('emocion') || content.includes('amor propio') || content.includes('duelo') || content.includes('ansiedad') || content.includes('estrés') || content.includes('estres') || content.includes('autoestima') || content.includes('emociones')) {
    return 'Bienestar Emocional';
  }
  
  // Default to Crecimiento Personal (it covers escritura, coaching, propósito, and is a good catch-all)
  return 'Crecimiento Personal';
}

function parsePublishTimeText(text) {
  const now = new Date();
  if (!text) return now.toISOString();
  
  const textClean = text.toLowerCase().trim();
  
  // Handled relative terms in Spanish (e.g. "hace 8 meses", "hace 1 año", "transmitido hace 3 semanas")
  const numberMatch = textClean.match(/(\d+)/);
  if (!numberMatch) return now.toISOString();
  const amount = parseInt(numberMatch[0]);

  if (textClean.includes('segundo')) {
    now.setSeconds(now.getSeconds() - amount);
  } else if (textClean.includes('minuto')) {
    now.setMinutes(now.getMinutes() - amount);
  } else if (textClean.includes('hora')) {
    now.setHours(now.getHours() - amount);
  } else if (textClean.includes('día') || textClean.includes('dia')) {
    now.setDate(now.getDate() - amount);
  } else if (textClean.includes('semana')) {
    now.setDate(now.getDate() - amount * 7);
  } else if (textClean.includes('mes')) {
    now.setMonth(now.getMonth() - amount);
  } else if (textClean.includes('año') || textClean.includes('ano')) {
    now.setFullYear(now.getFullYear() - amount);
  }
  return now.toISOString();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== LUMINUS YOUTUBE VIDEO SCRAPER ===");
  
  console.log("Fetching /videos tab...");
  const htmlVideos = await fetchUrl('https://www.youtube.com/@luminus_latam/videos');
  const dataVideos = parseYtInitialData(htmlVideos);
  let videosList = [];
  if (dataVideos) {
    videosList = extractVideosFromData(dataVideos, ['Videos', 'Vídeos']);
    console.log(`Found ${videosList.length} videos in listing`);
  } else {
    console.log("Could not parse /videos tab");
  }

  console.log("\nFetching /streams tab...");
  const htmlStreams = await fetchUrl('https://www.youtube.com/@luminus_latam/streams');
  const dataStreams = parseYtInitialData(htmlStreams);
  let streamsList = [];
  if (dataStreams) {
    streamsList = extractVideosFromData(dataStreams, ['Live', 'En vivo', 'Directos']);
    console.log(`Found ${streamsList.length} streams in listing`);
  } else {
    console.log("Could not parse /streams tab");
  }

  // Merge and deduplicate
  const combined = [];
  const seenIds = new Set();

  for (const item of videosList) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      combined.push({ ...item, type: 'video' });
    }
  }

  for (const item of streamsList) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      combined.push({ ...item, type: 'live' });
    }
  }

  console.log(`\nFound ${combined.length} unique videos. Fetching descriptions from individual watch pages...`);

  const results = [];
  
  for (let i = 0; i < combined.length; i++) {
    const video = combined[i];
    console.log(`[${i + 1}/${combined.length}] Fetching watch page for video: ${video.id} (${video.title.substring(0, 40)}...)`);
    
    let description = '';
    let exactDate = '';
    try {
      const watchHtml = await fetchUrl(video.link);
      const ogDescMatch = watchHtml.match(/<meta property="og:description" content="([^"]*)"/i) || watchHtml.match(/<meta name="description" content="([^"]*)"/i);
      if (ogDescMatch) {
        description = decodeHtmlEntities(ogDescMatch[1]);
      }

      const uploadDateMatch = watchHtml.match(/<meta itemprop="datePublished" content="([^"]*)"/i) || watchHtml.match(/<meta itemprop="uploadDate" content="([^"]*)"/i);
      if (uploadDateMatch) {
        exactDate = uploadDateMatch[1];
      }
    } catch (err) {
      console.error(`Error fetching watch page for video ${video.id}:`, err.message);
    }

    const speakerName = guessSpeaker(video.title);
    const dateValue = exactDate || parsePublishTimeText(video.publishTimeText);
    const category = autoCategorize(video.title, description);

    results.push({
      youtube_id: video.id,
      title: video.title,
      description: description,
      link: video.link,
      date: dateValue,
      speaker_name: speakerName || 'Especialista LUMINUS',
      category: category,
      cover_url: null, // to be populated later if custom covers are uploaded
      publishTimeText: video.publishTimeText,
      viewCountText: video.viewCountText,
      type: video.type
    });

    // Be nice to YouTube
    await delay(300);
  }

  // Ensure directories exist
  const outputDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'youtube_videos.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSuccessfully saved ${results.length} videos to ${outputPath}`);
}

main().catch(err => {
  console.error("Scraper crash:", err);
});
