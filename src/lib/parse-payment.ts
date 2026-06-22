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

export function looksLikePaymentEmail(text: string, html?: string, pdfText?: string): boolean {
  const blob = `${text || ""} ${html || ""} ${pdfText || ""}`.toLowerCase();
  return (
    /payment has been made/.test(blob) ||
    /payment received/.test(blob) ||
    /immediate payment confirmation/.test(blob) ||
    /credit of r/.test(blob)
  );
}

export function parsePaymentFromBody(
  text: string,
  html?: string,
  pdfText?: string,
): ParsedPayment | null {
  const body = [stripHtml(text || html || ""), pdfText || ""]
    .filter(Boolean)
    .join(" ");

  let amount: number | null = null;
  const amountPatterns = [
    /Amount\s*R?\s*([\d\s,]+(?:\.\d{2})?)/i,
    /(?:credit|value)\s*(?:of\s*)?R\s*([\d\s,]+(?:\.\d{2})?)/i,
    /R\s*([\d\s,]+(?:\.\d{2})?)/gi,
  ];
  for (const pattern of amountPatterns) {
    if (pattern.global) {
      const matches = [...body.matchAll(pattern)];
      const last = matches.at(-1);
      if (last?.[1]) {
        const n = parseFloat(last[1].replace(/[\s,]/g, ""));
        if (!Number.isNaN(n) && n > 0) {
          amount = n;
          break;
        }
      }
    } else {
      const m = body.match(pattern);
      if (m?.[1]) {
        const n = parseFloat(m[1].replace(/[\s,]/g, ""));
        if (!Number.isNaN(n) && n > 0) {
          amount = n;
          break;
        }
      }
    }
  }

  let studentId: string | null = null;
  const refPatterns = [
    /Beneficiary reference\s*[:\s]*([A-Za-z0-9 \-]{3,}?)(?=\s*(?:Amount|Payment date|Bank|$))/i,
    /(?:Your reference|Customer reference|From reference)\s*[:\s]+([A-Za-z0-9 \-]{3,})/i,
    /(?:Your reference|Customer reference|From reference)\s*[:\s]*([A-Za-z0-9 \-]{3,}?)(?=\s*(?:Bank|Amount|Payment date|$))/i,
    /\bref\.?\s*[:\s]+([A-Za-z0-9 \-]{3,})/i,
  ];
  for (const p of refPatterns) {
    const m = body.match(p);
    if (m) {
      studentId = m[1].trim();
      break;
    }
  }

  let paymentDate = new Date().toISOString().slice(0, 10);
  const isoDate = body.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoDate) {
    paymentDate = isoDate[1];
  } else {
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
