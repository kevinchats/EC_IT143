import {
  looksLikePaymentEmail,
  parsePaymentFromBody,
} from "../src/lib/parse-payment";

const sample = `
Payment confirmation
Credit of R 3 500.00 received.
Your reference: STUDENT-42
Date: 15/05/2026
`;

if (!looksLikePaymentEmail(sample)) {
  console.error("FAIL: keyword filter");
  process.exit(1);
}

const parsed = parsePaymentFromBody(sample);
if (!parsed || parsed.studentId !== "STUDENT-42" || parsed.amount !== 3500) {
  console.error("FAIL: parse", parsed);
  process.exit(1);
}

console.log("Parser OK:", parsed);
