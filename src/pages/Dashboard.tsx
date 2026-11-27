import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth, useStoredState, type User } from "@/lib/auth";
import { checkEmailBreaches } from "@/lib/security";
import { site } from "@/config/site";
import { ShieldField } from "@/components/ShieldField";
import { Aurora, spot } from "@/components/Fx";
import {
  Activity, AlertTriangle, Bot, CheckCircle2, Cpu, CreditCard, Download, EyeOff, Globe, KeyRound, Laptop, Loader2, Mail, Plus, Radar,
  RefreshCw, Settings, ShieldCheck, Smartphone, Tablet, Trash2, Tv, Users, Wrench,
} from "lucide-react";

type DeviceType = "laptop" | "phone" | "tablet" | "tv" | "iot";
type Device = { id: string; name: string; type: DeviceType; status: "protected" | "at-risk"; issue?: string; lastScan: string | null };
type Event = { id: string; kind: "warning" | "info" | "success"; text: string; at: string };
type Watched = { email: string; breaches: string[] | null; resolved?: boolean; checkedAt?: string };
type Member = { id: string; name: string; email: string; role: "Adult" | "Child" };
type Broker = { name: string; status: "found" | "requested"; requestedAt?: string };
type Txn = { id: string; account: string; merchant: string; amount: number; at: string; flagged: boolean; resolution?: "mine" | "fraud" };
type Data = {
  devices: Device[];
  events: Event[];
  emails: Watched[];
  family: Member[];
  vpn: boolean;
  settings: { realtime: boolean; autoUpdate: boolean; emailAlerts: boolean; parental: boolean };
  stats: { blocked: number; phishing: number; malware: number };
  brokers: Broker[] | null;
  accounts: string[];
  txns: Txn[];
};

const BROKERS = ["PeopleSearch Pro", "DataTrail", "FindAnyone", "RecordHub", "TruePeopleDB", "ContactLookup", "AddressVault", "PublicProfiles", "PhoneTracer", "BackgroundNow"];
const REMOVAL_MS = 45_000; // ponytail: simulated removal time; real broker opt-outs take days and need a backend worker
const MERCHANTS = [["Swiggy", 420], ["Amazon", 2199], ["Uber", 310], ["Netflix", 649], ["BigBasket", 1780], ["IRCTC", 1450], ["Zomato", 560]] as const;
const SUSPICIOUS = [["Unknown merchant · Lagos", 48000], ["Crypto exchange · overseas", 25000], ["Gift cards · online", 15000]] as const;
const txnsFor = (account: string): Txn[] => {
  const now = Date.now();
  const normal = Array.from({ length: 3 }, (_, i) => {
    const [merchant, amount] = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    return { id: uid(), account, merchant, amount, at: new Date(now - (i + 1) * 3_600_000 * 5).toISOString(), flagged: false };
  });
  const [merchant, amount] = SUSPICIOUS[Math.floor(Math.random() * SUSPICIOUS.length)];
  return [{ id: uid(), account, merchant, amount, at: new Date(now - 600_000).toISOString(), flagged: true }, ...normal];
};

const deviceIcons: Record<DeviceType, typeof Laptop> = { laptop: Laptop, phone: Smartphone, tablet: Tablet, tv: Tv, iot: Cpu };
const limits: Record<string, { devices: number; family: number }> = {
  Starter: { devices: 1, family: 1 },
  Family: { devices: 10, family: 5 },
  Business: { devices: 100, family: 50 },
};
const settingLabels: Record<keyof Data["settings"], [string, string]> = {
  realtime: ["Real-time protection", "Block malware and phishing as it happens"],
  autoUpdate: ["Automatic updates", "Keep threat definitions current"],
  emailAlerts: ["Email alerts", "Get notified about new breaches and threats"],
  parental: ["Parental controls", "Filter content on children's devices"],
};
const uid = () => crypto.randomUUID();
const ago = (iso: string | null | undefined) => (iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : "never");

function detectDevice(): Pick<Device, "name" | "type"> {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return { name: "iPhone", type: "phone" };
  if (/iPad/.test(ua)) return { name: "iPad", type: "tablet" };
  if (/Android/.test(ua)) return { name: "Android phone", type: "phone" };
  if (/Mac/.test(ua)) return { name: "Mac", type: "laptop" };
  if (/Windows/.test(ua)) return { name: "Windows PC", type: "laptop" };
  return { name: "This computer", type: "laptop" };
}

const initialData = (user: User): Data => ({
  devices: [{ id: uid(), ...detectDevice(), status: "protected", lastScan: null }],
  events: [{ id: uid(), kind: "success", text: `Welcome to ${site.name}! Run your first scan to get started.`, at: new Date().toISOString() }],
  emails: [{ email: user.email, breaches: null }],
  family: [{ id: uid(), name: user.name, email: user.email, role: "Adult" }],
  vpn: false,
  settings: { realtime: true, autoUpdate: true, emailAlerts: false, parental: false },
  stats: { blocked: 0, phishing: 0, malware: 0 },
  brokers: null,
  accounts: [],
  txns: [],
});

function scores(d: Data) {
  const identity = d.emails.length
    ? Math.round(
        d.emails.reduce((s, e) => s + (e.breaches === null ? 50 : e.breaches.length === 0 || e.resolved ? 100 : Math.max(30, 90 - e.breaches.length * 5)), 0) /
          d.emails.length,
      )
    : 0;
  const devices = d.devices.length ? Math.round((d.devices.filter((x) => x.status === "protected" && x.lastScan).length / d.devices.length) * 100) : 0;
  const network = d.vpn ? 100 : 55;
  const settings = Math.round((Object.values(d.settings).filter(Boolean).length / 4) * 100);
  return { identity, devices, network, settings, overall: Math.round((identity + devices + network + settings) / 4) };
}

const grade = (s: number) =>
  s >= 85 ? { label: "Excellent", color: "text-emerald-500" } : s >= 65 ? { label: "Good", color: "text-sky-500" } : s >= 45 ? { label: "Fair", color: "text-amber-500" } : { label: "At risk", color: "text-red-500" };

/** Animates a number from its previous value to the new one (used for the score and KPI counters). */
function useTween(target: number, ms = 900) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const val = a + (target - a) * (1 - Math.pow(1 - p, 3));
      setV(val);
      from.current = val;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function ScoreRing({ value: target }: { value: number }) {
  const value = Math.round(useTween(target, 1400));
  const r = 52;
  const c = 2 * Math.PI * r;
  const g = grade(value);
  return (
    <div className="relative h-44 w-44 shrink-0 drop-shadow-[0_0_30px_hsl(var(--primary)/0.45)] sm:h-52 sm:w-52">
      <div className="absolute inset-[-10%] animate-[sweep_14s_linear_infinite] rounded-full border border-dashed border-primary/30" />
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="59" fill="none" strokeWidth="1.5" strokeDasharray="1 4.2" className="stroke-primary/40" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" stroke="url(#ring)" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-bold tracking-tighter">{value}</span>
        <span className={`font-mono text-[11px] font-semibold uppercase tracking-widest ${g.color}`}>{g.label}</span>
      </div>
    </div>
  );
}

function Kpi({ label, value, suffix = "", icon: Icon, tone, i }: { label: string; value: number; suffix?: string; icon: typeof Laptop; tone: string; i: number }) {
  const v = Math.round(useTween(value));
  return (
    <div onMouseMove={spot} className="dash-in card-surface spotlight relative overflow-hidden p-4 sm:p-5" style={{ animationDelay: `${120 + i * 80}ms` }}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{v}<span className="text-lg text-muted-foreground">{suffix}</span></p>
      <svg viewBox="0 0 120 28" className={`mt-2 h-7 w-full ${tone}`} preserveAspectRatio="none" aria-hidden>
        <path d={SPARKS[i % SPARKS.length]} fill="none" stroke="currentColor" strokeWidth="1.6" pathLength={100} className="spark-line" style={{ animationDelay: `${300 + i * 80}ms` }} />
      </svg>
    </div>
  );
}
const SPARKS = [
  "M0 22 L15 18 L30 20 L45 12 L60 14 L75 8 L90 10 L105 4 L120 6",
  "M0 24 L15 20 L30 21 L45 15 L60 17 L75 11 L90 13 L105 7 L120 3",
  "M0 14 L15 16 L30 10 L45 12 L60 8 L75 12 L90 6 L105 9 L120 5",
  "M0 6 L15 10 L30 8 L45 14 L60 12 L75 18 L90 16 L105 22 L120 20",
];

const CONSOLE_LINES: [string, string, string][] = [
  ["OK", "text-emerald-400", "Outbound DNS verified · no hijack detected"],
  ["BLOCK", "text-rose-400", "Tracker blocked · ads.doubleclick.example"],
  ["WATCH", "text-sky-400", "Dark-web index refreshed · 0 new matches"],
  ["OK", "text-emerald-400", "TLS certificate pinned · bank session"],
  ["BLOCK", "text-rose-400", "Phishing domain blocked · secure-kyc-update.xyz"],
  ["WARN", "text-amber-400", "Unknown device joined Wi-Fi · fingerprinting"],
  ["OK", "text-emerald-400", "Firewall rules applied · 214 active"],
  ["WATCH", "text-sky-400", "Breach feeds polled · 14 sources"],
  ["BLOCK", "text-rose-400", "Spoofed caller ID silenced · +91 140•••"],
  ["OK", "text-emerald-400", "Password vault integrity check passed"],
];

/** Terminal panel that streams (simulated) monitor events; faster and device-specific while a scan runs. */
function ShieldConsole({ scanning, deviceNames }: { scanning: boolean; deviceNames: string }) {
  const [lines, setLines] = useState<{ id: number; t: string; tag: string; c: string; msg: string }[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const n = useRef(0);
  useEffect(() => {
    const devices = deviceNames ? deviceNames.split("|") : [];
    const push = () => {
      const k = n.current++;
      const [tag, c, msg] = scanning && devices.length
        ? (["SCAN", "text-violet-400", `Inspecting ${devices[k % devices.length]} · ${["ports", "OS patches", "running apps", "Wi-Fi encryption"][k % 4]}`] as const)
        : CONSOLE_LINES[Math.floor(Math.random() * CONSOLE_LINES.length)];
      const t = new Date().toLocaleTimeString([], { hour12: false });
      setLines((l) => [...l.slice(-40), { id: k, t, tag, c, msg }]);
    };
    push();
    const iv = setInterval(push, scanning ? 380 : 1700);
    return () => clearInterval(iv);
  }, [scanning, deviceNames]);
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
  }, [lines]);
  return (
    <div ref={box} data-lenis-prevent className="h-56 overflow-y-auto rounded-xl border border-border/70 bg-black/60 p-4 font-mono text-[11px] leading-relaxed sm:text-xs">
      {lines.map((l) => (
        <p key={l.id} className="animate-fade-in whitespace-nowrap">
          <span className="text-muted-foreground/60">{l.t}</span> <span className={`${l.c} font-semibold`}>[{l.tag}]</span> <span className="text-foreground/85">{l.msg}</span>
        </p>
      ))}
      <p className="text-primary">› <span className="animate-pulse">▋</span></p>
    </div>
  );
}

const Panel = ({ title, icon: Icon, action, children, className = "", id }: { title: string; icon: typeof Laptop; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} onMouseMove={spot} className={`dash-in card-surface spotlight min-w-0 scroll-mt-24 p-5 transition-colors duration-300 hover:border-primary/40 sm:p-6 ${className}`}>
    <div className="relative mb-5 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary"><Icon className="h-3.5 w-3.5" /></span> {title}
      </h3>
      {action}
    </div>
    {children}
  </section>
);

const Dashboard = () => {
  const { user, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stored, setData] = useStoredState<Data>(`omnia:data:${user!.email}`, () => initialData(user!));
  const data: Data = { brokers: null, accounts: [], txns: [], ...stored }; // older saves lack newer fields
  const [, tick] = useState(0);
  const [account, setAccount] = useState("");
  const [scan, setScan] = useState<number | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "device" | "email" | "family" | "settings">(null);
  const [form, setForm] = useState({ name: "", email: "", type: "laptop" as DeviceType, role: "Adult" as Member["role"] });
  const timer = useRef<number>();

  const s = scores(data);
  const limit = limits[user!.plan] ?? limits.Starter;
  const firstName = user!.name.split(" ")[0];
  const hour = new Date().getHours();

  useEffect(() => () => clearInterval(timer.current), []);
  // re-render every 5s so broker removals and "x minutes ago" stay fresh
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(t); }, []);
  const brokerRemoved = (b: Broker) => b.status === "requested" && Date.now() - new Date(b.requestedAt!).getTime() > REMOVAL_MS;

  const scanBrokers = () => {
    const found = BROKERS.filter(() => Math.random() < 0.6).map((name) => ({ name, status: "found" as const }));
    patch({ brokers: found });
    log(found.length ? "warning" : "success", found.length ? `Your personal info was found on ${found.length} data broker sites` : "No data broker listings found");
  };
  const removeAll = () => {
    const at = new Date().toISOString();
    patch((d) => ({ brokers: (d.brokers ?? []).map((b) => (b.status === "found" ? { ...b, status: "requested", requestedAt: at } : b)) }));
    log("info", "Removal requests sent to data brokers");
    toast.success("Opt-out requests sent. We'll track them for you.");
  };
  const linkAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const name = account.trim();
    if (!name) return;
    patch((d) => ({ accounts: [...d.accounts, name], txns: [...txnsFor(name), ...d.txns].slice(0, 40) }));
    log("warning", `Monitoring ${name} — 1 suspicious transaction flagged`);
    toast.warning(`Suspicious transaction found on ${name}`);
    setAccount("");
  };
  const resolveTxn = (t: Txn, resolution: "mine" | "fraud") => {
    patch((d) => ({ txns: d.txns.map((x) => (x.id === t.id ? { ...x, resolution } : x)) }));
    if (resolution === "fraud") {
      patch((d) => ({ stats: { ...d.stats, blocked: d.stats.blocked + 1 } }));
      log("success", `Fraud reported: ₹${t.amount.toLocaleString("en-IN")} at ${t.merchant}. Card freeze requested.`);
      toast.success("Reported. We've asked your bank to freeze the card.");
    } else log("info", `Confirmed ₹${t.amount.toLocaleString("en-IN")} at ${t.merchant} as yours`);
  };

  const log = (kind: Event["kind"], text: string) =>
    setData((d) => ({ ...d, events: [{ id: uid(), kind, text, at: new Date().toISOString() }, ...d.events].slice(0, 30) }));
  const patch = (p: Partial<Data> | ((d: Data) => Partial<Data>)) => setData((d) => ({ ...d, ...(typeof p === "function" ? p(d) : p) }));

  const runScan = () => {
    if (scan !== null) return;
    setScan(0);
    timer.current = window.setInterval(() => {
      setScan((p) => {
        const next = (p ?? 0) + 4;
        if (next < 100) return next;
        clearInterval(timer.current);
        finishScan();
        return null;
      });
    }, 90);
  };

  const finishScan = () => {
    const now = new Date().toISOString();
    const issues = ["Operating system update available", "Weak Wi-Fi encryption (WPA)", "Default admin password detected", "Outdated browser extension"];
    let found = 0;
    setData((d) => {
      const devices = d.devices.map((dev) => {
        if (dev.status === "protected" && Math.random() < 0.2) {
          found++;
          return { ...dev, status: "at-risk" as const, issue: issues[Math.floor(Math.random() * issues.length)], lastScan: now };
        }
        return { ...dev, lastScan: now };
      });
      const blocked = Math.floor(Math.random() * 6);
      return {
        ...d,
        devices,
        stats: { blocked: d.stats.blocked + blocked, phishing: d.stats.phishing + (Math.random() < 0.3 ? 1 : 0), malware: d.stats.malware },
        events: [{ id: uid(), kind: found ? "warning" : "success", text: found ? `Scan complete — ${found} issue${found > 1 ? "s" : ""} need attention` : `Scan complete — ${devices.length} device${devices.length > 1 ? "s" : ""} secure`, at: now } as Event, ...d.events].slice(0, 30),
      };
    });
    setTimeout(() => (found ? toast.warning(`Scan found ${found} issue${found > 1 ? "s" : ""}`) : toast.success("Scan complete. Everything looks secure.")));
  };

  const fixDevice = (dev: Device) => {
    patch((d) => ({ devices: d.devices.map((x) => (x.id === dev.id ? { ...x, status: "protected", issue: undefined } : x)) }));
    log("success", `Fixed: ${dev.issue} on ${dev.name}`);
    toast.success(`${dev.name} is protected`);
  };

  const removeDevice = (dev: Device) => {
    patch((d) => ({ devices: d.devices.filter((x) => x.id !== dev.id) }));
    log("info", `Removed device ${dev.name}`);
  };

  const addDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.devices.length >= limit.devices) return toast.error(`Your ${user!.plan} plan covers ${limit.devices} device${limit.devices > 1 ? "s" : ""}. Upgrade in Settings.`);
    patch((d) => ({ devices: [...d.devices, { id: uid(), name: form.name.trim(), type: form.type, status: "protected", lastScan: null }] }));
    log("info", `Added device ${form.name.trim()}`);
    toast.success(`${form.name.trim()} added — run a scan to check it`);
    setDialog(null);
  };

  const checkEmail = async (email: string) => {
    setChecking(email);
    try {
      const breaches = await checkEmailBreaches(email);
      patch((d) => ({ emails: d.emails.map((x) => (x.email === email ? { ...x, breaches, resolved: false, checkedAt: new Date().toISOString() } : x)) }));
      log(breaches.length ? "warning" : "success", breaches.length ? `${email} found in ${breaches.length} breaches` : `${email} — no breaches found`);
      if (breaches.length) toast.warning(`${email} appears in ${breaches.length} breaches`);
      else toast.success(`No breaches for ${email}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setChecking(null);
    }
  };

  const addEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (data.emails.some((x) => x.email === email)) return toast.error("Already monitoring that email.");
    patch((d) => ({ emails: [...d.emails, { email, breaches: null }] }));
    setDialog(null);
    checkEmail(email);
  };

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.family.length >= limit.family) return toast.error(`Your ${user!.plan} plan covers ${limit.family} member${limit.family > 1 ? "s" : ""}. Upgrade in Settings.`);
    patch((d) => ({ family: [...d.family, { id: uid(), name: form.name.trim(), email: form.email.trim(), role: form.role }] }));
    log("info", `Added ${form.name.trim()} to your family plan`);
    setForm({ ...form, name: "", email: "" });
  };

  const toggleVpn = (on: boolean) => {
    patch({ vpn: on });
    log(on ? "success" : "warning", on ? "Secure VPN connected" : "Secure VPN disconnected");
  };

  const downloadReport = () => {
    const lines = [
      `${site.name} Security Report — ${new Date().toLocaleString()}`,
      `Account: ${user!.name} <${user!.email}> · Plan: ${user!.plan}`,
      "",
      `Overall score: ${s.overall}/100 (${grade(s.overall).label})`,
      `  Identity ${s.identity} · Devices ${s.devices} · Network ${s.network} · Protection settings ${s.settings}`,
      "",
      "DEVICES",
      ...data.devices.map((d) => `  - ${d.name} (${d.type}): ${d.status}${d.issue ? ` — ${d.issue}` : ""}; last scan ${ago(d.lastScan)}`),
      "",
      "MONITORED EMAILS",
      ...data.emails.map((e) => `  - ${e.email}: ${e.breaches === null ? "not checked" : e.breaches.length ? `${e.breaches.length} breaches (${e.breaches.join(", ")})${e.resolved ? " — resolved" : ""}` : "no breaches"}`),
      "",
      "THREATS (all time)",
      `  Blocked: ${data.stats.blocked} · Phishing: ${data.stats.phishing} · Malware: ${data.stats.malware}`,
      "",
      "RECENT ACTIVITY",
      ...data.events.map((e) => `  [${new Date(e.at).toLocaleString()}] ${e.text}`),
    ];
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" })),
      download: `omnia-report-${new Date().toISOString().slice(0, 10)}.txt`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Report downloaded");
  };

  const open = (which: NonNullable<typeof dialog>) => {
    setForm({ name: "", email: "", type: "laptop", role: "Adult" });
    setDialog(which);
  };

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: "smooth" });
  };
  const atRisk = data.devices.filter((d) => d.status === "at-risk").length;
  const breached = data.emails.filter((e) => e.breaches?.length && !e.resolved).length
    + data.txns.filter((t) => t.flagged && !t.resolution).length
    + (data.brokers ?? []).filter((b) => b.status === "found").length;

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"><Aurora /></div>

      <div id="overview" className="container scroll-mt-24 px-4 pt-6 sm:px-6 lg:px-8">
        <div className="glow-border dash-in !rounded-[2rem] shadow-card">
        <section className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-card">
          <div className={`absolute inset-0 transition-opacity duration-700 ${scan !== null ? "opacity-90" : "opacity-50"}`}>
            <ShieldField intensity={scan !== null ? 3 : 0.6} />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="relative flex flex-col items-center gap-8 p-6 sm:p-10 lg:flex-row lg:justify-between">
            <div className="w-full">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">// command center · {user!.plan} plan</p>
              <h1 className="mt-3 text-[2.6rem] leading-[0.95] sm:text-6xl lg:text-7xl">
                Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"},<br />
                <span className="accent-text">{firstName}.</span>
              </h1>
              <p className="mt-4 flex items-center gap-2 text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${atRisk + breached ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`} />
                {atRisk + breached ? `${atRisk + breached} item${atRisk + breached > 1 ? "s" : ""} need your attention` : "You're all caught up. Nice."}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <button onClick={runScan} disabled={scan !== null} className="btn-glow disabled:opacity-80">
                  <RefreshCw className={`h-4 w-4 ${scan !== null ? "animate-spin" : ""}`} />
                  {scan !== null ? `Scanning ${scan}%` : "Run full scan"}
                </button>
                <Link to="/tools#scam" className="btn-frame"><Bot className="h-4 w-4" /> Scam Shield</Link>
                <button onClick={() => open("settings")} className="btn-frame"><Settings className="h-4 w-4" /> Settings</button>
              </div>
            </div>
            <div className="order-first lg:order-none"><ScoreRing value={s.overall} /></div>
          </div>
          {scan !== null && <Progress value={scan} className="relative h-1 rounded-none" />}
        </section>
        </div>
      </div>

      <div className="container space-y-6 px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Kpi i={0} label="Security score" value={s.overall} suffix="/100" icon={ShieldCheck} tone="text-violet-400" />
          <Kpi i={1} label="Threats blocked" value={data.stats.blocked} icon={Activity} tone="text-emerald-400" />
          <Kpi i={2} label="Devices protected" value={data.devices.filter((d) => d.status === "protected" && d.lastScan).length} suffix={`/${data.devices.length}`} icon={Laptop} tone="text-cyan-400" />
          <Kpi i={3} label="Open issues" value={atRisk + breached} icon={AlertTriangle} tone={atRisk + breached ? "text-amber-400" : "text-emerald-400"} />
        </div>

        <Panel
          title="Live shield console"
          icon={Radar}
          action={<span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">simulated</span>}
        >
          <ShieldConsole scanning={scan !== null} deviceNames={data.devices.map((d) => d.name).join("|")} />
        </Panel>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Protection breakdown" icon={ShieldCheck} className="lg:col-span-2">
            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <div className="grid w-full gap-5 sm:grid-cols-2">
                {([
                  ["Identity", s.identity, Radar],
                  ["Devices", s.devices, Laptop],
                  ["Network", s.network, Globe],
                  ["Protection settings", s.settings, Settings],
                ] as const).map(([label, v, Icon]) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
                      <span className="font-semibold">{v}%</span>
                    </div>
                    <Progress value={v} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Recent activity" icon={Activity}>
            <ul className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {data.events.slice(0, 10).map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.kind === "warning" ? "bg-amber-500" : e.kind === "success" ? "bg-emerald-500" : "bg-sky-500"}`} />
                  <div className="min-w-0">
                    <p className="text-sm">{e.text}</p>
                    <p className="text-xs text-muted-foreground">{ago(e.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            id="devices"
            title={`Devices · ${data.devices.length} of ${limit.devices}`}
            icon={Laptop}
            action={<Button size="sm" variant="outline" onClick={() => open("device")}><Plus className="mr-1 h-4 w-4" /> Add</Button>}
          >
            <div className="space-y-3">
              {data.devices.length === 0 && <p className="text-sm text-muted-foreground">No devices yet. Add one to start protecting it.</p>}
              {data.devices.map((dev) => {
                const Icon = deviceIcons[dev.type];
                return (
                  <div key={dev.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="h-5 w-5 text-muted-foreground" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{dev.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{dev.issue ?? `Last scan ${ago(dev.lastScan)}`}</p>
                    </div>
                    {dev.status === "at-risk" ? (
                      <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-600 hover:text-amber-700 dark:text-amber-400" onClick={() => fixDevice(dev)}>
                        <Wrench className="mr-1 h-3.5 w-3.5" /> Fix
                      </Button>
                    ) : (
                      <Badge variant="secondary" className={dev.lastScan ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : ""}>
                        {dev.lastScan ? <><CheckCircle2 className="mr-1 h-3 w-3" /> Protected</> : "Not scanned"}
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => removeDevice(dev)} aria-label={`Remove ${dev.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel
            id="identity"
            title="Identity monitoring"
            icon={Radar}
            action={<Button size="sm" variant="outline" onClick={() => open("email")}><Plus className="mr-1 h-4 w-4" /> Add email</Button>}
          >
            <div className="space-y-3">
              {data.emails.map((e) => (
                <div key={e.email} className="rounded-xl border border-border/70 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"><Mail className="h-5 w-5 text-muted-foreground" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{e.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.breaches === null ? "Not checked yet" : e.breaches.length ? `${e.breaches.length} breaches${e.resolved ? " · resolved" : ""}` : "No breaches found"}
                        {e.checkedAt && ` · checked ${ago(e.checkedAt)}`}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => checkEmail(e.email)} disabled={checking === e.email}>
                      {checking === e.email ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                    </Button>
                    {e.email !== user!.email && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" aria-label={`Stop monitoring ${e.email}`} onClick={() => patch((d) => ({ emails: d.emails.filter((x) => x.email !== e.email) }))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!!e.breaches?.length && !e.resolved && (
                    <div className="mt-3 rounded-lg bg-red-500/5 p-3">
                      <p className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"><AlertTriangle className="h-4 w-4" /> Exposed in: {e.breaches.slice(0, 6).join(", ")}{e.breaches.length > 6 && ` +${e.breaches.length - 6} more`}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline"><Link to="/tools#password"><KeyRound className="mr-1 h-3.5 w-3.5" /> Check passwords</Link></Button>
                        <Button size="sm" variant="ghost" onClick={() => { patch((d) => ({ emails: d.emails.map((x) => (x.email === e.email ? { ...x, resolved: true } : x)) })); log("success", `Marked breaches for ${e.email} as resolved`); }}>
                          I've changed my passwords
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Data broker removal"
            icon={EyeOff}
            action={data.brokers?.some((b) => b.status === "found") ? <Button size="sm" className="bg-gradient-primary" onClick={removeAll}>Remove all</Button> : <Button size="sm" variant="outline" onClick={scanBrokers}>{data.brokers ? "Rescan" : "Scan"}</Button>}
          >
            {data.brokers === null ? (
              <p className="text-sm text-muted-foreground">People-search sites sell your name, phone and address. Scan to see where you're listed, then remove yourself in one click.</p>
            ) : data.brokers.length === 0 ? (
              <p className="text-sm text-emerald-500">No listings found. We'll keep watching.</p>
            ) : (
              <>
                <div className="mb-3 flex justify-between text-xs text-muted-foreground">
                  <span>{data.brokers.filter(brokerRemoved).length} of {data.brokers.length} removed</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono">PREVIEW</span>
                </div>
                <Progress value={(data.brokers.filter(brokerRemoved).length / data.brokers.length) * 100} className="mb-4 h-1.5" />
                <ul className="grid gap-2 sm:grid-cols-2">
                  {data.brokers.map((b) => {
                    const done = brokerRemoved(b);
                    return (
                      <li key={b.name} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm">
                        <span className="truncate">{b.name}</span>
                        <span className={`shrink-0 font-mono text-[11px] ${done ? "text-emerald-500" : b.status === "requested" ? "text-sky-500" : "text-red-500"}`}>
                          {done ? "REMOVED" : b.status === "requested" ? "IN PROGRESS" : "EXPOSED"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Panel>

          <Panel title="Financial fraud alerts" icon={CreditCard}>
            <form onSubmit={linkAccount} className="mb-4 flex gap-2">
              <Input placeholder="Account nickname, e.g. HDFC Credit Card" value={account} onChange={(e) => setAccount(e.target.value)} aria-label="Account nickname" />
              <Button type="submit" variant="outline" disabled={!account.trim()}><Plus className="mr-1 h-4 w-4" /> Link</Button>
            </form>
            {data.txns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Link a bank or card to get instant alerts on unusual transactions. Only a nickname is stored — never card numbers.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {data.txns.map((t) => (
                  <li key={t.id} className={`rounded-lg border p-3 ${t.flagged && !t.resolution ? "border-red-500/40 bg-red-500/5" : "border-border/70"}`}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{t.flagged && !t.resolution && <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5 text-red-500" />}{t.merchant}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.account} · {ago(t.at)}</p>
                      </div>
                      <span className="shrink-0 font-mono">₹{t.amount.toLocaleString("en-IN")}</span>
                    </div>
                    {t.flagged && !t.resolution && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => resolveTxn(t, "fraud")}>Not me — freeze</Button>
                        <Button size="sm" variant="ghost" onClick={() => resolveTxn(t, "mine")}>That was me</Button>
                      </div>
                    )}
                    {t.resolution && <p className={`mt-1 text-xs ${t.resolution === "fraud" ? "text-emerald-500" : "text-muted-foreground"}`}>{t.resolution === "fraud" ? "Reported as fraud · card freeze requested" : "Confirmed by you"}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Secure VPN" icon={Globe}>
            <div className="flex items-center justify-between rounded-xl border border-border/70 p-4">
              <div>
                <p className="font-medium">{data.vpn ? "Connected" : "Disconnected"}</p>
                <p className="text-xs text-muted-foreground">{data.vpn ? "Your traffic is encrypted" : "Turn on for public Wi-Fi"}</p>
              </div>
              <Switch checked={data.vpn} onCheckedChange={toggleVpn} aria-label="Toggle VPN" />
            </div>
            <div className={`mt-4 flex items-center gap-2 text-sm ${data.vpn ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              <span className={`h-2 w-2 rounded-full ${data.vpn ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
              {data.vpn ? "Protected network" : "Network not protected"}
            </div>
          </Panel>

          <Panel title="Threats blocked" icon={ShieldCheck} action={<Button size="sm" variant="outline" onClick={downloadReport}><Download className="mr-1 h-4 w-4" /> Report</Button>}>
            <div className="grid grid-cols-3 gap-3 text-center">
              {([["Blocked", data.stats.blocked, "text-emerald-500"], ["Phishing", data.stats.phishing, "text-amber-500"], ["Malware", data.stats.malware, "text-red-500"]] as const).map(([l, v, c]) => (
                <div key={l} className="rounded-xl bg-muted/60 p-3">
                  <div className={`text-2xl font-bold ${c}`}>{v}</div>
                  <div className="text-xs text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Download a full report of your devices, breaches and activity.</p>
          </Panel>

          <Panel title={`Family · ${data.family.length} of ${limit.family}`} icon={Users} action={<Button size="sm" variant="outline" onClick={() => open("family")}>Manage</Button>}>
            <div className="flex -space-x-2">
              {data.family.slice(0, 6).map((m) => (
                <div key={m.id} title={m.name} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-gradient-primary text-sm font-semibold text-white">
                  {m.name[0]?.toUpperCase()}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {limit.family > 1 ? "Add family members to protect their identity and devices too." : "Upgrade to Family to protect up to 5 people."}
            </p>
          </Panel>
        </div>
      </div>

      {scan !== null && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
          <div className="scan-beam absolute inset-x-0 h-40" />
          <div className="card-surface absolute bottom-24 left-4 px-4 py-3 font-mono text-xs sm:left-6">
            <p className="text-primary">SCANNING {scan}%</p>
            <p className="mt-1 text-muted-foreground">
              {scan < 25 ? "› checking devices…" : scan < 50 ? "› probing network & Wi-Fi…" : scan < 75 ? "› searching breach databases…" : "› analysing protection settings…"}
            </p>
          </div>
        </div>
      )}

      {/* Mobile dock */}
      <nav aria-label="Dashboard" className="fixed inset-x-3 bottom-3 z-[60] lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-border/80 bg-background/85 px-2 py-1.5 shadow-card backdrop-blur-xl">
          {([
            ["overview", "Overview", ShieldCheck],
            ["devices", "Devices", Laptop],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => jump(id)} className="flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] text-muted-foreground active:bg-muted">
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
          <button onClick={runScan} disabled={scan !== null} aria-label="Run full scan" className="-mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow ring-4 ring-background">
            {scan !== null ? <span className="font-mono text-xs font-semibold">{scan}%</span> : <RefreshCw className="h-6 w-6" />}
          </button>
          {([
            ["identity", "Identity", Radar],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => jump(id)} className="flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] text-muted-foreground active:bg-muted">
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
          <button onClick={() => open("settings")} className="flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] text-muted-foreground active:bg-muted">
            <Settings className="h-5 w-5" /> Settings
          </button>
        </div>
      </nav>

      {/* Dialogs */}
      <Dialog open={dialog === "device"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a device</DialogTitle>
            <DialogDescription>{data.devices.length} of {limit.devices} devices used on your {user!.plan} plan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addDevice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dev-name">Device name</Label>
              <Input id="dev-name" required placeholder="e.g. Living room TV" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as DeviceType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop / Desktop</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="tv">Smart TV</SelectItem>
                  <SelectItem value="iot">Smart home / IoT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit" className="bg-gradient-primary">Add device</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "email"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monitor another email</DialogTitle>
            <DialogDescription>We'll check it against known data breaches right away.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addEmail} className="space-y-4">
            <Input type="email" required placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-label="Email to monitor" />
            <DialogFooter><Button type="submit" className="bg-gradient-primary">Add & check</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "family"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Family members</DialogTitle>
            <DialogDescription>{data.family.length} of {limit.family} members on your {user!.plan} plan.</DialogDescription>
          </DialogHeader>
          <ul className="max-h-60 space-y-2 overflow-y-auto">
            {data.family.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-lg border border-border/70 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">{m.name[0]?.toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name} <span className="text-xs font-normal text-muted-foreground">· {m.role}</span></p>
                  <p className="truncate text-xs text-muted-foreground">{m.email || "No email"}</p>
                </div>
                {m.email !== user!.email && (
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Remove ${m.name}`} onClick={() => patch((d) => ({ family: d.family.filter((x) => x.id !== m.id) }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={addMember} className="grid gap-2 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto_auto]">
            <Input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Member name" />
            <Input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-label="Member email" />
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Member["role"] })}>
              <SelectTrigger className="sm:w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Adult">Adult</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-gradient-primary"><Plus className="h-4 w-4" /></Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "settings"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>{user!.name} · {user!.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(Object.keys(settingLabels) as (keyof Data["settings"])[]).map((k) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{settingLabels[k][0]}</p>
                  <p className="text-xs text-muted-foreground">{settingLabels[k][1]}</p>
                </div>
                <Switch
                  checked={data.settings[k]}
                  onCheckedChange={(v) => {
                    patch((d) => ({ settings: { ...d.settings, [k]: v } }));
                    log(v ? "success" : "warning", `${settingLabels[k][0]} turned ${v ? "on" : "off"}`);
                  }}
                  aria-label={settingLabels[k][0]}
                />
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium">Plan</p>
                <p className="text-xs text-muted-foreground">Change your subscription</p>
              </div>
              <Select
                value={user!.plan}
                onValueChange={(plan) => {
                  updateUser({ plan });
                  log("info", `Switched to the ${plan} plan`);
                  toast.success(`You're now on the ${plan} plan`);
                }}
              >
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(limits).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-border pt-4 sm:justify-between">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (!confirm("Reset all dashboard data (devices, emails, family, activity)?")) return;
                setData(initialData(user!));
                setDialog(null);
                toast.success("Dashboard reset");
              }}
            >
              Reset data
            </Button>
            <Button variant="outline" onClick={() => { signOut(); navigate("/"); }}>Sign out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
