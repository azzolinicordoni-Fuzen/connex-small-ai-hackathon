// Hack-Nation 2026 — Connex Field (Phase 2: offline triage, local persistence, offline FAQ)
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Wifi, WifiOff, ShieldAlert, Check, ArrowLeft, Trash2, MessageCircleQuestion, ClipboardList, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fieldStrings, type FieldLang, type FieldStrings } from "@/field/i18n";
import { QUESTIONS, STEPS, BIOMES, qById, optLabel, type LocationValue } from "@/field/questions";
import {
  createSession, deleteAllLocalData, getDB, getLatestSession, loadAnswers, loadDiagnosis, requestPersistence, saveDiagnosis,
  saveAnswer, updateSession, type SessionRec,
} from "@/field/db";
import { buildLocalResult, SPECIALISTS, type LocalResult } from "@/field/pathways";
import { QuestionInput } from "@/field/components/QuestionInput";
import { Assistant } from "@/field/components/Assistant";
import { SyncPanel } from "@/field/components/SyncPanel";

const LANG_KEY = "connex-field-lang";
const REVIEW = STEPS.length;
type View = "home" | "triage" | "assistant";

function useOnline() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

const SENSITIVE = /@|\d{4,}/;

function validateStep(step: number, a: Record<string, unknown>, t: FieldStrings): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 0) {
    if (!a.C01) e.C01 = t.required;
    if (a.C02 !== "yes") e.C02 = a.C02 === undefined ? t.required : t.consentRequired;
  }
  if (step === 1 && typeof a.C03 === "string") {
    if (a.C03.length > 40) e.C03 = t.tooLong;
    else if (SENSITIVE.test(a.C03)) e.C03 = t.noSensitive;
  }
  if (step === 2) {
    const l = a.C06 as LocationValue | undefined;
    if (l && (SENSITIVE.test(l.municipality) || SENSITIVE.test(l.state))) e.C06 = t.noSensitive;
  }
  return e;
}

function formatAnswer(id: string, v: unknown, lang: FieldLang, t: FieldStrings): string {
  if (id === "C06") {
    const l = v as LocationValue;
    return [l.country === "BR" ? t.brazil : t.otherCountry, l.state, l.municipality].filter(Boolean).join(" · ");
  }
  if (id === "C06.biome") return optLabel({ options: BIOMES }, v as string, lang);
  const q = qById(id);
  if (Array.isArray(v)) return v.map((x) => optLabel(q, x, lang)).join(", ");
  return q.kind === "text" ? String(v) : optLabel(q, v as string, lang);
}

export default function Field() {
  const [lang, setLang] = useState<FieldLang>(() => (localStorage.getItem(LANG_KEY) === "pt" ? "pt" : "en"));
  const t = fieldStrings[lang];
  const online = useOnline();
  const [view, setView] = useState<View>("home");
  const [session, setSession] = useState<SessionRec | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentRefused, setConsentRefused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [stored, setStored] = useState<LocalResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.title = "Connex Field";
  }, [lang]);

  // Restore the latest local session at its exact step.
  useEffect(() => {
    (async () => {
      try {
        const s = await getLatestSession();
        if (s) {
          setSession(s);
          setAnswers(await loadAnswers(s.local_session_id));
          setStep(s.step);
          const d = await loadDiagnosis(s.local_session_id);
          if (d) setStored(JSON.parse(d.result_json));
          if (s.status === "draft") setView("triage");
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => { headingRef.current?.focus(); }, [step, view]);

  const setAnswer = useCallback(async (key: string, value: unknown) => {
    // "C06.biome" is stored inside the C06 answer.
    const qid = key === "C06.biome" ? "C06" : key;
    setErrors((e) => ({ ...e, [qid]: "" }));
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    if (qid === "C01") setLang(value as FieldLang);
    if (qid === "C02") {
      if (value === "no") {
        setConsentRefused(true);
        return;
      }
      setConsentRefused(false);
      if (!session) {
        const s = await createSession((answers.C01 as FieldLang) ?? lang, { ...answers, C02: "yes" }, 0);
        setSession(s);
        void requestPersistence();
        return;
      }
    }
    // Before local consent, answers live only in memory.
    if (session) {
      await saveAnswer(session.local_session_id, qid, value);
      if (qid === "C01") setSession(await updateSession(session.local_session_id, { language: value as FieldLang }));
      // Phase 4: explicit sync authorization timestamp (cleared if withdrawn).
      if (qid === "C19") setSession(await updateSession(session.local_session_id, { sync_consented_at: value === "authorize_now" ? new Date().toISOString() : undefined }));
    }
  }, [answers, lang, session]);

  const goTo = async (n: number) => {
    setStep(n);
    setErrors({});
    if (session) setSession(await updateSession(session.local_session_id, { step: n, language: lang }));
  };

  const next = () => {
    const e = validateStep(step, answers, t);
    if (Object.values(e).some(Boolean)) return setErrors(e);
    void goTo(step + 1);
  };

  const finish = async () => {
    if (!session) return;
    const db = await getDB();
    await db.put("outbox", {
      local_session_id: session.local_session_id, operation: "sync_triage", payload_version: session.pack_version,
      payload_json: JSON.stringify(answers), attempts: 0, last_error: null,
    });
    const result = buildLocalResult(answers);
    await saveDiagnosis({ local_session_id: session.local_session_id, payload_version: result.assessment_version, result_json: JSON.stringify(result), received_at: result.generated_at });
    setStored(result);
    setSession(await updateSession(session.local_session_id, { status: "ready_to_sync", step: REVIEW }));
    toast.success(t.savedResult);
  };

  const wipe = async () => {
    await deleteAllLocalData();
    setSession(null); setStored(null); setAnswers({}); setStep(0); setErrors({}); setConsentRefused(false); setView("home");
    toast.success(t.deleted);
  };

  const startOrResume = () => {
    // A synced session keeps only its receipt; a new triage starts fresh.
    if (session?.status === "synced") { setSession(null); setStored(null); setAnswers({}); setStep(0); setView("triage"); return; }
    setView("triage"); if (!session) setStep(0);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" aria-label={t.backToConnex} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <Logo size="sm" />
          <span className="hidden text-xs sm:inline">{t.backToConnex}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge role="status" aria-live="polite" title={online ? t.onlineMsg : t.offlineMsg} variant={online ? "default" : "destructive"} className="gap-1">
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? t.online : t.offline}
          </Badge>
          <div role="group" aria-label={t.language} className="flex rounded-md border border-border p-0.5">
            {(["en", "pt"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {l === "en" ? "EN" : "PT"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav aria-label="Connex Field" className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4">
        <Button variant={view === "home" ? "secondary" : "ghost"} size="sm" onClick={() => setView("home")}>{t.home}</Button>
        <Button variant={view === "triage" ? "secondary" : "ghost"} size="sm" onClick={startOrResume}><ClipboardList className="mr-1 h-4 w-4" />{session ? t.resume : t.begin}</Button>
        <Button variant={view === "assistant" ? "secondary" : "ghost"} size="sm" onClick={() => setView("assistant")}><MessageCircleQuestion className="mr-1 h-4 w-4" />{t.assistantTitle}</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto border-destructive/50 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-4 w-4" />{t.deleteLocal}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark bg-background text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{t.deleteConfirm}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={wipe} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t.delete}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        {view === "home" && (
          <>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Hack-Nation 2026</p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-4xl font-bold outline-none sm:text-5xl">Connex Field</h1>
            <p className="mt-3 text-xl text-primary">{t.tagline}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t.intro}</p>
            <ul className="mt-6 space-y-2">
              {[t.point1, t.point2, t.point3].map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{p}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">{online ? t.onlineMsg : t.offlineMsg}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={startOrResume} disabled={!loaded}>{session ? t.resume : t.begin}</Button>
              <Button size="lg" variant="outline" onClick={() => setView("assistant")}>{t.askAssistant}</Button>
            </div>
          </>
        )}

        {view === "assistant" && <Assistant lang={lang} t={t} sessionId={session?.local_session_id ?? null} />}

        {view === "triage" && step < REVIEW && (
          <section aria-labelledby="step-title" className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t.step} {step + 1} {t.of} {STEPS.length}</span>
                <span>{session ? t.saved : t.notSaved}</span>
              </div>
              <Progress value={((step + 1) / (STEPS.length + 1)) * 100} aria-label={`${t.step} ${step + 1} ${t.of} ${STEPS.length}`} />
              <h1 id="step-title" ref={headingRef} tabIndex={-1} className="pt-2 font-display text-2xl font-bold outline-none">{STEPS[step].title[lang]}</h1>
            </div>

            {step === 0 && (
              <div className="rounded-md border border-border bg-card p-4 text-sm">
                <p className="font-semibold">{t.limitationTitle}</p>
                <p className="mt-1 text-muted-foreground">{t.limitation}</p>
                <p className="mt-2 text-muted-foreground">{t.disclaimer}</p>
              </div>
            )}

            {STEPS[step].questions.map((key) => (
              <QuestionInput
                key={key}
                q={key === "C06.biome" ? "C06.biome" : qById(key)}
                value={key === "C06.biome" ? answers.C06 : answers[key]}
                onChange={(v) => setAnswer(key, v)}
                lang={lang}
                t={t}
                error={errors[key === "C06.biome" ? "C06" : key]}
              />
            ))}

            {step === 0 && consentRefused && (
              <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm">
                <p className="font-semibold">{t.consentRefusedTitle}</p>
                <p className="mt-1">{t.consentRefused}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setView("assistant")}>{t.askAssistant}</Button>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => (step === 0 ? setView("home") : goTo(step - 1))}>{t.back}</Button>
              <Button onClick={next} disabled={step === 0 && consentRefused}>{step === STEPS.length - 1 ? t.review : t.continue}</Button>
            </div>
          </section>
        )}

        {view === "triage" && step >= REVIEW && (
          <Review
            t={t} lang={lang} answers={answers} session={session} stored={stored}
            onEdit={(n) => goTo(n)} onBack={() => goTo(REVIEW - 1)}
            onSync={(v) => setAnswer("C19", v)} onFinish={finish} headingRef={headingRef}
            online={online} onSession={setSession}
          />
        )}

        <section className="mt-10 rounded-lg border border-border bg-card p-4" aria-labelledby="disclaimer-title">
          <h2 id="disclaimer-title" className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 text-primary" />{t.disclaimerTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.disclaimer}</p>
        </section>
      </main>
    </div>
  );
}

function Review({ t, lang, answers, session, stored, onEdit, onBack, onSync, onFinish, headingRef, online, onSession }: {
  online: boolean; onSession: (s: SessionRec) => void;
  t: FieldStrings; lang: FieldLang; answers: Record<string, unknown>; session: SessionRec | null; stored: LocalResult | null;
  onEdit: (step: number) => void; onBack: () => void; onSync: (v: string) => void; onFinish: () => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
}) {
  const status = session?.status ?? "draft";
  if (status === "synced") return (
    <section aria-labelledby="review-title" className="space-y-6">
      <h1 id="review-title" ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none">{t.resultTitle}</h1>
      <SyncPanel lang={lang} online={online} session={session} answers={answers} result={stored} onSession={onSession} />
    </section>
  );
  // Draft: live result. After saving: the stored result (reopens offline unchanged).
  const result = status !== "draft" && stored ? stored : buildLocalResult(answers);
  const missing = result.missing;
  const stepOf = (k: string) => STEPS.findIndex((s) => s.questions.includes(k));
  const facts: { key: string; step: number }[] = [];
  STEPS.forEach((s, i) => s.questions.forEach((k) => {
    if (k === "C02") return;
    const v = k === "C06.biome" ? (answers.C06 as LocationValue | undefined)?.biome : answers[k];
    if (v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)) facts.push({ key: k, step: i });
  }));
  const label = (k: string) => (k === "C06.biome" ? t.biome : qById(k).label[lang]);
  const val = (k: string) => (k === "C06.biome" ? formatAnswer(k, (answers.C06 as LocationValue).biome, lang, t) : formatAnswer(k, answers[k], lang, t));

  return (
    <section aria-labelledby="review-title" className="space-y-6">
      <h1 id="review-title" ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none">{t.resultTitle}</h1>

      <div>
        <h2 className="mb-2 font-semibold">{t.facts}</h2>
        <dl className="divide-y divide-border rounded-md border border-border">
          {facts.map(({ key, step }) => (
            <div key={key} className="flex items-start justify-between gap-3 p-3 text-sm">
              <div>
                <dt className="text-muted-foreground"><span className="mr-1 font-mono text-xs">{key.replace(".biome", "")}</span>{label(key)}</dt>
                <dd className="mt-0.5 font-medium">{val(key)}</dd>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEdit(step)} aria-label={`${t.edit}: ${label(key)}`}>{t.edit}</Button>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">{t.missing}</h2>
        {missing.length === 0 ? <p className="text-sm text-muted-foreground">{t.noMissing}</p> : (
          <ul className="space-y-1 text-sm">
            {missing.map((k) => (
              <li key={k} className="flex items-center justify-between gap-2">
                <span><span className="mr-1 font-mono text-xs text-muted-foreground">{k.replace(".biome", "")}</span>{label(k)}</span>
                <Button variant="link" size="sm" onClick={() => onEdit(stepOf(k))}>{t.edit}</Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-semibold">{t.pathwaysTitle}</h2>
        <ul className="space-y-3">
          {result.pathways.map((p) => (
            <li key={p.id} data-pathway={p.id} className="rounded-md border border-primary/40 bg-card p-4 text-sm">
              <p className="font-semibold">{p.label[lang]}</p>
              <p className="mt-1 text-xs italic text-muted-foreground">{p.notice[lang]}</p>
              <p className="mt-2"><span className="text-muted-foreground">{t.whyAppeared}: </span>{p.why[lang]}</p>
              <p className="mt-1"><span className="text-muted-foreground">{t.contributed}: </span>
                {p.contributions.map((c) => `${c.question.replace(".biome", "")} (${formatAnswer(c.question, c.question === "C06.biome" ? c.value : answers[c.question] ?? c.value, lang, t)})`).join("; ")}</p>
              <p className="mt-1"><span className="text-muted-foreground">{t.missingInfo}: </span>
                {p.missing.length ? p.missing.map((k) => `${k.replace(".biome", "")} ${label(k)}`).join("; ") : t.none}</p>
              <p className="mt-1"><span className="text-muted-foreground">{t.relatedFaq}: </span>{p.faq.join(", ")}</p>
              <p className="mt-1"><span className="text-muted-foreground">{t.specialistsTitle}: </span>{p.specialists.map((x) => SPECIALISTS[x][lang]).join(", ")}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">{t.safeguardsTitle}</h2>
        {result.safeguards.length === 0 ? <p className="text-sm text-muted-foreground">{t.noSafeguards}</p> : (
          <ul className="space-y-2">
            {result.safeguards.map((f) => (
              <li key={f.id} data-flag={f.id} className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p>{f.why[lang]} <span className="text-xs text-muted-foreground">({f.faq})</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.triggeredBy}: {f.trigger.map((c) => `${c.question} (${c.value ? formatAnswer(c.question, answers[c.question] ?? c.value, lang, t) : "—"})`).join("; ")}</p>
                  <p className="mt-1 text-xs italic text-muted-foreground">{f.notice[lang]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-semibold">{t.nextStepsTitle}</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">{result.next_steps.map((n) => <li key={n.id}>{n.text[lang]}</li>)}</ol>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">{t.specialistsTitle}</h2>
        <ul className="flex flex-wrap gap-2">{result.specialists.map((x) => <li key={x}><Badge variant="secondary">{SPECIALISTS[x][lang]}</Badge></li>)}</ul>
      </div>

      <p className="text-xs text-muted-foreground">{t.assessmentVersion}: <span className="font-mono">{result.assessment_version}</span> · {t.aiModelVersion}: <span className="font-mono">{result.model.name} {result.model.version}</span></p>

      <QuestionInput q={qById("C19")} value={answers.C19} onChange={(v) => onSync(v as string)} lang={lang} t={t} />

      <p className="text-sm" role="status">{t.syncStatus}: {t[`status_${status}` as keyof FieldStrings]}</p>
      <SyncPanel lang={lang} online={online} session={session} answers={answers} result={stored} onSession={onSession} />

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack}>{t.back}</Button>
        <Button onClick={onFinish} disabled={!session || status !== "draft"}>{t.finish}</Button>
      </div>
    </section>
  );
}
