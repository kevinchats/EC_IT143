/**
 * One-time OAuth setup: prints a URL, you authorize, paste the code, get refresh token.
 *
 * Usage: GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... npm run gmail:auth
 */
import * as readline from "readline";
import { google } from "googleapis";

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const redirectUri =
  process.env.GMAIL_REDIRECT_URI ?? "http://localhost:3000/oauth2callback";

if (!clientId || !clientSecret) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in the environment.");
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const scopes = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

const url = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes,
});

console.log("\nOpen this URL in your browser:\n");
console.log(url);
console.log("\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Paste the authorization code here: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2.getToken(code.trim());
    console.log("\nAdd to your .env:\n");
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token ?? tokens.access_token}`);
    if (!tokens.refresh_token) {
      console.log(
        "\nWarning: no refresh_token returned. Re-run with prompt=consent or revoke app access first.",
      );
    }
  } catch (err) {
    console.error("Token exchange failed:", err);
    process.exit(1);
  }
});
