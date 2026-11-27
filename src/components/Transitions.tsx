import { useEffect, useMemo, useRef } from "react";
import { LogoMark } from "@/components/Logo";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";

// Where the last click happened, so the hex ripple starts under the user's finger/cursor.
let origin: { x: number; y: number } | null = null;
addEventListener("pointerdown", (e) => (origin = { x: e.clientX, y: e.clientY }), { capture: true });

const HEX_R = 52;
const HEX_W = Math.sqrt(3) * HEX_R;

const GLYPHS = "ABCDEF0123456789#$%&*<>/\\|=+";

/** Destination path that scrambles from random glyphs into place, with a 0→100% "securing" counter. */
function Decode({ text }: { text: string }) {
  const out = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const start = performance.now() + 380;
    const dur = 520;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / dur));
      const solid = Math.floor(p * text.length);
      if (out.current)
        out.current.textContent = text
          .split("")
          .map((c, i) => (i < solid || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("");
      if (pct.current) pct.current.textContent = `${Math.round(p * 100)}`.padStart(3, "0") + "%";
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return (
    <div className="logo-word relative mt-4 flex w-64 flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] [animation-delay:.38s]">
      <span ref={out} className="text-cyan-300">{text}</span>
      <div className="h-px w-full overflow-hidden bg-white/10">
        <div className="secure-bar h-full bg-gradient-to-r from-violet-400 to-cyan-300" />
      </div>
      <span className="flex w-full justify-between text-[10px] tracking-[0.25em] text-white/50">
        <span>securing route</span>
        <span ref={pct}>000%</span>
      </span>
    </div>
  );
}

/**
 * OMNIA route transition: shockwaves burst from the click point, a honeycomb shield spins in behind them,
 * a scan beam sweeps the screen, the logo draws itself with a spark burst and glitching wordmark,
 * the destination decodes, then everything collapses to reveal the page.
 */
export function RouteCurtain() {
  const { pathname } = useLocation();
  const { tiles, o } = useMemo(() => {
    const W = innerWidth, H = innerHeight;
    const o = origin ?? { x: W / 2, y: H / 2 };
    origin = null;
    const out: { x: number; y: number; d: number; hue: number; lit: boolean }[] = [];
    for (let row = -1; row * HEX_R * 1.5 < H + HEX_R; row++)
      for (let col = -1; col * HEX_W < W + HEX_W; col++) {
        const x = col * HEX_W + (row % 2 ? HEX_W / 2 : 0), y = row * HEX_R * 1.5;
        out.push({ x, y, d: Math.hypot(x - o.x, y - o.y), hue: 262 - (x / W) * 72, lit: Math.random() < 0.13 });
      }
    const max = Math.max(...out.map((t) => t.d));
    return { tiles: out.map((t) => ({ ...t, delay: (t.d / max) * 380 })), o };
  }, [pathname]);

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const dest = `→ ${pathname === "/" ? "/home" : pathname}`;

  return (
    <div key={pathname} aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {tiles.map((t, i) => (
        <div
          key={i}
          className={`hex-tile ${t.lit ? "hex-lit" : ""}`}
          style={{ left: t.x - HEX_W / 2, top: t.y - HEX_R, width: HEX_W + 1, height: HEX_R * 2 + 1, animationDelay: `${t.delay}ms`, background: `hsl(${t.hue} 95% 62%)` }}
        >
          {!t.lit && <div className="hex-inner" />}
        </div>
      ))}

      {/* shockwaves from the click point */}
      {[0, 140].map((d) => (
        <div key={d} className="shockwave" style={{ left: o.x, top: o.y, animationDelay: `${d}ms` }} />
      ))}

      {/* scan beam */}
      <div className="route-scan absolute inset-x-0 h-24" />

      <div className="curtain-logo absolute inset-0 flex flex-col items-center justify-center">
        {/* dark halo separates the mark from the coloured tiles */}
        <div className="absolute h-[38rem] w-[38rem] max-w-[140vw] rounded-full bg-[radial-gradient(circle,hsl(240_12%_3%)_30%,hsl(240_12%_3%/0.85)_47%,transparent_70%)]" />
        <div className="relative">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className="spark" style={{ ["--a" as string]: `${i * 22.5}deg`, ["--d" as string]: `${120 + (i % 3) * 45}px`, animationDelay: `${520 + (i % 4) * 25}ms` }} />
          ))}
          <div className="absolute -inset-8 rounded-full bg-violet-600/40 blur-3xl" />
          <LogoMark animated className="relative h-32 w-32 drop-shadow-[0_0_28px_rgba(139,92,246,0.85)]" />
        </div>
        <p className="logo-word glitch relative mt-6 font-display text-6xl font-bold tracking-tight text-white" data-text="OMNIA">OMNIA</p>
        <Decode text={dest} />
      </div>
    </div>
  );
}

/** Glowing ring that trails the mouse and swells over anything clickable. Desktop pointers only. */
export function CursorFx() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const hot = (e.target as Element)?.closest?.("a,button,[role=button],input,textarea,select,label");
      ring.current?.classList.toggle("hot", !!hot);
      ring.current?.classList.add("on");
      dot.current?.classList.add("on");
    };
    const leave = () => { ring.current?.classList.remove("on"); dot.current?.classList.remove("on"); };
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => { removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={ring} aria-hidden className="cursor-ring" />
      <div ref={dot} aria-hidden className="cursor-dot" />
    </>
  );
}

declare global {
  interface Window { __lenis?: Lenis }
}

/** Inertia smooth scrolling. Pauses while a dialog locks the page and ignores scrollable inner panels. */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      prevent: (node) =>
        !!node.closest?.("[role=dialog],[data-lenis-prevent],[cmdk-list]") ||
        /(auto|scroll)/.test(getComputedStyle(node).overflowY),
    });
    window.__lenis = lenis;
    const sync = () => (document.body.hasAttribute("data-scroll-locked") ? lenis.stop() : lenis.start());
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
    return () => {
      mo.disconnect();
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}
