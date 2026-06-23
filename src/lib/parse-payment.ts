/**
 * Standard Bank MyUpdates + payment confirmation parser.
 */

export type ParsedPayment = {
  counterpartyRef: string;
  direction: "in" | "out";
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
    /was paid to standard bank account/.test(blob) ||
    /was paid from standard bank account/.test(blob) ||
    /payment has been made/.test(blob) ||
    /immediate payment confirmation/.test(blob)
  );
}

function parseMyUpdates(body: string): ParsedPayment | null {
  const incoming = body.match(
    /An amount of R([\d.]+) was paid to Standard Bank account.+ from (.+?) on (\d{4}-\d{2}-\d{2})/i,
  );
  if (incoming) {
    const amount = parseFloat(incoming[1]);
    if (!Number.isNaN(amount) && amount > 0) {
      return {
        counterpartyRef: incoming[2].trim(),
        direction: "in",
        amount,
        amountCents: Math.round(amount * 100),
        paymentDate: incoming[3],
        bodyPreview: body.slice(0, 800),
      };
    }
  }

  const outgoing = body.match(
    /An amount of R([\d.]+) was paid from Standard Bank account.+ to (.+?) on (\d{4}-\d{2}-\d{2})/i,
  );
  if (outgoing) {
    const amount = parseFloat(outgoing[1]);
    if (!Number.isNaN(amount) && amount > 0) {
      return {
        counterpartyRef: outgoing[2].trim(),
        direction: "out",
        amount,
        amountCents: Math.round(amount * 100),
        paymentDate: outgoing[3],
        bodyPreview: body.slice(0, 800),
      };
    }
  }

  return null;
}

export function parsePaymentFromBody(
  text: string,
  html?: string,
  pdfText?: string,
): ParsedPayment | null {
  const body = [stripHtml(text || html || ""), pdfText || ""]
    .filter(Boolean)
    .join(" ");

  const myUpdates = parseMyUpdates(body);
  if (myUpdates) return myUpdates;

  let amount: number | null = null;
  const amountPatterns = [
    /Amount\s*R?\s*([\d\s,]+(?:\.\d{2})?)/i,
    /(?:credit|value)\s*(?:of\s*)?R\s*([\d\s,]+(?:\.\d{2})?)/i,
  ];
  for (const pattern of amountPatterns) {
    const m = body.match(pattern);
    if (m?.[1]) {
      const n = parseFloat(m[1].replace(/[\s,]/g, ""));
      if (!Number.isNaN(n) && n > 0) {
        amount = n;
        break;
      }
    }
  }

  let counterpartyRef: string | null = null;
  const refPatterns = [
    /Beneficiary reference\s*[:\s]*([A-Za-z0-9 \-]{3,}?)(?=\s*(?:Amount|Payment date|Bank|$))/i,
    /(?:Your reference|Customer reference|From reference)\s*[:\s]+([A-Za-z0-9 \-]{3,})/i,
  ];
  for (const p of refPatterns) {
    const m = body.match(p);
    if (m) {
      counterpartyRef = m[1].trim();
      break;
    }
  }

  let paymentDate = new Date().toISOString().slice(0, 10);
  const isoDate = body.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoDate) paymentDate = isoDate[1];

  if (!counterpartyRef || amount == null) return null;

  return {
    counterpartyRef,
    direction: "in",
    amount,
    amountCents: Math.round(amount * 100),
    paymentDate,
    bodyPreview: body.slice(0, 800),
  };
}
