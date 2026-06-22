import { google } from "googleapis";

export type GmailEnvStatus = {
  configured: boolean;
  clientId: boolean;
  clientSecret: boolean;
  refreshToken: boolean;
  redirectUri: string;
  authUrl: string | null;
  missing: string[];
};

export function getGmailEnvStatus(): GmailEnvStatus {
  const clientId = process.env.GMAIL_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim() ?? "";
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim() ?? "";
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI?.trim() ??
    "http://localhost:3000/oauth2callback";

  const missing: string[] = [];
  if (!clientId) missing.push("GMAIL_CLIENT_ID");
  if (!clientSecret) missing.push("GMAIL_CLIENT_SECRET");
  if (!refreshToken) missing.push("GMAIL_REFRESH_TOKEN");

  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  let authUrl: string | null = null;
  if (clientId && clientSecret) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    authUrl = oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
    });
  }

  return {
    configured: missing.length === 0,
    clientId: Boolean(clientId),
    clientSecret: Boolean(clientSecret),
    refreshToken: Boolean(refreshToken),
    redirectUri,
    authUrl,
    missing,
  };
}

/** Accept raw code or full redirect URL (?code=...). */
export function parseAuthCode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  try {
    if (trimmed.includes("code=")) {
      const url = trimmed.startsWith("http")
        ? new URL(trimmed)
        : new URL(trimmed, "http://localhost");
      const fromQuery = url.searchParams.get("code");
      if (fromQuery) return fromQuery;
    }
  } catch {
    // fall through
  }
  return trimmed;
}

export async function exchangeCodeForRefreshToken(
  rawCode: string,
): Promise<{ ok: true; refreshToken: string } | { ok: false; error: string }> {
  const code = parseAuthCode(rawCode);
  const clientId = process.env.GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI?.trim() ??
    "http://localhost:3000/oauth2callback";

  if (!clientId || !clientSecret) {
    return {
      ok: false,
      error:
        "GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env before authorizing.",
    };
  }

  if (!code) {
    return { ok: false, error: "Authorization code is empty." };
  }

  try {
    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const text = await res.text();
    let data: { refresh_token?: string; error?: string; error_description?: string };
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      return {
        ok: false,
        error: `Google token response was not JSON (HTTP ${res.status}). Try again with a fresh code within 10 minutes.`,
      };
    }

    if (!res.ok) {
      const detail = data.error_description ?? data.error ?? text;
      if (data.error === "invalid_grant") {
        return {
          ok: false,
          error: `invalid_grant — code expired or already used. Open Connect Gmail again and use the new code immediately. (${detail})`,
        };
      }
      return {
        ok: false,
        error: `Token exchange failed (HTTP ${res.status}): ${detail}`,
      };
    }

    const refreshToken = data.refresh_token;
    if (!refreshToken) {
      return {
        ok: false,
        error:
          "Google did not return a refresh token. Revoke app access at myaccount.google.com/permissions and try again with prompt=consent.",
      };
    }
    return { ok: true, refreshToken };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
