import { useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

function loadGoogleTranslate(onReady: () => void) {
  if (document.getElementById("gt-script")) {
    onReady();
    return;
  }
  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      { pageLanguage: "ur", autoDisplay: false },
      "gt-el",
    );
    onReady();
  };
  const s = document.createElement("script");
  s.id = "gt-script";
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(s);
}

export function LanguagePicker() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (open) {
      setOpen(false);
      return;
    }
    loadGoogleTranslate(() => setOpen(true));
    // If the script was already loaded and widget initialized, just open.
    if (document.getElementById("gt-script")) setOpen(true);
  };

  return (
    <div className="relative flex items-center gap-2 text-sm text-muted-foreground">
      <button
        type="button"
        onClick={handleClick}
        aria-label="زبان منتخب کریں"
        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-accent"
      >
        <span aria-hidden>🌐</span>
        <span>زبان</span>
      </button>
      <div
        id="gt-el"
        className={open ? "absolute top-full end-0 z-50 mt-1 rounded-md border border-border bg-card p-2 shadow-lg" : "hidden"}
      />
    </div>
  );
}
