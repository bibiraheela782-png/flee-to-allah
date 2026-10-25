import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHero, FaqSection } from "@/components/site";
import { faqs } from "@/lib/content";
import {
  listVideos,
  uploadVideo,
  setFeaturedVideo,
  deleteVideo,
  generateVideoNotes,
  type VideoItem,
} from "@/lib/videos.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "منتظم پینل — Flee to Allah" },
      { name: "description", content: "ویڈیوز اپلوڈ کریں، آج کی ویڈیو منتخب کریں اور AI خلاصہ بنائیں۔" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ageGroup, setAgeGroup] = useState("7-10");
  const [featureDate, setFeatureDate] = useState(() => new Date().toISOString().slice(0, 10));

  const uploadFn = useServerFn(uploadVideo);
  const featureFn = useServerFn(setFeaturedVideo);
  const deleteFn = useServerFn(deleteVideo);
  const aiFn = useServerFn(generateVideoNotes);

  const refresh = async () => setVideos(await listVideos());

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (!isAdmin) {
        setState("denied");
        return;
      }
      setState("ready");
      await refresh();
    })();
  }, [navigate]);

  const doUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMsg("براہ کرم ویڈیو فائل منتخب کریں۔");
      return;
    }
    setBusy(true);
    setMsg("ویڈیو اپلوڈ ہو رہی ہے… بڑی ویڈیو میں کچھ منٹ لگ سکتے ہیں۔");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("age_group", ageGroup);
      await uploadFn({ data: fd });
      setMsg("ویڈیو اپلوڈ ہو گئی! اب نیچے فہرست سے AI خلاصہ بنائیں اور آج کی ویڈیو منتخب کریں۔");
      setTitle("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      await refresh();
    } catch (err) {
      setMsg("خرابی: " + (err instanceof Error ? err.message : String(err)));
    }
    setBusy(false);
  };

  const doFeature = async (videoId: string) => {
    setBusy(true);
    try {
      await featureFn({ data: { videoId, date: featureDate } });
      setMsg(`یہ ویڈیو ${featureDate} کی نمایاں ویڈیو بن گئی۔`);
      await refresh();
    } catch (err) {
      setMsg("خرابی: " + (err instanceof Error ? err.message : String(err)));
    }
    setBusy(false);
  };

  const doAi = async (videoId: string) => {
    setBusy(true);
    setMsg("AI خلاصہ اور سوالات بنا رہا ہے…");
    try {
      await aiFn({ data: { videoId } });
      setMsg("AI خلاصہ اور سوالات تیار ہیں اور بچوں کو دکھ رہے ہیں۔");
      await refresh();
    } catch (err) {
      setMsg("خرابی: " + (err instanceof Error ? err.message : String(err)));
    }
    setBusy(false);
  };

  const doDelete = async (videoId: string) => {
    if (!confirm("کیا آپ واقعی یہ ویڈیو حذف کرنا چاہتے ہیں؟")) return;
    setBusy(true);
    try {
      await deleteFn({ data: { videoId } });
      setMsg("ویڈیو حذف ہو گئی۔");
      await refresh();
    } catch (err) {
      setMsg("خرابی: " + (err instanceof Error ? err.message : String(err)));
    }
    setBusy(false);
  };

  if (state === "loading") {
    return <p className="py-20 text-center text-muted-foreground">لوڈ ہو رہا ہے…</p>;
  }

  if (state === "denied") {
    return (
      <section className="mx-auto mt-16 max-w-md px-4 text-center">
        <div className="card">
          <h1 className="text-xl font-bold text-primary">اجازت نہیں ہے</h1>
          <p className="mt-3 leading-loose text-muted-foreground">
            یہ صفحہ صرف اکیڈمی کے منتظم کے لیے ہے۔ اگر آپ منتظم ہیں تو پہلے{" "}
            <Link to="/auth" className="text-primary underline">لاگ اِن</Link> کریں۔
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero title="منتظم پینل" sub="ویڈیوز اپلوڈ کریں، روزانہ کی نمایاں ویڈیو منتخب کریں، اور AI سے خلاصہ و سوالات بنائیں" />
      <section className="mx-auto mt-10 max-w-3xl px-4">
        <form onSubmit={doUpload} className="card space-y-4">
          <h2 className="text-xl font-bold text-primary">نئی ویڈیو اپلوڈ کریں</h2>
          <div>
            <label className="mb-1 block font-semibold">ویڈیو فائل (200MB تک)</label>
            <input ref={fileRef} type="file" accept="video/*" required className="w-full rounded-md border border-input bg-background px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block font-semibold">ویڈیو کا عنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="مثلاً: سچ بولنے کی برکت" className="w-full rounded-md border border-input bg-background px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block font-semibold">تفصیل (AI اسی سے خلاصہ اور سوالات بناتا ہے — جتنی مکمل ہو اتنا بہتر)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="ویڈیو میں کیا سکھایا گیا ہے؟ کن باتوں پر مشتمل ہے؟" className="w-full rounded-md border border-input bg-background px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block font-semibold">بچوں کی عمر</label>
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
              <option value="4-6">4 تا 6 سال</option>
              <option value="7-10">7 تا 10 سال</option>
              <option value="11-14">11 تا 14 سال</option>
            </select>
          </div>
          {msg && <p className="rounded-md bg-secondary px-3 py-2 text-sm leading-relaxed">{msg}</p>}
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "براہ کرم انتظار کریں…" : "⬆ ویڈیو اپلوڈ کریں"}
          </button>
        </form>
      </section>

      <section className="mx-auto mt-12 max-w-3xl px-4">
        <div className="card">
          <h2 className="text-xl font-bold text-primary">آج کی نمایاں ویڈیو</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            جس دن کی ویڈیو دکھانی ہو وہ تاریخ چنیں، پھر نیچے کسی ویڈیو کے سامنے "نمایاں کریں" دبائیں۔ بچوں کو ویڈیوز والے صفحے پر سب سے اوپر یہی ویڈیو دکھے گی۔
          </p>
          <input type="date" value={featureDate} onChange={(e) => setFeatureDate(e.target.value)} className="mt-3 rounded-md border border-input bg-background px-3 py-2" dir="ltr" />
        </div>

        <div className="mt-6 space-y-4">
          {videos.length === 0 && <p className="text-center text-muted-foreground">ابھی کوئی ویڈیو اپلوڈ نہیں ہوئی۔</p>}
          {videos.map((v) => (
            <div key={v.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    عمر: {v.age_group} سال
                    {v.featured_date ? ` — نمایاں: ${v.featured_date}` : ""}
                    {v.summary ? " — AI خلاصہ موجود ✅" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => doFeature(v.id)} disabled={busy} className="btn-gold px-3 py-1 text-sm">⭐ نمایاں کریں</button>
                  <button onClick={() => doAi(v.id)} disabled={busy} className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">🤖 AI خلاصہ و سوالات</button>
                  <button onClick={() => doDelete(v.id)} disabled={busy} className="rounded-md border border-destructive px-3 py-1 text-sm text-destructive">حذف</button>
                </div>
              </div>
              {v.summary && <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm leading-relaxed">{v.summary}</p>}
            </div>
          ))}
        </div>
      </section>

      <FaqSection items={faqs.admin} />
    </>
  );
}
