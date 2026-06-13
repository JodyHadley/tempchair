import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Deterministic IDs ───────────────────────────────────────
const W = {
  w1: "a0000000-0000-0000-0000-000000000001",
  w2: "a0000000-0000-0000-0000-000000000002",
  w3: "a0000000-0000-0000-0000-000000000003",
};

const C: Record<string, string> = {};
for (let i = 1; i <= 32; i++) {
  C[`c${i}`] = `b0000000-0000-0000-0000-${String(i).padStart(12, "0")}`;
}

const J = {
  j1: "c0000000-0000-0000-0000-000000000001",
  j2: "c0000000-0000-0000-0000-000000000002",
  j3: "c0000000-0000-0000-0000-000000000003",
  j4: "c0000000-0000-0000-0000-000000000004",
  j5: "c0000000-0000-0000-0000-000000000005",
  j6: "c0000000-0000-0000-0000-000000000006",
  j7: "c0000000-0000-0000-0000-000000000007",
};

async function createAuthUser(email: string, password: string, role: string, profileId: string, name: string, initials: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, profileId, name, initials },
  });
  if (error) {
    // User might already exist — update their metadata
    if (error.message.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === email);
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, {
          user_metadata: { role, profileId, name, initials },
        });
        return existing.id;
      }
      return null;
    }
    console.error(`Auth error for ${email}:`, error.message);
    return null;
  }
  return data.user.id;
}

async function main() {
  console.log("Cleaning existing data...");
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.clinicProfile.deleteMany();

  // ── Create auth users ───────────────────────────────────
  console.log("Creating auth users...");
  const authIds: Record<string, string | null> = {};

  authIds.w1 = await createAuthUser("sarah@test.com", "password", "worker", W.w1, "Sarah Johnson", "SJ");
  authIds.w2 = await createAuthUser("michael@test.com", "password", "worker", W.w2, "Michael Chen", "MC");
  authIds.w3 = await createAuthUser("emily@test.com", "password", "worker", W.w3, "Emily Torres", "ET");
  authIds.c1 = await createAuthUser("boise@test.com", "password", "clinic", C.c1, "Boise Family Dentistry", "BF");
  authIds.c2 = await createAuthUser("eagle@test.com", "password", "clinic", C.c2, "Eagle Road Dental", "ER");
  authIds.c3 = await createAuthUser("meridian@test.com", "password", "clinic", C.c3, "Meridian Smiles", "MS");

  // ── Workers ─────────────────────────────────────────────
  console.log("Seeding workers...");
  await prisma.workerProfile.createMany({
    data: [
      {
        id: W.w1,
        authUserId: authIds.w1,
        email: "sarah@test.com",
        firstName: "Sarah",
        lastName: "Johnson",
        initials: "SJ",
        specialty: "Hygienist",
        location: "Boise, ID",
        bio: "Licensed RDH with 8 years of experience in general and periodontal care. Passionate about patient education and preventive dentistry. Known for putting nervous patients at ease.",
        experience: "8 years",
        rating: 4.9,
        reviewCount: 23,
        certifications: ["RDH License - Idaho", "CPR/BLS", "Local Anesthesia", "Nitrous Oxide"],
        availability: "Available next week",
        hourlyRate: "$48–55/hr",
      },
      {
        id: W.w2,
        authUserId: authIds.w2,
        email: "michael@test.com",
        firstName: "Michael",
        lastName: "Chen",
        initials: "MC",
        specialty: "Assistant",
        location: "Meridian, ID",
        bio: "CDA-certified dental assistant experienced in both general and orthodontic practices. Comfortable with all major dental software systems including Dentrix and Eaglesoft.",
        experience: "4 years",
        rating: 4.7,
        reviewCount: 15,
        certifications: ["CDA Certification", "CPR/BLS", "Radiology Certified", "OSHA Compliant"],
        availability: "Available now",
        hourlyRate: "$24–28/hr",
      },
      {
        id: W.w3,
        authUserId: authIds.w3,
        email: "emily@test.com",
        firstName: "Emily",
        lastName: "Torres",
        initials: "ET",
        specialty: "Dentist",
        location: "Boise, ID",
        bio: "General dentist with over a decade of experience. Available for locum work while between practices. Comfortable with all general procedures including extractions, crowns, and root canals.",
        experience: "12 years",
        rating: 5.0,
        reviewCount: 8,
        certifications: ["DDS - Idaho License", "DEA Registration", "CPR/BLS", "Invisalign Certified"],
        availability: "Available Jul 14–25",
        hourlyRate: "$90–100/hr",
      },
    ],
  });

  // ── Clinics (claimed test accounts) ─────────────────────
  console.log("Seeding clinics...");
  const claimedClinics = [
    { id: C.c1, authUserId: authIds.c1, email: "boise@test.com", name: "Boise Family Dentistry", contactName: "Dr. Robert Hayes", initials: "BF", location: "Boise, ID", address: "1234 Main St, Boise, ID 83702", phone: "(208) 555-0101", description: "A friendly family dental practice serving the Boise community for over 15 years.", rating: 4.8, reviewCount: 18, claimed: true },
    { id: C.c2, authUserId: authIds.c2, email: "eagle@test.com", name: "Eagle Road Dental", contactName: "Dr. Lisa Park", initials: "ER", location: "Eagle, ID", address: "5678 Eagle Rd, Eagle, ID 83616", phone: "(208) 555-0202", description: "Modern dental office with state-of-the-art equipment.", rating: 4.6, reviewCount: 12, claimed: true },
    { id: C.c3, authUserId: authIds.c3, email: "meridian@test.com", name: "Meridian Smiles", contactName: "Dr. James Wilson", initials: "MS", location: "Meridian, ID", address: "9012 Fairview Ave, Meridian, ID 83642", phone: "(208) 555-0303", description: "General and pediatric dentistry in a fun, comfortable environment.", rating: 4.9, reviewCount: 9, claimed: true },
  ];

  // ── Clinics (unclaimed real Boise-area) ─────────────────
  const unclaimedClinics = [
    { id: C.c4, name: "Pennsylvania Dental", initials: "PD", location: "Boise, ID", address: "150 E Boise Ave, Boise, ID 83706", phone: "(208) 385-7500", description: "General dentistry practice in downtown Boise." },
    { id: C.c5, name: "Ustick Dental Office", initials: "UD", location: "Boise, ID", address: "9733 W Ustick Rd, Boise, ID 83704", phone: "(208) 375-8720", description: "Family-oriented dental office on Ustick Road." },
    { id: C.c6, name: "Dental Care Center", initials: "DC", location: "Boise, ID", address: "912 N Curtis Rd, Boise, ID 83706", phone: "(208) 375-2363", description: "Full-service dental care center in Boise." },
    { id: C.c7, name: "Boise Smile Design", initials: "BS", location: "Boise, ID", address: "800 W Main St, Ste 205, Boise, ID 83702", phone: "(208) 906-0933", description: "Cosmetic and general dentistry in downtown Boise." },
    { id: C.c8, name: "Northwest Dental Center", initials: "NW", location: "Boise, ID", address: "8300 W Northview St, Boise, ID 83704", phone: "(208) 377-8078", description: "Established dental practice in northwest Boise." },
    { id: C.c9, name: "River City Dental", initials: "RC", location: "Boise, ID", address: "7723 W Riverside Dr, Boise, ID 83714", phone: "(208) 853-8811", description: "General dentistry along the Boise River." },
    { id: C.c10, name: "Willow Tree Dental", initials: "WT", location: "Boise, ID", address: "5898 S Quamash Way, Boise, ID 83716", phone: "(208) 395-1000", description: "Modern dental practice in southeast Boise." },
    { id: C.c11, name: "North End Dental", initials: "NE", location: "Boise, ID", address: "704 N 17th St, Boise, ID 83702", phone: "(208) 344-0134", description: "Neighborhood dental practice in the Boise North End." },
    { id: C.c12, name: "Boise Dentistry Co.", initials: "BD", location: "Boise, ID", address: "Boise, ID", phone: "", description: "General and cosmetic dentistry." },
    { id: C.c13, name: "Meridian Dental", initials: "MD", location: "Meridian, ID", address: "780 W Cherry Ln, Meridian, ID 83642", phone: "(208) 888-4711", description: "General dentistry on Cherry Lane." },
    { id: C.c14, name: "Alliance Dental Care", initials: "AD", location: "Meridian, ID", address: "270 S Ten Mile Rd, Ste 100, Meridian, ID 83642", phone: "(208) 608-2098", description: "Comprehensive dental care on Ten Mile Road." },
    { id: C.c15, name: "Bridgetower Dental", initials: "BT", location: "Meridian, ID", address: "3250 N Towerbridge Way, Meridian, ID 83642", phone: "(208) 898-9355", description: "Dental practice in the Bridgetower community." },
    { id: C.c16, name: "Roots Dental", initials: "RD", location: "Meridian, ID", address: "6291 N Fox Run Way, Ste 120, Meridian, ID 83646", phone: "(208) 906-0306", description: "Cosmetic and general dental practice." },
    { id: C.c17, name: "Birchwood Dental", initials: "BW", location: "Meridian, ID", address: "3325 N Ten Mile Rd, Ste 140, Meridian, ID 83646", phone: "(208) 228-5499", description: "Family dental practice on North Ten Mile Road." },
    { id: C.c18, name: "New Leaf Dental", initials: "NL", location: "Meridian, ID", address: "870 N Linder Rd, Ste G, Meridian, ID 83642", phone: "(208) 896-2284", description: "Comprehensive dental care in Meridian." },
    { id: C.c19, name: "Signature Smiles", initials: "SS", location: "Meridian, ID", address: "3200 N Leslie Way, Ste 110, Meridian, ID 83646", phone: "(208) 322-0024", description: "General dentistry in north Meridian." },
    { id: C.c20, name: "Millennium Family Dental", initials: "MF", location: "Meridian, ID", address: "1848 S Millennium Way, Meridian, ID 83642", phone: "(208) 314-1834", description: "Family dental practice on Millennium Way." },
    { id: C.c21, name: "Silverstone Family Dental", initials: "SF", location: "Meridian, ID", address: "Eagle Rd & Overland, South Meridian, ID", phone: "", description: "Family dental practice in south Meridian." },
    { id: C.c22, name: "Treasure Valley Family Dentistry", initials: "TV", location: "Meridian, ID", address: "Meridian, ID", phone: "(208) 884-8066", description: "Top-rated family dentistry in Meridian and Eagle." },
    { id: C.c23, name: "Eagle Dental Care", initials: "ED", location: "Eagle, ID", address: "125 N Stierman Way, Ste A, Eagle, ID 83616", phone: "(208) 939-4111", description: "General dentistry in downtown Eagle." },
    { id: C.c24, name: "Lighthouse Dental", initials: "LD", location: "Eagle, ID", address: "1177 N Eagle Rd, Eagle, ID 83616", phone: "(208) 939-3010", description: "Dental practice on Eagle Road." },
    { id: C.c25, name: "Cottonwood Creek Dental", initials: "CC", location: "Eagle, ID", address: "325 E Shore Dr, Ste 100, Eagle, ID 83616", phone: "(844) 498-0149", description: "Modern dentistry in Eagle." },
    { id: C.c26, name: "Eagle River Smiles", initials: "ES", location: "Eagle, ID", address: "Rivershore Ln, Eagle, ID 83616", phone: "(208) 938-2100", description: "Family dental practice in Eagle." },
    { id: C.c27, name: "Eagle Smiles Dentistry and Orthodontics", initials: "EM", location: "Meridian, ID", address: "Meridian, ID", phone: "", description: "Combined dental and orthodontic practice." },
    { id: C.c28, name: "Nampa Dental Health Center", initials: "NH", location: "Nampa, ID", address: "109 12th Avenue Rd, Nampa, ID 83686", phone: "(208) 467-9271", description: "Established dental health center in Nampa." },
    { id: C.c29, name: "Southridge Dental", initials: "SR", location: "Nampa, ID", address: "Nampa, ID 83686", phone: "(844) 437-8184", description: "Dental practice in south Nampa." },
    { id: C.c30, name: "Brookside Dental", initials: "BR", location: "Nampa, ID", address: "Nampa, ID", phone: "", description: "General dental practice in Nampa." },
    { id: C.c31, name: "Aspen Creek Dental", initials: "AC", location: "Nampa, ID", address: "6144 Birch Ln, Nampa, ID 83687", phone: "", description: "Dental practice serving Meridian, Eagle, and Nampa." },
    { id: C.c32, name: "Caldwell Dentistry Co.", initials: "CW", location: "Caldwell, ID", address: "1711 S 10th Ave, Caldwell, ID 83605", phone: "(208) 454-9217", description: "General dentistry in Caldwell." },
  ];

  await prisma.clinicProfile.createMany({
    data: [
      ...claimedClinics,
      ...unclaimedClinics.map((c) => ({
        ...c,
        email: "",
        contactName: "",
        rating: 0,
        reviewCount: 0,
        claimed: false,
      })),
    ],
  });

  // ── Jobs ────────────────────────────────────────────────
  console.log("Seeding jobs...");
  await prisma.jobPosting.createMany({
    data: [
      { id: J.j1, clinicId: C.c1, title: "Dental Hygienist", type: "Hygienist", dates: "May 12 – May 16, 2026", startDate: new Date("2026-05-12"), endDate: new Date("2026-05-16"), hours: "40 hrs/week", rate: "$45–55/hr", description: "Needed an experienced hygienist to cover a full week.", posted: "4 weeks ago", status: "completed" },
      { id: J.j2, clinicId: C.c1, title: "Dental Assistant", type: "Assistant", dates: "Jun 23 – Jun 27, 2026", startDate: new Date("2026-06-23"), endDate: new Date("2026-06-27"), hours: "40 hrs/week", rate: "$22–28/hr", description: "Need a reliable dental assistant for a full week.", posted: "1 week ago", status: "filled" },
      { id: J.j3, clinicId: C.c1, title: "Dental Hygienist", type: "Hygienist", dates: "Jul 6 – Jul 10, 2026", startDate: new Date("2026-07-06"), endDate: new Date("2026-07-10"), hours: "40 hrs/week", rate: "$48–55/hr", description: "Looking for an experienced hygienist to cover a full week.", posted: "2 days ago", status: "open" },
      { id: J.j4, clinicId: C.c2, title: "Dental Assistant", type: "Assistant", dates: "Apr 28 – Apr 30, 2026", startDate: new Date("2026-04-28"), endDate: new Date("2026-04-30"), hours: "24 hrs", rate: "$22–28/hr", description: "Needed a dental assistant for 3 days.", posted: "6 weeks ago", status: "completed" },
      { id: J.j5, clinicId: C.c2, title: "Dental Hygienist", type: "Hygienist", dates: "Jun 16 – Jun 18, 2026", startDate: new Date("2026-06-16"), endDate: new Date("2026-06-18"), hours: "24 hrs", rate: "$50–58/hr", description: "Need a hygienist for 3 days.", posted: "5 days ago", status: "open" },
      { id: J.j6, clinicId: C.c3, title: "Temporary Dentist", type: "Dentist", dates: "Jul 14 – Jul 25, 2026", startDate: new Date("2026-07-14"), endDate: new Date("2026-07-25"), hours: "32 hrs/week", rate: "$85–100/hr", description: "Seeking a licensed dentist for 2-week coverage.", posted: "1 day ago", status: "open" },
      { id: J.j7, clinicId: C.c3, title: "Dental Assistant", type: "Assistant", dates: "Jun 30 – Jul 3, 2026", startDate: new Date("2026-06-30"), endDate: new Date("2026-07-03"), hours: "32 hrs", rate: "$24–30/hr", description: "Looking for an assistant for a busy holiday week.", posted: "3 days ago", status: "open" },
    ],
  });

  // ── Applications ────────────────────────────────────────
  console.log("Seeding applications...");
  await prisma.application.createMany({
    data: [
      { id: "d0000000-0000-0000-0000-000000000001", jobId: J.j1, workerId: W.w1, appliedDate: "May 1, 2026", status: "accepted", coverNote: "I'd love to help cover this week!" },
      { id: "d0000000-0000-0000-0000-000000000002", jobId: J.j2, workerId: W.w2, appliedDate: "Jun 2, 2026", status: "accepted", coverNote: "I'm available the full week and experienced with digital X-rays." },
      { id: "d0000000-0000-0000-0000-000000000003", jobId: J.j3, workerId: W.w1, appliedDate: "Jun 6, 2026", status: "pending", coverNote: "I worked with your team in May and it was a great experience." },
      { id: "d0000000-0000-0000-0000-000000000004", jobId: J.j4, workerId: W.w2, appliedDate: "Apr 20, 2026", status: "accepted", coverNote: "Available for all 3 days." },
      { id: "d0000000-0000-0000-0000-000000000005", jobId: J.j5, workerId: W.w1, appliedDate: "Jun 5, 2026", status: "pending", coverNote: "I can cover all 3 days." },
      { id: "d0000000-0000-0000-0000-000000000006", jobId: J.j5, workerId: W.w3, appliedDate: "Jun 6, 2026", status: "pending", coverNote: "I'm also qualified to provide hygiene services." },
      { id: "d0000000-0000-0000-0000-000000000007", jobId: J.j6, workerId: W.w3, appliedDate: "Jun 7, 2026", status: "pending", coverNote: "I'm available for the full 2-week period." },
      { id: "d0000000-0000-0000-0000-000000000008", jobId: J.j7, workerId: W.w2, appliedDate: "Jun 5, 2026", status: "rejected", coverNote: "I'm available and have some pediatric experience." },
    ],
  });

  // ── Reviews ─────────────────────────────────────────────
  console.log("Seeding reviews...");
  await prisma.review.createMany({
    data: [
      { id: "e0000000-0000-0000-0000-000000000001", fromClinicId: C.c1, fromRole: "clinic", fromName: "Boise Family Dentistry", toWorkerId: W.w1, toRole: "worker", rating: 5, comment: "Sarah was outstanding! She arrived early, was professional with every patient.", date: "May 18, 2026", jobId: J.j1 },
      { id: "e0000000-0000-0000-0000-000000000002", fromWorkerId: W.w1, fromRole: "worker", fromName: "Sarah Johnson", toClinicId: C.c1, toRole: "clinic", rating: 5, comment: "Great office with a wonderful team. Everything was well-organized.", date: "May 18, 2026", jobId: J.j1 },
      { id: "e0000000-0000-0000-0000-000000000003", fromClinicId: C.c2, fromRole: "clinic", fromName: "Eagle Road Dental", toWorkerId: W.w2, toRole: "worker", rating: 4, comment: "Michael was reliable and knew his way around digital X-rays.", date: "May 2, 2026", jobId: J.j4 },
      { id: "e0000000-0000-0000-0000-000000000004", fromWorkerId: W.w2, fromRole: "worker", fromName: "Michael Chen", toClinicId: C.c2, toRole: "clinic", rating: 5, comment: "Excellent office with top-of-the-line equipment.", date: "May 2, 2026", jobId: J.j4 },
    ],
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
