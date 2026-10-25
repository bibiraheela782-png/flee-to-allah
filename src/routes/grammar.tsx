import { createFileRoute } from "@tanstack/react-router";
import { FaqSection, PageHero } from "@/components/site";
import { faqs, grammar } from "@/lib/content";

export const Route = createFileRoute("/grammar")({
  head: () => ({
    meta: [
      { title: "عربی گرامر — Flee to Allah" },
      { name: "description", content: "بچوں کے لیے قرآن فہمی کی آسان عربی گرامر۔" },
      { property: "og:title", content: "Arabic Grammar — Flee to Allah" },
      { property: "og:description", content: "Easy Quranic Arabic grammar lessons for kids." },
    ],
  }),
  component: Grammar,
});

function Grammar() {
  return (
    <>
      <PageHero title="عربی گرامر" sub="قرآن پاک کو سمجھنے کے لیے آسان اسباق" />
      <section className="mx-auto mt-10 grid max-w-5xl gap-4 px-4 sm:grid-cols-2">
        {grammar.map((g, i) => (
          <div key={g.title} className="card">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xl font-bold text-primary">سبق {i + 1}: {g.title}</h3>
              <span className="font-arabic text-xl text-gold-deep">{g.ar}</span>
            </div>
            <p className="mt-3 leading-loose text-muted-foreground">{g.desc}</p>
            <p className="mt-3 rounded-md bg-secondary p-3 font-arabic text-lg text-foreground">مثال: {g.ex}</p>
          </div>
        ))}
      </section>
      <FaqSection items={faqs.grammar} />
    </>
  );
}
