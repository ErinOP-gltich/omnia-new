import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/Logo";
import { AlertTriangle, Globe, ShieldCheck, Trash2, Zap } from "lucide-react";

/** onMouseMove handler that feeds the .spotlight hover glow. */
export const spot = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
};

/** Page background: drifting aurora blobs + grid. Place inside a `relative overflow-hidden` parent. */
export const Aurora = () => (
  <>
    <div className="bg-grid absolute inset-0" />
    <div className="aurora -left-32 top-0 h-[28rem] w-[28rem] bg-violet-600/25 dark:bg-violet-600/30" />
    <div className="aurora right-[-10rem] top-20 h-[32rem] w-[32rem] bg-cyan-500/20 [animation-delay:-6s]" />
    <div className="aurora bottom-[-12rem] left-1/3 h-[26rem] w-[26rem] bg-fuchsia-500/15 [animation-delay:-12s]" />
  </>
);

const chips = [
  { icon: AlertTriangle, text: "Breach detected", sub: "LinkedIn · 2 passwords", cls: "left-0 top-6 sm:-left-6", color: "text-amber-400" },
  { icon: Globe, text: "VPN secured", sub: "AES-256 · Mumbai", cls: "right-0 top-1/3 sm:-right-8 [animation-delay:-2s]", color: "text-cyan-400" },
  { icon: Trash2, text: "Data broker removed", sub: "PeopleFinder", cls: "bottom-10 left-2 sm:-left-10 [animation-delay:-4s]", color: "text-fuchsia-400" },
  { icon: Zap, text: "Phishing blocked", sub: "fake-bank-login.xyz", cls: "-bottom-2 right-4 [animation-delay:-3s]", color: "text-emerald-400" },
];

/** Animated radar visual for the hero. */
export function Radar() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <div className="absolute inset-0 rounded-full border border-primary/20 bg-[radial-gradient(circle,hsl(var(--primary)/0.12),transparent_70%)]" />
      {[0.75, 0.5, 0.25].map((s) => (
        <div key={s} className="absolute rounded-full border border-primary/15" style={{ inset: `${(1 - s) * 50}%` }} />
      ))}
      <div className="absolute inset-x-0 top-1/2 h-px bg-primary/15" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-primary/15" />
      <div className="absolute inset-0 animate-sweep rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,hsl(var(--primary-glow)/0.45)_360deg)]" />
      {[
        ["22%", "30%", "bg-amber-400"],
        ["68%", "24%", "bg-emerald-400"],
        ["74%", "66%", "bg-red-400"],
        ["30%", "72%", "bg-cyan-400"],
      ].map(([l, t, c], i) => (
        <span key={i} className="absolute h-2.5 w-2.5" style={{ left: l, top: t }}>
          <span className={`absolute inset-0 animate-ping-slow rounded-full ${c}`} style={{ animationDelay: `${i * 0.6}s` }} />
          <span className={`absolute inset-0 rounded-full ${c} shadow-[0_0_12px_currentColor]`} />
        </span>
      ))}
      <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-white/10 bg-card/80 shadow-glow backdrop-blur-xl">
        <LogoMark className="h-14 w-14" />
      </div>
      {chips.map((c) => (
        <div key={c.text} className={`card-surface absolute flex animate-float items-center gap-3 px-3.5 py-2.5 ${c.cls}`}>
          <c.icon className={`h-4 w-4 ${c.color}`} />
          <div className="leading-tight">
            <p className="text-xs font-semibold">{c.text}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const feed = [
  ["PHISHING", "Fake delivery SMS blocked", "text-amber-400"],
  ["BREACH", "Credentials found on dark-web forum", "text-red-400"],
  ["MALWARE", "Trojan quarantined on Android", "text-fuchsia-400"],
  ["PRIVACY", "Home address removed from data broker", "text-cyan-400"],
  ["FRAUD", "Unusual ₹48,000 card transaction flagged", "text-amber-400"],
  ["WI-FI", "Unsecured hotspot — VPN auto-enabled", "text-emerald-400"],
  ["SPAM", "Robocall from spoofed number blocked", "text-violet-400"],
  ["IoT", "Smart camera default password fixed", "text-cyan-400"],
] as const;

/** Infinite marquee of the kinds of threats OMNIA stops. */
export const ThreatTicker = () => (
  <div className="relative overflow-hidden border-y border-border/60 bg-card/40 py-3 backdrop-blur [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
    <div className="marquee flex w-max gap-10">
      {[...feed, ...feed].map(([tag, text, c], i) => (
        <span key={i} className="flex shrink-0 items-center gap-2.5 font-mono text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className={`font-semibold ${c}`}>{tag}</span>
          <span className="text-muted-foreground">{text}</span>
        </span>
      ))}
    </div>
  </div>
);

/** Number that counts up when scrolled into view. */
export function CountUp({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1400);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

/** Card with animated rainbow border. */
export const GlowCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`glow-border ${className}`}>
    <div className="glow-inner">{children}</div>
  </div>
);

/** Fades/slides children in when they scroll into view. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShown(true), io.disconnect()), { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Cycles through words with a slide-up swap. */
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      {/* invisible longest word reserves width so the line doesn't jump */}
      <span className="invisible col-start-1 row-start-1">{words.reduce((a, b) => (b.length > a.length ? b : a))}</span>
      <span key={i} className="col-start-1 row-start-1 animate-word-in bg-gradient-primary bg-clip-text text-transparent">{words[i]}</span>
    </span>
  );
}

/** 3D tilt toward the cursor. */
export function Tilt({ children, className = "", max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg)`;
  };
  const leave = () => (ref.current!.style.transform = "");
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-200 ease-out ${className}`}>
      {children}
    </div>
  );
}

/** Thin gradient bar at the top showing scroll progress. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      if (ref.current) ref.current.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div ref={ref} className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-gradient-primary" />;
}

const previewFeed = [
  ["bg-red-400", "Password for you@gmail.com found in new leak", "now"],
  ["bg-emerald-400", "Phishing link blocked in WhatsApp", "2m"],
  ["bg-cyan-400", "VPN auto-connected on Airport Wi-Fi", "9m"],
  ["bg-fuchsia-400", "Removed from 3 data broker sites", "1h"],
  ["bg-amber-400", "₹48,000 card charge flagged", "3h"],
];

/** Animated mock of the OMNIA dashboard in a browser frame, used as the product shot. */
export function ProductPreview() {
  return (
    <div className="relative">
      {/* soft halo via radial gradients: no blur filter, so nothing can clip it into hard edges */}
      <div className="pointer-events-none absolute -inset-x-24 -inset-y-16 [background:radial-gradient(ellipse_45%_55%_at_20%_60%,hsl(262_90%_60%/0.28),transparent_70%),radial-gradient(ellipse_45%_55%_at_80%_60%,hsl(190_95%_50%/0.22),transparent_70%)]" />
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
        <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400/80" /><span className="h-3 w-3 rounded-full bg-amber-400/80" /><span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <div className="mx-auto flex items-center gap-2 rounded-md bg-background/70 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> app.omnia.security/dashboard
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-[1fr_1.2fr_1fr]">
          <div className="rounded-xl border border-border/70 bg-background/50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Security score</p>
            <div className="relative mx-auto mt-4 h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10" className="stroke-muted" />
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10" strokeLinecap="round" stroke="url(#pv)" strokeDasharray="314" className="animate-ring" />
                <defs><linearGradient id="pv" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--primary-glow))" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold"><CountUp to={92} /></span>
                <span className="text-[10px] font-semibold text-emerald-400">Excellent</span>
              </div>
            </div>
            {[["Identity", 96], ["Devices", 88], ["Network", 100]].map(([l, v]) => (
              <div key={l} className="mt-3">
                <div className="flex justify-between text-[11px] text-muted-foreground"><span>{l}</span><span>{v}%</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-primary" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Live activity</p>
            <ul className="mt-4 space-y-3">
              {previewFeed.map(([c, t, when], i) => (
                <li key={t} className="flex animate-fade-up items-start gap-3 text-xs [animation-fill-mode:both]" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${c} shadow-[0_0_8px_currentColor]`} />
                  <span className="flex-1">{t}</span>
                  <span className="font-mono text-muted-foreground">{when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Threats blocked · 7 days</p>
            <div className="mt-6 flex h-36 items-end gap-2">
              {[40, 65, 30, 85, 55, 100, 70].map((h, i) => (
                <div key={i} className="flex-1 origin-bottom animate-bar rounded-t-md bg-gradient-to-t from-primary/40 to-primary-glow" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">{"MTWTFSS".split("").map((d, i) => <span key={i}>{d}</span>)}</div>
            <p className="mt-4 font-display text-2xl font-bold">1,284 <span className="text-xs font-normal text-emerald-400">↑ 18%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
