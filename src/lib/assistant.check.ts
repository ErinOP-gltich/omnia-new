import { reply } from "./assistant.ts";
const assert = (c: boolean, m: string) => { if (!c) throw new Error(m); };
assert(reply("Dear customer your SBI KYC expires today, share OTP at http://sbi-kyc.xyz").text.includes("High risk"), "pasted scam -> analyzer");
assert(reply("I got scammed on UPI").text.includes("1930"), "scam victim -> helpline");
assert(reply("what does it cost?").links?.[0].to === "/#pricing", "pricing");
assert(reply("who is the founder").text.includes("Aman"), "founder");
assert(reply("asdfgh").links?.[0].to === "/contact", "fallback");
console.log("assistant checks OK");
