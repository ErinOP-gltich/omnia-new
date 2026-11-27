import { useEffect, useState, type ReactNode } from "react";

/** Sticky bars under the header use the same width, shape and glass as the header's scrolled pill,
 *  so the two line up instead of the bar running edge to edge. Keep in sync with Header.tsx. */
export const STICKY_UNDER_HEADER = "sticky top-[76px] px-3";
export const PILL = "mx-auto max-w-5xl rounded-2xl border border-border/70 bg-background/70 shadow-glass backdrop-blur-xl";

/** Thin numbered label bar that sticks under the header while its section is on screen. */
export const SectionRail = ({ n, label, right }: { n: string; label: string; right?: ReactNode }) => (
  <div className={`${STICKY_UNDER_HEADER} z-20`}>
    <div className={`${PILL} flex h-9 items-center justify-between px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:px-4`}>
      <span>
        <span className="text-primary">{n}</span> / {label}
      </span>
      {right && <span className="hidden sm:inline">{right}</span>}
    </div>
  </div>
);

/** Fixed right-edge ruler + clickable section index with scroll-spy. Desktop only. */
export function SectionIndex({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onScroll = () => {
      const h = document.documentElement;
      setProgress(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
    };
  }, [items]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -76 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ruler */}
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden w-3 xl:block">
        <div className="absolute inset-0 [background:repeating-linear-gradient(180deg,hsl(var(--muted-foreground)/0.35)_0_1px,transparent_1px_12px)] [mask:linear-gradient(90deg,transparent_40%,#000)]" />
        <div className="absolute inset-0 [background:repeating-linear-gradient(180deg,hsl(var(--muted-foreground)/0.6)_0_1px,transparent_1px_60px)]" />
        <div className="absolute right-0 h-px w-5 bg-primary shadow-[0_0_8px_hsl(var(--primary))] transition-[top] duration-150" style={{ top: `${progress * 100}%` }} />
      </div>
      {/* index */}
      <nav aria-label="Page sections" className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 xl:flex">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => go(it.id)}
            className={`group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${active === it.id ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"}`}
          >
            <span className={`transition-opacity ${active === it.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{it.label}</span>
            <span className={active === it.id ? "text-primary" : ""}>{String(i + 1).padStart(2, "0")}</span>
            <span className={`h-px transition-all duration-300 ${active === it.id ? "w-6 bg-primary" : "w-3 bg-muted-foreground/40"}`} />
          </button>
        ))}
      </nav>
    </>
  );
}
