import { GMAIL_SEARCH_QUERY } from "./constants";
import { refreshGoogleAccessToken } from "./gmail-setup";
import { looksLikePaymentEmail, parsePaymentFromBody } from "./parse-payment";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

export type GmailMessagePayload = {
  id: string;
  subject: string;
  text: string;
  html: string;
  pdfText: string;
};

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GMAIL_CLIENT_ID?.trim() &&
      process.env.GMAIL_CLIENT_SECRET?.trim() &&
      process.env.GMAIL_REFRESH_TOKEN?.trim(),
  );
}

async function gmailFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const accessToken = await refreshGoogleAccessToken();
  const res = await fetch(`${GMAIL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 200);
    try {
      const err = JSON.parse(text) as { error?: { message?: string } };
      detail = err.error?.message ?? detail;
    } catch {
      // keep raw snippet
    }
    throw new Error(`Gmail API ${res.status}: ${detail}`);
  }

  if (!text) return {} as T;
  return JSON.parse(text) as T;
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
  mimeType?: string;
  filename?: string;
  body?: { data?: string; attachmentId?: string; size?: number };
  parts?: MimePart[];
};

type GmailHeader = { name?: string; value?: string };

type GmailMessage = {
  id?: string;
  payload?: MimePart & { headers?: GmailHeader[] };
};

type ListResponse = { messages?: Array<{ id?: string }> };

function extractBodies(payload: MimePart): { text: string; html: string } {
  let text = "";
  let html = "";

  function walk(part: MimePart) {
    const mime = part.mimeType ?? "";
    const data = part.body?.data;
    if (data) {
      const decoded = decodeBase64Url(data);
      if (mime.includes("text/plain")) text += decoded;
      else if (mime.includes("text/html")) html += decoded;
    }
    part.parts?.forEach(walk);
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
  payload.parts?.forEach((p) => findPdfParts(p, out));
  return out;
}

async function extractPdfText(
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
    const att = await gmailFetch<{ data?: string }>(
      `/users/me/messages/${messageId}/attachments/${attachmentId}`,
    );
    const buf = decodeBase64UrlBuffer(att.data ?? "");
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
  if (!isGmailConfigured()) return [];

  const unreadOnly = options?.unreadOnly ?? true;
  const newerThanDays = options?.newerThanDays;
  let q = GMAIL_SEARCH_QUERY;
  if (unreadOnly) q += " is:unread";
  if (newerThanDays && newerThanDays > 0) q += ` newer_than:${newerThanDays}d`;

  const params = new URLSearchParams({
    q,
    maxResults: String(options?.maxResults ?? 50),
  });

  const listRes = await gmailFetch<ListResponse>(
    `/users/me/messages?${params.toString()}`,
  );

  const messages = listRes.messages ?? [];
  const out: GmailMessagePayload[] = [];

  for (const m of messages) {
    if (!m.id) continue;
    const full = await gmailFetch<GmailMessage>(
      `/users/me/messages/${m.id}?format=full`,
    );

    const headers = full.payload?.headers ?? [];
    const subject =
      headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
    const { text, html } = extractBodies(full.payload ?? {});
    const pdfText = await extractPdfText(m.id, full.payload ?? {});

    if (!looksLikePaymentEmail(text, html, pdfText)) continue;

    out.push({ id: m.id, subject, text, html, pdfText });
  }

  return out;
}

export async function markMessageRead(messageId: string): Promise<void> {
  if (process.env.GMAIL_MARK_READ === "false") return;
  if (!isGmailConfigured()) return;
  await gmailFetch(`/users/me/messages/${messageId}/modify`, {
    method: "POST",
    body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
  });
}

export function parseGmailMessage(msg: GmailMessagePayload) {
  return parsePaymentFromBody(msg.text, msg.html, msg.pdfText);
}
