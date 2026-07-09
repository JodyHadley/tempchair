# Test / demo accounts (keep until development is done)

Source of truth: `prisma/seed.ts` and the Demo Accounts panel on `/sign-in`.

**Password for all fake users:** `password`

Do **not** delete these until development/testing is finished. When ready to purge, remove Supabase Auth users **and** app profiles (jobs, applications, reviews, messages) — see checklist at the bottom.

---

## Fake workers

| Name | Role | Email | Profile ID |
|------|------|-------|------------|
| Sarah Johnson | Hygienist | `sarah@test.com` | `a0000000-0000-0000-0000-000000000001` |
| Michael Chen | Assistant | `michael@test.com` | `a0000000-0000-0000-0000-000000000002` |
| Emily Torres | Dentist | `emily@test.com` | `a0000000-0000-0000-0000-000000000003` |

---

## Fake claimed clinics (demo practices)

| Name | Contact (seed) | Email | Phone | Address | Profile ID |
|------|----------------|-------|-------|---------|------------|
| Boise Family Dentistry | Dr. Robert Hayes | `boise@test.com` | (208) 555-0101 | 1234 Main St, Boise, ID 83702 | `b0000000-0000-0000-0000-000000000001` |
| Eagle Road Dental | Dr. Lisa Park | `eagle@test.com` | (208) 555-0202 | 5678 Eagle Rd, Eagle, ID 83616 | `b0000000-0000-0000-0000-000000000002` |
| Meridian Smiles | Dr. James Wilson | `meridian@test.com` | (208) 555-0303 | 9012 Fairview Ave, Meridian, ID 83642 | `b0000000-0000-0000-0000-000000000003` |

**Notes**

- Boise Family Dentistry is seeded with **premium** tier.
- Seed also creates sample **jobs**, **applications**, and **reviews** tied to these three clinics and the three workers.
- Fingerprints for future purge: `@test.com` emails, `(208) 555-0…` phones, deterministic IDs above.

---

## Related seed job IDs (optional purge)

| Job ID | Clinic | Title (seed) |
|--------|--------|--------------|
| `c0000000-0000-0000-0000-000000000001` | Boise Family Dentistry | Dental Hygienist |
| `c0000000-0000-0000-0000-000000000002` | Boise Family Dentistry | Dental Assistant |
| `c0000000-0000-0000-0000-000000000003` | Boise Family Dentistry | Dental Hygienist |
| `c0000000-0000-0000-0000-000000000004` | Eagle Road Dental | Dental Assistant |
| `c0000000-0000-0000-0000-000000000005` | Eagle Road Dental | Dental Hygienist |
| `c0000000-0000-0000-0000-000000000006` | Meridian Smiles | Temporary Dentist |
| `c0000000-0000-0000-0000-000000000007` | Meridian Smiles | Dental Assistant |

Application IDs: `d0000000-0000-0000-0000-000000000001` … `008`  
Review IDs: `e0000000-0000-0000-0000-000000000001` … `007`

---

## Not “fake logins” (directory seed — leave alone for now)

`prisma/seed.ts` also inserted many **unclaimed** real-ish Treasure Valley clinic names (IDs `b0000000-…0004` through `…0032`). Those are early directory pre-listings, not demo logins. Later imports/scrapes added more clinics. **Do not bulk-delete seed clinic IDs** unless you intend to wipe directory data.

---

## When ready to remove test data

1. Delete related **reviews**, **applications**, **messages**, **credentials**, then **job_postings** for the 3 claimed clinics.
2. Delete the 3 **worker_profiles** and 3 **claimed clinic_profiles**.
3. Delete the 6 **Supabase Auth** users (`@test.com`).
4. Remove the Demo Accounts UI from `src/app/(auth)/sign-in/page.tsx` if still present.
5. Prefer a dedicated purge script — **do not** re-run `npm run seed` on production (seed currently `deleteMany`s all workers/clinics first).

Last verified present in production DB: 2026-07-08.
