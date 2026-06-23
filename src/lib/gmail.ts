import { GMAIL_SEARCH_QUERIES } from "./constants";
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

type ListResponse = {
  messages?: Array<{ id?: string }>;
  nextPageToken?: string;
};

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

async function listMessageIdsForQuery(
  q: string,
  options?: { unreadOnly?: boolean; newerThanDays?: number; fetchAll?: boolean },
): Promise<string[]> {
  let query = q;
  if (options?.unreadOnly) query += " is:unread";
  if (options?.newerThanDays && options.newerThanDays > 0) {
    query += ` newer_than:${options.newerThanDays}d`;
  }

  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: query,
      maxResults: "500",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const listRes = await gmailFetch<ListResponse>(
      `/users/me/messages?${params.toString()}`,
    );

    for (const m of listRes.messages ?? []) {
      if (m.id) ids.push(m.id);
    }

    pageToken = listRes.nextPageToken;
  } while (pageToken && options?.fetchAll);

  return ids;
}

async function fetchMessagePayload(id: string): Promise<GmailMessagePayload | null> {
  const full = await gmailFetch<GmailMessage>(
    `/users/me/messages/${id}?format=full`,
  );

  const headers = full.payload?.headers ?? [];
  const subject =
    headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
  const { text, html } = extractBodies(full.payload ?? {});
  const pdfText = await extractPdfText(id, full.payload ?? {});

  if (!looksLikePaymentEmail(text, html, pdfText)) return null;
  if (!parsePaymentFromBody(text, html, pdfText)) return null;

  return { id, subject, text, html, pdfText };
}

export async function listPaymentMessages(options?: {
  unreadOnly?: boolean;
  newerThanDays?: number;
  maxResults?: number;
  fetchAll?: boolean;
}): Promise<GmailMessagePayload[]> {
  if (!isGmailConfigured()) return [];

  const idSet = new Set<string>();
  for (const q of GMAIL_SEARCH_QUERIES) {
    const ids = await listMessageIdsForQuery(q, options);
    for (const id of ids) idSet.add(id);
  }

  let ids = [...idSet];
  if (options?.maxResults && !options.fetchAll) {
    ids = ids.slice(0, options.maxResults);
  }

  const out: GmailMessagePayload[] = [];
  for (const id of ids) {
    const msg = await fetchMessagePayload(id);
    if (msg) out.push(msg);
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
