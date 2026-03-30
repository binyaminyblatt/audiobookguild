import axios from "axios";
import fs from "fs";

const BASE = "https://audiobookguild.com/collections/all/products.json?page=";
const CONCURRENCY = 4;
const OUTPUT_FILE = "audiobookguild.json";

const client = axios.create({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }
});

function parseTags(tags) {
  const meta = {
    author: null,
    narrators: [],
    genre: [],
    series: null,
    trope: [],
    sexyTime: null,
    harem: false,
  };

  for (const tag of tags) {
    if (tag.startsWith("Author_"))
      meta.author = tag.replace("Author_", "");
    else if (tag.startsWith("Narrator_"))
      meta.narrators.push(tag.replace("Narrator_", ""));
    else if (tag.startsWith("Genre_"))
      meta.genre.push(tag.replace("Genre_", ""));
    else if (tag.startsWith("Series_") || tag.startsWith("series_"))
      meta.series = tag.replace("Series_", "").replace("series_", "");
    else if (tag.startsWith("Trope_"))
        meta.trope.push(tag.replace("Trope_", ""));
    else if (tag.startsWith("Sexy Time_"))
        meta.sexyTime = tag.replace("Sexy Time_", "");
    else if (tag.startsWith("Harem_")){
        let val = tag.replace("Harem_", "");
        if (val === "Yes Please" )
            meta.harem = true;
    }
  }

  return meta;
}


function parseEpisodeNumber(title) {
  const m = title.match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}

function convertProduct(p) {
  const tags = parseTags(p.tags);
  const episodeNumber = parseEpisodeNumber(p.title);
  return {
    id: p.id,
    link: `https://audiobookguild.com/products/${p.handle}`,
    cover: p.images?.[0]?.src ?? null,
    description: p.body_html,
    seriesName: tags.series,
    title: p.title,
    episodeNumber: episodeNumber,
    author: tags.author || p.vendor,
    releaseDate: new Date(p.published_at).toISOString(),
    genre: tags.genre,
    narrators: tags.narrators,
    tags: tags.trope,
    harem: tags.harem,
    sexyTime: tags.sexyTime
  };
}

async function fetchPage(page, retries = 3) {
  try {
    const { data } = await client.get(BASE + page);
    return data.products;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchPage(page, retries - 1);
    }
    throw err;
  }
}

async function scrape() {
  let page = 1;
  let finished = false;

  // Load existing data if it exists
  let existing = new Map();
  if (fs.existsSync(OUTPUT_FILE)) {
    const oldData = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    for (const item of oldData) {
      existing.set(item.id, item);
    }
  }

  while (!finished) {
    const batch = [];
    for (let i = 0; i < CONCURRENCY; i++)
      batch.push(fetchPage(page + i));

    const pages = await Promise.all(batch);

    for (const products of pages) {
      if (!products.length) {
        finished = true;
        break;
      }

      for (const p of products) {
        if (!p.variants?.[0]?.title || p.variants[0].title.toLowerCase() !== "audiobook")
          continue;
        const converted = convertProduct(p);
        // Update if exists, else add new
        existing.set(converted.id, converted);
      }
    }

    page += CONCURRENCY;
    console.log("Pages scraped:", page);
  }

  // Write the final unique array
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(Array.from(existing.values()), null, 2)
  );

  console.log("Total unique books:", existing.size);
}

scrape();