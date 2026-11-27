import type { ReactNode } from "react";
import { Aurora, Reveal } from "@/components/Fx";

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary backdrop-blur">
    {children}
  </span>
);

export const SectionHeading = ({ eyebrow, title, subtitle }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode }) => (
  <Reveal className="mx-auto mb-14 max-w-2xl text-center">
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
    {subtitle && <p className="mt-5 text-lg text-muted-foreground">{subtitle}</p>}
  </Reveal>
);

export const PageHero = ({ eyebrow, title, subtitle }: { eyebrow: string; title: ReactNode; subtitle: ReactNode }) => (
  <section className="relative overflow-hidden bg-gradient-hero">
    <Aurora />
    <div className="container relative px-4 pb-24 pt-36 text-center sm:px-6 lg:px-8 lg:pb-32 lg:pt-44">
      <div className="mx-auto max-w-3xl animate-fade-up">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">{subtitle}</p>
      </div>
    </div>
  </section>
);

export const GradientText = ({ children }: { children: ReactNode }) => (
  <span className="bg-gradient-primary bg-clip-text text-transparent">{children}</span>
);
