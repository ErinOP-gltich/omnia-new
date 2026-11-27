import { site } from "@/config/site";

// ponytail: starter policy text so the links aren't dead. Have a lawyer review before launch.
const sections = [
  {
    id: "privacy",
    title: "Privacy Policy",
    body: [
      `${site.name} collects only the information needed to protect you: your name, email, the devices and emails you ask us to monitor, and security events on your account.`,
      "Breach and password checks run against third-party breach databases. Password checks use k-anonymity: only the first 5 characters of a hash of your password leave your device — never the password itself.",
      "We never sell your personal data or share it with advertisers. You can delete your data at any time from your dashboard settings or by emailing us.",
    ],
  },
  {
    id: "terms",
    title: "Terms of Service",
    body: [
      `By creating an account you agree to use ${site.name} for lawful purposes and to keep your login details secure.`,
      "Security tools reduce risk but cannot guarantee protection against every threat. Paid plans renew automatically until cancelled; you can cancel any time.",
      "We may update these terms; material changes will be announced by email or in the app.",
    ],
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    body: [
      "We use only essential browser storage to keep you signed in and remember your preferences (like dark mode). We don't use advertising or cross-site tracking cookies.",
    ],
  },
];

const Legal = () => (
  <div className="container max-w-3xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
    <h1 className="text-4xl font-bold tracking-tight">Legal</h1>
    <p className="mt-2 text-muted-foreground">Last updated {new Date().getFullYear()}. Questions? Email {site.contact.email}.</p>
    <nav className="mt-6 flex gap-4 text-sm">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="font-medium text-primary hover:underline">{s.title}</a>
      ))}
    </nav>
    {sections.map((s) => (
      <section key={s.id} id={s.id} className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold">{s.title}</h2>
        {s.body.map((p) => <p key={p} className="mt-4 leading-relaxed text-muted-foreground">{p}</p>)}
      </section>
    ))}
  </div>
);

export default Legal;
