# Teaching Assistant

An AI assistant for teachers: lesson ideas, curriculum-grounded chat, interdisciplinary planning, and Schoology-aware assessment support.

Built with **Next.js**, **TypeScript**, and connected via API to **Google Gemini** models.

---

## Privacy & data

- **No secrets in this repository.** API keys and Schoology credentials live only in local / host environment variables (see `.env.example`). Never commit `.env.local`.
- **No student data is stored in the repo.** Schoology names, grades, and submissions are fetched at runtime over the API and are not checked into git.
- **Chat uploads stay in the browser session** (memory only). There is no auth database and no persistent document store for uploads.
- **Optional anonymization** replaces student names with aliases before sending course chat context to Gemini; names are restored in the UI after the reply.
- **Curriculum under `data/plans/` is sample content only.** Plans are written for a fictional school named **Colégio Horizonte**, which **does not exist**. They are demo curriculum, not any real school’s official materials. Swap in your own files as needed.
- Bundled framework texts (`BNCC`, Massachusetts Curriculum Framework) are reference extracts for local grounding. Confirm redistribution rights for your own deployment.

---

## What you can do

| Module | Route | Purpose |
|--------|--------|---------|
| **Teaching Assistant** | `/` | Chat grounded in selected reference docs (BNCC, Massachusetts, session uploads). Lesson plans, activities, rubrics — with pedagogical differentiation. |
| **Interdisciplinary Planning** | `/interdisciplinary-planning` | Build plans from sample grade/subject files under `data/plans/` (Colégio Horizonte — fictional demo school). |
| **Lesson Map** | `/lesson-map` | Browse sample lesson-map cards. |
| **Assessment Assistant** | `/assessment-assistant` | Connect to Schoology (two-legged OAuth), browse courses/assignments, and chat with course or assignment context. |

---

## Architecture

```
Browser (React UI)
    │  same-origin fetch
    ▼
Next.js App Router API routes  (/api/chat, /api/assessment-assistant/*, …)
    │
    ├── Prompt builders  (src/lib/build*.ts)
    ├── Gemini client    (src/lib/gemini.ts)     ← GEMINI_API_KEY
    └── Schoology client (src/lib/schoology/*)   ← OAuth 1.0 consumer key/secret
            │
            ▼
      api.schoology.com
```

### Design choices

1. **Server-side secrets** — Gemini and Schoology credentials never ship to the browser.
2. **Prompt + document context** — Selected `.txt` sources (and optional uploads) are assembled into a structured prompt; no vector DB in the MVP.
3. **Module-specific prompts** — Teaching Assistant, Assessment, Course chat, and Interdisciplinary planning each have their own system instructions.
4. **Schoology via signed REST** — Two-legged OAuth 1.0 from the server only (no Playwright scraping, no browser OAuth redirect for the API path).
5. **Sample curriculum pack** — Interdisciplinary features read local plan files for a fictional school (**Colégio Horizonte**) so the demo works without a real school CMS.

---

## How it works

### Teaching Assistant

1. Teacher selects built-in and/or uploaded sources.
2. Client posts the question + selected source ids to `/api/chat`.
3. Server loads document text (capped per source), builds the prompt, streams Gemini’s reply.

### Assessment Assistant

1. Server uses `SCHOOLOGY_CONSUMER_KEY` / `SECRET` to call Schoology’s REST API.
2. UI lists courses (current/archived), materials, students, and submissions.
3. Course or assignment chat classifies the question, computes analytics from a course snapshot, and may attach submission extracts when relevant — then calls Gemini.

### Interdisciplinary Planning

1. Teacher picks grade, period, primary subject (and optional connections).
2. Server loads matching **sample** plans from `data/plans/` (Colégio Horizonte — fictional).
3. Gemini proposes a lesson plan / project / sequence grounded only in that provided text.

---

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript  
- Tailwind CSS v4 · Gemini (`@google/generative-ai`)  
- `pdf-parse` / `mammoth` for session uploads  

---

## Requirements

- Node.js **≥ 20.19**
- A [Gemini API key](https://aistudio.google.com/apikey)
- (Optional) Schoology personal API consumer key & secret for Assessment Assistant

---

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your keys (never commit this file)
npm run dev
```

Open [http://localhost:3030](http://localhost:3030).

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Generative AI API key |
| `GEMINI_MODEL` | No | Preferred model (fallback chain in `src/lib/gemini.ts`) |
| `SCHOOLOGY_BASE_URL` | Assessment | Default `https://api.schoology.com/v1` |
| `SCHOOLOGY_CONSUMER_KEY` | Assessment | Two-legged API consumer key |
| `SCHOOLOGY_CONSUMER_SECRET` | Assessment | Two-legged API consumer secret |
| `SCHOOLOGY_DOMAIN` | No | Web UI host for “Open in Schoology” links |
| `SCHOOLOGY_DEBUG` | No | `1` enables debug routes / local debug log |
| `ANONYMIZE_STUDENT_NAMES` | No | Default on; set `0` to disable |

---

## Project layout

```
src/
  app/                  # Routes & API handlers
  components/           # UI
  lib/                  # Prompts, Gemini, Schoology, analytics, i18n
data/
  documents/            # Built-in framework extracts (BNCC, Massachusetts)
  plans/                # Sample curriculum for fictional Colégio Horizonte (demo only)
```

Useful scripts:

```bash
npm run verify:gemini      # Check Gemini key / model
npm run verify:schoology   # Check Schoology credentials
npm run convert-pdf        # Helper to turn PDFs into .txt for data/documents
```

---

## Deploying

Host on Vercel (or similar). Set the same environment variables in the project settings. Do **not** upload `.env.local` or Schoology debug dumps.

---

## Security checklist (for contributors)

- Keep `.env*` out of git (only `.env.example` is tracked).
- Do not commit `data/schoology-*` artifacts, PDFs, or `.cursor/`.
- Treat `data/plans/` as replaceable demo content (Colégio Horizonte is fictional).
- Rotate API keys if they may have been exposed outside the repo.

---

## License

MIT — see [LICENSE](./LICENSE).
