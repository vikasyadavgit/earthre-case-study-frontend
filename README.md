# SLA Monitoring Dashboard

A full-stack SLA monitoring tool that ingests raw health-check CSVs, cleans the data through a serverless pipeline, persists it to a database, and renders an interactive dashboard — built for the Earthre Full Stack Developer take-home assignment.

---

## 🔗 Live URLs

| Layer | URL |
|---|---|
| **Frontend (Upload + Dashboard)** | https://earthre-case-study-frontend.vercel.app/upload |
| 

> Last verified live: **22 Sep 2026**. Hosted on Vercel (frontend) and AWS Lambda + API Gateway (backend) — both free-tier, always-on.

---

## Architecture

```
User Browser (Next.js on Vercel)
        │
        │  POST /upload  (multipart/form-data)
        ▼
AWS API Gateway  ──►  AWS Lambda (Python)
                              │
                              │  parse → validate → deduplicate
                              ▼
                         PostgreSQL (RDS / Supabase free tier)
                              │
        ┌─────────────────────┘
        │  GET /dashboard   (aggregate SLA stats)
        │  GET /checks      (paginated raw records)
        ▼
User Browser (Dashboard page)
```

### Why each piece

| Choice | Reason |
|---|---|
| **Next.js 16 (App Router)** | Zero-config deploy on Vercel; file-system routing keeps upload and dashboard as clean separate pages |
| **Vercel** | Free tier, automatic HTTPS, no cold starts for static/SSR pages |
| **AWS Lambda** | Stateless, scales to zero cost, handles the heavy CSV parsing without a persistent server |
| **AWS API Gateway** | Managed HTTP endpoint in front of Lambda; free 1M calls/month |
| **PostgreSQL** | Relational queries make date-range + service filters trivial; free Supabase tier |
| **No auth, no multi-tenancy** | Explicitly out of scope per the spec |

---

## API Endpoints (Backend)

| Method | Path | Description |
|---|---|---|
| `POST` | `/upload` | Upload CSV; returns processing summary |
| `GET` | `/dashboard` | Overall + per-service SLA stats |
| `GET` | `/checks` | Paginated check records (`limit`, `offset`, `service_id`, `date_from`, `date_to`) |

---

## Data Findings

The CSV files were intentionally messy. Here's every issue discovered and how the backend handles it:

### 1. Mixed latency units (`ms` vs `s`)
Some rows report latency as `0.717` with `latency_unit = "s"`, others as `707` with `latency_unit = "ms"`. These are the same measurement in different scales.

**Handling:** Backend normalises all values to milliseconds before storing (`latency_ms`). The `latency_unit` column drives the conversion: `value_in_s × 1000`.

### 2. Exact duplicate rows
Identical rows (same service, timestamp, agent, status, latency) appear more than once — likely from overlapping log collection windows across agents.

**Handling:** Exact duplicates are dropped. Reported as `exact_duplicates_dropped` in the upload response.

### 3. Conflicting duplicates
Same service + timestamp + agent, but different status code or latency values — indicating a re-try or a logging race condition.

**Handling:** One row is kept (last-write-wins), the rest are flagged. Reported as `conflicting_duplicates_resolved`.

### 4. Invalid status codes
Rows with HTTP status codes outside the valid 100–599 range (e.g. `0`, `999`).

**Handling:** Rows flagged as `is_valid_status = false` and excluded from SLA computation. Reported as `invalid_status_rows`.

### 5. Invalid latency values
Negative latency, zero latency after unit conversion, or implausibly large values (likely sensor errors).

**Handling:** Flagged as `is_valid_latency = false` and excluded from average latency computation. Reported as `invalid_latency_rows`.

### 6. Dataset date range varies per file
The spec said "multiple days" — actual range depends on which seed file is uploaded (9 days, 12 days, 14 days, 21 days, or 30 days). The system does not assume any fixed range.

**Handling:** Frontend reads date bounds from the actual records returned by `/checks`; no hardcoded range.

---

## Stats Shown on Dashboard (Design Decisions)

The stats panel shows what an **on-call engineer or billing team** would actually need:

| Stat | Why it matters |
|---|---|
| **Overall SLA %** | The single number that decides whether a billing credit is issued (threshold: 99.9%) |
| **SLA MET / BREACH badge per service** | Instant visual triage — which service do I escalate? |
| **Total checks / Success checks / Invalid checks** | Understand the denominator; invalid checks are excluded from SLA |
| **Avg latency + p95 latency** | Avg alone hides tail latency spikes; p95 shows the slowest 5% of real users |
| **Duplicates dropped / Invalid rows** | Data quality transparency — the pipeline's honesty about what it cleaned |

The stats panel is **collapsible** so it doesn't obscure the logs view when an engineer is drilling into specific records.

---

## Assumptions

1. **SLA threshold = 99.9%** — the spec explicitly states this is the billing-credit trigger.
2. **Success = HTTP 2xx** — 3xx/4xx/5xx are all treated as failures for SLA purposes.
3. **Invalid rows are excluded from SLA computation, not counted as failures** — a bad sensor reading should not penalise the service.
4. **One shared dataset** — no multi-tenancy; each upload overwrites/appends to the same database. Out of scope per spec.
5. **Logs table shows all records (including those with `exclude_reason`)** — transparency; the engineer should be able to see why a row was excluded.
6. **Upload response is cached in `localStorage`** for the session — so data quality stats (duplicates, invalid rows) remain visible on the dashboard after upload without a separate API call.

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
# Clone the repo
git clone https://github.com/vikasyadavgit/earthre-case-study-frontend.git
cd earthre-case-study-frontend

# Install dependencies
npm install


# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/upload`.

### Production build

```bash
npm run build
npm run start
```

---

## Project Structure

```
app/
  upload/page.tsx        # CSV upload screen
  dashboard/page.tsx     # Stats + logs dashboard
  components/
    Navbar.tsx           # Sticky top nav
    UploadZone.tsx       # Drag-and-drop file input
    UploadResult.tsx     # Post-upload summary card
    StatsPanel.tsx       # Collapsible SLA stats (calls GET /dashboard)
    LogsTable.tsx        # Filterable check log (calls GET /checks)
    ServiceBadge.tsx     # Coloured service name chip
    StatusBadge.tsx      # HTTP status code badge
  lib/
    api.ts               # fetch wrappers for all 3 endpoints
    types.ts             # TypeScript interfaces
    utils.ts             # Formatters, colour helpers, localStorage
```

---

## What I'd Do Differently With More Time

1. **Chart the SLA over time** — a line chart showing availability % per day per service would make incident windows visually obvious without scanning logs.
2. **Show `exclude_reason` inline in the logs table** — currently it's fetched but not displayed; surfacing it would help engineers understand exactly why a row was excluded.
3. **Add a "re-upload replaces" toggle** — right now uploads accumulate. A clear dataset button + replace semantics would make the tool production-ready.
4. **p99 latency** — p95 is shown; adding p99 costs nothing on the backend but gives a sharper view of worst-case outliers.
5. **Dark/light mode toggle** — the UI is dark-only; a toggle would improve accessibility.
6. **Export filtered logs as CSV** — useful for incident reports sent to billing or leadership.


**GitHub Repositories:**

- Frontend: https://github.com/vikasyadavgit/earthre-case-study-frontend
- Backend: https://github.com/vikasyadavgit/earthre-case-study-backend