import { useEffect, useRef } from "react";

type Cell = { x: number; y: number; e: number; hue: number; inside: boolean };
type Threat = { x: number; y: number; vx: number; vy: number; trail: [number, number][] };
type Wave = { x: number; y: number; t: number };

const HEX = 17; // hex radius in CSS px

/**
 * OMNIA's signature visual: a honeycomb shield. Cells glow where the cursor moves,
 * red threats fly in from the edges and get blocked at the shield wall.
 */
export function ShieldField({
  className = "",
  onBlock,
  intensity = 1,
}: {
  className?: string;
  onBlock?: () => void;
  intensity?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const blockRef = useRef(onBlock);
  blockRef.current = onBlock;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, R = 0, cx = 0, cy = 0, raf = 0, frame = 0, visible = true;
    let cells: Cell[] = [];
    const threats: Threat[] = [];
    const waves: Wave[] = [];
    const mouse = { x: -999, y: -999 };

    const layout = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      cx = w / 2;
      cy = h / 2;
      R = Math.min(w, h) * 0.34;
      cells = [];
      const dx = HEX * 1.5, dy = HEX * Math.sqrt(3);
      for (let col = -1; col * dx < w + HEX; col++)
        for (let row = -1; row * dy < h + HEX; row++) {
          const x = col * dx, y = row * dy + (col % 2 ? dy / 2 : 0);
          cells.push({ x, y, e: 0, hue: 255, inside: Math.hypot(x - cx, y - cy) < R });
        }
    };

    const hex = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        ctx[i ? "lineTo" : "moveTo"](x + r * Math.cos(a), y + r * Math.sin(a));
      }
      ctx.closePath();
    };

    const energize = (x: number, y: number, radius: number, hue: number, amt: number) => {
      for (const c of cells) {
        const d = Math.hypot(c.x - x, c.y - y);
        if (d < radius) {
          c.e = Math.min(1, c.e + (1 - d / radius) * amt);
          c.hue = hue;
        }
      }
    };

    const spawn = () => {
      const side = Math.floor(Math.random() * 4);
      const x = side === 0 ? -10 : side === 1 ? w + 10 : Math.random() * w;
      const y = side === 2 ? -10 : side === 3 ? h + 10 : Math.random() * h;
      const ang = Math.atan2(cy - y, cx - x) + (Math.random() - 0.5) * 0.5;
      const sp = (1.4 + Math.random() * 1.4) * intensity;
      threats.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, trail: [] });
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pulse = 0.5 + Math.sin(frame * 0.03) * 0.5;

      // honeycomb
      ctx.lineWidth = 1;
      for (const c of cells) {
        c.e *= 0.955;
        const base = c.inside ? 0.16 + pulse * 0.06 : 0.05;
        hex(c.x, c.y, HEX - 2);
        if (c.e > 0.02) {
          ctx.fillStyle = `hsla(${c.hue} 95% 62% / ${c.e * 0.35})`;
          ctx.fill();
        }
        ctx.strokeStyle = `hsla(${c.e > 0.05 ? c.hue : 255} 90% 66% / ${Math.min(0.9, base + c.e)})`;
        ctx.stroke();
      }

      // shield wall
      const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.08);
      g.addColorStop(0, "hsla(255 95% 65% / 0)");
      g.addColorStop(0.85, `hsla(255 95% 65% / ${0.12 + pulse * 0.08})`);
      g.addColorStop(1, "hsla(190 95% 60% / 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(200 95% 65% / ${0.45 + pulse * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -frame * 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // threats
      for (const t of threats) {
        t.trail.forEach(([x, y], i) => {
          ctx.fillStyle = `hsla(350 95% 62% / ${(i / t.trail.length) * 0.6})`;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        });
        ctx.fillStyle = "#fb7185";
        ctx.shadowColor = "#fb7185";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // impact waves + labels
      for (const v of waves) {
        const k = v.t / 50;
        ctx.strokeStyle = `hsla(155 80% 55% / ${1 - k})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(v.x, v.y, 6 + k * 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `hsla(155 80% 60% / ${1 - k})`;
        ctx.font = "600 10px 'JetBrains Mono', monospace";
        ctx.fillText("BLOCKED", v.x + 10, v.y - 12 - k * 14);
      }
    };

    const step = () => {
      raf = requestAnimationFrame(step);
      if (!visible) return;
      frame++;
      if (frame % Math.round(34 / intensity) === 0 && threats.length < 9) spawn();
      if (mouse.x > -999) energize(mouse.x, mouse.y, 70, 190, 0.09);

      for (let i = threats.length - 1; i >= 0; i--) {
        const t = threats[i];
        t.trail.push([t.x, t.y]);
        if (t.trail.length > 14) t.trail.shift();
        t.x += t.vx;
        t.y += t.vy;
        if (Math.hypot(t.x - cx, t.y - cy) <= R) {
          waves.push({ x: t.x, y: t.y, t: 0 });
          energize(t.x, t.y, 60, 155, 1);
          threats.splice(i, 1);
          blockRef.current?.();
        } else if (t.x < -40 || t.y < -40 || t.x > w + 40 || t.y > h + 40) threats.splice(i, 1);
      }
      for (let i = waves.length - 1; i >= 0; i--) if (++waves[i].t > 50) waves.splice(i, 1);
      draw();
    };

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => (mouse.x = mouse.y = -999);
    const click = (e: PointerEvent) => {
      move(e);
      energize(mouse.x, mouse.y, 140, 190, 1);
      waves.push({ x: mouse.x, y: mouse.y, t: 20 });
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const host = canvas.parentElement!;
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerdown", click);

    if (still) draw();
    else raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", click);
    };
  }, [intensity]);

  return <canvas ref={ref} className={`h-full w-full ${className}`} aria-hidden />;
}
