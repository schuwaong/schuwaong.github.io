#!/usr/bin/env node
import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(scriptDir);
const htmlPath = join(repoRoot, "ic-property", "darren-damansara.html");
const outputDir = join(repoRoot, "ic-property", "assets", "darren-listings");
const manifestPath = join(outputDir, "manifest.json");
const force = process.argv.includes("--force");

const headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
  "Referer": "https://www.propertyguru.com.my/",
  "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
};

function imageUrlsFrom(html) {
  const pattern = /https:\/\/(?:my1|ipp1)-cdn\.pgimgs\.com\/listing\/[^"'`\s<)]+?\.(?:jpg|jpeg|png)/gi;
  return [...new Set([...html.matchAll(pattern)].map((match) => match[0]))];
}

function localNameFor(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const listingIndex = parts.indexOf("listing");
  const listingId = parts[listingIndex + 1] || "listing";
  const variant = parts[listingIndex + 2] || "photo";
  const fileName = parts[listingIndex + 3] || parts.at(-1) || "photo.jpg";
  return `${listingId}-${decodeURIComponent(variant)}-${decodeURIComponent(fileName)}`;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function download(url, destination, redirects = 4) {
  const parsed = new URL(url);
  const getter = parsed.protocol === "http:" ? httpGet : httpsGet;

  await new Promise((resolve, reject) => {
    const request = getter(url, { headers }, async (response) => {
      const status = response.statusCode || 0;
      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location && redirects > 0) {
        response.resume();
        try {
          await download(new URL(response.headers.location, url).href, destination, redirects - 1);
          resolve();
        } catch (error) {
          reject(error);
        }
        return;
      }

      if (status !== 200) {
        response.resume();
        reject(new Error(`HTTP ${status} for ${url}`));
        return;
      }

      try {
        await pipeline(response, createWriteStream(destination));
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error(`Timed out downloading ${url}`));
    });
  });
}

await mkdir(outputDir, { recursive: true });

const html = await readFile(htmlPath, "utf8");
const urls = imageUrlsFrom(html);
const assets = [];

for (const url of urls) {
  const fileName = localNameFor(url);
  const destination = join(outputDir, fileName);
  const alreadyCached = await exists(destination);
  if (!alreadyCached || force) {
    await download(url, destination);
    console.log(`cached ${fileName}`);
  } else {
    console.log(`kept ${fileName}`);
  }
  assets.push({
    sourceUrl: url,
    localPath: `ic-property/assets/darren-listings/${fileName}`
  });
}

await writeFile(
  manifestPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    sourceHtml: "ic-property/darren-damansara.html",
    count: assets.length,
    assets
  }, null, 2)}\n`,
  "utf8"
);

console.log(`wrote ${assets.length} assets -> ${manifestPath}`);
