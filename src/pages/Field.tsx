// Hack-Nation 2026 — Connex Field (Phase 1: offline shell)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wifi, WifiOff, ShieldAlert, Check, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fieldStrings, type FieldLang } from "@/field/i18n";

const LANG_KEY = "connex-field-lang";

function useOnline() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export default function Field() {
  const [lang, setLang] = useState<FieldLang>(() =>
    localStorage.getItem(LANG_KEY) === "pt" ? "pt" : "en",
  );
  const online = useOnline();
  const t = fieldStrings[lang];

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.title = "Connex Field";
  }, [lang]);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <Link to="/" aria-label={t.back} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Badge
            role="status"
            aria-live="polite"
            variant={online ? "default" : "destructive"}
            className="gap-1"
          >
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? t.online : t.offline}
          </Badge>
          <div role="group" aria-label={t.language} className="flex rounded-md border border-border p-0.5">
            {(["en", "pt"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "en" ? "EN" : "PT"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Hack-Nation 2026</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Connex Field</h1>
        <p className="mt-3 text-xl text-primary">{t.tagline}</p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t.intro}</p>

        <ul className="mt-6 space-y-2">
          {[t.point1, t.point2, t.point3].map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" disabled aria-describedby="coming-next">
            {t.begin}
          </Button>
          <span id="coming-next" className="text-sm text-muted-foreground">{t.comingNext}</span>
        </div>

        <section className="mt-10 rounded-lg border border-border bg-card p-4" aria-labelledby="disclaimer-title">
          <h2 id="disclaimer-title" className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4 text-primary" />
            {t.disclaimerTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.disclaimer}</p>
        </section>
      </main>
    </div>
  );
}
