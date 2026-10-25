import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "منتظم لاگ اِن — Flee to Allah" },
      { name: "description", content: "اکیڈمی منتظم کے لیے لاگ اِن صفحہ۔" },
    ],
  }),
  component: AuthPage,
});

// Supabase کی انگریزی غلطیوں کو آسان اردو میں بدلنا
const urduError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes("weak") || m.includes("password"))
    return "پاس ورڈ بہت آسان ہے۔ حروف اور نمبر ملا کر ایک مشکل پاس ورڈ بنائیں، مثلاً Flee2026@ — پھر دوبارہ کوشش کریں۔";
  if (m.includes("not allowed") || m.includes("mistyped") || m.includes("invalid email"))
    return "ای میل کا پتہ درست نہیں لگ رہا۔ دوبارہ لکھ کر دیکھیں — @gmail.com جیسی ہجے پوری درست لکھیں۔";
  if (m.includes("already registered"))
    return "اس ای میل پر اکاؤنٹ پہلے سے بنا ہوا ہے۔ نیچے 'پہلے سے اکاؤنٹ ہے؟' پر کلک کر کے لاگ اِن کریں۔";
  if (m.includes("rate limit") || m.includes("too many"))
    return "بہت جلدی جلدی کوششیں ہوئیں۔ تھوڑی دیر بعد دوبارہ کریں۔";
  if (m.includes("signups not allowed") || m.includes("disabled"))
    return "ابھی نئے اکاؤنٹ بند ہیں۔ براہ کرم ہم سے رابطہ کریں۔";
  return "ای میل یا پاس ورڈ درست نہیں۔ " + message;
};

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsgOk(false);
        setMsg(
          error.message.toLowerCase().includes("not confirmed")
            ? "آپ کی ای میل کی ابھی تصدیق نہیں ہوئی۔ اپنا Gmail کھولیں (Spam/Junk بھی دیکھیں) اور تصدیق کا لنک دبائیں، پھر دوبارہ لاگ اِن کریں۔"
            : "ای میل یا پاس ورڈ درست نہیں۔ اگر اکاؤنٹ نہیں بنا تو پہلے نیا اکاؤنٹ بنائیں۔",
        );
      } else {
        navigate({ to: "/admin" });
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMsgOk(false);
        setMsg(urduError(error.message));
      } else {
        setMsgOk(true);
        setMsg("اکاؤنٹ بن گیا! اپنی ای میل کھول کر تصدیق کا لنک دبائیں، پھر لاگ اِن کریں۔ اگر ای میل نہ ملے تو سپیم (Junk) خانہ بھی دیکھیں۔");
      }
    }
    setBusy(false);
  };


  return (
    <>
      <PageHero title="منتظم لاگ اِن" sub="یہ صفحہ صرف اکیڈمی کے منتظم کے لیے ہے" />
      <section className="mx-auto mt-10 max-w-md px-4">
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="mb-1 block font-semibold">ای میل</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              dir="ltr"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold">پاس ورڈ</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              dir="ltr"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              کم از کم 8 حروف — حروف اور نمبر ملا کر مشکل پاس ورڈ بنائیں (مثلاً Flee2026@)
            </p>
          </div>
          {msg && (
            <p
              className={`rounded-md px-3 py-2 text-sm leading-loose ${msgOk ? "bg-secondary" : "bg-secondary text-destructive"}`}
            >
              {msg}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "براہ کرم انتظار کریں…" : mode === "login" ? "لاگ اِن" : "اکاؤنٹ بنائیں"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-center text-sm text-primary underline"
          >
            {mode === "login" ? "نیا اکاؤنٹ بنانا ہے؟" : "پہلے سے اکاؤنٹ ہے؟ لاگ اِن کریں"}
          </button>
        </form>
      </section>
    </>
  );
}
