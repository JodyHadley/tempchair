/**
 * Nightly clinic website scraper (20–30 sites per run).
 *
 * Does NOT scrape Google Search results (blocked + against Google ToS).
 * Instead scrapes known practice websites from data/scrape-queue.json:
 *  - Prefer schema.org Dentist / LocalBusiness / DentalClinic JSON-LD
 *  - Fallback: tel: links + simple address heuristics
 *  - Upserts into clinic_profiles (unclaimed preferred; fills empty fields)
 *
 * Usage:
 *   npx tsx scripts/nightly-clinic-scrape.ts
 *   npx tsx scripts/nightly-clinic-scrape.ts --batch=20
 *   npx tsx scripts/nightly-clinic-scrape.ts --dry-run
 *
 * Env: DATABASE_URL (or DIRECT_URL) via .env.local
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const QUEUE_PATH = path.resolve(process.cwd(), "data/scrape-queue.json");
const LOG_DIR = path.resolve(process.cwd(), "data/scrape-logs");

type QueueTarget = {
  url: string;
  nameHint?: string;
  status: "pending" | "ok" | "error" | "skipped";
  lastScrapedAt: string | null;
  lastError: string | null;
};

type QueueFile = {
  settings: {
    batchSize: number;
    delayMsBetweenRequests: number;
    userAgent: string;
  };
  targets: QueueTarget[];
};

type ScrapedClinic = {
  name: string;
  address: string;
  phone: string;
  location: string;
  description: string;
  website: string;
};

const dryRun = process.argv.includes("--dry-run");
const batchArg = process.argv.find((a) => a.startsWith("--batch="));
const batchOverride = batchArg ? Number(batchArg.split("=")[1]) : null;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function initialsFromName(name: string): string {
  const cleaned = name
    .replace(
      /\b(DDS|DMD|PC|PLLC|LLC|Inc|Dental|Dentistry|Family|Care|Center|Clinic|of|and|&|The|Group|Dr)\b/gi,
      " ",
    )
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return raw.trim();
}

function locationFromAddress(address: string): string {
  // "9460 W Franklin Rd, Boise, ID 83709" → "Boise, ID"
  const m = address.match(/,\s*([A-Za-z .]+),\s*(ID|Idaho)\b/i);
  if (m) {
    const city = m[1].trim();
    return `${city}, ID`;
  }
  if (/boise/i.test(address)) return "Boise, ID";
  if (/meridian/i.test(address)) return "Meridian, ID";
  if (/eagle/i.test(address)) return "Eagle, ID";
  if (/nampa/i.test(address)) return "Nampa, ID";
  if (/caldwell/i.test(address)) return "Caldwell, ID";
  return "Boise, ID";
}

/** Extract all application/ld+json blocks and flatten @graph */
function extractJsonLd(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { "@graph"?: unknown[] })["@graph"])) {
        blocks.push(...((parsed as { "@graph": unknown[] })["@graph"]));
      } else {
        blocks.push(parsed);
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }
  return blocks;
}

function typesOf(node: Record<string, unknown>): string[] {
  const t = node["@type"];
  if (!t) return [];
  if (Array.isArray(t)) return t.map(String);
  return [String(t)];
}

function isDentalBusiness(types: string[]): boolean {
  const joined = types.join(" ").toLowerCase();
  return (
    joined.includes("dentist") ||
    joined.includes("dental") ||
    joined.includes("localbusiness") ||
    joined.includes("medicalbusiness") ||
    joined.includes("physician")
  );
}

function addressFromSchema(addr: unknown): string {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object" && addr !== null) {
    const a = addr as Record<string, unknown>;
    const street = String(a.streetAddress || "");
    const city = String(a.addressLocality || "");
    const region = String(a.addressRegion || "ID");
    const zip = String(a.postalCode || "");
    return [street, city, region, zip].filter(Boolean).join(", ").replace(/, ID,/, ", ID");
  }
  return "";
}

function scrapeFromHtml(html: string, pageUrl: string, nameHint?: string): ScrapedClinic | null {
  const nodes = extractJsonLd(html).filter(
    (n): n is Record<string, unknown> => !!n && typeof n === "object",
  );

  const dental = nodes.find((n) => isDentalBusiness(typesOf(n)));
  const anyBiz = dental || nodes.find((n) => typesOf(n).some((t) => /organization|localbusiness/i.test(t)));

  let name = nameHint || "";
  let phone = "";
  let address = "";
  let description = "";

  if (anyBiz) {
    name = String(anyBiz.name || name);
    phone = String(anyBiz.telephone || anyBiz.phone || "");
    address = addressFromSchema(anyBiz.address);
    description = String(anyBiz.description || "");
  }

  // Fallback phone from tel: links
  if (!phone) {
    const tel = html.match(/href=["']tel:([^"']+)["']/i);
    if (tel) phone = decodeURIComponent(tel[1]);
  }

  // Fallback: Idaho-looking address line
  if (!address) {
    const addrMatch = html.match(
      /(\d{1,5}\s+[\w .#'-]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)\.?[^<,]{0,40},\s*[A-Za-z .]+,\s*ID\s*\d{5})/i,
    );
    if (addrMatch) address = addrMatch[1].replace(/\s+/g, " ").trim();
  }

  // Clean HTML entities lightly
  const clean = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

  name = clean(name);
  phone = phone ? formatPhone(clean(phone)) : "";
  address = clean(address);
  description = clean(description).slice(0, 400);

  if (!name && nameHint) name = nameHint;
  if (!name) return null;
  // Need at least phone or street address to be useful
  if (!phone && !/\d/.test(address)) return null;

  if (description && !description.includes(pageUrl)) {
    description = `${description} Website: ${pageUrl}`.trim();
  } else if (!description) {
    description = `Dental practice in the Treasure Valley. Website: ${pageUrl}`;
  }

  return {
    name,
    address: address || locationFromAddress(address) || "Boise, ID",
    phone,
    location: address ? locationFromAddress(address) : "Boise, ID",
    description,
    website: pageUrl,
  };
}

async function robotsAllows(url: string, userAgent: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const robotsUrl = `${u.origin}/robots.txt`;
    const res = await fetch(robotsUrl, {
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return true; // if no robots, be polite but proceed
    const text = await res.text();
    // Very simple: if Disallow: / for * and path is / only — still allow subpaths unless Disallow: /
    // Block if User-agent: * has Disallow: / with no allow for our path
    const lines = text.split("\n").map((l) => l.trim());
    let inStar = false;
    const disallows: string[] = [];
    for (const line of lines) {
      if (/^user-agent:\s*\*/i.test(line)) {
        inStar = true;
        continue;
      }
      if (/^user-agent:/i.test(line)) {
        inStar = false;
        continue;
      }
      if (inStar && /^disallow:/i.test(line)) {
        disallows.push(line.split(":").slice(1).join(":").trim());
      }
    }
    const pathName = u.pathname || "/";
    for (const d of disallows) {
      if (d === "/") return false;
      if (d && pathName.startsWith(d)) return false;
    }
    return true;
  } catch {
    return true;
  }
}

async function fetchHtml(url: string, userAgent: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text") && !ct.includes("html") && !ct.includes("xml")) {
    throw new Error(`Non-HTML content-type: ${ct}`);
  }
  return await res.text();
}

async function upsertClinic(
  prisma: PrismaClient,
  scraped: ScrapedClinic,
): Promise<"updated" | "inserted" | "unchanged"> {
  const existing = await prisma.clinicProfile.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      description: true,
      claimed: true,
    },
  });
  const match = existing.find(
    (c) => normalizeName(c.name) === normalizeName(scraped.name),
  );

  if (match) {
    const data: Record<string, string> = {};
    if (scraped.phone && !match.phone) data.phone = scraped.phone;
    if (scraped.address && /\d/.test(scraped.address) && !/\d/.test(match.address || "")) {
      data.address = scraped.address;
    }
    if (
      scraped.description &&
      (match.description.length < scraped.description.length ||
        !match.description.includes("Website:"))
    ) {
      data.description = scraped.description;
    }
    if (Object.keys(data).length === 0) return "unchanged";
    if (dryRun) return "updated";
    await prisma.clinicProfile.update({ where: { id: match.id }, data });
    return "updated";
  }

  if (dryRun) return "inserted";
  await prisma.clinicProfile.create({
    data: {
      id: randomUUID(),
      name: scraped.name,
      initials: initialsFromName(scraped.name),
      location: scraped.location,
      address: scraped.address,
      phone: scraped.phone,
      description: scraped.description,
      email: "",
      contactName: "",
      rating: 0,
      reviewCount: 0,
      claimed: false,
    },
  });
  return "inserted";
}

async function main() {
  if (!fs.existsSync(QUEUE_PATH)) {
    console.error("Missing", QUEUE_PATH);
    process.exit(1);
  }

  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8")) as QueueFile;
  const batchSize = batchOverride || queue.settings.batchSize || 25;
  const delay = queue.settings.delayMsBetweenRequests || 3000;
  const ua = queue.settings.userAgent;

  // Prefer never-scraped, then oldest ok/error (re-scrape after 14 days)
  const now = Date.now();
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;

  const ranked = [...queue.targets].sort((a, b) => {
    const aTime = a.lastScrapedAt ? new Date(a.lastScrapedAt).getTime() : 0;
    const bTime = b.lastScrapedAt ? new Date(b.lastScrapedAt).getTime() : 0;
    return aTime - bTime;
  });

  const batch = ranked
    .filter((t) => {
      if (!t.lastScrapedAt) return true;
      const age = now - new Date(t.lastScrapedAt).getTime();
      return age > fourteenDays || t.status === "error";
    })
    .slice(0, batchSize);

  console.log(`Nightly clinic scrape — batch ${batch.length} (limit ${batchSize})${dryRun ? " [DRY RUN]" : ""}`);

  if (batch.length === 0) {
    console.log("Nothing due for scrape. Add more URLs to data/scrape-queue.json");
    return;
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL || "",
  });
  const prisma = new PrismaClient({ adapter });

  const results: unknown[] = [];
  let updated = 0;
  let inserted = 0;
  let errors = 0;

  try {
    for (let i = 0; i < batch.length; i++) {
      const target = batch[i];
      const queueItem = queue.targets.find((t) => t.url === target.url)!;
      console.log(`\n[${i + 1}/${batch.length}] ${target.url}`);

      try {
        const allowed = await robotsAllows(target.url, ua);
        if (!allowed) {
          queueItem.status = "skipped";
          queueItem.lastError = "Disallowed by robots.txt";
          queueItem.lastScrapedAt = new Date().toISOString();
          console.log("  skipped (robots.txt)");
          continue;
        }

        const html = await fetchHtml(target.url, ua);
        const scraped = scrapeFromHtml(html, target.url, target.nameHint);
        if (!scraped) {
          queueItem.status = "error";
          queueItem.lastError = "No structured contact data found";
          queueItem.lastScrapedAt = new Date().toISOString();
          errors++;
          console.log("  no data extracted");
        } else {
          const action = await upsertClinic(prisma, scraped);
          queueItem.status = "ok";
          queueItem.lastError = null;
          queueItem.lastScrapedAt = new Date().toISOString();
          if (action === "updated") updated++;
          if (action === "inserted") inserted++;
          console.log(`  ${action}: ${scraped.name} | ${scraped.phone} | ${scraped.address}`);
          results.push({ url: target.url, action, scraped });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        queueItem.status = "error";
        queueItem.lastError = msg.slice(0, 300);
        queueItem.lastScrapedAt = new Date().toISOString();
        errors++;
        console.log("  error:", msg);
      }

      if (i < batch.length - 1) await sleep(delay);
    }

    if (!dryRun) {
      fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + "\n");
      fs.mkdirSync(LOG_DIR, { recursive: true });
      const logFile = path.join(
        LOG_DIR,
        `scrape-${new Date().toISOString().slice(0, 10)}.json`,
      );
      fs.writeFileSync(
        logFile,
        JSON.stringify(
          {
            ranAt: new Date().toISOString(),
            batchSize: batch.length,
            updated,
            inserted,
            errors,
            results,
          },
          null,
          2,
        ) + "\n",
      );
      console.log("\nWrote queue + log", logFile);
    }

    const total = await prisma.clinicProfile.count();
    console.log("\n=== Done ===");
    console.log({ updated, inserted, errors, totalClinics: total });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
