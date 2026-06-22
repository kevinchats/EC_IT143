import { google } from "googleapis";
import { GMAIL_SEARCH_QUERY } from "./constants";
import { looksLikePaymentEmail, parsePaymentFromBody } from "./parse-payment";

export type GmailMessagePayload = {
  id: string;
  subject: string;
  text: string;
  html: string;
  pdfText: string;
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
    process.env.GMAIL_CLIENT_ID?.trim() &&
      process.env.GMAIL_CLIENT_SECRET?.trim() &&
      process.env.GMAIL_REFRESH_TOKEN?.trim(),
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

function decodeBase64UrlBuffer(data: string): Buffer {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

type MimePart = {
  mimeType?: string | null;
  filename?: string | null;
  body?: { data?: string | null; attachmentId?: string | null } | null;
  parts?: MimePart[] | null;
};

function extractBodies(payload: MimePart): { text: string; html: string } {
  let text = "";
  let html = "";

  function walk(part: MimePart) {
    if (!part) return;
    const mime = part.mimeType ?? "";
    const data = part.body?.data;
    if (data) {
      const decoded = decodeBase64Url(data);
      if (mime.includes("text/plain")) text += decoded;
      else if (mime.includes("text/html")) html += decoded;
    }
    if (part.parts) {
      for (const p of part.parts) walk(p);
    }
  }

  walk(payload);
  return { text, html };
}

function findPdfParts(payload: MimePart, out: MimePart[] = []): MimePart[] {
  if (
    payload.filename?.toLowerCase().endsWith(".pdf") &&
    payload.body?.attachmentId
  ) {
    out.push(payload);
  }
  if (payload.parts) {
    for (const p of payload.parts) findPdfParts(p, out);
  }
  return out;
}

async function extractPdfText(
  gmail: ReturnType<typeof google.gmail>,
  messageId: string,
  payload: MimePart,
): Promise<string> {
  const pdfParts = findPdfParts(payload);
  if (pdfParts.length === 0) return "";

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (
    buf: Buffer,
  ) => Promise<{ text: string }>;

  const chunks: string[] = [];
  for (const part of pdfParts) {
    const attachmentId = part.body?.attachmentId;
    if (!attachmentId) continue;
    const att = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: attachmentId,
    });
    const buf = decodeBase64UrlBuffer(att.data.data ?? "");
    const parsed = await pdfParse(buf);
    chunks.push(parsed.text);
  }
  return chunks.join("\n");
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
  if (newerThanDays && newerThanDays > 0) q += ` newer_than:${newerThanDays}d`;

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
    const pdfText = await extractPdfText(
      gmail,
      m.id,
      full.data.payload ?? {},
    );

    if (!looksLikePaymentEmail(text, html, pdfText)) continue;

    out.push({ id: m.id, subject, text, html, pdfText });
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
  return parsePaymentFromBody(msg.text, msg.html, msg.pdfText);
}
