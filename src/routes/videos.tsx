import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaqSection, PageHero } from "@/components/site";
import { faqs, motivations, poems, dayIndex } from "@/lib/content";
import { getFeaturedVideo, listVideos, type VideoItem } from "@/lib/videos.functions";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "ویڈیوز و نظمیں — Flee to Allah" },
      { name: "description", content: "بچوں کے لیے روزانہ نئی موٹیویشنل ویڈیو اور اسلامی نظمیں۔" },
      { property: "og:title", content: "Videos & Poems — Flee to Allah" },
      { property: "og:description", content: "A new motivational video every day for Muslim kids." },
    ],
  }),
  component: Videos,
});

function Quiz({ video }: { video: VideoItem }) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  if (!video.questions?.length) return null;
  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-bold text-primary">سوالات — دیکھیں آپ نے کیا سیکھا!</h3>
      {video.questions.map((q, qi) => (
        <div key={qi} className="rounded-md bg-secondary p-3">
          <p className="font-semibold leading-relaxed">{q.q}</p>
          <div className="mt-2 grid gap-2">
            {q.options.map((opt, oi) => {
              const chosen = picked[`${video.id}-${qi}`];
              const answered = chosen !== undefined;
              const isRight = oi === q.answer;
              const cls = answered
                ? isRight
                  ? "border-primary bg-primary/10"
                  : oi === chosen
                    ? "border-destructive bg-destructive/10"
                    : "border-input"
                : "border-input";
              return (
                <button
                  key={oi}
                  disabled={answered}
                  onClick={() => setPicked((p) => ({ ...p, [`${video.id}-${qi}`]: oi }))}
                  className={`rounded-md border px-3 py-2 text-right text-sm leading-relaxed ${cls}`}
                >
                  {opt} {answered && isRight ? "✅" : answered && oi === chosen ? "❌" : ""}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoCard({ video, featured }: { video: VideoItem; featured?: boolean }) {
  return (
    <div className="card">
      {featured && <span className="badge">⭐ آج کی نمایاں ویڈیو</span>}
      <h3 className="mt-2 text-xl font-bold text-primary">{video.title}</h3>
      {video.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{video.description}</p>}
      <video src={video.video_url} controls playsInline preload="metadata" className="mt-3 w-full rounded-md" />
      {video.summary && (
        <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm leading-loose">
          <span className="font-bold text-primary">خلاصہ: </span>
          {video.summary}
        </p>
      )}
      <Quiz video={video} />
    </div>
  );
}

function Videos() {
  const { data: featured } = useQuery({ queryKey: ["featured-video"], queryFn: () => getFeaturedVideo() });
  const { data: videos } = useQuery({ queryKey: ["videos"], queryFn: () => listVideos() });

  const i = dayIndex(motivations.length);
  const m = motivations[i]!;
  const rest = (videos ?? []).filter((v) => v.id !== featured?.id);

  return (
    <>
      <PageHero title="ویڈیوز و نظمیں" sub="ہر روز ایک نئی ویڈیو جو بچوں کو نیکی کی طرف متوجہ کرے" />

      <section className="mx-auto mt-10 max-w-3xl px-4">
        {featured ? (
          <VideoCard video={featured} featured />
        ) : (
          <div className="card text-center">
            <span className="badge">آج کا پیغام — دن {i + 1}</span>
            <h2 className="mt-3 text-2xl font-bold text-primary">{m.title}</h2>
            <p className="mt-3 leading-loose text-muted-foreground">{m.text}</p>
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section className="mx-auto mt-12 max-w-3xl px-4">
          <h2 className="section-title">ہماری ویڈیوز</h2>
          <div className="mt-5 space-y-6">
            {rest.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-12 max-w-5xl px-4">
        <h2 className="section-title">بچوں کی نظمیں</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {poems.map((p) => (
            <div key={p.title} className="card text-center">
              <h3 className="text-xl font-bold text-primary">{p.title}</h3>
              <div className="mt-4 space-y-2 leading-loose text-foreground">
                {p.lines.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
              <p className="mt-4 text-sm text-gold-deep">— {p.by}</p>
            </div>
          ))}
        </div>
      </section>
      <FaqSection items={faqs.videos} />
    </>
  );
}
