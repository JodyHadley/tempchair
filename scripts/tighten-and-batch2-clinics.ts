/**
 * 1) Tighten incomplete addresses/phones for known clinics
 * 2) Remove unclaimed placeholder listings (street-only fakes)
 * 3) Insert batch-2 real Treasure Valley clinics
 *
 * Usage: npx tsx scripts/tighten-and-batch2-clinics.ts
 */
import dotenv from "dotenv";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type Patch = {
  location?: string;
  address?: string;
  phone?: string;
  description?: string;
};

/** Exact name → fields to update */
const TIGHTEN: Record<string, Patch> = {
  "Treasure Valley Family Dentistry": {
    address: "1570 E Heritage Park St Ste 100, Meridian, ID 83646",
    phone: "(208) 884-8066",
    location: "Meridian, ID",
    description: "Family dentistry serving Meridian, Eagle, and Boise.",
  },
  "Willamette Dental Nampa": {
    address: "16145 N High Desert St, Nampa, ID 83687",
    phone: "(855) 433-6825",
    location: "Nampa, ID",
    description: "Willamette Dental Group location in north Nampa.",
  },
  "Willamette Dental Boise": {
    address: "607 N Mitchell St, Boise, ID 83704",
    phone: "(855) 433-6825",
    location: "Boise, ID",
  },
  "Willamette Dental Meridian": {
    address: "1075 S Wells St, Meridian, ID 83642",
    phone: "(855) 433-6825",
    location: "Meridian, ID",
  },
  "Idaho Family Dental": {
    address: "9203 W Overland Rd, Boise, ID 83709",
    phone: "(208) 375-1012",
    location: "Boise, ID",
    description: "Family dentistry with Dr. Anna Budolfson on Overland Road.",
  },
  "Lowry Dental": {
    address: "9460 W Franklin Rd, Boise, ID 83709",
    phone: "(208) 377-0410",
    location: "Boise, ID",
    description: "Family dental practice on Franklin Road.",
  },
  "Emerald West Dental": {
    address: "8850 W Emerald St Suite 150, Boise, ID 83704",
    phone: "(208) 323-2294",
    location: "Boise, ID",
    description: "General dentistry on Emerald Street.",
  },
  "Wells Dental": {
    address: "1880 W Judith Ln Suite 210, Boise, ID 83705",
    phone: "(208) 345-2771",
    location: "Boise, ID",
    description: "Family dentistry on Judith Lane.",
  },
  "Dr. Alexis Phillips Kids Dentist": {
    address: "Boise, ID",
    phone: "(208) 500-5437",
    description: "Board-certified pediatric dentistry in Boise.",
  },
  "Aspen Creek Dental": {
    address: "6144 Birch Ln, Nampa, ID 83687",
    phone: "(208) 466-8780",
    location: "Nampa, ID",
  },
  "Nampa Dental Health Center": {
    address: "109 12th Avenue Rd, Nampa, ID 83686",
    phone: "(208) 467-9271",
  },
  "Today's Dentistry Nampa": {
    address: "203 7th Ave S, Nampa, ID 83651",
    phone: "(208) 466-8400",
  },
  "Today's Dentistry Boise": {
    address: "8660 W Emerald St Ste 152, Boise, ID 83704",
    phone: "(208) 639-4390",
  },
  "Eagle Dental Care": {
    address: "125 N Stierman Way Ste A, Eagle, ID 83616",
    phone: "(208) 939-4111",
  },
  "Ascend Dental": {
    address: "577 E State St, Eagle, ID 83616",
    phone: "(208) 939-3500",
  },
  "New Leaf Dental": {
    address: "870 N Linder Rd Suite G, Meridian, ID 83642",
    phone: "(208) 896-2284",
  },
  "Willow Tree Dental Meridian": {
    address: "317 W Cherry Ln, Meridian, ID 83642",
    phone: "(208) 888-2055",
  },
  "Boise Integrative Dentistry": {
    address: "398 S 9th St Ste 230, Boise, ID 83702",
    phone: "(208) 336-0003",
  },
  "Idaho Street Dental": {
    address: "305 W Idaho St, Boise, ID 83702",
    phone: "(208) 343-7271",
  },
  "Capitol Dental": {
    address: "314 W Bannock St, Boise, ID 83702",
    phone: "(208) 336-9333",
  },
  "Carrington College Dental Hygiene Clinic": {
    address: "1122 N Orchard St, Boise, ID 83706",
    phone: "(208) 947-6821",
  },
  "Terry Reilly Health Services Dental — Whitney": {
    address: "1609 S Owyhee St, Boise, ID 83705",
    phone: "(208) 854-6627",
  },
  "VA Boise Dental Clinic": {
    address: "500 W Fort St, Boise, ID 83702",
    phone: "(208) 422-1000",
  },
  "Boise Family Dental Care — Emerald": {
    address: "6363 W Emerald St Ste 102, Boise, ID 83704",
    phone: "(208) 376-7413",
  },
  "Boise Family Dental Care — Overland": {
    address: "9931 W Cable Car St Ste 150, Boise, ID 83709",
    phone: "(208) 369-2255",
  },
  "Aspen Dental Boise": {
    address: "8321 W Overland Rd, Boise, ID 83709",
    phone: "(208) 375-4240",
  },
  "Emerald Smiles Dentistry": {
    address: "675 N Milwaukee St Ste 110, Boise, ID 83704",
    phone: "(208) 593-3221",
  },
  "Grant Dental Meridian": {
    address: "2275 S Eagle Rd Suite 140, Meridian, ID 83642",
    phone: "(208) 888-2000",
  },
  "Steiner Family Dentistry": {
    address: "1550 N Crestmont Dr Suite C, Meridian, ID 83642",
    phone: "(208) 888-4481",
  },
  "Cherry Lane Kids Dentistry": {
    address: "1558 N Crestmont Dr Ste A, Meridian, ID 83642",
    phone: "(208) 519-3474",
  },
  "Eagle Oral Surgery and Dental Implant Center": {
    address: "197 W State St, Eagle, ID 83616",
    phone: "(208) 995-2865",
  },
  "Alexander Hoffman Orthodontics": {
    address: "450 W State St Ste 150, Eagle, ID 83616",
    phone: "(208) 331-5080",
  },
  "Treasure Valley Orthodontics": {
    address: "450 E State St Ste 100, Eagle, ID 83616",
    phone: "(208) 939-2311",
  },
  "Lighthouse Dental": {
    address: "1177 N Eagle Rd, Eagle, ID 83616",
    phone: "(208) 939-3010",
  },
  "Cottonwood Creek Dental": {
    address: "325 E Shore Dr Ste 100, Eagle, ID 83616",
    phone: "(844) 498-0149",
  },
  "Caldwell Dentistry Co.": {
    address: "1711 S 10th Ave, Caldwell, ID 83605",
    phone: "(208) 454-9217",
  },
};

/** Unclaimed placeholder / non-office rows to remove */
const DELETE_NAMES = [
  "12th Avenue Dental Nampa",
  "Avalon Street Dental Kuna",
  "Blaine Street Dental Caldwell",
  "Broadway Dental Boise",
  "Cole Road Dental",
  "Eagle Road Dental Care",
  "Fairview Dental Meridian",
  "Five Mile Dental",
  "Floating Feather Dental",
  "Garrity Boulevard Dental",
  "Highway 44 Dental Eagle",
  "Highway 44 Dental Star",
  "Hill Road Dental",
  "Karcher Road Dental",
  "Kimball Avenue Dental",
  "Linder Road Dental",
  "Locust Grove Dental",
  "Midland Boulevard Dental",
  "Overland Dental Meridian",
  "Parkcenter Dental",
  "Ten Mile Dental",
  "Ustick Dental Meridian",
  "Vista Avenue Dental",
  "Warm Springs Dental",
  "Pacific Dental Services Boise Area",
  "Family Health Services Dental", // Twin Falls — outside market focus
  "fjrYpPomLWMHGxVg",
  "Test Clinic",
];

type NewClinic = {
  name: string;
  location: string;
  address: string;
  phone: string;
  description: string;
};

/** Batch 2 — only practices with verified street address + phone when possible */
const BATCH2: NewClinic[] = [
  {
    name: "Lamb Family Dental",
    location: "Boise, ID",
    address: "4255 N Eagle Rd Ste 102, Boise, ID 83713",
    phone: "(208) 344-6300",
    description: "Gentle family dentistry on Eagle Road.",
  },
  {
    name: "Bird Family Dental",
    location: "Boise, ID",
    address: "1744 N Mitchell St, Boise, ID 83704",
    phone: "(208) 322-1263",
    description: "Family dental practice near Fairview and Mitchell.",
  },
  {
    name: "Copperstone Dental",
    location: "Meridian, ID",
    address: "3250 N Leslie Way, Meridian, ID 83646",
    phone: "(208) 218-0329",
    description: "Family and cosmetic dentistry in Meridian.",
  },
  {
    name: "Riverbend Family Dental",
    location: "Meridian, ID",
    address: "2947 E Magic View Dr #4, Meridian, ID 83642",
    phone: "(986) 256-3244",
    description: "Family dentistry in Meridian.",
  },
  {
    name: "Care Smiles Dental",
    location: "Meridian, ID",
    address: "1144 S Silverstone Way Suite 140, Meridian, ID 83642",
    phone: "(208) 607-3234",
    description: "General dentistry in south Meridian.",
  },
  {
    name: "ISU Family Dentistry Meridian",
    location: "Meridian, ID",
    address: "1311 E Central Dr, Meridian, ID 83642",
    phone: "(208) 373-1855",
    description: "Idaho State University family dentistry clinic.",
  },
  {
    name: "Owyhee Oral & Facial Surgery",
    location: "Meridian, ID",
    address: "1554 S Labrador Way, Meridian, ID 83642",
    phone: "(208) 505-1946",
    description: "Oral and facial surgery in Meridian.",
  },
  {
    name: "Dental Care West Nampa",
    location: "Nampa, ID",
    address: "230 W Georgia Ave Ste 100, Nampa, ID 83686",
    phone: "(208) 467-1000",
    description: "Dental care practice in Nampa.",
  },
  {
    name: "Boise Caring Dentistry",
    location: "Boise, ID",
    address: "4840 N Rosepoint Way STE A, Boise, ID 83713",
    phone: "(208) 938-8743",
    description: "General dentistry in northwest Boise.",
  },
  {
    name: "208 Dental Meridian",
    location: "Meridian, ID",
    address: "Meridian, ID 83642",
    phone: "(208) 501-8860",
    description: "Family-owned dental practice in Meridian.",
  },
  {
    name: "Legacy Smiles Family Dental",
    location: "Meridian, ID",
    address: "Meridian, ID 83642",
    phone: "(208) 888-3311",
    description: "Family dental practice in Meridian.",
  },
  {
    name: "Central District Health Dental Clinic",
    location: "Boise, ID",
    address: "707 N Armstrong Pl, Boise, ID 83704",
    phone: "(208) 375-5211",
    description: "Public health dental clinic in Ada County.",
  },
];

function initialsFromName(name: string): string {
  const cleaned = name
    .replace(
      /\b(DDS|DMD|PC|PLLC|LLC|Inc|Dental|Dentistry|Family|Care|Center|Clinic|of|and|&|The|Group)\b/gi,
      " ",
    )
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
  console.log("=== 1) Tighten known incomplete clinics ===");
  let updated = 0;
  for (const [name, patch] of Object.entries(TIGHTEN)) {
    const result = await prisma.clinicProfile.updateMany({
      where: { name },
      data: patch,
    });
    if (result.count > 0) {
      updated += result.count;
      console.log(`  updated: ${name}`);
    }
  }
  console.log(`Updated ${updated} clinic rows.`);

  console.log("\n=== 2) Remove placeholder / junk unclaimed rows ===");
  // Only delete unclaimed placeholders (never touch claimed production accounts)
  const del = await prisma.clinicProfile.deleteMany({
    where: {
      claimed: false,
      name: { in: DELETE_NAMES },
    },
  });
  // Also delete clearly junk claimed test rows if present
  const delJunk = await prisma.clinicProfile.deleteMany({
    where: {
      OR: [
        { name: "fjrYpPomLWMHGxVg" },
        { name: "Test Clinic", claimed: true, address: "" },
      ],
    },
  });
  console.log(`Deleted ${del.count + delJunk.count} placeholder/junk clinics.`);

  console.log("\n=== 3) Insert batch 2 ===");
  const existing = await prisma.clinicProfile.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((c) => normalizeName(c.name)));

  const toInsert = BATCH2.filter((c) => !existingNames.has(normalizeName(c.name)));
  console.log(`Batch2 candidates: ${BATCH2.length}, new: ${toInsert.length}`);

  if (toInsert.length > 0) {
    const data = toInsert.map((c) => ({
      id: randomUUID(),
      name: c.name,
      initials: initialsFromName(c.name),
      location: c.location,
      address: c.address || c.location,
      phone: c.phone || "",
      description: c.description,
      email: "",
      contactName: "",
      rating: 0,
      reviewCount: 0,
      claimed: false,
    }));
    const result = await prisma.clinicProfile.createMany({ data });
    console.log(`Inserted ${result.count} clinics.`);
  }

  const total = await prisma.clinicProfile.count();
  const unclaimed = await prisma.clinicProfile.count({ where: { claimed: false } });
  const incomplete = await prisma.clinicProfile.findMany({
    select: { name: true, address: true, phone: true, location: true },
  });
  const stillIncomplete = incomplete.filter((c) => {
    const addr = (c.address || "").trim();
    const phone = (c.phone || "").trim();
    return !phone || !addr || !/\d/.test(addr) || addr === c.location;
  });

  console.log("\n=== Summary ===");
  console.log(`Total clinics: ${total}`);
  console.log(`Unclaimed: ${unclaimed}`);
  console.log(`Still incomplete (no street # or phone): ${stillIncomplete.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
