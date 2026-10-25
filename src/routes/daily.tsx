import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FaqSection, PageHero } from "@/components/site";
import { faqs, questions, dayIndex } from "@/lib/content";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "روزانہ سوال — Flee to Allah" },
      { name: "description", content: "بچوں کے لیے ہر روز ایک نیا اسلامی سوال۔" },
      { property: "og:title", content: "Daily Question — Flee to Allah" },
      { property: "og:description", content: "A new Islamic quiz question every day." },
    ],
  }),
  component: Daily,
});

function Daily() {
  const q = questions[dayIndex(questions.length)]!;
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <>
      <PageHero title="آج کا سوال" sub="ہر روز ایک نیا سوال — سوچیں اور جواب دیں!" />
      <section className="mx-auto mt-10 max-w-2xl px-4">
        <div className="card">
          <h2 className="text-center text-2xl font-bold text-primary">{q.q}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const state = picked === null ? "" : i === q.answer ? "opt-right" : i === picked ? "opt-wrong" : "";
              return (
                <button key={o} disabled={picked !== null} onClick={() => setPicked(i)} className={`opt ${state}`}>{o}</button>
              );
            })}
          </div>
          {picked !== null && (
            <p className="mt-5 text-center text-lg font-semibold text-primary">
              {picked === q.answer ? "ماشاءاللہ! بالکل صحیح جواب 🌟" : `صحیح جواب: ${q.options[q.answer]}`}
            </p>
          )}
        </div>
      </section>
      <FaqSection items={faqs.daily} />
    </>
  );
}
