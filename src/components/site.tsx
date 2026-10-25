import { Link } from "@tanstack/react-router";
import { EMAIL, WHATSAPP, type Faq } from "@/lib/content";
import { LanguagePicker } from "@/components/translate";

const nav = [
  { to: "/", label: "ہوم" },
  { to: "/academy", label: "اکیڈمی" },
  { to: "/fees", label: "فیس" },
  { to: "/grammar", label: "گرامر" },
  { to: "/videos", label: "ویڈیوز و نظمیں" },
  { to: "/daily", label: "روزانہ سوال" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-3 md:flex-row md:justify-between">
        <Link to="/" className="font-display text-2xl text-primary">Flee to Allah</Link>
        <nav className="flex flex-wrap justify-center gap-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="nav-link" activeProps={{ className: "nav-link nav-active" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <LanguagePicker />
        <Link to="/auth" className="btn-outline mt-1 md:mt-0" aria-label="منتظم لاگ اِن">
          🔐 منتظم لاگ اِن
        </Link>
      </div>
    </header>
  );
}

export function GmailIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden>
      <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7a3 3 0 003-3V16.2z" />
      <path fill="#1e88e5" d="M3 16.2l3.6 1.7L13 23.7V40H6a3 3 0 01-3-3V16.2z" />
      <path fill="#e53935" d="M35 11.2L24 19.45 13 11.2 12 17l1 6.7 11 8.25 11-8.25 1-6.7z" />
      <path fill="#c62828" d="M3 12.3v3.9l10 7.5V11.2L9.9 8.87A4.3 4.3 0 003 12.3z" />
      <path fill="#fbc02d" d="M45 12.3v3.9l-10 7.5V11.2l3.1-2.33A4.3 4.3 0 0145 12.3z" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <path fill="#25D366" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z" />
      <path fill="#fff" d="M17 14.4c-.3-.1-1.6-.8-1.8-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a6.8 6.8 0 01-3.4-3c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.3c0-.1-.2-.2-.5-.3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center">
        <p className="font-display text-xl text-primary">فَفِرُّوا إِلَى اللّٰهِ</p>
        <p className="text-sm text-muted-foreground">پس اللہ کی طرف دوڑو (الذاریات: 50)</p>
        <div className="flex gap-3">
          <a href={`mailto:${EMAIL}`} className="contact-btn" aria-label="Gmail"><GmailIcon /> Gmail</a>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="contact-btn" aria-label="WhatsApp"><WhatsAppIcon /> WhatsApp</a>
        </div>
        <Link to="/auth" className="btn-outline">🔐 منتظم لاگ اِن</Link>
      </div>
    </footer>
  );
}

export function FaqSection({ items }: { items: Faq[] }) {
  return (
    <section className="mx-auto mt-14 max-w-3xl px-4">
      <h2 className="section-title">اکثر پوچھے جانے والے سوالات</h2>
      <div className="mt-5 space-y-3">
        {items.map((f) => (
          <details key={f.q} className="card group">
            <summary className="cursor-pointer list-none font-semibold text-foreground">{f.q}</summary>
            <p className="mt-3 leading-loose text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function PageHero({ title, sub }: { title: string; sub: string }) {
  return (
    <section className="hero-band px-4 py-14 text-center">
      <h1 className="font-display text-4xl text-primary-foreground md:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl leading-loose text-primary-foreground/85">{sub}</p>
    </section>
  );
}
