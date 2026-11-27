import { Link } from "react-router-dom";
import { LogoMark } from "@/components/Logo";
import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";

const columns = [
  {
    title: "Product",
    links: [
      { to: "/#features", label: "Features" },
      { to: "/#pricing", label: "Pricing" },
      { to: "/tools", label: "Free security tools" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/legal#privacy", label: "Privacy Policy" },
      { to: "/legal#terms", label: "Terms of Service" },
    ],
  },
];

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-border bg-card/40">
    <div className="container px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight">{site.name}</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{site.description}</p>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="space-y-4">
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <nav className="flex flex-col gap-2.5">
              {col.links.map((l) => (
                <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        <div className="col-span-2 space-y-4 md:col-span-1">
          <h4 className="text-sm font-semibold">Get in touch</h4>
          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <a href={`mailto:${site.contact.email}`} className="flex items-center gap-2 hover:text-foreground">
              <Mail className="h-4 w-4" /> {site.contact.email}
            </a>
            <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-foreground">
              <Phone className="h-4 w-4" /> {site.contact.phone}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {site.contact.city}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>© {new Date().getFullYear()} {site.name}.</span>
          <span>Built by <a href={site.founder.links.portfolio} target="_blank" rel="noreferrer" className="font-medium text-foreground hover:text-primary">{site.founder.name}</a></span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> All systems operational
          </span>
        </p>
        <div className="flex gap-6">
          <Link to="/legal#privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/legal#terms" className="hover:text-foreground">Terms</Link>
          <Link to="/legal#cookies" className="hover:text-foreground">Cookies</Link>
        </div>
      </div>
    </div>
    <div aria-hidden className="pointer-events-none select-none overflow-hidden">
      <p className="wordmark -mb-[0.22em] text-center font-display font-extrabold leading-none tracking-tighter">{site.name}</p>
    </div>
  </footer>
);

export default Footer;
