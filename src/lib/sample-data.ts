// ============================================================
// Types
// ============================================================

export type UserRole = "worker" | "clinic";
export type WorkerSpecialty = "Hygienist" | "Assistant" | "Dentist";
export type JobStatus = "open" | "filled" | "completed" | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  initials: string;
}

export interface WorkerProfile {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  initials: string;
  specialty: WorkerSpecialty;
  location: string;
  bio: string;
  experience: string;
  rating: number;
  reviewCount: number;
  certifications: string[];
  availability: string;
  hourlyRate: string;
}

export interface ClinicProfile {
  id: string;
  email: string;
  password: string;
  name: string;
  contactName: string;
  initials: string;
  location: string;
  address: string;
  phone: string;
  description: string;
  rating: number;
  reviewCount: number;
  claimed: boolean;
}

export interface JobPosting {
  id: string;
  clinicId: string;
  title: string;
  type: WorkerSpecialty;
  dates: string;
  startDate: string;
  endDate: string;
  hours: string;
  rate: string;
  description: string;
  posted: string;
  status: JobStatus;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  appliedDate: string;
  status: ApplicationStatus;
  coverNote: string;
}

export interface Review {
  id: string;
  fromId: string;
  fromRole: UserRole;
  fromName: string;
  toId: string;
  toRole: UserRole;
  rating: number;
  comment: string;
  date: string;
  jobId: string;
}

// ============================================================
// Workers
// ============================================================

export const workers: WorkerProfile[] = [
  {
    id: "w1",
    email: "sarah@test.com",
    password: "password",
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
    id: "w2",
    email: "michael@test.com",
    password: "password",
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
    id: "w3",
    email: "emily@test.com",
    password: "password",
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
];

// ============================================================
// Clinics
// ============================================================

export const clinics: ClinicProfile[] = [
  // ── Test accounts (claimed) ──────────────────────────────────
  {
    id: "c1",
    email: "boise@test.com",
    password: "password",
    name: "Boise Family Dentistry",
    contactName: "Dr. Robert Hayes",
    initials: "BF",
    location: "Boise, ID",
    address: "1234 Main St, Boise, ID 83702",
    phone: "(208) 555-0101",
    description: "A friendly family dental practice serving the Boise community for over 15 years. We pride ourselves on a welcoming atmosphere and top-notch patient care.",
    rating: 4.8,
    reviewCount: 18,
    claimed: true,
  },
  {
    id: "c2",
    email: "eagle@test.com",
    password: "password",
    name: "Eagle Road Dental",
    contactName: "Dr. Lisa Park",
    initials: "ER",
    location: "Eagle, ID",
    address: "5678 Eagle Rd, Eagle, ID 83616",
    phone: "(208) 555-0202",
    description: "Modern dental office with state-of-the-art equipment. We focus on cosmetic and restorative dentistry with a patient-first philosophy.",
    rating: 4.6,
    reviewCount: 12,
    claimed: true,
  },
  {
    id: "c3",
    email: "meridian@test.com",
    password: "password",
    name: "Meridian Smiles",
    contactName: "Dr. James Wilson",
    initials: "MS",
    location: "Meridian, ID",
    address: "9012 Fairview Ave, Meridian, ID 83642",
    phone: "(208) 555-0303",
    description: "General and pediatric dentistry in a fun, comfortable environment. Our team loves working with patients of all ages.",
    rating: 4.9,
    reviewCount: 9,
    claimed: true,
  },

  // ── Real Boise-area clinics (unclaimed) ──────────────────────
  // BOISE
  {
    id: "c4",
    email: "",
    password: "",
    name: "Pennsylvania Dental",
    contactName: "",
    initials: "PD",
    location: "Boise, ID",
    address: "150 E Boise Ave, Boise, ID 83706",
    phone: "(208) 385-7500",
    description: "General dentistry practice in downtown Boise providing comprehensive dental care to patients of all ages.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c5",
    email: "",
    password: "",
    name: "Ustick Dental Office",
    contactName: "",
    initials: "UD",
    location: "Boise, ID",
    address: "9733 W Ustick Rd, Boise, ID 83704",
    phone: "(208) 375-8720",
    description: "Family-oriented dental office on Ustick Road offering general and preventive dental services.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c6",
    email: "",
    password: "",
    name: "Dental Care Center",
    contactName: "",
    initials: "DC",
    location: "Boise, ID",
    address: "912 N Curtis Rd, Boise, ID 83706",
    phone: "(208) 375-2363",
    description: "Full-service dental care center providing general dentistry to the Boise community.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c7",
    email: "",
    password: "",
    name: "Boise Smile Design",
    contactName: "",
    initials: "BS",
    location: "Boise, ID",
    address: "800 W Main St, Ste 205, Boise, ID 83702",
    phone: "(208) 906-0933",
    description: "Cosmetic and general dentistry practice in downtown Boise specializing in smile makeovers and restorative treatments.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c8",
    email: "",
    password: "",
    name: "Northwest Dental Center",
    contactName: "",
    initials: "NW",
    location: "Boise, ID",
    address: "8300 W Northview St, Boise, ID 83704",
    phone: "(208) 377-8078",
    description: "Established dental practice offering comprehensive general dentistry services in northwest Boise.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c9",
    email: "",
    password: "",
    name: "River City Dental",
    contactName: "",
    initials: "RC",
    location: "Boise, ID",
    address: "7723 W Riverside Dr, Boise, ID 83714",
    phone: "(208) 853-8811",
    description: "General dentistry practice along the Boise River providing quality dental care in a relaxed setting.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c10",
    email: "",
    password: "",
    name: "Willow Tree Dental",
    contactName: "",
    initials: "WT",
    location: "Boise, ID",
    address: "5898 S Quamash Way, Boise, ID 83716",
    phone: "(208) 395-1000",
    description: "Modern dental practice in southeast Boise offering general, cosmetic, and family dentistry.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c11",
    email: "",
    password: "",
    name: "North End Dental",
    contactName: "",
    initials: "NE",
    location: "Boise, ID",
    address: "704 N 17th St, Boise, ID 83702",
    phone: "(208) 344-0134",
    description: "Neighborhood dental practice in the Boise North End providing personalized dental care.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c12",
    email: "",
    password: "",
    name: "Boise Dentistry Co.",
    contactName: "",
    initials: "BD",
    location: "Boise, ID",
    address: "Boise, ID",
    phone: "",
    description: "Dental practice led by Dr. Chris Minert and Dr. Zachary Taylor providing general and cosmetic dentistry.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },

  // MERIDIAN
  {
    id: "c13",
    email: "",
    password: "",
    name: "Meridian Dental",
    contactName: "",
    initials: "MD",
    location: "Meridian, ID",
    address: "780 W Cherry Ln, Meridian, ID 83642",
    phone: "(208) 888-4711",
    description: "General dentistry practice on Cherry Lane providing dental services to Meridian families.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c14",
    email: "",
    password: "",
    name: "Alliance Dental Care",
    contactName: "",
    initials: "AD",
    location: "Meridian, ID",
    address: "270 S Ten Mile Rd, Ste 100, Meridian, ID 83642",
    phone: "(208) 608-2098",
    description: "Comprehensive dental care practice on Ten Mile Road in Meridian.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c15",
    email: "",
    password: "",
    name: "Bridgetower Dental",
    contactName: "",
    initials: "BT",
    location: "Meridian, ID",
    address: "3250 N Towerbridge Way, Meridian, ID 83642",
    phone: "(208) 898-9355",
    description: "Dental practice in the Bridgetower community offering general and family dentistry.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c16",
    email: "",
    password: "",
    name: "Roots Dental",
    contactName: "",
    initials: "RD",
    location: "Meridian, ID",
    address: "6291 N Fox Run Way, Ste 120, Meridian, ID 83646",
    phone: "(208) 906-0306",
    description: "Cosmetic and general dental practice in north Meridian.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c17",
    email: "",
    password: "",
    name: "Birchwood Dental",
    contactName: "",
    initials: "BW",
    location: "Meridian, ID",
    address: "3325 N Ten Mile Rd, Ste 140, Meridian, ID 83646",
    phone: "(208) 228-5499",
    description: "Family dental practice on North Ten Mile Road offering preventive and restorative dentistry.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c18",
    email: "",
    password: "",
    name: "New Leaf Dental",
    contactName: "",
    initials: "NL",
    location: "Meridian, ID",
    address: "870 N Linder Rd, Ste G, Meridian, ID 83642",
    phone: "(208) 896-2284",
    description: "Comprehensive dental care at the corner of Pine Avenue and Linder Road in Meridian.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c19",
    email: "",
    password: "",
    name: "Signature Smiles",
    contactName: "",
    initials: "SS",
    location: "Meridian, ID",
    address: "3200 N Leslie Way, Ste 110, Meridian, ID 83646",
    phone: "(208) 322-0024",
    description: "General dentistry practice in north Meridian focused on creating beautiful, healthy smiles.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c20",
    email: "",
    password: "",
    name: "Millennium Family Dental",
    contactName: "",
    initials: "MF",
    location: "Meridian, ID",
    address: "1848 S Millennium Way, Meridian, ID 83642",
    phone: "(208) 314-1834",
    description: "Family dental practice on Millennium Way providing comprehensive dental services for all ages.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c21",
    email: "",
    password: "",
    name: "Silverstone Family Dental",
    contactName: "",
    initials: "SF",
    location: "Meridian, ID",
    address: "Eagle Rd & Overland, South Meridian, ID",
    phone: "",
    description: "Family dental practice in south Meridian serving the Treasure Valley community.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c22",
    email: "",
    password: "",
    name: "Treasure Valley Family Dentistry",
    contactName: "",
    initials: "TV",
    location: "Meridian, ID",
    address: "Meridian, ID",
    phone: "(208) 884-8066",
    description: "Top-rated family dentistry practice in Meridian and Eagle offering friendly service and professional care.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },

  // EAGLE
  {
    id: "c23",
    email: "",
    password: "",
    name: "Eagle Dental Care",
    contactName: "",
    initials: "ED",
    location: "Eagle, ID",
    address: "125 N Stierman Way, Ste A, Eagle, ID 83616",
    phone: "(208) 939-4111",
    description: "General dentistry practice in downtown Eagle providing quality dental care in a friendly environment.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c24",
    email: "",
    password: "",
    name: "Lighthouse Dental",
    contactName: "",
    initials: "LD",
    location: "Eagle, ID",
    address: "1177 N Eagle Rd, Eagle, ID 83616",
    phone: "(208) 939-3010",
    description: "Dental practice on Eagle Road offering comprehensive general and cosmetic dentistry.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c25",
    email: "",
    password: "",
    name: "Cottonwood Creek Dental",
    contactName: "",
    initials: "CC",
    location: "Eagle, ID",
    address: "325 E Shore Dr, Ste 100, Eagle, ID 83616",
    phone: "(844) 498-0149",
    description: "Dental practice along the shore in Eagle offering modern dentistry in a comfortable setting.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c26",
    email: "",
    password: "",
    name: "Eagle River Smiles",
    contactName: "",
    initials: "ES",
    location: "Eagle, ID",
    address: "Rivershore Ln, Eagle, ID 83616",
    phone: "(208) 938-2100",
    description: "Family dental practice in Eagle providing quality dental care with a personal touch.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c27",
    email: "",
    password: "",
    name: "Eagle Smiles Dentistry and Orthodontics",
    contactName: "",
    initials: "EM",
    location: "Meridian, ID",
    address: "Meridian, ID",
    phone: "",
    description: "Combined dental and orthodontic practice serving the Eagle and Meridian communities.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },

  // NAMPA
  {
    id: "c28",
    email: "",
    password: "",
    name: "Nampa Dental Health Center",
    contactName: "",
    initials: "NH",
    location: "Nampa, ID",
    address: "109 12th Avenue Rd, Nampa, ID 83686",
    phone: "(208) 467-9271",
    description: "Established dental health center in Nampa providing general dentistry and preventive care.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c29",
    email: "",
    password: "",
    name: "Southridge Dental",
    contactName: "",
    initials: "SR",
    location: "Nampa, ID",
    address: "Nampa, ID 83686",
    phone: "(844) 437-8184",
    description: "Dental practice in south Nampa offering family and general dentistry services.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c30",
    email: "",
    password: "",
    name: "Brookside Dental",
    contactName: "",
    initials: "BR",
    location: "Nampa, ID",
    address: "Nampa, ID",
    phone: "",
    description: "General dental practice in Nampa committed to providing quality dental care to the community.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
  {
    id: "c31",
    email: "",
    password: "",
    name: "Aspen Creek Dental",
    contactName: "",
    initials: "AC",
    location: "Nampa, ID",
    address: "6144 Birch Ln, Nampa, ID 83687",
    phone: "",
    description: "Dental practice off the Garrity exit of I-84 serving Meridian, Eagle, and Nampa communities.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },

  // CALDWELL
  {
    id: "c32",
    email: "",
    password: "",
    name: "Caldwell Dentistry Co.",
    contactName: "",
    initials: "CW",
    location: "Caldwell, ID",
    address: "1711 S 10th Ave, Caldwell, ID 83605",
    phone: "(208) 454-9217",
    description: "General dentistry practice in Caldwell providing dental care to the western Treasure Valley.",
    rating: 0,
    reviewCount: 0,
    claimed: false,
  },
];

// ============================================================
// Job Postings
// ============================================================

export const jobs: JobPosting[] = [
  // Boise Family Dentistry jobs
  {
    id: "j1",
    clinicId: "c1",
    title: "Dental Hygienist",
    type: "Hygienist",
    dates: "May 12 – May 16, 2026",
    startDate: "2026-05-12",
    endDate: "2026-05-16",
    hours: "40 hrs/week",
    rate: "$45–55/hr",
    description: "Needed an experienced hygienist to cover a full week while our staff member was on vacation. Periodontal maintenance and patient education required.",
    posted: "4 weeks ago",
    status: "completed",
  },
  {
    id: "j2",
    clinicId: "c1",
    title: "Dental Assistant",
    type: "Assistant",
    dates: "Jun 23 – Jun 27, 2026",
    startDate: "2026-06-23",
    endDate: "2026-06-27",
    hours: "40 hrs/week",
    rate: "$22–28/hr",
    description: "Need a reliable dental assistant for a full week to cover during staff training. Experience with digital X-rays and chairside assisting required.",
    posted: "1 week ago",
    status: "filled",
  },
  {
    id: "j3",
    clinicId: "c1",
    title: "Dental Hygienist",
    type: "Hygienist",
    dates: "Jul 6 – Jul 10, 2026",
    startDate: "2026-07-06",
    endDate: "2026-07-10",
    hours: "40 hrs/week",
    rate: "$48–55/hr",
    description: "Looking for an experienced hygienist to cover a full week. Must be comfortable with periodontal maintenance, sealants, and patient education. Friendly team environment.",
    posted: "2 days ago",
    status: "open",
  },
  // Eagle Road Dental jobs
  {
    id: "j4",
    clinicId: "c2",
    title: "Dental Assistant",
    type: "Assistant",
    dates: "Apr 28 – Apr 30, 2026",
    startDate: "2026-04-28",
    endDate: "2026-04-30",
    hours: "24 hrs",
    rate: "$22–28/hr",
    description: "Needed a dental assistant for 3 days to help with a busy schedule. Experience with digital X-rays and chairside assisting was required.",
    posted: "6 weeks ago",
    status: "completed",
  },
  {
    id: "j5",
    clinicId: "c2",
    title: "Dental Hygienist",
    type: "Hygienist",
    dates: "Jun 16 – Jun 18, 2026",
    startDate: "2026-06-16",
    endDate: "2026-06-18",
    hours: "24 hrs",
    rate: "$50–58/hr",
    description: "Need a hygienist for 3 days. We have a full patient schedule and need someone who can hit the ground running. Our team is friendly and supportive.",
    posted: "5 days ago",
    status: "open",
  },
  // Meridian Smiles jobs
  {
    id: "j6",
    clinicId: "c3",
    title: "Temporary Dentist",
    type: "Dentist",
    dates: "Jul 14 – Jul 25, 2026",
    startDate: "2026-07-14",
    endDate: "2026-07-25",
    hours: "32 hrs/week",
    rate: "$85–100/hr",
    description: "Seeking a licensed dentist for 2-week coverage. General dentistry — exams, fillings, crowns. Great support staff in place. Friendly patient base.",
    posted: "1 day ago",
    status: "open",
  },
  {
    id: "j7",
    clinicId: "c3",
    title: "Dental Assistant",
    type: "Assistant",
    dates: "Jun 30 – Jul 3, 2026",
    startDate: "2026-06-30",
    endDate: "2026-07-03",
    hours: "32 hrs",
    rate: "$24–30/hr",
    description: "Looking for an assistant to help us through a busy holiday week. Pediatric experience is a plus but not required. Fun team atmosphere!",
    posted: "3 days ago",
    status: "open",
  },
];

// ============================================================
// Applications
// ============================================================

export const applications: Application[] = [
  // Completed job j1 (Boise Family - Hygienist, completed) — Sarah worked it
  {
    id: "a1",
    jobId: "j1",
    workerId: "w1",
    appliedDate: "May 1, 2026",
    status: "accepted",
    coverNote: "I'd love to help cover this week! I have extensive experience with periodontal maintenance and patient education.",
  },
  // Filled job j2 (Boise Family - Assistant, filled) — Michael accepted
  {
    id: "a2",
    jobId: "j2",
    workerId: "w2",
    appliedDate: "Jun 2, 2026",
    status: "accepted",
    coverNote: "I'm available the full week and experienced with digital X-rays and Dentrix. Happy to help!",
  },
  // Open job j3 (Boise Family - Hygienist, open) — Sarah applied, pending
  {
    id: "a3",
    jobId: "j3",
    workerId: "w1",
    appliedDate: "Jun 6, 2026",
    status: "pending",
    coverNote: "I worked with your team in May and it was a great experience. Would love to come back!",
  },
  // Completed job j4 (Eagle Road - Assistant, completed) — Michael worked it
  {
    id: "a4",
    jobId: "j4",
    workerId: "w2",
    appliedDate: "Apr 20, 2026",
    status: "accepted",
    coverNote: "Available for all 3 days. I have experience with both chairside assisting and digital radiography.",
  },
  // Open job j5 (Eagle Road - Hygienist, open) — Sarah applied, Emily applied
  {
    id: "a5",
    jobId: "j5",
    workerId: "w1",
    appliedDate: "Jun 5, 2026",
    status: "pending",
    coverNote: "I can cover all 3 days. Comfortable with fast-paced schedules and enjoy working with new teams.",
  },
  {
    id: "a6",
    jobId: "j5",
    workerId: "w3",
    appliedDate: "Jun 6, 2026",
    status: "pending",
    coverNote: "Although I'm a dentist by training, I'm also qualified to provide hygiene services. Happy to discuss further.",
  },
  // Open job j6 (Meridian - Dentist, open) — Emily applied
  {
    id: "a7",
    jobId: "j6",
    workerId: "w3",
    appliedDate: "Jun 7, 2026",
    status: "pending",
    coverNote: "I'm available for the full 2-week period and comfortable with all general dentistry procedures. Would love to learn more about your practice.",
  },
  // Open job j7 (Meridian - Assistant) — Michael applied, rejected. Shows rejection flow.
  {
    id: "a8",
    jobId: "j7",
    workerId: "w2",
    appliedDate: "Jun 5, 2026",
    status: "rejected",
    coverNote: "I'm available and would love to help during the holiday week. I have some pediatric experience from my orthodontic work.",
  },
];

// ============================================================
// Reviews (two-way: workers review clinics, clinics review workers)
// ============================================================

export const reviews: Review[] = [
  // Job j1 (Boise Family ↔ Sarah) — completed
  {
    id: "r1",
    fromId: "c1",
    fromRole: "clinic",
    fromName: "Boise Family Dentistry",
    toId: "w1",
    toRole: "worker",
    rating: 5,
    comment: "Sarah was outstanding! She arrived early, was professional with every patient, and our team loved working with her. Highly recommend.",
    date: "May 18, 2026",
    jobId: "j1",
  },
  {
    id: "r2",
    fromId: "w1",
    fromRole: "worker",
    fromName: "Sarah Johnson",
    toId: "c1",
    toRole: "clinic",
    rating: 5,
    comment: "Great office with a wonderful team. Everything was well-organized, the equipment was modern, and the patients were lovely. Would definitely work here again!",
    date: "May 18, 2026",
    jobId: "j1",
  },
  // Job j4 (Eagle Road ↔ Michael) — completed
  {
    id: "r3",
    fromId: "c2",
    fromRole: "clinic",
    fromName: "Eagle Road Dental",
    toId: "w2",
    toRole: "worker",
    rating: 4,
    comment: "Michael was reliable and knew his way around digital X-rays. Could improve on speed with chairside transitions but overall a solid assistant.",
    date: "May 2, 2026",
    jobId: "j4",
  },
  {
    id: "r4",
    fromId: "w2",
    fromRole: "worker",
    fromName: "Michael Chen",
    toId: "c2",
    toRole: "clinic",
    rating: 5,
    comment: "Excellent office with top-of-the-line equipment. Dr. Park was clear with instructions and the team made me feel welcome from day one.",
    date: "May 2, 2026",
    jobId: "j4",
  },
];

// ============================================================
// Helper Functions
// ============================================================

export function getWorkerById(id: string): WorkerProfile | undefined {
  return workers.find((w) => w.id === id);
}

export function getClinicById(id: string): ClinicProfile | undefined {
  return clinics.find((c) => c.id === id);
}

export function getJobById(id: string): JobPosting | undefined {
  return jobs.find((j) => j.id === id);
}

export function getJobsByClinicId(clinicId: string): JobPosting[] {
  return jobs.filter((j) => j.clinicId === clinicId);
}

export function getOpenJobs(): JobPosting[] {
  return jobs.filter((j) => j.status === "open");
}

export function getApplicationsByWorkerId(workerId: string): Application[] {
  return applications.filter((a) => a.workerId === workerId);
}

export function getApplicationsByJobId(jobId: string): Application[] {
  return applications.filter((a) => a.jobId === jobId);
}

export function getReviewsForUser(userId: string): Review[] {
  return reviews.filter((r) => r.toId === userId);
}

export function getReviewsByUser(userId: string): Review[] {
  return reviews.filter((r) => r.fromId === userId);
}

export function getAllClinics(): ClinicProfile[] {
  return clinics;
}

export function getClaimedClinics(): ClinicProfile[] {
  return clinics.filter((c) => c.claimed);
}

export function getUnclaimedClinics(): ClinicProfile[] {
  return clinics.filter((c) => !c.claimed);
}

export function authenticate(email: string, password: string): AuthUser | null {
  const worker = workers.find((w) => w.email === email && w.password === password);
  if (worker) {
    return {
      id: worker.id,
      role: "worker",
      email: worker.email,
      name: `${worker.firstName} ${worker.lastName}`,
      initials: worker.initials,
    };
  }

  const clinic = clinics.find((c) => c.email === email && c.password === password);
  if (clinic) {
    return {
      id: clinic.id,
      role: "clinic",
      email: clinic.email,
      name: clinic.name,
      initials: clinic.initials,
    };
  }

  return null;
}
