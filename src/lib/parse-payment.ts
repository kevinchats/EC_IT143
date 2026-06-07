/**
 * Standard Bank payment confirmation parser — ported from n8n workflow.
 */

export type ParsedPayment = {
  studentId: string;
  amount: number;
  amountCents: number;
  paymentDate: string;
  bodyPreview: string;
};

export function stripHtml(s: string): string {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function looksLikePaymentEmail(text: string, html?: string): boolean {
  const blob = `${text || ""} ${html || ""}`.toLowerCase();
  return /credit|payment received/.test(blob);
}

export function parsePaymentFromBody(
  text: string,
  html?: string,
): ParsedPayment | null {
  const body = stripHtml(text || html || "");

  let amount: number | null = null;
  const amt1 = body.match(/R\s*([\d\s,]+(?:\.\d{2})?)/i);
  const amt2 = body.match(
    /(?:amount|credit|value)[^\d]{0,12}([\d\s,]+(?:\.\d{2})?)/i,
  );
  const amtStr = (amt1 && amt1[1]) || (amt2 && amt2[1]);
  if (amtStr) {
    const n = parseFloat(amtStr.replace(/[\s,]/g, ""));
    if (!Number.isNaN(n)) amount = n;
  }

  let studentId: string | null = null;
  const refPatterns = [
    /(?:Reference|Your reference|Beneficiary reference|Customer reference|From reference)\s*[:\s]+([A-Za-z0-9\-]{3,})/i,
    /\bref\.?\s*[:\s]+([A-Za-z0-9\-]{3,})/i,
  ];
  for (const p of refPatterns) {
    const m = body.match(p);
    if (m) {
      studentId = m[1].trim();
      break;
    }
  }

  let paymentDate = new Date().toISOString().slice(0, 10);
  const dm = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (dm) {
    const parts = dm[1].split(/[\/\-]/);
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      // Assume DD/MM/YYYY (South Africa); if first segment > 12, treat as MM/DD
      if (day > 12 && month <= 12) {
        // already day/month
      } else if (month > 12 && day <= 12) {
        [day, month] = [month, day];
      }
      paymentDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  if (!studentId || amount == null || Number.isNaN(amount)) {
    return null;
  }

  return {
    studentId,
    amount,
    amountCents: Math.round(amount * 100),
    paymentDate,
    bodyPreview: body.slice(0, 800),
  };
}
