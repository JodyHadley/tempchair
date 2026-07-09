# Nightly clinic website scraper

## Can we scrape Google Search?

**No — not practically or cleanly.**

| Approach | Works? | Why |
|----------|--------|-----|
| Scrape Google SERP HTML | ❌ | Against Google ToS; CAPTCHAs, blocks, brittle |
| Google Places API | ✅ paid | Best coverage; costs money |
| Scrape **practice websites** you already know | ✅ free | 20–30/night is sustainable |

This project uses **option 3**: a queue of known clinic URLs, scraped politely overnight.

## How it works

```
data/scrape-queue.json     ← list of practice URLs
        ↓
scripts/nightly-clinic-scrape.ts
        ↓
  fetch homepage (User-Agent, delay, robots.txt check)
  parse schema.org JSON-LD (Dentist / LocalBusiness)
  fallback: tel: links + address regex
  logo: schema.org logo/image → og:image → logo <img> → apple-touch-icon
  download logo → public/clinic-logos/ (fallback: store remote URL)
        ↓
  upsert clinic_profiles (fill empty fields / insert new / logoUrl)
        ↓
data/scrape-logs/scrape-YYYY-MM-DD.json
```

Default batch: **25 sites/run**, **3s delay** between requests.

## Run locally

```bash
# Dry run (no DB writes, no queue save)
npx tsx scripts/nightly-clinic-scrape.ts --dry-run --batch=5

# Real run
npx tsx scripts/nightly-clinic-scrape.ts --batch=25
```

Requires `.env.local` with `DATABASE_URL`.

## Nightly automation (free)

GitHub Actions workflow: `.github/workflows/nightly-clinic-scrape.yml`

1. Repo → **Settings → Secrets → Actions**
2. Add secret: `DATABASE_URL` (Supabase connection string)
3. Actions run daily at 08:00 UTC (~1 AM Mountain)
4. Or run manually: **Actions → Nightly clinic website scrape → Run workflow**

The job commits updated `data/scrape-queue.json` + logs so you can see progress in git.

## Adding more sites

Edit `data/scrape-queue.json` and append:

```json
{
  "url": "https://example-dental.com",
  "nameHint": "Example Dental",
  "status": "pending",
  "lastScrapedAt": null,
  "lastError": null
}
```

Find URLs by hand (Google once, copy the practice’s own domain) or from outreach spreadsheets — **don’t automate Google scraping**.

## Ethics / politeness

- Identifies as `TempChairBot` with contact in User-Agent
- Checks `robots.txt` (simple rules)
- 3+ second delay between hosts
- Only stores public contact fields for directory/claim use
- Prefer practice sites that publish schema.org data

## Logos

When demographic data is scraped, the script also tries to grab a practice logo:

| Priority | Source |
|----------|--------|
| 1 | schema.org `logo` (JSON-LD) |
| 2 | schema.org `image` |
| 3 | `og:image` / `twitter:image` meta |
| 4 | `<img>` with logo-ish class/id/alt/src |
| 5 | large `apple-touch-icon` (last resort) |

**Storage**

- Prefer **download** into `public/clinic-logos/{slug}-{hash}.{ext}` and set `logo_url` to `/clinic-logos/...`
- If download fails (hotlink block, non-image, too large), store the **remote URL** instead
- Only fills `logo_url` when empty; upgrades remote → local if a later scrape succeeds
- Commit downloaded logos so Vercel can serve them (scraper runs locally or in CI, not on the Vercel runtime)

UI: directory (`/clinics`), claim picker, and clinic dashboard avatars show `logoUrl` when present, with initials fallback.

## Limitations

- Many sites block bots (403) — marked `error` and retried later
- Some sites have no structured data — may extract little
- Logos may be missing, low-res, or wrong (hero photo as og:image) — initials remain the fallback
- Not a complete market census without Places/board data
- Re-scrapes successful sites after **14 days** for freshness
