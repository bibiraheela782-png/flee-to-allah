import { createFileRoute, Link } from "@tanstack/react-router";
import { FaqSection, PageHero, WhatsAppIcon } from "@/components/site";
import { combos, faqs, feeMessage, fees, payments, WHATSAPP } from "@/lib/content";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "فیس اور داخلہ — Flee to Allah" },
      { name: "description", content: "بچوں کی کلاسوں کی ماہانہ فیس، بھائی بہنوں کی رعایت اور رقم جمع کروانے کے طریقے۔" },
      { property: "og:title", content: "Fees & Enrolment — Flee to Allah" },
      { property: "og:description", content: "Monthly class fees, sibling discount and ways to pay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fees,
});

const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

function Fees() {
  return (
    <>
      <PageHero title="فیس اور داخلہ" sub="پہلی کلاس آزمائش کے لیے مفت ہے۔ پسند آئے تو ماہانہ فیس جمع کروا کر کلاس شروع کریں۔" />

      <section className="mx-auto mt-10 grid max-w-5xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {fees.map((f) => (
          <div key={f.title} className="card card-hover">
            <h3 className="text-xl font-bold text-primary">{f.title}</h3>
            <p className="mt-3 text-3xl font-bold text-gold-deep">{f.price} <span className="text-base">روپے / ماہ</span></p>
            <p className="text-sm text-muted-foreground">تقریباً ${f.usd} ڈالر ماہانہ</p>
            <p className="mt-3 text-muted-foreground">{f.plan}</p>
            <p className="text-muted-foreground">{f.time}</p>
            <a href={wa(feeMessage(f.title))} target="_blank" rel="noreferrer" className="btn-outline mt-4">
              <WhatsAppIcon /> فیس کے لیے پوچھیں
            </a>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4">
        <h2 className="section-title">ایک سے زیادہ کلاسیں — رعایت</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {combos.map((c) => (
            <div key={c.title} className="card">
              <span className="badge">رعایت</span>
              <h3 className="mt-3 text-xl font-bold text-primary">{c.title}</h3>
              <p className="mt-2 text-muted-foreground">{c.detail}</p>
              <p className="mt-2 text-2xl font-bold text-gold-deep">{c.price} <span className="text-base">روپے / ماہ</span></p>
              <p className="text-sm text-muted-foreground">تقریباً ${c.usd} ڈالر ماہانہ</p>
              <a href={wa(feeMessage(c.title))} target="_blank" rel="noreferrer" className="btn-outline mt-4">
                <WhatsAppIcon /> داخلہ اور فیس
              </a>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ایک ہی گھر کے دو یا زیادہ بچے ہوں تو دوسرے بچے پر بیس فیصد رعایت۔
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-3xl px-4">
        <h2 className="section-title">رقم جمع کروانے کے طریقے</h2>
        <div className="mt-5 space-y-3">
          {payments.map((p) => (
            <div key={p.label} className="card">
              <h3 className="text-lg font-bold text-primary">{p.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
              {p.detail ? (
                <p className="mt-2 font-semibold text-foreground">{p.detail}</p>
              ) : (
                <p className="mt-2 text-gold-deep">تفصیل کے لیے WhatsApp پر پوچھ لیں — فوری بتا دیں گے۔</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl border border-border bg-secondary p-4 leading-loose text-muted-foreground">
          رقم جمع کروانے کے بعد رسید (اسکرین شاٹ) WhatsApp پر بھیج دیں، اور لکھ دیں کہ بچے کا نام اور کون سی کلاس ہے۔
          اسی دن کلاس کا وقت طے کر دیا جائے گا۔
        </p>
        <div className="mt-6 text-center">
          <Link to="/academy" className="btn-gold">کلاسیں دیکھیں</Link>
        </div>
      </section>

      <FaqSection items={faqs.fees} />
    </>
  );
}
