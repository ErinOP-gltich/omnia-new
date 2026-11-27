import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GradientText, PageHero, SectionHeading } from "@/components/Section";
import { toast } from "sonner";
import { site } from "@/config/site";
import { Building2, Clock, Headphones, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";

const topics: Record<string, string> = {
  general: "General question",
  support: "Technical support",
  sales: "Business / enterprise sales",
  billing: "Billing",
  press: "Press & partnerships",
};

const options = [
  { icon: MessageSquare, title: "General questions", text: "Features, plans or your account.", topic: "general" },
  { icon: Headphones, title: "Technical support", text: "Installation, setup or troubleshooting.", topic: "support" },
  { icon: Building2, title: "Business sales", text: "Protection for your team or company.", topic: "sales" },
];

const faqs = [
  { q: "How quickly can I get started?", a: "Minutes. Create an account, run your first scan and follow the recommendations on your dashboard." },
  { q: "Do you offer business plans?", a: "Yes — endpoint protection, team management and compliance reporting. Pick 'Business sales' in the form and we'll reach out." },
  { q: "Which devices are supported?", a: "Windows, macOS, Android, iOS, plus smart TVs, cameras and other IoT devices on your network." },
  { q: "Is my data private?", a: "Yes. Data is encrypted, we collect only what we need to protect you, and we never sell it." },
];

const Contact = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: params.get("topic") && topics[params.get("topic")!] ? params.get("topic")! : "general",
    message: "",
  });
  const formRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ponytail: opens the visitor's mail app (no backend). Swap for Formspree/Resend/an API route to receive messages directly.
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[${topics[form.topic]}] from ${form.name}`;
    const body = `${form.message}\n\n— ${form.name} <${form.email}>`;
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email app with the message ready to send.");
  };

  const pick = (topic: string) => {
    set("topic")(topic);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const info = [
    { icon: Mail, title: "Email", value: site.contact.email, href: `mailto:${site.contact.email}`, note: "We reply within 24 hours" },
    { icon: Phone, title: "Phone", value: site.contact.phone, href: `tel:${site.contact.phone.replace(/\s/g, "")}`, note: site.contact.phoneHours },
    { icon: MapPin, title: "Office", value: site.contact.city, note: "Visits by appointment" },
    { icon: Clock, title: "Emergency help", value: "24/7 for members", note: "Identity theft? Call us right away" },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title={<>We're here to <GradientText>help</GradientText></>}
        subtitle={`Questions about ${site.name}, help with setup, or protection for your business — reach out and we'll get back to you fast.`}
      />

      <section className="bg-background py-20">
        <div className="container grid gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
          <div ref={formRef} className="card-surface scroll-mt-24 p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fill this in and it'll open in your email app, ready to send.</p>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => set("name")(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email")(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Select value={form.topic} onValueChange={set("topic")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(topics).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={6} placeholder="How can we help?" value={form.message} onChange={(e) => set("message")(e.target.value)} />
              </div>
              <Button type="submit" size="lg" className="w-full bg-gradient-primary">
                <Send className="mr-2 h-4 w-4" /> Send message
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {info.map((i) => (
                <div key={i.title} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><i.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">{i.title}</p>
                    {i.href ? <a href={i.href} className="font-semibold hover:text-primary">{i.value}</a> : <p className="font-semibold">{i.value}</p>}
                    <p className="text-xs text-muted-foreground">{i.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">What do you need help with?</h3>
              {options.map((o) => (
                <button key={o.topic} onClick={() => pick(o.topic)} className="card-surface flex w-full items-center gap-4 p-4 text-left transition-colors hover:border-primary/50">
                  <o.icon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-muted-foreground">{o.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="container max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Quick answers" />
          <Accordion type="single" collapsible className="card-surface divide-y divide-border px-6">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-0">
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default Contact;
