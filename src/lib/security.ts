// Real, client-side security checks used by the Home scan, Tools page and Dashboard.

export async function sha(algo: "SHA-1" | "SHA-256", text: string) {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** Email breach lookup via the free XposedOrNot API. Returns breach names (empty = none found). */
export async function checkEmailBreaches(email: string): Promise<string[]> {
  const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email.trim())}`);
  if (res.status === 404) return [];
  if (res.status === 429) throw new Error("Too many checks right now — try again in a minute.");
  if (!res.ok) throw new Error("Breach service unavailable — try again shortly.");
  const data = await res.json();
  return (data?.breaches?.[0] as string[] | undefined) ?? [];
}

/** Have I Been Pwned k-anonymity check: only the first 5 chars of the SHA-1 hash leave the browser. */
export async function checkPasswordPwned(password: string): Promise<number> {
  const hash = await sha("SHA-1", password);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!res.ok) throw new Error("Password service unavailable — try again shortly.");
  const line = (await res.text()).split("\n").find((l) => l.startsWith(hash.slice(5)));
  return line ? parseInt(line.split(":")[1], 10) : 0;
}

export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (/^(.)\1+$/.test(pw) || /^(password|12345|qwerty)/i.test(pw)) score = 0;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score, label: labels[score], percent: (score / 5) * 100 };
}

export function generatePassword(length: number, opts: { upper: boolean; digits: boolean; symbols: boolean }) {
  let chars = "abcdefghijkmnopqrstuvwxyz";
  if (opts.upper) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (opts.digits) chars += "23456789";
  if (opts.symbols) chars += "!@#$%^&*()-_=+[]{};:,.?";
  const rand = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(rand, (n) => chars[n % chars.length]).join("");
}

// ponytail: heuristic only (no threat-intel feed). Wire Google Safe Browsing in if you need real verdicts.
export function analyzeUrl(raw: string) {
  const issues: string[] = [];
  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `http://${raw}`);
  } catch {
    return { safe: false, issues: ["This isn't a valid web address."] };
  }
  const host = url.hostname;
  if (url.protocol !== "https:") issues.push("Not using HTTPS — data you send isn't encrypted.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) issues.push("Uses a raw IP address instead of a domain name.");
  if (host.includes("xn--")) issues.push("Contains look-alike (punycode) characters.");
  if (raw.includes("@")) issues.push("Contains '@', which can hide the real destination.");
  if (host.split(".").length > 4) issues.push("Has an unusually deep chain of subdomains.");
  if (/\.(zip|mov|xyz|top|click|gq|tk|ml|cf|work|rest)$/i.test(host)) issues.push("Uses a domain ending often abused for scams.");
  if (/(login|verify|secure|account|update|wallet|bank)/i.test(host) && host.split(".").length > 2)
    issues.push("Subdomain uses bait words like 'login' or 'verify'.");
  if (/(paypa1|amaz0n|g00gle|faceb00k|micros0ft|app1e)/i.test(host)) issues.push("Looks like a misspelled famous brand.");
  if (raw.length > 120) issues.push("Very long link — often used to hide tracking or redirects.");
  return { safe: issues.length === 0, issues };
}

// ponytail: rule-based scam scoring. Upgrade path: send text to an LLM endpoint for a second opinion.
const scamRules: [RegExp, number, string][] = [
  [/\b(urgent|immediately|within \d+ ?(hours?|hrs|minutes)|final (notice|warning)|act now|last chance|expires? today)\b/i, 18, "Creates false urgency to rush you"],
  [/\b(suspend|suspended|blocked|deactivat|disconnect|frozen|locked)\w*/i, 16, "Threatens to block or suspend an account or service"],
  [/\b(otp|one[- ]time password|pin|cvv|password|login details|net ?banking)\b/i, 22, "Asks for OTP, PIN, CVV or passwords — real companies never do"],
  [/\b(kyc|verify your (account|identity)|update (your )?(details|kyc|pan|aadhaar))\b/i, 18, "Pushes a fake KYC / verification update"],
  [/\b(won|winner|lottery|prize|reward|lucky draw|cashback|gift ?card|free (iphone|gift))\b/i, 18, "Promises prizes, rewards or free gifts"],
  [/\b(refund|tax refund|income tax|customs|parcel|courier|fedex|dhl|delivery (failed|attempt))\b/i, 12, "Common delivery / refund / tax scam theme"],
  [/\b(upi|processing fee|registration fee|pay (now|₹|rs)|transfer (money|funds)|bitcoin|crypto|usdt)\b/i, 16, "Requests a payment, fee or crypto transfer"],
  [/\b(work from home|part[- ]time job|earn (₹|rs\.?|\$)\s?\d+|per day|like (youtube )?videos|daily income)\b/i, 18, "Looks like a task / job scam"],
  [/\b(whatsapp|telegram)\b.*\b(contact|message|join|chat)\b|\b(contact|message|join|chat)\b.*\b(whatsapp|telegram)\b/i, 10, "Moves the conversation to WhatsApp / Telegram"],
  [/\b(bit\.ly|tinyurl|t\.co|cutt\.ly|rb\.gy|is\.gd|shorturl)\b/i, 14, "Uses a link shortener to hide the destination"],
  [/\b(police|cbi|cyber cell|arrest|warrant|court|legal action)\b/i, 16, "Uses fear of police or legal action"],
  [/\b(dear (customer|user|sir|madam)|valued customer)\b/i, 8, "Generic greeting instead of your name"],
  [/\b(electricity|power) (bill|connection)\b/i, 12, "Fake electricity disconnection theme"],
];

export function analyzeMessage(text: string) {
  const signals: string[] = [];
  let score = 0;
  for (const [re, w, why] of scamRules) if (re.test(text)) { score += w; signals.push(why); }
  for (const link of text.match(/(https?:\/\/[^\s]+|\b[\w-]+\.(?:com|in|net|org|xyz|top|click|info|co|io|link|site|online)[^\s]*)/gi) ?? []) {
    const r = analyzeUrl(link);
    if (!r.safe) { score += 8 * r.issues.length; signals.push(`Risky link "${link.slice(0, 40)}": ${r.issues[0]}`); }
  }
  if (/[A-Z]{6,}/.test(text) && /!{2,}/.test(text)) { score += 6; signals.push("Shouty capitals and exclamation marks"); }
  score = Math.min(100, score);
  const level = score >= 50 ? "High risk — very likely a scam" : score >= 25 ? "Suspicious — be careful" : "Low risk";
  return { score, level, signals };
}
