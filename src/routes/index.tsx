import { createFileRoute, Link } from "@tanstack/react-router";
import dome from "@/assets/green-dome.jpg";
import { FaqSection } from "@/components/site";
import { faqs, motivations, dayIndex } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flee to Allah — بچوں کی اسلامی آن لائن اکیڈمی" },
      { name: "description", content: "بچوں کے لیے قرآن، عربی گرامر، نظمیں، روزانہ موٹیویشن اور روزانہ سوال۔" },
      { property: "og:title", content: "Flee to Allah — Islamic Kids Academy" },
      { property: "og:description", content: "Online Quran academy, grammar, poems and daily motivation for kids." },
    ],
  }),
  component: Index,
});

const cards = [
  { to: "/academy", t: "آن لائن اکیڈمی", d: "قرآن، نماز، سیرت — گھر بیٹھے پڑھیں" },
  { to: "/fees", t: "فیس اور داخلہ", d: "ماہانہ فیس، رعایت اور رقم بھیجنے کا طریقہ" },
  { to: "/grammar", t: "عربی گرامر", d: "قرآن سمجھنے کی آسان بنیاد" },
  { to: "/videos", t: "ویڈیوز و نظمیں", d: "ہر روز نئی موٹیویشن" },
  { to: "/daily", t: "روزانہ سوال", d: "ہر دن ایک نیا اسلامی سوال" },
] as const;

function Index() {
  const m = motivations[dayIndex(motivations.length)]!;
  return (
    <>
      <section className="relative">
        <img src={dome} alt="مسجد نبوی ﷺ کا گنبدِ خضریٰ، مدینہ منورہ" width={1536} height={1024} className="h-[70vh] w-full object-cover" />
        <div className="hero-overlay absolute inset-0 flex flex-col items-center justify-end px-4 pb-14 text-center">
          <p className="font-arabic text-3xl text-gold md:text-4xl">فَفِرُّوا إِلَى اللّٰهِ</p>
          <h1 className="mt-3 font-display text-5xl text-primary-foreground md:text-7xl">Flee to Allah</h1>
          <p className="mt-4 max-w-lg leading-loose text-primary-foreground/90">بچوں کے لیے اسلامی تعلیم — قرآن، گرامر، نظمیں اور روزانہ موٹیویشن</p>
          <Link to="/academy" className="btn-gold mt-6">داخلہ لیں</Link>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4">
        <div className="card text-center">
          <p className="text-sm text-gold-deep">آج کی موٹیویشن</p>
          <h2 className="mt-2 text-2xl font-bold text-primary">{m.title}</h2>
          <p className="mt-3 leading-loose text-muted-foreground">{m.text}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="card card-hover">
              <h3 className="text-xl font-bold text-primary">{c.t}</h3>
              <p className="mt-2 text-muted-foreground">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>
      <FaqSection items={faqs.home} />
    </>
  );
}
