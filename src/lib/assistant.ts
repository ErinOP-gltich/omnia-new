import { analyzeMessage } from "./security";
import { site } from "../config/site";

export type Msg = { from: "bot" | "you"; text: string; links?: { label: string; to: string }[] };

export const suggestions = ["Is this message a scam?", "I got scammed, what now?", "How do I make a strong password?", "What does OMNIA cost?"];

// ponytail: rule-based answers. Swap reply() for a call to an LLM endpoint when there's a backend.
export function reply(input: string): Msg {
  const q = input.toLowerCase();
  const looksLikeMessage = input.length > 70 || /https?:\/\/|www\.|\.(xyz|top|click|in|com)\b/i.test(input);
  if (looksLikeMessage) {
    const r = analyzeMessage(input);
    return {
      from: "bot",
      text: `${r.score >= 50 ? "🚨" : r.score >= 25 ? "⚠️" : "✅"} ${r.level} (${r.score}/100).${r.signals.length ? "\n\n" + r.signals.slice(0, 4).map((s) => "• " + s).join("\n") : ""}\n\nWhatever it says: never share an OTP, PIN or password, and don't pay "fees" to receive money.`,
      links: [{ label: "Full Scam Shield", to: "/tools#scam" }],
    };
  }
  if (/is (this|it) .*scam|check (a|this|my) (message|sms|text|email)/.test(q))
    return { from: "bot", text: "Paste the full message (SMS, email or WhatsApp) right here and I'll check it for scam patterns." };
  if (/(got|been|was) (scammed|cheated|defrauded)|lost money|fraud happened|money (was )?(stolen|taken)/.test(q))
    return {
      from: "bot",
      text: "Act fast — the first hour matters:\n\n1. Call the National Cyber Crime Helpline 1930 (India).\n2. File a complaint at cybercrime.gov.in.\n3. Call your bank to block the card / UPI and dispute the transaction.\n4. Change passwords for email and banking, and turn on 2FA.\n5. Keep screenshots of messages, numbers and transaction IDs.",
      links: [{ label: "Check other accounts for leaks", to: "/tools#breach" }],
    };
  if (/hack|compromis|someone (logged|signed)|account (stolen|taken)/.test(q))
    return { from: "bot", text: "1. Reset the password from a device you trust.\n2. Sign out of all sessions in the account's security settings.\n3. Turn on app-based 2FA.\n4. Check recovery email/phone weren't changed.\n5. Check if the same password was used anywhere else — change those too.", links: [{ label: "Check a password", to: "/tools#password" }] };
  if (/password|passcode/.test(q))
    return { from: "bot", text: "Use a unique password of 14+ characters for every account — a password manager makes this painless. Check old ones for leaks and generate new ones here:", links: [{ label: "Leak check", to: "/tools#password" }, { label: "Generator", to: "/tools#generator" }] };
  if (/breach|leak|pwned|exposed|dark ?web/.test(q))
    return { from: "bot", text: "I can check your email against billions of leaked records right now — it takes 3 seconds.", links: [{ label: "Run breach scan", to: "/tools#breach" }] };
  if (/otp|kyc|upi|pin\b|cvv/.test(q))
    return { from: "bot", text: "Rule of thumb: no bank, courier, telecom or government office will ever ask for your OTP, PIN, CVV or UPI PIN. Anyone who does is a scammer — hang up or block." };
  if (/vpn|wi-?fi|hotspot|public network/.test(q))
    return { from: "bot", text: "On public Wi-Fi (cafés, airports, hotels) turn on a VPN so others on the network can't read your traffic. OMNIA's VPN can auto-connect whenever you join an unsafe network." };
  if (/link|url|website safe/.test(q))
    return { from: "bot", text: "Paste the link and I'll look for phishing tricks, or use the Link safety check.", links: [{ label: "Link safety check", to: "/tools#link" }] };
  if (/price|pricing|plan|cost|free|subscription|pay/.test(q))
    return { from: "bot", text: "Starter is free (1 device, breach alerts, scam checks). Family is $9.99/mo billed yearly for up to 5 people and 10 devices with everything included. Business is custom.", links: [{ label: "See plans", to: "/#pricing" }] };
  if (/founder|aman|who (made|built|created|runs)|team|ceo/.test(q))
    return { from: "bot", text: `${site.name} was founded by ${site.founder.name} — a CSE student at VIT-AP who builds front-ends and studies network security (CCNA, Security+).`, links: [{ label: "Meet Aman", to: "/about#founder" }] };
  if (/dashboard|account|sign ?(up|in)|login|register/.test(q))
    return { from: "bot", text: "Create a free account to get your security score, device protection and identity monitoring in one dashboard.", links: [{ label: "Get started", to: "/login?mode=signup" }] };
  if (/^(hi|hey|hello|yo|namaste|sup)\b/.test(q))
    return { from: "bot", text: "Hey! I'm the OMNIA assistant. Paste a suspicious message, or ask me anything about staying safe online." };
  return { from: "bot", text: "I'm not sure about that one yet. Try pasting a suspicious message, or ask about passwords, data leaks, scams, VPNs or our plans.", links: [{ label: "Contact a human", to: "/contact" }] };
}
