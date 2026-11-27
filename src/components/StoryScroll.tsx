import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Laptop, Loader2, MessageSquareWarning, Smartphone, Tablet, Tv } from "lucide-react";
import { Eyebrow } from "@/components/Section";

const Frame = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="card-surface overflow-hidden">
    <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      <span>{label}</span>
      <span className="flex items-center gap-1.5 text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> live</span>
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </div>
);

const DarkWeb = () => (
  <Frame label="Dark-web monitor">
    <div className="relative mb-5 h-1 overflow-hidden rounded-full bg-muted">
      <div className="absolute inset-y-0 w-1/3 animate-[scanbar_2s_ease-in-out_infinite] rounded-full bg-gradient-primary" />
    </div>
    <p className="mb-4 font-mono text-xs text-muted-foreground">Scanning 14 breach sources & dark-web markets…</p>
    {[
      ["you@gmail.com", "Found in 3 breaches", "text-red-400", true],
      ["+91 98•••••210", "Clean", "text-emerald-400", false],
      ["PAN ••••••4F", "Monitoring", "text-cyan-400", false],
      ["Passport ••••21", "Clean", "text-emerald-400", false],
    ].map(([id, st, c, bad]) => (
      <div key={id as string} className="mb-2 flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3.5 py-2.5 font-mono text-xs">
        <span className="flex items-center gap-2">{bad ? <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}{id}</span>
        <span className={c as string}>{st}</span>
      </div>
    ))}
  </Frame>
);

const Devices = () => (
  <Frame label="Device shield">
    <div className="grid grid-cols-2 gap-3">
      {([
        [Laptop, "MacBook Air", "Protected", true],
        [Smartphone, "Pixel 8", "Protected", true],
        [Tablet, "Kid's iPad", "Parental mode", true],
        [Tv, "Living room TV", "Patching…", false],
      ] as const).map(([Icon, n, st, ok]) => (
        <div key={n} className="rounded-xl border border-border/60 bg-background/50 p-4">
          <Icon className="h-6 w-6 text-primary" />
          <p className="mt-3 text-sm font-medium">{n}</p>
          <p className={`mt-1 flex items-center gap-1.5 text-xs ${ok ? "text-emerald-400" : "text-amber-400"}`}>
            {ok ? <CheckCircle2 className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />} {st}
          </p>
        </div>
      ))}
    </div>
  </Frame>
);

const Brokers = () => (
  <Frame label="Data broker removal">
    {[["PeopleSearch Pro", 100], ["DataTrail", 100], ["FindAnyone", 72], ["RecordHub", 40], ["PhoneTracer", 15]].map(([n, p]) => (
      <div key={n as string} className="mb-3.5">
        <div className="mb-1.5 flex justify-between text-xs">
          <span>{n}</span>
          <span className={`font-mono ${p === 100 ? "text-emerald-400" : "text-sky-400"}`}>{p === 100 ? "REMOVED" : `${p}%`}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-primary transition-all duration-1000" style={{ width: `${p}%` }} />
        </div>
      </div>
    ))}
  </Frame>
);

const Scam = () => (
  <Frame label="AI Scam Shield">
    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm">
      Dear Customer, your SBI account will be BLOCKED today. Update KYC now: sbi-kyc-update.xyz and share the OTP.
    </div>
    <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
      <p className="flex items-center justify-between font-semibold text-red-400">
        <span className="flex items-center gap-2"><MessageSquareWarning className="h-4 w-4" /> Scam detected</span>
        <span className="font-mono">96/100</span>
      </p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        <li>• Asks for your OTP — banks never do</li>
        <li>• Fake urgency: "blocked today"</li>
        <li>• Look-alike link on a scam-prone domain</li>
      </ul>
    </div>
  </Frame>
);

const chapters = [
  { title: "We watch the dark web for you", text: "Your emails, phone, PAN and passport are checked against breach dumps and criminal markets around the clock. Leaks reach you in minutes, not months.", Visual: DarkWeb },
  { title: "We lock down every device", text: "Antivirus, safe browsing and one-tap fixes for laptops, phones, tablets and the smart TV nobody remembers to update.", Visual: Devices },
  { title: "We erase you from data brokers", text: "People-search sites sell your name, number and address. We find the listings and file the removal requests for you.", Visual: Brokers },
  { title: "We stop scams before you tap", text: "Paste any SMS, email or WhatsApp message. OMNIA spots fake KYC, OTP, delivery and job scams instantly.", Visual: Scam },
];

/** Pinned left column; right column scrolls through chapters and drives the active state. */
export function StoryScroll() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative bg-background py-24 lg:py-32">
      <div className="container grid gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <Eyebrow>How OMNIA protects you</Eyebrow>
          <h2 className="mt-6 text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
            Four layers.
            <br />
            <span className="accent-text">Zero effort.</span>
          </h2>
          <ol className="mt-10 hidden space-y-1 lg:block">
            {chapters.map((c, i) => (
              <li key={c.title}>
                <button
                  onClick={() => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className={`flex w-full items-start gap-4 rounded-xl px-4 py-3.5 text-left transition-all duration-500 ${active === i ? "bg-card/80" : "opacity-40 hover:opacity-70"}`}
                >
                  <span className={`mt-0.5 font-mono text-xs ${active === i ? "text-primary" : "text-muted-foreground"}`}>0{i + 1}</span>
                  <span>
                    <span className="block font-medium">{c.title}</span>
                    <span className={`grid transition-all duration-500 ${active === i ? "mt-1.5 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <span className="overflow-hidden text-sm leading-relaxed text-muted-foreground">{c.text}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-6 hidden h-px overflow-hidden bg-border lg:block">
            <div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${((active + 1) / chapters.length) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-16 lg:space-y-0">
          {chapters.map(({ title, text, Visual }, i) => (
            <div
              key={title}
              data-i={i}
              ref={(el) => (refs.current[i] = el)}
              className={`flex flex-col justify-center transition-all duration-700 lg:min-h-[85vh] ${active === i ? "opacity-100" : "lg:scale-[0.96] lg:opacity-30"}`}
            >
              <div className="mb-5 lg:hidden">
                <p className="font-mono text-xs text-primary">0{i + 1}</p>
                <h3 className="mt-1 text-2xl font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </div>
              <Visual />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
