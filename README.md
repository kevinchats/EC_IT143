# Student rental tracker

Self-hosted dashboard for student accommodation: **automatic rent payments** from Standard Bank Gmail confirmations, **manual expenses**, per-room balances, and monthly income vs expense charts.

Replaces the n8n + Google Sheets workflow in `~/n8n-workflows/student-accommodation-payment-tracker.json`.

## Features

- Gmail sync (Standard Bank `Payment confirmation` emails)
- Per-room student tracking with bank reference matching
- Manual expense entry (shared or room-specific)
- Overview with charts, overdue badges, CSV export
- SQLite database (single file, Docker volume)

## Quick start (local)

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Open http://localhost:3000

## Gmail setup

1. [Google Cloud Console](https://console.cloud.google.com/) → create project → enable **Gmail API**.
2. OAuth consent screen (External or Internal) → add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
3. Credentials → **OAuth client ID** → Desktop app (or Web with redirect `http://localhost:3000/oauth2callback`).
4. Add to `.env`:

   ```
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   ```

5. Run once:

   ```bash
   npm run gmail:auth
   ```

   Paste the code; copy `GMAIL_REFRESH_TOKEN` into `.env`.

6. Add students with **Student reference** exactly matching the bank payment reference field.

7. On the dashboard, click **Sync Gmail now** or wait for the 5-minute cron (`GMAIL_SYNC_CRON`).

For first-time backfill of older emails, use **Backfill (90 days)** on Settings.

## Docker (self-hosted)

```bash
cp .env.example .env
# Edit .env with Gmail credentials
docker compose up -d --build
```

App listens on **127.0.0.1:3000** only. Access via SSH tunnel or LAN; do not expose publicly without auth.

Data persists in the `rental-data` volume at `/app/data/rental.db`.

## Students & bank references

When a student pays, Standard Bank emails include a **reference** line. That value must match the student's `student_ref` in the app (same as your old Google Sheets "Student ID" column).

## Security

- No built-in login — intended for LAN/VPN use.
- Keep `.env` off git; it holds OAuth secrets.
- Put n8n-style HTTPS + auth in front if you ever expose this beyond your network.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply SQLite migrations |
| `npm run gmail:auth` | One-time OAuth refresh token |

## Cutover from n8n

1. Deploy this app and configure Gmail.
2. Add rooms and students.
3. Run backfill sync; verify payments against bank emails.
4. Deactivate the n8n workflow.

Optional: export old Sheets to CSV and import manually (no bundled importer in MVP).

## Environment variables

See `.env.example` for all options.
