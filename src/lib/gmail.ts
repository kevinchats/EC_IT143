import { google } from "googleapis";
import { GMAIL_SEARCH_QUERY } from "./constants";
import { looksLikePaymentEmail, parsePaymentFromBody } from "./parse-payment";

export type GmailMessagePayload = {
  id: string;
  subject: string;
  text: string;
  html: string;
};

function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI ?? "http://localhost:3000/oauth2callback";

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN,
  );
}

export function getGmailClient() {
  const auth = getOAuth2Client();
  if (!auth) return null;
  return google.gmail({ version: "v1", auth });
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function extractBodies(payload: {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: Array<{
    mimeType?: string | null;
    body?: { data?: string | null } | null;
    parts?: unknown[];
  }> | null;
}): { text: string; html: string } {
  let text = "";
  let html = "";

  function walk(part: typeof payload) {
    if (!part) return;
    const mime = part.mimeType ?? "";
    const data = part.body?.data;
    if (data) {
      const decoded = decodeBase64Url(data);
      if (mime.includes("text/plain")) text += decoded;
      else if (mime.includes("text/html")) html += decoded;
    }
    if (part.parts) {
      for (const p of part.parts as typeof payload[]) walk(p);
    }
  }

  walk(payload);
  return { text, html };
}

export async function listPaymentMessages(options?: {
  unreadOnly?: boolean;
  newerThanDays?: number;
  maxResults?: number;
}): Promise<GmailMessagePayload[]> {
  const gmail = getGmailClient();
  if (!gmail) return [];

  const unreadOnly = options?.unreadOnly ?? true;
  const newerThanDays = options?.newerThanDays;
  let q = GMAIL_SEARCH_QUERY;
  if (unreadOnly) q += " is:unread";
  if (newerThanDays) q += ` newer_than:${newerThanDays}d`;

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q,
    maxResults: options?.maxResults ?? 50,
  });

  const messages = listRes.data.messages ?? [];
  const out: GmailMessagePayload[] = [];

  for (const m of messages) {
    if (!m.id) continue;
    const full = await gmail.users.messages.get({
      userId: "me",
      id: m.id,
      format: "full",
    });

    const headers = full.data.payload?.headers ?? [];
    const subject =
      headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
    const { text, html } = extractBodies(full.data.payload ?? {});

    if (!looksLikePaymentEmail(text, html)) continue;

    out.push({ id: m.id, subject, text, html });
  }

  return out;
}

export async function markMessageRead(messageId: string): Promise<void> {
  if (process.env.GMAIL_MARK_READ === "false") return;
  const gmail = getGmailClient();
  if (!gmail) return;
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
}

export function parseGmailMessage(msg: GmailMessagePayload) {
  return parsePaymentFromBody(msg.text, msg.html);
}
