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

export async function exchangeCodeForRefreshToken(
  code: string,
): Promise<{ ok: true; refreshToken: string } | { ok: false; error: string }> {
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

  try {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2.getToken(code);
    const refreshToken = tokens.refresh_token;
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
