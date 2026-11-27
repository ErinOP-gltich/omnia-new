import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BreachCheck } from "@/components/BreachCheck";
import { Aurora, CountUp, GlowCard, ProductPreview, Reveal, RotatingWord, ThreatTicker, Tilt, spot } from "@/components/Fx";
import { ShieldField } from "@/components/ShieldField";
import { StoryScroll } from "@/components/StoryScroll";
import { SectionIndex, SectionRail } from "@/components/Blueprint";
import { Eyebrow, GradientText, SectionHeading } from "@/components/Section";
import { site } from "@/config/site";
import {
  AlertTriangle, ArrowRight, Baby, Lock, MapPin, MessageSquareText, Bot, Building2, Check, CreditCard, Eye, EyeOff, Globe, KeyRound, LifeBuoy, Minus,
  Laptop, Monitor, MousePointerClick, PhoneOff, Router, Tablet, Tv, Radar as RadarIcon, ScanLine, ShieldCheck, Smartphone, Sparkles, Wifi,
} from "lucide-react";

type Status = "live" | "preview" | "dev";
const lineup: { name: [string, string]; cat: string; icon: typeof Bot; text: string; status: Status; href?: string }[] = [
  { name: ["ID", "Guard"], cat: "Identity", icon: RadarIcon, text: "Breach and dark-web monitoring for your email, phone, PAN, Aadhaar and passport.", status: "live", href: "/tools#breach" },
  { name: ["Scam", "Shield"], cat: "AI detection", icon: Bot, text: "Paste any SMS, email or WhatsApp message and get a scam score with the reasons.", status: "live", href: "/tools#scam" },
  { name: ["Pass", "Check"], cat: "Passwords", icon: KeyRound, text: "Private leak checks (k-anonymity) plus a secure password generator.", status: "live", href: "/tools#password" },
  { name: ["Link", "Scan"], cat: "Safe browsing", icon: MousePointerClick, text: "Spot phishing tricks and look-alike domains before you click.", status: "live", href: "/tools#link" },
  { name: ["Fraud", "Alert"], cat: "Finance", icon: CreditCard, text: "Unusual transactions and new credit inquiries flagged the moment they happen.", status: "preview", href: "/dashboard" },
  { name: ["Broker", "Wipe"], cat: "Privacy", icon: EyeOff, text: "Finds people-search listings selling your info and files removal requests.", status: "preview", href: "/dashboard" },
  { name: ["Virus", "Guard"], cat: "Devices", icon: Smartphone, text: "Malware and ransomware protection for every phone and computer.", status: "dev" },
  { name: ["Safe", "VPN"], cat: "Network", icon: Globe, text: "Encrypted traffic that switches on by itself on unsafe Wi-Fi.", status: "dev" },
  { name: ["Call", "Block"], cat: "Phone", icon: PhoneOff, text: "Silences robocalls and spoofed numbers before your phone rings.", status: "dev" },
  { name: ["Kid", "Safe"], cat: "Family", icon: Baby, text: "Screen-time, safe search and gaming-chat monitoring for kids.", status: "dev" },
  { name: ["Home", "Shield"], cat: "Smart home", icon: Wifi, text: "Finds vulnerable cameras, TVs and routers and locks them down.", status: "dev" },
  { name: ["Rescue", "Desk"], cat: "Support", icon: LifeBuoy, text: "Human specialists to walk you through identity-theft recovery.", status: "dev" },
  { name: ["OMNIA ", "Teams"], cat: "Business", icon: Building2, text: "Endpoint detection, team dashboards and compliance reports.", status: "dev", href: "/contact?topic=sales" },
];
const sectionIndex = [
  { id: "free-scan", label: "Free scan" },
  { id: "command", label: "Command center" },
  { id: "features", label: "Lineup" },
  { id: "savings", label: "Savings" },
  { id: "compare", label: "Compare" },
  { id: "how", label: "How it works" },
  { id: "principles", label: "Principles" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];
const lineupColors = ["#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#10b981", "#84cc16", "#eab308", "#f59e0b", "#f97316", "#ef4444", "#ec4899"];
const statusTag: Record<Status, [string, string]> = {
  live: ["Live · free", "border-emerald-500/40 text-emerald-400"],
  preview: ["Preview in dashboard", "border-sky-500/40 text-sky-400"],
  dev: ["In development", "border-amber-500/40 text-amber-400"],
};

const principles = [
  { icon: Lock, title: "Private by design", text: "Password checks use k-anonymity — your password never leaves your device. We never sell data. Ever." },
  { icon: Eye, title: "No dark patterns", text: "Free tools need no sign-up. No fake countdowns, no scare tactics, and cancelling takes two clicks." },
  { icon: MessageSquareText, title: "Plain language", text: "Every alert says what happened and the one thing to do next. No jargon, no 40-page reports." },
  { icon: MapPin, title: "Built for India first", text: "UPI fraud, fake KYC, courier and job scams are first-class threats here, not an afterthought." },
];

const separate = [
  { name: "Identity monitoring", price: 12 },
  { name: "Antivirus suite", price: 5 },
  { name: "VPN", price: 10 },
  { name: "Password manager", price: 3 },
  { name: "Data broker removal", price: 10 },
  { name: "Parental controls", price: 5 },
  { name: "Spam call blocker", price: 4 },
];

const compare = [
  ["Dark-web & identity monitoring", true, true, false],
  ["Credit & fraud alerts", true, true, false],
  ["Data broker removal", true, "partial", false],
  ["AI scam message detection", true, false, false],
  ["Antivirus & safe browsing", true, "partial", true],
  ["VPN", true, true, "partial"],
  ["Password vault & leak checker", true, true, "partial"],
  ["Smart home / IoT defense", true, false, false],
  ["Parental controls", true, true, "partial"],
  ["Business & team plans", true, false, true],
] as const;

const plans = [
  { name: "Starter", monthly: 0, blurb: "Try OMNIA on one device", features: ["1 device", "Email breach alerts", "AI Scam Shield (5/day)", "Password leak checker", "Security score"], cta: "Get started free", href: "/login?mode=signup&plan=Starter" },
  { name: "Family", monthly: 12.99, yearly: 9.99, popular: true, blurb: "Everything, for up to 5 people", features: ["Up to 10 devices", "Identity, credit & dark-web monitoring", "Data broker removal", "VPN + safe browsing", "Spam call blocker", "Parental controls", "24/7 restoration experts"], cta: "Start 14-day trial", href: "/login?mode=signup&plan=Family" },
  { name: "Business", blurb: "Control and compliance for teams", features: ["Everything in Family", "Endpoint detection & response", "Team management", "Compliance reports", "Dedicated security manager"], cta: "Talk to sales", href: "/contact?topic=sales" },
];

const faqs = [
  { q: "Is the breach scan on this page real?", a: "Yes. It checks your email against a public database of billions of leaked records. We don't store the email you enter." },
  { q: "How is OMNIA different from buying separate apps?", a: "One subscription, one app and one dashboard replace 5–7 tools — identity monitoring, antivirus, VPN, password manager, data removal and more — for a fraction of the combined price." },
  { q: "Which devices are supported?", a: "Windows, macOS, Android and iOS, plus smart TVs, cameras and routers on your home network." },
  { q: "Can I cancel any time?", a: "Yes. Monthly plans can be cancelled any time; yearly plans come with a 30-day money-back guarantee." },
  { q: "Do you sell my data?", a: "Never. Removing your data from the internet is literally one of our features." },
];

const Mark = ({ v }: { v: boolean | string }) =>
  v === true ? <Check className="mx-auto h-5 w-5 text-emerald-400" /> : v === "partial" ? <span className="text-xs text-amber-400">Partial</span> : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />;

const Home = () => {
  const [yearly, setYearly] = useState(true);
  const [blocked, setBlocked] = useState(0);
  const [picked, setPicked] = useState(() => new Set(separate.map((s) => s.name)));
  const total = separate.filter((s) => picked.has(s.name)).reduce((a, s) => a + s.price, 0);
  const toggle = (n: string) => setPicked((p) => { const x = new Set(p); if (!x.delete(n)) x.add(n); return x; });

  return (
    <div>
      <SectionIndex items={sectionIndex} />
      {/* HERO */}
      <section onMouseMove={spot} className="spotlight spotlight-lg relative overflow-hidden bg-gradient-hero">
        <div className="bg-grid absolute inset-0" />
        <div className="container relative grid items-center gap-12 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-24 lg:pt-40">
          <div className="animate-fade-up">
            <Link to="/tools" className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card/60 px-3 py-1.5 font-mono text-xs backdrop-blur transition-colors hover:border-primary/50">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400" /> 6 FREE TOOLS LIVE
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <h1 className="mt-7 text-[3.3rem] leading-[0.92] sm:text-7xl lg:text-[6.2rem]">
              <span className="outline-text">Your digital</span>
              <br />
              life, <RotatingWord className="pb-[0.08em]" words={["untouchable.", "unhackable.", "unbreachable.", "invisible.", "protected."]} />
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {site.name} fuses identity theft protection, antivirus, VPN, data-broker removal and AI scam detection into one ridiculously simple app.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/login?mode=signup" className="btn-glow">Get protected free <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/tools" className="btn-box">Try the free tools</Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[["13", "layers"], ["24/7", "watch"], ["0", "data sold"]].map(([v, l]) => (
                <div key={l} className="rounded-xl border border-border/70 bg-card/40 px-3 py-2.5 backdrop-blur">
                  <p className="font-display text-2xl font-bold">{v}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-border/70 bg-card/30 shadow-card backdrop-blur">
              <ShieldField onBlock={() => setBlocked((n) => n + 1)} />
              <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-white/10 bg-background/70 shadow-glow backdrop-blur-xl">
                <LogoMark className="h-14 w-14" />
              </div>
              <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> threat simulation</span>
                <span>blocked <span className="text-emerald-400">{blocked.toString().padStart(3, "0")}</span></span>
              </div>
              <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">move · click the shield</p>
            </div>
            {([
              ["-left-3 top-[16%] sm:-left-8", AlertTriangle, "text-amber-400", "Breach detected", "LinkedIn · 2 passwords"],
              ["-right-3 top-[30%] sm:-right-8 [animation-delay:-2s]", Globe, "text-cyan-400", "VPN secured", "AES-256 · Mumbai"],
              ["-left-3 bottom-[14%] sm:-left-10 [animation-delay:-4s]", EyeOff, "text-fuchsia-400", "Data broker removed", "PeopleFinder"],
            ] as const).map(([pos, Icon, c, t, sub]) => (
              <div key={t} className={`card-surface absolute hidden animate-float items-center gap-3 px-3.5 py-2.5 sm:flex ${pos}`}>
                <Icon className={`h-4 w-4 ${c}`} />
                <div className="leading-tight">
                  <p className="text-xs font-semibold">{t}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ThreatTicker />
      </section>

      {/* BREACH SCAN */}
      <div id="free-scan" className="scroll-mt-16">
        <SectionRail n="01" label="Free breach scan" right="Real data · 3 seconds" />
      <section className="relative bg-background py-20">
        <div className="container max-w-3xl px-4 sm:px-6 lg:px-8">
          <GlowCard>
            <div className="p-6 sm:p-10">
              <div className="text-center">
                <Eyebrow>Free · real · instant</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Has your email been leaked?</h2>
                <p className="mt-3 text-muted-foreground">Check against billions of breached records. Takes 3 seconds.</p>
              </div>
              <div className="mt-8"><BreachCheck /></div>
            </div>
          </GlowCard>
        </div>
      </section>
      </div>

      {/* STATS */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="container grid grid-cols-2 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { to: 13, suffix: "", label: "Protection layers" },
            { to: 60, suffix: "s", label: "First full scan" },
            { to: 24, suffix: "/7", label: "Monitoring" },
            { to: 70, suffix: "%", label: "Cheaper than separate apps" },
          ].map((s) => (
            <div key={s.label} className="border-border/60 px-4 py-10 text-center [&:not(:last-child)]:md:border-r">
              <div className="font-display text-4xl font-bold tracking-tight sm:text-5xl"><GradientText><CountUp to={s.to} suffix={s.suffix} /></GradientText></div>
              <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <div id="command" className="scroll-mt-16">
        <SectionRail n="02" label="Command center" right="Dashboard preview" />
      <section className="relative overflow-hidden bg-background py-24 lg:py-32">
        <div className="container px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Your command center" title={<>Every threat. <GradientText>One glance.</GradientText></>} subtitle="Your score, live alerts and one-tap fixes for every device and family member — in a dashboard you'll actually understand." />
          <Reveal>
            <Tilt max={4} className="mx-auto max-w-5xl">
              <ProductPreview />
            </Tilt>
          </Reveal>
        </div>
      </section>
      </div>

      {/* PLATFORMS */}
      <section className="border-y border-border/60 bg-card/30 py-10">
        <div className="container flex flex-col items-center gap-6 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Protects every screen you own</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {([[Monitor, "Windows"], [Laptop, "macOS"], [Smartphone, "Android"], [Tablet, "iOS & iPadOS"], [Tv, "Smart TVs"], [Router, "Routers & IoT"], [Globe, "Browsers"]] as const).map(([Icon, label]) => (
              <span key={label} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Icon className="h-4 w-4" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* LINEUP */}
      <div id="features" className="scroll-mt-16">
        <SectionRail n="03" label="The lineup" right="13 modules · 4 live" />
      <section className="bg-background py-20 lg:py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <h2 className="text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Every layer you need.
              <br />
              <span className="accent-text">Nothing you don't.</span>
            </h2>
            <div>
              <p className="text-lg text-muted-foreground">Thirteen protection modules under one subscription. Four are live and free right now — the rest are rolling out module by module.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to="/tools" className="btn-box btn-box-solid">Try live modules <ArrowRight className="h-3.5 w-3.5" /></Link>
                <Link to="/#pricing" className="btn-box">See pricing</Link>
              </div>
            </div>
          </Reveal>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:hidden">Swipe →</p>
          <div className="snap-rail sm:grid-cols-2 lg:grid-cols-4">
            {lineup.map((m, i) => {
              const c = lineupColors[i];
              const [tag, tagCls] = statusTag[m.status];
              return (
                <div key={m.cat} onMouseMove={spot} className="spotlight group flex flex-col p-6 transition-colors hover:!bg-card">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="px-1.5 py-0.5 font-semibold text-black" style={{ background: c }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{m.cat}</span>
                  </div>
                  <div
                    className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-6"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}88)`, boxShadow: `0 12px 30px -12px ${c}` }}
                  >
                    <m.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                    {m.name[0]}<span style={{ color: c }}>{m.name[1]}</span>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-wider">
                    <span className={`border px-1.5 py-0.5 ${tagCls}`}>{tag}</span>
                    <span className="border border-border px-1.5 py-0.5 text-muted-foreground">{m.status === "dev" ? "Planned" : "Web"}</span>
                  </div>
                  <Link
                    to={m.href ?? "/contact?topic=general"}
                    className="mt-3 inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {m.status === "dev" && !m.href ? "Get notified" : `Open ${m.name.join("").trim()}`} ↗
                  </Link>
                </div>
              );
            })}
            <div className="relative flex flex-col justify-between gap-6 overflow-hidden p-8 sm:col-span-1 lg:col-span-3">
              <div className="bg-grid absolute inset-0 opacity-60" />
              <p className="relative font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                13 modules. <span className="accent-text">One subscription.</span>
                <br />
                <span className="text-muted-foreground">Less than one streaming plan.</span>
              </p>
              <div className="relative flex flex-wrap gap-2">
                <Link to="/login?mode=signup" className="btn-box btn-box-solid">Start free <ArrowRight className="h-3.5 w-3.5" /></Link>
                <Link to="/contact?topic=general" className="btn-box">Suggest a module</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* SAVINGS CALCULATOR */}
      <div id="savings" className="scroll-mt-16">
        <SectionRail n="04" label="Savings" right="Calculator" />
      <section className="relative overflow-hidden border-y border-border/60 bg-card/30 py-24">
        <div className="container grid items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Eyebrow>Savings calculator</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Stop paying 7 times for <GradientText>one job</GradientText></h2>
            <p className="mt-5 text-lg text-muted-foreground">Tick what you'd buy separately. Approximate typical market prices.</p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {separate.map((s) => (
                <button key={s.name} onClick={() => toggle(s.name)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${picked.has(s.name) ? "border-primary/50 bg-primary/10" : "border-border/70 bg-card/40 text-muted-foreground"}`}>
                  <span className="flex items-center gap-2.5">
                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${picked.has(s.name) ? "border-primary bg-primary text-white" : "border-border"}`}>{picked.has(s.name) && <Check className="h-3 w-3" />}</span>
                    {s.name}
                  </span>
                  <span className="font-mono">${s.price}</span>
                </button>
              ))}
            </div>
          </div>
          <GlowCard>
            <div className="p-8 text-center sm:p-12">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Separately</p>
              <p className="mt-2 font-display text-5xl font-bold text-muted-foreground line-through decoration-red-400/70">${total}<span className="text-2xl">/mo</span></p>
              <p className="mt-8 font-mono text-xs uppercase tracking-wider text-muted-foreground">With {site.name} Family</p>
              <p className="mt-2 font-display text-6xl font-extrabold"><GradientText>$9.99</GradientText><span className="text-2xl text-muted-foreground">/mo</span></p>
              <p className="mt-6 inline-flex rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold text-emerald-400">
                You save ${Math.max(0, (total - 9.99) * 12).toFixed(0)} a year
              </p>
              <Button asChild size="lg" className="mt-8 w-full bg-gradient-primary shadow-glow">
                <Link to="/login?mode=signup&plan=Family">Claim the savings</Link>
              </Button>
            </div>
          </GlowCard>
        </div>
      </section>
      </div>

      {/* COMPARISON */}
      <div id="compare" className="scroll-mt-16">
        <SectionRail n="05" label="Compare" />
      <section className="bg-background py-24">
        <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Compare" title="Why settle for half the protection?" />
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:hidden">Swipe to compare →</p>
          <div data-lenis-prevent className="card-surface overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left">
                  <th className="sticky left-0 z-10 bg-card p-4 font-medium text-muted-foreground">Feature</th>
                  <th className="bg-primary/10 p-4 text-center font-display text-base font-bold text-primary">{site.name}</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">Typical identity app</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">Typical antivirus</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([f, a, b, c]) => (
                  <tr key={f} className="border-b border-border/40 last:border-0">
                    <td className="sticky left-0 z-10 bg-card p-4">{f}</td>
                    <td className="bg-primary/5 p-4 text-center"><Mark v={a} /></td>
                    <td className="p-4 text-center"><Mark v={b} /></td>
                    <td className="p-4 text-center"><Mark v={c} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </div>

      {/* HOW IT PROTECTS (pinned scroll story) */}
      <div id="how" className="scroll-mt-16">
        <SectionRail n="06" label="How it works" right="4 layers" />
        <StoryScroll />
      </div>

      {/* PRINCIPLES */}
      <div id="principles" className="scroll-mt-16">
        <SectionRail n="07" label="Principles" right="4 rules" />
      <section className="bg-background py-20 lg:py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
            <h2 className="text-5xl leading-[0.95] sm:text-6xl">
              Security, <span className="accent-text">without the creep.</span>
            </h2>
            <p className="text-lg text-muted-foreground">The rules we build OMNIA by. If a feature breaks one of these, it doesn't ship.</p>
          </Reveal>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:hidden">Swipe →</p>
          <div className="snap-rail sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <div key={p.title} onMouseMove={spot} className="spotlight group p-7 transition-colors hover:!bg-card">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center border border-border bg-card text-primary transition-colors group-hover:border-primary/60">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-10 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* PRICING */}
      <div id="pricing" className="scroll-mt-16">
        <SectionRail n="08" label="Pricing" right="Monthly · yearly" />
      <section className="scroll-mt-24 bg-background py-24 lg:py-32">
        <div className="container px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Pricing" title="Simple plans. Serious protection." subtitle="Start free. Upgrade when you're ready." />
          <div className="mb-12 flex items-center justify-center gap-3 text-sm">
            <span className={yearly ? "text-muted-foreground" : "font-medium"}>Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Bill yearly" />
            <span className={yearly ? "font-medium" : "text-muted-foreground"}>Yearly</span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">Save 23%</span>
          </div>
          <div className="mx-auto grid max-w-6xl items-stretch gap-6 md:grid-cols-3">
            {plans.map((p) => {
              const price = p.monthly === undefined ? null : yearly && p.yearly ? p.yearly : p.monthly;
              const body = (
                <div className="flex h-full flex-col p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    {p.popular && <span className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
                  <div className="mt-8 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold tracking-tight">{price === null ? "Custom" : price === 0 ? "Free" : `$${price}`}</span>
                    {!!price && <span className="text-muted-foreground">/mo</span>}
                  </div>
                  <p className="mt-1 h-5 text-xs text-muted-foreground">{!!price && (yearly ? `Billed $${(price * 12).toFixed(2)} yearly` : "Billed monthly")}</p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}</li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className={`mt-8 w-full ${p.popular ? "bg-gradient-primary shadow-glow" : ""}`} variant={p.popular ? "default" : "outline"}>
                    <Link to={p.href}>{p.cta}</Link>
                  </Button>
                </div>
              );
              return p.popular ? <GlowCard key={p.name} className="md:-my-4">{body}</GlowCard> : <div key={p.name} className="card-surface">{body}</div>;
            })}
          </div>
        </div>
      </section>
      </div>

      {/* FAQ */}
      <div id="faq" className="scroll-mt-16">
        <SectionRail n="09" label="FAQ" />
      <section className="border-t border-border/60 bg-card/30 py-24">
        <div className="container max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <Accordion type="single" collapsible className="card-surface divide-y divide-border/60 px-6">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-0">
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      </div>

      {/* FOUNDER */}
      <section className="bg-background py-20">
        <div className="container max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Link to="/about#founder" onMouseMove={spot} className="card-surface spotlight group flex flex-col items-center gap-6 p-6 text-center transition-colors hover:border-primary/40 sm:flex-row sm:p-8 sm:text-left">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-2 ring-primary/40">
                <img src={site.founder.photo} alt={site.founder.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-primary opacity-70 mix-blend-color" />
              </div>
              <div className="flex-1">
                <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">“Security tools are either powerful and confusing, or simple and shallow. {site.name} is both powerful <GradientText>and</GradientText> simple.”</p>
                <p className="mt-3 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{site.founder.name}</span> · {site.founder.role}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-background py-28">
        <Aurora />
        <div className="container relative px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Hackers don't take days off. <GradientText>Neither do we.</GradientText>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Create a free account and get your personal security score in under a minute.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-gradient-primary px-8 text-base shadow-glow transition-transform hover:scale-[1.03]">
              <Link to="/login?mode=signup">Get protected free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 bg-card/40 px-8 text-base backdrop-blur">
              <Link to="/contact?topic=sales">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
