import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { passwordStrength } from "@/lib/security";
import { site } from "@/config/site";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { ShieldField } from "@/components/ShieldField";
import { Aurora, GlowCard } from "@/components/Fx";

const feed = [
  "phishing link blocked · whatsapp",
  "password found in new leak · alerted",
  "vpn auto-connected · airport wi-fi",
  "removed from data broker · findanyone",
  "₹48,000 card charge flagged · frozen",
  "spoofed robocall silenced",
];

const IconInput = ({ icon: Icon, ...props }: React.ComponentProps<typeof Input> & { icon: typeof Mail }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input {...props} className={`h-11 pl-10 ${props.className ?? ""}`} />
  </div>
);

const Login = () => {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const plan = params.get("plan") ?? "Starter";
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(0);
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLine((n) => n + 1), 2200);
    return () => clearInterval(t);
  }, []);
  const [show, setShow] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "", confirm: "" });
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/dashboard";
  const strength = passwordStrength(signup.password);

  const run = async (fn: () => Promise<void>, message: string) => {
    setLoading(true);
    try {
      await fn();
      toast.success(message);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signup.password.length < 8) return toast.error("Use at least 8 characters for your password.");
    if (signup.password !== signup.confirm) return toast.error("Passwords don't match.");
    run(() => signUp(signup.name, signup.email, signup.password, plan), `Welcome to ${site.name}, ${signup.name.split(" ")[0]}!`);
  };

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShow(!show)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel: interactive hex shield */}
      <div className="relative hidden overflow-hidden border-r border-border/60 bg-background lg:block">
        <ShieldField onBlock={() => setBlocked((n) => n + 1)} intensity={1.2} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-12">
          <Link to="/" className="pointer-events-auto flex w-fit items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <span className="font-display text-2xl font-bold tracking-tight">{site.name}</span>
          </Link>
          <div className="max-w-lg">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">// secure sign-in</p>
            <h1 className="mt-4 text-6xl leading-[0.92] xl:text-7xl">
              <span className="outline-text">One account.</span>
              <br />
              <span className="accent-text">Total protection.</span>
            </h1>
            <div className="card-surface mt-8 max-w-sm p-4 font-mono text-xs">
              <div className="mb-3 flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> live shield</span>
                <span>blocked <span className="text-emerald-400">{blocked.toString().padStart(3, "0")}</span></span>
              </div>
              {[0, 1, 2].map((k) => (
                <p key={`${line}-${k}`} className="animate-fade-in truncate py-0.5" style={{ opacity: 1 - k * 0.3 }}>
                  <span className="text-primary">›</span> {feed[(line + k) % feed.length]}
                </p>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Built by <span className="text-foreground">{site.founder.name}</span> · © {new Date().getFullYear()} {site.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="relative flex flex-col overflow-hidden bg-background px-4 py-6 sm:px-8">
        <div className="pointer-events-none absolute inset-0"><Aurora /></div>
        <div className="relative flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="mr-1.5 h-4 w-4" /> Home</Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <LogoMark className="mx-auto mb-6 h-14 w-14 shadow-glow lg:hidden" />
          <GlowCard>
          <div className="p-6 sm:p-8">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-8 grid h-12 w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to your security dashboard.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => signIn(login.email, login.password), "Signed in");
                }}
                className="mt-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <IconInput icon={Mail} id="login-email" type="email" autoComplete="email" placeholder="you@example.com" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Dialog>
                      <DialogTrigger className="text-xs font-medium text-primary hover:underline">Forgot password?</DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset your password</DialogTitle>
                          <DialogDescription>
                            Email our support team from the address on your account and we'll help you regain access.
                          </DialogDescription>
                        </DialogHeader>
                        <Button asChild className="bg-gradient-primary">
                          <a href={`mailto:${site.contact.email}?subject=${encodeURIComponent("Password reset request")}`}>Email {site.contact.email}</a>
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="relative">
                    <IconInput icon={Lock} id="login-password" type={show ? "text" : "password"} autoComplete="current-password" placeholder="Your password" required className="pr-10" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
                    {pwToggle}
                  </div>
                </div>
                <Button type="submit" className="h-11 w-full bg-gradient-primary" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Plan: <span className="font-medium text-foreground">{plan}</span>
                {plan !== "Starter" && " · 14-day free trial"}
              </p>
              <form onSubmit={handleSignup} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <IconInput icon={User} id="signup-name" autoComplete="name" placeholder="Your name" required value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <IconInput icon={Mail} id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <IconInput icon={Lock} id="signup-password" type={show ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" required minLength={8} className="pr-10" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
                    {pwToggle}
                  </div>
                  {signup.password && (
                    <div className="flex items-center gap-3">
                      <Progress value={strength.percent} className="h-1.5" />
                      <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">{strength.label}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm password</Label>
                  <IconInput icon={Lock} id="signup-confirm" type={show ? "text" : "password"} autoComplete="new-password" placeholder="Repeat password" required value={signup.confirm} onChange={(e) => setSignup({ ...signup, confirm: e.target.value })} />
                </div>
                <Button type="submit" className="h-11 w-full bg-gradient-primary" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          </div>
          </GlowCard>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/legal#terms" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link to="/legal#privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
