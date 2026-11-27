import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Link, useLocation } from "react-router-dom";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { reply, suggestions, type Msg } from "@/lib/assistant";

/** Floating "Ask OMNIA AI" security assistant. */
export function AskOmnia() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Hi! I'm OMNIA's security assistant. Paste a suspicious message or ask me anything about staying safe online." }]);
  const list = useRef<HTMLDivElement>(null);
  // on the dashboard, phones have a bottom dock: sit above it
  const lift = useLocation().pathname === "/dashboard";

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, []);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setMsgs((m) => [...m, { from: "you", text: t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, reply(t)]);
      setTyping(false);
    }, 600);
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="OMNIA assistant"
          data-lenis-prevent
          className={`fixed inset-x-2 z-[70] flex h-[min(560px,calc(100dvh-9rem))] animate-scale-in flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-card backdrop-blur-xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[380px] ${lift ? "bottom-40" : "bottom-20"}`}
        >
          <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
            <LogoMark className="h-8 w-8" />
            <div className="flex-1 leading-tight">
              <p className="text-sm font-semibold">OMNIA Assistant</p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · beta</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "you" ? "justify-end" : ""}`}>
                <div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${m.from === "you" ? "rounded-br-sm bg-gradient-primary text-white" : "rounded-bl-sm bg-muted"}`}>
                  {m.text}
                  {m.links && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20">
                          {l.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex w-fit gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </div>
            )}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-border/70 p-3">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask, or paste a message…"
              aria-label="Message the assistant"
              className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
            />
            <button type="submit" disabled={!input.trim() || typing} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-white disabled:opacity-40" aria-label="Send">
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close assistant" : "Ask OMNIA AI"}
        className={`fixed right-4 z-[70] flex items-center gap-2.5 rounded-full border border-border/80 bg-card/90 p-2 text-sm font-medium shadow-card backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow sm:bottom-5 sm:right-6 sm:pr-4 ${lift ? "bottom-24" : "bottom-5"}`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-white">
          {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </span>
        <span className="hidden sm:inline">{open ? "Close" : "Ask OMNIA AI"}</span>
      </button>
    </>
  );
}
