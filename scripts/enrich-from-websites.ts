/**
 * Upsert clinic profiles from website-enriched JSON (schema.org / practice sites).
 * - Updates existing clinics by case-insensitive name match
 * - Inserts new practices not already in DB
 * - Never overwrites claimed clinics' core identity (name) but may fill empty contact fields
 *
 * Usage: npx tsx scripts/enrich-from-websites.ts
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type Enriched = {
  name: string;
  website?: string;
  location: string;
  address: string;
  phone: string;
  description: string;
};

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

function isBetterAddress(next: string, prev: string): boolean {
  const n = (next || "").trim();
  const p = (prev || "").trim();
  if (!n) return false;
  if (!p) return true;
  // Prefer addresses with a street number
  const nHasNum = /\d/.test(n);
  const pHasNum = /\d/.test(p);
  if (nHasNum && !pHasNum) return true;
  if (n.length > p.length + 5 && nHasNum) return true;
  return false;
}

function isBetterPhone(next: string, prev: string): boolean {
  const n = (next || "").replace(/\D/g, "");
  const p = (prev || "").replace(/\D/g, "");
  if (n.length >= 10 && p.length < 10) return true;
  if (n.length >= 10 && !prev) return true;
  return false;
}

async function main() {
  const file = path.resolve(process.cwd(), "data/website-enriched-clinics.json");
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as Enriched[];

  const existing = await prisma.clinicProfile.findMany();
  const byNorm = new Map(existing.map((c) => [normalizeName(c.name), c]));

  let updated = 0;
  let inserted = 0;

  for (const row of rows) {
    const key = normalizeName(row.name);
    const found = byNorm.get(key);

    if (found) {
      const data: Record<string, string> = {};
      if (isBetterAddress(row.address, found.address)) data.address = row.address;
      if (isBetterPhone(row.phone, found.phone)) data.phone = row.phone;
      if (row.location && (!found.location || found.location.length < 3)) {
        data.location = row.location;
      } else if (row.location && found.location !== row.location && row.location.includes("ID")) {
        // keep existing city unless empty
      }
      if (
        row.description &&
        (found.description.length < 40 || found.description.startsWith("General dentistry") || found.description.startsWith("Dental practice"))
      ) {
        data.description = row.description;
      }
      // Append website note into description if present and not already there
      if (row.website && data.description) {
        if (!data.description.includes(row.website)) {
          data.description = `${data.description} Website: ${row.website}`;
        }
      } else if (row.website && found.description && !found.description.includes(row.website) && Object.keys(data).length > 0) {
        data.description = `${data.description || found.description} Website: ${row.website}`;
      } else if (row.website && !found.description.includes("Website:") && Object.keys(data).length === 0) {
        data.description = `${found.description} Website: ${row.website}`.trim();
      }

      if (Object.keys(data).length > 0) {
        await prisma.clinicProfile.update({ where: { id: found.id }, data });
        updated++;
        console.log("updated:", row.name, Object.keys(data).join(","));
      }
    } else {
      const desc = row.website
        ? `${row.description} Website: ${row.website}`
        : row.description;
      await prisma.clinicProfile.create({
        data: {
          id: randomUUID(),
          name: row.name,
          initials: initialsFromName(row.name),
          location: row.location,
          address: row.address || row.location,
          phone: row.phone || "",
          description: desc,
          email: "",
          contactName: "",
          rating: 0,
          reviewCount: 0,
          claimed: false,
        },
      });
      inserted++;
      console.log("inserted:", row.name);
    }
  }

  const total = await prisma.clinicProfile.count();
  const unclaimed = await prisma.clinicProfile.count({ where: { claimed: false } });
  console.log("\n=== Summary ===");
  console.log({ updated, inserted, total, unclaimed });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
