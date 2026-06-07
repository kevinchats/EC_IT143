import { exchangeCodeForRefreshToken } from "@/lib/gmail-setup";

export const dynamic = "force-dynamic";

export default async function OAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error: oauthError } = await searchParams;

  if (oauthError) {
    return (
      <div className="card mx-auto max-w-lg space-y-3">
        <h1 className="text-xl font-bold text-[var(--negative)]">
          Google sign-in failed
        </h1>
        <p>{oauthError}</p>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="card mx-auto max-w-lg space-y-3">
        <h1 className="text-xl font-bold">Gmail OAuth callback</h1>
        <p className="text-[var(--muted)]">
          No authorization code in the URL. Start from Settings → Connect Gmail,
          or run <code>npm run gmail:auth</code>.
        </p>
      </div>
    );
  }

  const result = await exchangeCodeForRefreshToken(code);

  if (!result.ok) {
    return (
      <div className="card mx-auto max-w-lg space-y-3">
        <h1 className="text-xl font-bold text-[var(--negative)]">
          Could not get refresh token
        </h1>
        <p>{result.error}</p>
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-[var(--positive)]">
        Gmail authorized
      </h1>
      <p>
        Add this line to your <code>.env</code> file, then restart the app
        (or <code>docker compose restart</code>):
      </p>
      <pre className="overflow-x-auto rounded-lg bg-[#15202b] p-4 text-sm">
        GMAIL_REFRESH_TOKEN={result.refreshToken}
      </pre>
      <p className="text-sm text-[var(--muted)]">
        After restart, open Settings — status should show Configured. Then use
        Sync Gmail now.
      </p>
    </div>
  );
}
