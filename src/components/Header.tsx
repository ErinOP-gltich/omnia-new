import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { site } from "@/config/site";
import { LayoutDashboard, LogOut, Menu, Search, X } from "lucide-react";
import { openPalette } from "@/components/CommandPalette";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/tools", label: "Free Tools" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const navigate = useNavigate();

  const logout = () => {
    signOut();
    setOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3">
      {/* frosted backdrop that fades out at the bottom: hides content scrolling behind the pill without a hard seam */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -bottom-5 -z-10 bg-background/75 backdrop-blur-xl transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)] ${
          scrolled || open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`mx-auto flex h-14 items-center justify-between gap-4 rounded-2xl border px-3 transition-all duration-500 sm:px-4 ${
          scrolled || open
            ? "max-w-5xl border-border/70 bg-background/70 shadow-glass backdrop-blur-xl"
            : "max-w-7xl border-transparent bg-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <LogoMark className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-1.5 lg:flex">
          {navItems.map((item) =>
            item.href.includes("#") ? (
              <Link key={item.href} to={item.href} className="px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <NavLink key={item.href} to={item.href} end className={linkClass}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={openPalette}
            className="flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-card/50 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" /> Search
            <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
          </button>
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Account menu"
                  >
                    {initials(user.name)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.name}</div>
                    <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-primary shadow-sm hover:opacity-95">
                <Link to="/login?mode=signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Button variant="ghost" size="icon" onClick={openPalette} aria-label="Search"><Search className="h-4 w-4" /></Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-glass backdrop-blur-xl lg:hidden animate-fade-in">
          <nav className="container flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-gradient-primary">
                    <Link to="/login?mode=signup" onClick={() => setOpen(false)}>Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
