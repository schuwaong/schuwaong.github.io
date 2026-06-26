#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const sourcePages = [
  "https://www.28hse.com/en/rent/apartment/a1/dg4/di4-22",
  "https://www.28hse.com/en/rent/apartment/a1/dg4/di4-22/page-2",
  "https://www.28hse.com/en/rent/apartment/a1/dg4/di4-22/page-3"
];

const outputPaths = [
  path.join(repoRoot, "ic-property/data/live-wanchai-listings.json"),
  path.join(repoRoot, "ic-property/social-content-sample/live-wanchai-listings.json")
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Codex IC Property refresh script)"
      }
    }, (response) => {
      const { statusCode, headers } = response;

      if (statusCode >= 300 && statusCode < 400 && headers.location) {
        response.resume();
        const nextUrl = new URL(headers.location, url).toString();
        resolve(fetchText(nextUrl));
        return;
      }

      if (statusCode && statusCode >= 400) {
        reject(new Error(`HTTP ${statusCode} for ${url}`));
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve(body));
    });

    request.on("error", reject);
  });
}

function clean(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value) {
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function formatHKD(value) {
  return `HK$${Math.round(Number(value) || 0).toLocaleString("en-US")}`;
}

function formatPercent(value, digits = 2) {
  return `${Number(value).toFixed(digits)}%`;
}

function hkTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} +08:00`;
}

function toLargeImage(url) {
  return String(url || "").replace(/_thumb\.jpg$/i, "_large.jpg");
}

function getMatch(block, pattern) {
  const match = block.match(pattern);
  return match ? clean(match[1]) : "";
}

function buildTags(text) {
  const lower = text.toLowerCase();
  const tags = [];
  const compactHint = /(?:\bstudio\b|\bsuite\b|\broom\b)/.test(lower);

  if (/no commission|commission free/.test(lower)) tags.push("No commission");
  if (/landlord/.test(lower)) tags.push("Direct landlord");
  if (/mtr|station|subway|times square|sogo|exhibition centre/.test(lower)) tags.push("MTR access");
  if (compactHint) tags.push("Studio / compact");
  if (/2-bedroom|2 bedrooms|2 bed/.test(lower)) tags.push("2 bedrooms");
  if (/3-bedroom|3 bedrooms|3 bed/.test(lower)) tags.push("3 bedrooms");
  if (/lift|elevator/.test(lower)) tags.push("Lift");
  if (/furnished/.test(lower)) tags.push("Furnished");
  if (/regulated tenancy|regulate/.test(lower)) tags.push("Regulated tenancy");
  if (/wan chai|causeway bay/.test(lower)) tags.push("Island side");

  return tags;
}

function buildFlags(text, areaNumber, photoCount) {
  const lower = text.toLowerCase();
  const flags = [];
  const compactHint = /(?:\bstudio\b|\bsuite\b|\broom\b)/.test(lower) || (areaNumber > 0 && areaNumber <= 220);

  if (/no commission|landlord/.test(lower)) flags.push("landlord_direct");
  if (/mtr|station|subway/.test(lower)) flags.push("mtr_access");
  if (compactHint) flags.push("compact_unit");
  if (/subdivided/.test(lower)) flags.push("subdivided_unit");
  if (/furnished/.test(lower)) flags.push("furnished");
  if (/lift|elevator/.test(lower)) flags.push("lift");
  if (/regulated tenancy|regulate/.test(lower)) flags.push("regulated");
  if (areaNumber && areaNumber < 150) flags.push("small_unit");
  if (photoCount >= 8) flags.push("photo_rich");

  return flags;
}

function pickValueLabel(score) {
  if (score >= 82) return "worth checking first";
  if (score >= 68) return "compare carefully";
  return "high-friction candidate";
}

function parseSearchPage(html, sourceUrl) {
  const blocks = html.split('<div class="item property_item " >').slice(1);

  return blocks.map((block) => {
    const id = getMatch(block, /href="https:\/\/www\.28hse\.com\/en\/rent\/apartment\/property-(\d+)"/i);
    if (!id) return null;

    const title = getMatch(block, /<div class="header wHoverBlue">\s*<a[^>]*>([\s\S]*?)<\/a>/i);
    const district = getMatch(block, /<div class="district_area wHoverBlue">[\s\S]*?<a[^>]*>(Wan Chai|Causeway Bay)<\/a>/i) || "Wan Chai";
    const building = getMatch(
      block,
      /<div class="district_area wHoverBlue">[\s\S]*?<a[^>]*>(?:Wan Chai|Causeway Bay)<\/a>\s*<span class="separation"><\/span>\s*<a[^>]*>([\s\S]*?)<\/a>/i
    );
    const unitDesc = getMatch(block, /<span class="unit_desc">([\s\S]*?)<\/span>/i);
    const priceNumber = parseNumber(getMatch(block, /Lease HKD\$([0-9,]+)/i));
    const areaMatch = block.match(/(Saleable Area|Gross Area):\s*([0-9,]+)\s*ft²(?:\s*<span class="separation"><\/span>\s*@\s*([0-9.]+))?/i);
    const areaType = areaMatch && /gross/i.test(areaMatch[1]) ? "gross" : "saleable";
    const areaNumber = areaMatch ? parseNumber(areaMatch[2]) : 0;
    const rentPerSqft = areaMatch && areaMatch[3] ? parseFloat(areaMatch[3]) : (areaNumber ? priceNumber / areaNumber : 0);
    const posted = getMatch(block, /<i class="clock outline icon"><\/i>\s*([\s\S]*?)<\/div>/i);
    const photoCount = parseNumber(getMatch(block, /<span class="ui label" style="">\s*([0-9]+)\s*/i));
    const imageThumb = getMatch(block, /<img class="detail_page_img desktop_detail_page_img" src="([^"]+)"/i);
    const textBlob = [title, building, unitDesc, district].join(" ");
    const tags = buildTags(textBlob);
    const flags = buildFlags(textBlob, areaNumber, photoCount);
    const needsTranslation = /[一-龥]/.test(textBlob);
    const image = toLargeImage(imageThumb);
    const hook = `${formatHKD(priceNumber)} in Wan Chai?`;
    const cta = "Open live listing";

    return {
      id,
      name: building || title || `Wan Chai ${id}`,
      title,
      district,
      price: formatHKD(priceNumber),
      priceNumber,
      size: `${areaType === "gross" ? "Gross Area" : "Saleable Area"}: ${areaNumber.toLocaleString("en-US")} ft²`,
      saleableAreaNumber: areaType === "saleable" ? areaNumber : null,
      grossSize: areaType === "gross" ? `${areaNumber.toLocaleString("en-US")} ft²` : "",
      grossAreaNumber: areaType === "gross" ? areaNumber : null,
      areaNumber,
      areaType,
      rentPerSqft,
      rentPerSqftLabel: `HK$${Math.round(rentPerSqft).toLocaleString("en-US")}/sq ft`,
      highlight: title,
      link: `https://www.28hse.com/en/rent/apartment/property-${id}`,
      image,
      imageUrl: image,
      posted,
      source: "28Hse",
      sourceUrl,
      company: "",
      tags,
      flags,
      valueScore: 0,
      valueLabel: "compare carefully",
      needsTranslation,
      hook,
      cta,
      fetchedAt: hkTimestamp(),
      status: "live_candidate_needs_agent_confirmation"
    };
  }).filter(Boolean);
}

function computeAnalytics(listings) {
  const prices = listings.map((listing) => listing.priceNumber).filter(Boolean);
  const rents = listings.map((listing) => listing.priceNumber).filter(Boolean);
  const rentPerSqfts = listings.map((listing) => listing.rentPerSqft).filter(Boolean);
  const sortedByPrice = listings.slice().sort((a, b) => a.priceNumber - b.priceNumber);
  const sortedByRpsf = listings.slice().sort((a, b) => a.rentPerSqft - b.rentPerSqft);
  const median = (values) => {
    if (!values.length) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const minRpsf = Math.min(...rentPerSqfts);
  const maxRpsf = Math.max(...rentPerSqfts);
  const directLandlordCount = listings.filter((listing) => listing.flags.includes("landlord_direct")).length;
  const shortTermCount = listings.filter((listing) => /\bshort\b|service|co-living/i.test(`${listing.title} ${listing.highlight} ${listing.tags.join(" ")}`)).length;
  const subdividedCount = listings.filter((listing) => listing.flags.includes("subdivided_unit") || listing.flags.includes("compact_unit")).length;
  const riskFlagListingCount = listings.filter((listing) => listing.flags.length > 0).length;
  const translationCheckCount = listings.filter((listing) => listing.needsTranslation).length;
  const photoRichCount = listings.filter((listing) => listing.flags.includes("photo_rich")).length;

  listings.forEach((listing) => {
    const scoreBase = maxRpsf === minRpsf ? 75 : 100 - (((listing.rentPerSqft - minRpsf) / (maxRpsf - minRpsf)) * 55);
    const bonuses =
      (listing.flags.includes("landlord_direct") ? 7 : 0) +
      (listing.flags.includes("mtr_access") ? 6 : 0) +
      (listing.flags.includes("photo_rich") ? 4 : 0) +
      Math.min(listing.tags.length, 4);
    const score = Math.max(1, Math.min(99, Math.round(scoreBase + bonuses)));
    listing.valueScore = score;
    listing.valueLabel = pickValueLabel(score);
    listing.hook = `${listing.price} in Wan Chai?`;
  });

  const topValueListings = listings
    .slice()
    .sort((a, b) => b.valueScore - a.valueScore || a.priceNumber - b.priceNumber)
    .slice(0, 3)
    .map((listing) => ({
      id: listing.id,
      name: listing.name,
      price: listing.price,
      rentPerSqftLabel: listing.rentPerSqftLabel,
      valueScore: listing.valueScore,
      valueLabel: listing.valueLabel,
      link: listing.link
    }));

  const totalRent = prices.reduce((sum, value) => sum + value, 0);
  const averageRent = prices.length ? totalRent / prices.length : 0;
  const averageRpsf = rentPerSqfts.length ? rentPerSqfts.reduce((sum, value) => sum + value, 0) / rentPerSqfts.length : 0;
  const priceBuckets = [
    { label: "HK$6,000-6,999", min: 6000, max: 6999 },
    { label: "HK$7,000-7,999", min: 7000, max: 7999 },
    { label: "HK$8,000-9,999", min: 8000, max: 9999 },
    { label: "HK$10,000-12,999", min: 10000, max: 12999 },
    { label: "HK$13,000-15,999", min: 13000, max: 15999 },
    { label: "HK$16,000+", min: 16000, max: Number.POSITIVE_INFINITY }
  ].map((bucket) => ({
    ...bucket,
    count: listings.filter((listing) => listing.priceNumber >= bucket.min && listing.priceNumber <= bucket.max).length,
    averageRentPerSqft: (() => {
      const bucketListings = listings.filter((listing) => listing.priceNumber >= bucket.min && listing.priceNumber <= bucket.max);
      if (!bucketListings.length) return null;
      return Number((bucketListings.reduce((sum, listing) => sum + listing.rentPerSqft, 0) / bucketListings.length).toFixed(2));
    })()
  }));

  const lowestRent = sortedByPrice[0];
  const bestRentPerSqft = sortedByRpsf[0];

  return {
    listingCount: listings.length,
    sourceResultCount: 581,
    averageRent: Math.round(averageRent),
    averageRentLabel: formatHKD(averageRent),
    medianRent: Math.round(median(prices)),
    medianRentLabel: formatHKD(median(prices)),
    averageRentPerSqft: Number(averageRpsf.toFixed(2)),
    averageRentPerSqftLabel: `HK$${Math.round(averageRpsf)}/sq ft`,
    medianRentPerSqft: Number(median(rentPerSqfts).toFixed(2)),
    medianRentPerSqftLabel: `HK$${Math.round(median(rentPerSqfts))}/sq ft`,
    directLandlordCount,
    shortTermCount,
    subdividedCount,
    riskFlagListingCount,
    translationCheckCount,
    newListingCount: listings.length,
    priceChangedCount: 0,
    imageChangedCount: 0,
    removedFromShortlistCount: 0,
    priceBuckets,
    lowestRent: lowestRent
      ? { id: lowestRent.id, name: lowestRent.name, price: lowestRent.price, link: lowestRent.link }
      : null,
    bestRentPerSqft: bestRentPerSqft
      ? {
          id: bestRentPerSqft.id,
          name: bestRentPerSqft.name,
          rentPerSqftLabel: bestRentPerSqft.rentPerSqftLabel,
          price: bestRentPerSqft.price,
          link: bestRentPerSqft.link
        }
      : null,
    topValueListings,
    note: "Live snapshot from Wan Chai search pages 1-3. Confirm availability, area basis, and image reuse before posting or advising."
  };
}

async function main() {
  const pageHtml = await Promise.all(sourcePages.map((url) => fetchText(url)));
  const listings = pageHtml.flatMap((html, index) => parseSearchPage(html, sourcePages[index]));
  const uniqueListings = Array.from(
    new Map(listings.map((listing) => [listing.id, listing])).values()
  ).slice(0, 45);

  const analytics = computeAnalytics(uniqueListings);
  const prices = uniqueListings.map((listing) => listing.priceNumber).filter(Boolean);
  const payload = {
    fetchedAt: hkTimestamp(),
    source: "28Hse Wan Chai apartment rentals, pages 1-3",
    sourceUrl: sourcePages[0],
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    resultCount: 581,
    note: "Live candidate feed refreshed from the Wan Chai search pages. Confirm availability and image reuse rights before posting.",
    analytics,
    listings: uniqueListings
  };

  for (const outputPath of outputPaths) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  }

  console.log(`refreshed ${uniqueListings.length} Wan Chai listings`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
