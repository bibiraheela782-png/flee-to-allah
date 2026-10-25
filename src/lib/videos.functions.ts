import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type VideoQuestion = { q: string; options: string[]; answer: number };

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  age_group: string;
  video_url: string;
  summary: string;
  questions: VideoQuestion[];
  featured_date: string | null;
  created_at: string;
};

// Server-side publishable client for public reads (anon SELECT policy).
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type VideoRow = Database["public"]["Tables"]["videos"]["Row"];

// Private bucket: turn storage_path into a temporary watch link (7 days).
async function toItem(client: ReturnType<typeof publicClient>, row: VideoRow): Promise<VideoItem> {
  let url = row.video_url;
  if (row.storage_path) {
    const { data } = await client.storage.from("videos").createSignedUrl(row.storage_path, 60 * 60 * 24 * 7);
    if (data?.signedUrl) url = data.signedUrl;
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    age_group: row.age_group,
    video_url: url,
    summary: row.summary,
    questions: (row.questions as unknown as VideoQuestion[]) ?? [],
    featured_date: row.featured_date,
    created_at: row.created_at,
  };
}

async function toItems(client: ReturnType<typeof publicClient>, rows: VideoRow[]) {
  return Promise.all(rows.map((r) => toItem(client, r)));
}

export const listVideos = createServerFn({ method: "GET" }).handler(async (): Promise<VideoItem[]> => {
  const client = publicClient();
  const { data, error } = await client.from("videos").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return toItems(client, data ?? []);
});

export const getFeaturedVideo = createServerFn({ method: "GET" }).handler(async (): Promise<VideoItem | null> => {
  const client = publicClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: todays } = await client
    .from("videos")
    .select("*")
    .eq("featured_date", today)
    .order("created_at", { ascending: false })
    .limit(1);
  if (todays && todays.length > 0) return toItem(client, todays[0]!);
  const { data: latest } = await client
    .from("videos")
    .select("*")
    .not("featured_date", "is", null)
    .order("featured_date", { ascending: false })
    .limit(1);
  if (latest && latest.length > 0) return toItem(client, latest[0]!);
  const { data: any } = await client.from("videos").select("*").order("created_at", { ascending: false }).limit(1);
  return any && any.length > 0 ? toItem(client, any[0]!) : null;
});

async function requireAdmin(supabase: any, userId: string) {
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) throw new Error("صرف منتظم کے لیے اجازت ہے");
}

export const uploadVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("غلط درخواست");
    return data;
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const file = data.get("file");
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const ageGroup = String(data.get("age_group") ?? "7-10");
    if (!(file instanceof File) || file.size === 0) throw new Error("ویڈیو فائل منتخب کریں");
    if (!title) throw new Error("ویڈیو کا عنوان لکھیں");
    if (file.size > 200 * 1024 * 1024) throw new Error("ویڈیو 200MB سے چھوٹی ہونی چاہیے");

    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const path = `${context.userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await context.supabase.storage.from("videos").upload(path, file, {
      contentType: file.type || "video/mp4",
    });
    if (upErr) throw new Error(upErr.message);

    const { error: insErr } = await context.supabase.from("videos").insert({
      title,
      description,
      age_group: ageGroup,
      video_url: "",
      storage_path: path,
      uploaded_by: context.userId,
    });
    if (insErr) throw new Error(insErr.message);
    return { ok: true };
  });

export const setFeaturedVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { videoId: string; date: string }) => data)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("videos")
      .update({ featured_date: data.date })
      .eq("id", data.videoId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { videoId: string }) => data)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: row } = await context.supabase.from("videos").select("storage_path").eq("id", data.videoId).single();
    const { error } = await context.supabase.from("videos").delete().eq("id", data.videoId);
    if (error) throw new Error(error.message);
    if (row?.storage_path) await context.supabase.storage.from("videos").remove([row.storage_path]);
    return { ok: true };
  });

// AI: age-appropriate Urdu summary + quiz questions from the video's title and notes.
export const generateVideoNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { videoId: string }) => data)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("videos")
      .select("title, description, age_group")
      .eq("id", data.videoId)
      .single();
    if (error || !row) throw new Error("ویڈیو نہیں ملی");

    const { generateResponse } = await import("@lovable.dev/ai-gateway");
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions:
        "آپ ایک اسلامی بچوں کی اکیڈمی کے معلم ہیں۔ دی گئی ویڈیو کے عنوان اور تفصیل کی بنیاد پر بچوں کے لیے سادہ، شائستہ اور عمر کے مطابق اردو مواد لکھیں۔ ایسی باتیں نہ لکھیں جو عنوان یا تفصیل میں نہ ہوں۔",
      input: `ویڈیو کا عنوان: ${row.title}\nتفصیل: ${row.description || "(کوئی تفصیل نہیں)"}\nبچوں کی عمر: ${row.age_group} سال\n\nاس عمر کے بچوں کے لیے:\n1) 3 تا 4 جملوں کا آسان اردو خلاصہ لکھیں۔\n2) 3 کثیر الانتخابی سوالات بنائیں، ہر سوال کے 4 اختیارات اور درست جواب کا نمبر (0 سے 3)۔`,
      text: {
        format: {
          type: "json_schema",
          name: "video_notes",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    q: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    answer: { type: "number" },
                  },
                  required: ["q", "options", "answer"],
                  additionalProperties: false,
                },
              },
            },
            required: ["summary", "questions"],
            additionalProperties: false,
          },
        },
      },
    });

    // Responses API: text lives in output items -> message -> content -> output_text
    let text = "";
    for (const item of (res as any).output ?? []) {
      if (item?.type === "message") {
        for (const c of item.content ?? []) {
          if (c?.type === "output_text" && typeof c.text === "string") text += c.text;
        }
      }
    }
    if (!text) throw new Error("AI سے جواب نہیں ملا، دوبارہ کوشش کریں");
    const parsed = JSON.parse(text) as { summary: string; questions: VideoQuestion[] };
    const { error: upErr } = await context.supabase
      .from("videos")
      .update({ summary: parsed.summary, questions: parsed.questions as any })
      .eq("id", data.videoId);
    if (upErr) throw new Error(upErr.message);
    return { ok: true, summary: parsed.summary };
  });
