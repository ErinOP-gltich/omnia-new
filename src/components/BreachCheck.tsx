import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkEmailBreaches } from "@/lib/security";
import { AlertTriangle, CheckCircle2, Loader2, Search } from "lucide-react";

type Result = { email: string; breaches: string[] } | { error: string };

/** Real email breach lookup (XposedOrNot). Used on Home and Tools. */
export function BreachCheck() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const scan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      setResult({ email, breaches: await checkEmailBreaches(email) });
    } catch (err) {
      setResult({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={scan} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address to check"
          className="h-11"
        />
        <Button type="submit" disabled={loading} className="h-11 shrink-0 bg-gradient-primary px-5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2">{loading ? "Scanning…" : "Scan"}</span>
        </Button>
      </form>

      {result && "error" in result && (
        <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground" role="status">{result.error}</p>
      )}

      {result && "breaches" in result && (
        <div
          role="status"
          className={`animate-scale-in rounded-xl border p-4 ${
            result.breaches.length
              ? "border-red-500/30 bg-red-500/5"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.breaches.length ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            )}
            <div className="min-w-0 space-y-2">
              <p className="font-semibold">
                {result.breaches.length
                  ? `Found in ${result.breaches.length} known data breach${result.breaches.length > 1 ? "es" : ""}`
                  : "No known breaches found"}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.breaches.length
                  ? "Change the passwords for these services, never reuse them, and turn on two-factor authentication."
                  : `${result.email} doesn't appear in any public breach we track. Keep monitoring — new leaks appear every week.`}
              </p>
              {result.breaches.length > 0 && (
                <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pt-1">
                  {result.breaches.map((b) => (
                    <span key={b} className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
