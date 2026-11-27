import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eyebrow, GradientText, PageHero, SectionHeading } from "@/components/Section";
import { GlowCard, Reveal, Tilt, spot } from "@/components/Fx";
import { site } from "@/config/site";
import { ArrowRight, ArrowUpRight, Award, CheckCircle2, Github, Globe2, Mail, Network, Shield, Target, Terminal, Users } from "lucide-react";

const facts = [
  { value: "13", label: "Protection layers in one app" },
  { value: "24/7", label: "Automated monitoring" },
  { value: "0", label: "Bytes of your data sold" },
  { value: "<5 min", label: "To get fully set up" },
];

const values = [
  { icon: Shield, title: "Security first", description: "Every decision starts with one question: does this make our users safer?" },
  { icon: Users, title: "Built for people", description: "Protection a parent, a student or a small business owner can set up in minutes." },
  { icon: Target, title: "Always ahead", description: "Threats evolve weekly. So do our detection rules, breach feeds and modules." },
  { icon: Award, title: "Privacy by default", description: "We collect only what's needed to protect you, and never sell your data." },
];

const skillIcons = { "Web development": Globe2, "Network security": Shield, "Infra & self-hosting": Network } as const;

const About = () => {
  const f = site.founder;

  return (
    <div>
      <PageHero
        eyebrow={`About ${site.name}`}
        title={<>Built by someone who studies <GradientText>what breaks</GradientText></>}
        subtitle={`${site.name} is a one-founder startup on a mission to make complete cybersecurity simple, beautiful and affordable for everyone.`}
      />

      {/* FOUNDER */}
      <section id="founder" className="relative scroll-mt-24 bg-background py-24 lg:py-32">
        <div className="container grid items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <Tilt max={7} className="relative mx-auto max-w-sm">
              <GlowCard>
                <div className="scan relative overflow-hidden rounded-[calc(1.25rem-1px)]">
                  <img src={f.photo} alt={`Portrait of ${f.name}`} className="aspect-[4/5] w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-primary mix-blend-color opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">{f.role}</p>
                    <p className="font-display text-2xl font-bold">{f.name}</p>
                  </div>
                </div>
              </GlowCard>
              <div className="card-surface absolute -right-4 -top-5 animate-float px-3.5 py-2.5 font-mono text-xs sm:-right-10">
                <span className="text-emerald-400">~$</span> whoami<br />
                <span className="text-muted-foreground">→ founder, builder, defender</span>
              </div>
              <div className="card-surface absolute -bottom-5 -left-4 flex animate-float items-center gap-2 px-3.5 py-2.5 text-xs [animation-delay:-3s] sm:-left-10">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Building OMNIA
              </div>
            </Tilt>
          </Reveal>

          <Reveal delay={120}>
            <Eyebrow>Meet the founder</Eyebrow>
            <h2 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl">
              Hi, I'm <GradientText>{f.name.split(" ")[0]}</GradientText>.
            </h2>
            <p className="mt-4 font-mono text-sm text-primary">“{f.tagline}”</p>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              {f.bio.map((p) => <p key={p}>{p}</p>)}
            </div>
            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              {f.facts.map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border/70 bg-card/40 px-4 py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-primary shadow-glow">
                <a href={f.links.portfolio} target="_blank" rel="noreferrer"><Globe2 className="mr-2 h-4 w-4" /> Portfolio</a>
              </Button>
              <Button asChild variant="outline" className="bg-card/40">
                <a href={f.links.github} target="_blank" rel="noreferrer"><Github className="mr-2 h-4 w-4" /> GitHub</a>
              </Button>
              <Button asChild variant="outline" className="bg-card/40">
                <a href={`mailto:${f.links.email}`}><Mail className="mr-2 h-4 w-4" /> Email me</a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CERTS + SKILLS */}
      <section className="border-y border-border/60 bg-card/30 py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="The lab bench" title={<>Front-end craft meets <GradientText>network defense</GradientText></>} subtitle="The skills behind OMNIA — learned from documentation, Packet Tracer labs and an isolated home lab." />
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
            <div className="space-y-5">
              {f.certs.map((c, i) => (
                <Reveal key={c.name} delay={i * 100}>
                  <div onMouseMove={spot} className="card-surface spotlight p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{c.name}</p>
                      <span className="font-mono text-sm text-primary">{c.progress}%</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${c.progress}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{c.note}</p>
                  </div>
                </Reveal>
              ))}
              <Reveal delay={200}>
                <div className="card-surface overflow-hidden">
                  <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"><Terminal className="h-3 w-3" /> campus-lab.pkt</span>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-muted-foreground">
{`R1(config)# router ospf 1
R1(config-router)# network 10.0.0.0 0.0.255.255 area 0
SW-C(config)# vlan 30
SW-C(config-vlan)# name GUEST
R1(config)# access-list 110 deny ip 10.0.30.0 0.0.0.255 10.0.0.0 0.0.255.255
`}<span className="text-emerald-400">{"% guest wing → internet only. inside: denied."}</span>
                  </pre>
                </div>
              </Reveal>
            </div>
            <div className="grid gap-5">
              {Object.entries(f.skills).map(([group, list], i) => {
                const Icon = skillIcons[group as keyof typeof skillIcons];
                return (
                  <Reveal key={group} delay={i * 100}>
                    <div onMouseMove={spot} className="card-surface spotlight p-6">
                      <p className="flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-primary" /> {group}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {list.map((s) => (
                          <span key={s} className="rounded-lg border border-border/70 bg-background/50 px-2.5 py-1 font-mono text-xs transition-colors hover:border-primary/50 hover:text-primary">{s}</span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SHIPPED */}
      <section className="bg-background py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Shipped" title="Real products, used by real people" subtitle="Before OMNIA, Aman built and handed over software that labs, clients and startups run on today." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {f.work.map((w, i) => {
              const inner = (
                <div onMouseMove={spot} className="card-surface spotlight group flex h-full items-start justify-between gap-4 p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{w.kind}</p>
                    <p className="mt-1.5 text-lg font-semibold">{w.name}</p>
                    {w.url && <p className="mt-1 truncate font-mono text-xs text-primary">{new URL(w.url).hostname}</p>}
                  </div>
                  {w.url ? (
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-500">Beta</span>
                  )}
                </div>
              );
              return (
                <Reveal key={w.name} delay={(i % 3) * 80} className="h-full">
                  {w.url ? <a href={w.url} target="_blank" rel="noreferrer" className="block h-full">{inner}</a> : inner}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="container grid grid-cols-2 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {facts.map((x) => (
            <div key={x.label} className="px-4 py-10 text-center">
              <div className="font-display text-3xl font-bold tracking-tight sm:text-4xl"><GradientText>{x.value}</GradientText></div>
              <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{x.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background py-24 lg:py-28">
        <div className="container grid items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <Eyebrow>Our mission</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Security that <GradientText>anyone</GradientText> can use</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Everyone deserves complete digital protection without the complexity. {site.name} brings identity monitoring, device security,
              VPN, password safety, data-broker removal and smart-home defense together in one place — with enterprise-grade technology that's affordable and simple.
            </p>
            <ul className="mt-8 space-y-3">
              {["Real-time breach and dark-web monitoring", "One dashboard for every device and family member", "Plain-language guidance when something needs your attention"].map((t) => (
                <li key={t} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> {t}</li>
              ))}
            </ul>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div onMouseMove={spot} className="card-surface spotlight h-full p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow"><v.icon className="h-5 w-5" /></div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-primary py-24">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="container relative px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Ready to join the mission?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Start free and see your security score in under a minute.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/login?mode=signup">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/contact">Contact {f.name.split(" ")[0]}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
