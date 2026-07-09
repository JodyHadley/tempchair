/**
 * Additive import of pre-listed clinics.
 * Does NOT wipe existing data. Skips clinics that already exist (case-insensitive name match).
 *
 * Usage: npx tsx scripts/import-clinics.ts
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

type ClinicRow = {
  name: string;
  location: string;
  address: string;
  phone: string;
  description: string;
};

function initialsFromName(name: string): string {
  const cleaned = name
    .replace(/\b(DDS|DMD|PC|PLLC|LLC|Inc|Dental|Dentistry|Family|Care|Center|Clinic|of|and|&|The)\b/gi, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function main() {
  const file = path.resolve(process.cwd(), "data/treasure-valley-clinics.json");
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as ClinicRow[];

  const existing = await prisma.clinicProfile.findMany({
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => normalizeName(c.name)));

  const toInsert: ClinicRow[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const key = normalizeName(row.name);
    if (!key || existingNames.has(key) || seen.has(key)) continue;
    seen.add(key);
    toInsert.push(row);
  }

  console.log(`Existing clinics: ${existing.length}`);
  console.log(`Candidates in file: ${rows.length}`);
  console.log(`New to insert: ${toInsert.length}`);

  if (toInsert.length === 0) {
    console.log("Nothing to insert.");
    return;
  }

  const data = toInsert.map((c) => ({
    id: randomUUID(),
    name: c.name,
    initials: initialsFromName(c.name),
    location: c.location,
    address: c.address || c.location,
    phone: c.phone || "",
    description: c.description || `Dental practice in ${c.location}.`,
    email: "",
    contactName: "",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  }));

  // Batch insert
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const result = await prisma.clinicProfile.createMany({ data: batch });
    inserted += result.count;
  }

  const total = await prisma.clinicProfile.count();
  const unclaimed = await prisma.clinicProfile.count({ where: { claimed: false } });
  console.log(`Inserted: ${inserted}`);
  console.log(`Total clinics now: ${total} (${unclaimed} unclaimed)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
