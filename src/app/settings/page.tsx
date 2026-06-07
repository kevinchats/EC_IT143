import { getDb } from "@/db";
import { gmailSyncState } from "@/db/schema";
import { SyncButton } from "@/components/SyncButton";
import { isGmailConfigured } from "@/lib/gmail";
import { getGmailEnvStatus } from "@/lib/gmail-setup";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const db = getDb();
  const rows = await db.select().from(gmailSyncState).limit(1);
  const state = rows[0];
  const configured = isGmailConfigured();
  const envStatus = getGmailEnvStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--muted)]">
          Gmail sync, exports, and deployment notes.
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Gmail connection</h2>
        <p>
          Status:{" "}
          <span
            className={
              configured ? "text-[var(--positive)]" : "text-[var(--negative)]"
            }
          >
            {configured ? "Configured" : "Not configured"}
          </span>
        </p>

        {!configured && (
          <div className="space-y-3 text-sm">
            <p className="text-[var(--muted)]">
              Your <code>.env</code> file is missing values for:
            </p>
            <ul className="list-inside list-disc text-[var(--negative)]">
              {envStatus.missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>

            <div className="rounded-lg bg-[#15202b] p-4 text-[var(--foreground)]">
              <p className="mb-2 font-medium">Setup steps</p>
              <ol className="list-inside list-decimal space-y-2 text-[var(--muted)]">
                <li>
                  Open{" "}
                  <a
                    href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Cloud Console
                  </a>{" "}
                  → enable <strong>Gmail API</strong>.
                </li>
                <li>
                  Credentials → Create OAuth client → <strong>Web application</strong>.
                </li>
                <li>
                  Authorized redirect URI:{" "}
                  <code className="text-[var(--foreground)]">
                    {envStatus.redirectUri}
                  </code>
                </li>
                <li>
                  Put <code>GMAIL_CLIENT_ID</code> and{" "}
                  <code>GMAIL_CLIENT_SECRET</code> in <code>.env</code>, then
                  restart the app.
                </li>
                <li>
                  Click <strong>Connect Gmail</strong> below (or run{" "}
                  <code>npm run gmail:auth</code>), then add{" "}
                  <code>GMAIL_REFRESH_TOKEN</code> to <code>.env</code> and
                  restart again.
                </li>
              </ol>
            </div>

            {envStatus.authUrl ? (
              <a href={envStatus.authUrl} className="btn btn-primary inline-flex">
                Connect Gmail
              </a>
            ) : (
              <p className="text-[var(--muted)]">
                Add client ID and secret to <code>.env</code> first, then restart
                — the Connect Gmail button will appear here.
              </p>
            )}
          </div>
        )}

        {state?.lastSyncAt && (
          <p className="text-sm">
            Last sync: {new Date(state.lastSyncAt).toLocaleString("en-ZA")}
            {state.lastInsertedCount != null &&
              ` — inserted ${state.lastInsertedCount}, skipped ${state.lastSkippedCount}`}
          </p>
        )}
        {state?.lastError && (
          <p className="text-sm text-[var(--negative)]">
            Last errors: {state.lastError}
          </p>
        )}
        {configured && (
          <div className="flex flex-wrap gap-4">
            <SyncButton />
            <SyncButton label="Backfill (90 days)" backfill />
          </div>
        )}
      </div>

      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Export backup</h2>
        <div className="flex flex-wrap gap-3">
          <a className="btn btn-secondary" href="/api/export?type=all">
            Download all (CSV)
          </a>
          <a className="btn btn-secondary" href="/api/export?type=payments">
            Payments only
          </a>
          <a className="btn btn-secondary" href="/api/export?type=expenses">
            Expenses only
          </a>
        </div>
      </div>

      <div className="card space-y-2 text-sm text-[var(--muted)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Security
        </h2>
        <p>
          This app has no login. Bind Docker to <code>127.0.0.1</code> or your LAN
          only; use VPN if accessing remotely. Do not expose port 3000 to the public
          internet without adding authentication.
        </p>
        <p>
          After verifying the dashboard, deactivate your n8n workflow at{" "}
          <code>~/n8n-workflows/student-accommodation-payment-tracker.json</code>.
        </p>
        <p>
          <Link href="/">Back to overview</Link>
        </p>
      </div>
    </div>
  );
}
