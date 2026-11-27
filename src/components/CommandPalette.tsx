import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { useAuth } from "@/lib/auth";
import { site } from "@/config/site";
import { Bot, ClipboardCheck, CreditCard, Home, Info, KeyRound, LayoutDashboard, Link2, LogIn, LogOut, Mail, Moon, Search, Sparkles, Wand2 } from "lucide-react";

export const openPalette = () => window.dispatchEvent(new Event("open-palette"));

/** ⌘K / Ctrl+K quick navigation across the whole site. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const show = () => setOpen(true);
    window.addEventListener("keydown", key);
    window.addEventListener("open-palette", show);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("open-palette", show);
    };
  }, []);

  const go = (to: string) => () => {
    setOpen(false);
    navigate(to);
  };

  const groups = [
    {
      heading: "Pages",
      items: [
        { icon: Home, label: "Home", run: go("/") },
        { icon: Sparkles, label: "Features", run: go("/#features") },
        { icon: CreditCard, label: "Pricing", run: go("/#pricing") },
        { icon: Info, label: `About ${site.name} & the founder`, run: go("/about") },
        { icon: Mail, label: "Contact", run: go("/contact") },
      ],
    },
    {
      heading: "Free tools",
      items: [
        { icon: Search, label: "Check if my email was leaked", run: go("/tools#breach") },
        { icon: Bot, label: "Is this message a scam?", run: go("/tools#scam") },
        { icon: KeyRound, label: "Check a password", run: go("/tools#password") },
        { icon: Wand2, label: "Generate a strong password", run: go("/tools#generator") },
        { icon: Link2, label: "Check a link", run: go("/tools#link") },
        { icon: ClipboardCheck, label: "Take the security checkup", run: go("/tools#checkup") },
      ],
    },
    {
      heading: "Account",
      items: [
        user
          ? { icon: LayoutDashboard, label: "Open dashboard", run: go("/dashboard") }
          : { icon: LogIn, label: "Sign in / create account", run: go("/login") },
        ...(user ? [{ icon: LogOut, label: "Sign out", run: () => { signOut(); go("/")(); } }] : []),
        { icon: Moon, label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`, run: () => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); setOpen(false); } },
      ],
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Where to? Try “scam” or “pricing”…" />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g.heading} heading={g.heading}>
            {g.items.map((i) => (
              <CommandItem key={i.label} onSelect={i.run}>
                <i.icon className="mr-2 h-4 w-4 text-primary" /> {i.label}
                {i.label === "Home" && <CommandShortcut>⌘K</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
