import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BreachCheck } from "@/components/BreachCheck";
import { GradientText, PageHero } from "@/components/Section";
import { PILL, STICKY_UNDER_HEADER } from "@/components/Blueprint";
import { spot } from "@/components/Fx";
import { analyzeMessage, analyzeUrl, checkPasswordPwned, generatePassword, passwordStrength } from "@/lib/security";
import {
  AlertTriangle, Bot, CheckCircle2, ClipboardCheck, Copy, Eye, EyeOff, KeyRound, Link2, Loader2, Mail, RefreshCw, ShieldAlert, Wand2,
} from "lucide-react";

const tools = [
  { id: "breach", icon: Mail, title: "Email breach scan" },
  { id: "scam", icon: Bot, title: "AI Scam Shield" },
  { id: "password", icon: KeyRound, title: "Password leak check" },
  { id: "generator", icon: Wand2, title: "Password generator" },
  { id: "link", icon: Link2, title: "Link safety check" },
  { id: "checkup", icon: ClipboardCheck, title: "Security checkup" },
];

const ToolCard = ({ id, icon: Icon, title, desc, children }: { id: string; icon: typeof Mail; title: string; desc: string; children: React.ReactNode }) => (
  <section id={id} onMouseMove={spot} className="card-surface spotlight scroll-mt-36 p-6 sm:p-8">
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow"><Icon className="h-6 w-6" /></div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
    {children}
  </section>
);

const Verdict = ({ ok, title, children }: { ok: boolean; title: string; children?: React.ReactNode }) => (
  <div role="status" className={`mt-4 animate-scale-in rounded-xl border p-4 ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
    <p className="flex items-center gap-2 font-semibold">
      {ok ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />} {title}
    </p>
    {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
  </div>
);

function ScamShield() {
  const [text, setText] = useState("");
  const [res, setRes] = useState<ReturnType<typeof analyzeMessage> | null>(null);
  const sample = "Dear Customer, your SBI account will be BLOCKED today!! Update your KYC immediately at http://sbi-kyc-update.xyz and share the OTP to avoid suspension.";
  const color = !res ? "" : res.score >= 50 ? "text-red-500" : res.score >= 25 ? "text-amber-500" : "text-emerald-500";
  return (
    <>
      <Textarea rows={5} placeholder="Paste a suspicious SMS, email or WhatsApp message…" value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} aria-label="Message to analyze" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button className="bg-gradient-primary" disabled={!text.trim()} onClick={() => setRes(analyzeMessage(text))}><Bot className="mr-2 h-4 w-4" /> Analyze message</Button>
        <Button variant="ghost" onClick={() => { setText(sample); setRes(analyzeMessage(sample)); }}>Try an example</Button>
      </div>
      {res && (
        <div className="mt-5 animate-scale-in rounded-xl border border-border/70 bg-background/50 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className={`font-semibold ${color}`}>{res.level}</p>
            <span className={`font-mono text-2xl font-bold ${color}`}>{res.score}<span className="text-sm text-muted-foreground">/100</span></span>
          </div>
          <Progress value={res.score} className="mt-3 h-2" />
          {res.signals.length ? (
            <ul className="mt-4 space-y-2 text-sm">
              {res.signals.map((s) => <li key={s} className="flex gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {s}</li>)}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No common scam patterns found. Still — never share OTPs or click links you weren't expecting.</p>
          )}
        </div>
      )}
    </>
  );
}

function PasswordCheck() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const strength = passwordStrength(pw);
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { setCount(await checkPasswordPwned(pw)); } catch (err) { toast.error((err as Error).message); } finally { setLoading(false); }
  };
  return (
    <form onSubmit={check}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Input type={show ? "text" : "password"} required placeholder="Type a password" value={pw} onChange={(e) => { setPw(e.target.value); setCount(null); }} className="h-11 pr-10" aria-label="Password to check" autoComplete="off" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={show ? "Hide" : "Show"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        <Button type="submit" disabled={loading} className="h-11 bg-gradient-primary">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check</Button>
      </div>
      {pw && (
        <div className="mt-3 flex items-center gap-3">
          <Progress value={strength.percent} className="h-1.5" />
          <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">{strength.label}</span>
        </div>
      )}
      {count !== null && (
        <Verdict ok={count === 0} title={count ? `Leaked ${count.toLocaleString()} times` : "Not found in any known leak"}>
          {count ? "Hackers try this password first. Stop using it everywhere." : "Good. Make sure it's unique to one account."}
        </Verdict>
      )}
      <p className="mt-4 text-xs text-muted-foreground">Your password never leaves this device — only the first 5 characters of its SHA-1 hash are sent (k-anonymity).</p>
    </form>
  );
}

function Generator() {
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ upper: true, digits: true, symbols: true });
  const [seed, setSeed] = useState(0);
  const pw = useMemo(() => generatePassword(len, opts), [len, opts, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-3">
        <code className="flex-1 break-all font-mono text-base sm:text-lg">{pw}</code>
        <Button size="icon" variant="ghost" onClick={() => setSeed(seed + 1)} aria-label="Regenerate"><RefreshCw className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(pw).then(() => toast.success("Copied to clipboard"))} aria-label="Copy"><Copy className="h-4 w-4" /></Button>
      </div>
      <div className="mt-5 space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm"><Label>Length</Label><span className="font-mono">{len}</span></div>
          <Slider min={8} max={64} step={1} value={[len]} onValueChange={([v]) => setLen(v)} aria-label="Password length" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["upper", "digits", "symbols"] as const).map((k) => (
            <label key={k} className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm capitalize">
              {k === "upper" ? "A–Z" : k === "digits" ? "0–9" : "!@#"}
              <Switch checked={opts[k]} onCheckedChange={(v) => setOpts({ ...opts, [k]: v })} />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

function LinkCheck() {
  const [url, setUrl] = useState("");
  const [res, setRes] = useState<ReturnType<typeof analyzeUrl> | null>(null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setRes(analyzeUrl(url.trim())); }}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input required placeholder="Paste a link, e.g. http://paypa1-secure-login.xyz" value={url} onChange={(e) => { setUrl(e.target.value); setRes(null); }} className="h-11" aria-label="Link to check" />
        <Button type="submit" className="h-11 bg-gradient-primary">Check link</Button>
      </div>
      {res && (
        <Verdict ok={res.safe} title={res.safe ? "No red flags found" : `${res.issues.length} red flag${res.issues.length > 1 ? "s" : ""} found`}>
          {res.safe ? "Looks normal — but only open links you were expecting." : <ul className="list-disc space-y-1 pl-5">{res.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
        </Verdict>
      )}
    </form>
  );
}

const questions = [
  ["Do you use a different password for every important account?", "Use a password manager so every account gets a unique password."],
  ["Is two-factor authentication (2FA) on for email, banking and social media?", "Turn on 2FA — app-based codes are safer than SMS."],
  ["Are your phone and computer set to update automatically?", "Enable automatic updates; most attacks use already-fixed bugs."],
  ["Do you use a VPN on public Wi-Fi?", "Use a VPN on cafés, airports and hotel Wi-Fi."],
  ["Have you changed the default password on your Wi-Fi router?", "Change the router admin password and use WPA2/WPA3."],
  ["Do you back up important files at least monthly?", "Turn on automatic cloud or external-drive backups to beat ransomware."],
  ["Have you checked if your email appears in a data breach this year?", "Run the free breach scan above and monitor it continuously."],
  ["Do you verify callers/messages before sharing OTPs or paying?", "Never share OTPs. Call the company back on its official number."],
] as const;

function Checkup() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const done = Object.keys(answers).length === questions.length;
  const score = Math.round((Object.values(answers).filter(Boolean).length / questions.length) * 100);
  return (
    <>
      <ol className="space-y-3">
        {questions.map(([q], i) => (
          <li key={q} className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm"><span className="mr-2 font-mono text-primary">0{i + 1}</span>{q}</span>
            <div className="flex shrink-0 gap-2">
              {[true, false].map((v) => (
                <Button key={String(v)} size="sm" variant={answers[i] === v ? "default" : "outline"} className={answers[i] === v ? (v ? "bg-emerald-600 hover:bg-emerald-600" : "bg-red-600 hover:bg-red-600") : ""} onClick={() => setAnswers({ ...answers, [i]: v })}>
                  {v ? "Yes" : "No"}
                </Button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {done && (
        <div className="mt-6 animate-scale-in rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Your security score</p>
          <p className="font-display text-5xl font-bold"><GradientText>{score}</GradientText><span className="text-xl text-muted-foreground">/100</span></p>
          {score < 100 && (
            <ul className="mt-4 space-y-2 text-sm">
              {questions.filter((_, i) => !answers[i]).map(([q, tip]) => <li key={q} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {tip}</li>)}
            </ul>
          )}
          <Button asChild className="mt-6 bg-gradient-primary"><Link to="/login?mode=signup">Fix these automatically with OMNIA</Link></Button>
        </div>
      )}
    </>
  );
}

const Tools = () => {
  const { hash } = useLocation();
  return (
    <div>
      <PageHero eyebrow="Free security tools" title={<>Check yourself <GradientText>before you wreck yourself</GradientText></>} subtitle="Six free tools that actually work. No sign-up needed." />
      <div className={`${STICKY_UNDER_HEADER} z-30`}>
        <nav className={`${PILL} flex gap-1 overflow-x-auto px-2 py-1.5 lg:justify-between`}>
          {tools.map((t) => (
            <a key={t.id} href={`#${t.id}`} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm lg:px-2 transition-colors hover:bg-muted ${hash === `#${t.id}` ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
              <t.icon className="h-4 w-4" /> {t.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="container grid gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ToolCard id="breach" icon={Mail} title="Email breach scan" desc="See which data breaches have exposed your email address."><BreachCheck /></ToolCard>
        <ToolCard id="scam" icon={Bot} title="AI Scam Shield" desc="Paste any SMS, email or WhatsApp message to detect scam patterns."><ScamShield /></ToolCard>
        <ToolCard id="password" icon={KeyRound} title="Password leak check" desc="Find out if a password has appeared in a known breach."><PasswordCheck /></ToolCard>
        <ToolCard id="generator" icon={Wand2} title="Password generator" desc="Create strong, random passwords with your device's secure randomness."><Generator /></ToolCard>
        <ToolCard id="link" icon={Link2} title="Link safety check" desc="Spot phishing tricks in a link before you click it."><LinkCheck /></ToolCard>
        <div className="lg:col-span-2"><ToolCard id="checkup" icon={ClipboardCheck} title="2-minute security checkup" desc="Answer 8 questions and get your personal security score."><Checkup /></ToolCard></div>
      </div>
    </div>
  );
};

export default Tools;
