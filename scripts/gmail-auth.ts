/**
 * One-time OAuth setup (CLI alternative to Settings → Connect Gmail).
 * Loads .env from project root automatically.
 */
import * as readline from "readline";
import fs from "fs";
import path from "path";
import { getGmailEnvStatus, exchangeCodeForRefreshToken } from "../src/lib/gmail-setup";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const status = getGmailEnvStatus();

if (!status.clientId || !status.clientSecret) {
  console.error(
    "Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env first.\nSee Settings in the app for Google Cloud setup steps.",
  );
  process.exit(1);
}

if (!status.authUrl) {
  console.error("Could not build auth URL.");
  process.exit(1);
}

console.log("\nOpen this URL in your browser:\n");
console.log(status.authUrl);
console.log(
  "\nAfter approving, you will land on /oauth2callback with the refresh token to copy.\n",
);
console.log("Or paste the ?code= value from that URL here:\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Authorization code: ", async (code) => {
  rl.close();
  const result = await exchangeCodeForRefreshToken(code.trim());
  if (!result.ok) {
    console.error("Token exchange failed:", result.error);
    process.exit(1);
  }
  console.log("\nAdd to your .env:\n");
  console.log(`GMAIL_REFRESH_TOKEN=${result.refreshToken}`);
});
