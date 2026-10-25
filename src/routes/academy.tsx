import { createFileRoute, Link } from "@tanstack/react-router";
import { FaqSection, PageHero, WhatsAppIcon } from "@/components/site";
import { faqs, fees, lessons, WHATSAPP } from "@/lib/content";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "آن لائن اکیڈمی — Flee to Allah" },
      { name: "description", content: "بچوں کے لیے آن لائن قرآن، نماز اور سیرت کی کلاسیں۔" },
      { property: "og:title", content: "Online Academy — Flee to Allah" },
      { property: "og:description", content: "Live online Quran classes for kids worldwide." },
    ],
  }),
  component: Academy,
});

function Academy() {
  return (
    <>
      <PageHero title="آن لائن اکیڈمی" sub="دنیا کے کسی بھی کونے سے آپ کا بچہ گھر بیٹھے قرآن اور دین سیکھ سکتا ہے۔" />
      <section className="mx-auto mt-10 grid max-w-5xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => {
          const f = fees.find((x) => x.title === l.title);
          return (
            <div key={l.title} className="card card-hover">
              <span className="badge">{l.level}</span>
              <h3 className="mt-3 text-xl font-bold text-primary">{l.title}</h3>
              <p className="mt-2 text-muted-foreground">{l.desc}</p>
              {f && (
                <p className="mt-3 font-bold text-gold-deep">
                  {f.price} روپے / ماہ
                  <span className="text-sm font-normal text-muted-foreground"> ({f.plan})</span>
                </p>
              )}
              <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("السلام علیکم، مجھے " + l.title + " کلاس میں داخلہ چاہیے")}`} target="_blank" rel="noreferrer" className="btn-outline mt-4">
                <WhatsAppIcon /> داخلہ
              </a>
            </div>
          );
        })}
      </section>
      <div className="mt-8 text-center">
        <Link to="/fees" className="btn-gold">فیس اور رقم بھیجنے کا طریقہ</Link>
      </div>
      <FaqSection items={faqs.academy} />
    </>
  );
}
