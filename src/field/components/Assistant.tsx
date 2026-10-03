// Offline assistant UI over the deterministic search. No network calls.
import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { faqById, searchFaq, type FaqEntry, type SearchResult } from "@/field/search";
import { REFERENCES } from "@/field/references";
import { addConversation, loadConversations, type ConversationRec } from "@/field/db";
import type { FieldLang, FieldStrings } from "@/field/i18n";

export function Assistant({ lang, t, sessionId }: { lang: FieldLang; t: FieldStrings; sessionId: string | null }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<SearchResult | null>(null);
  const [shown, setShown] = useState<FaqEntry | null>(null);
  const [history, setHistory] = useState<ConversationRec[]>([]);

  useEffect(() => {
    if (sessionId) loadConversations(sessionId).then((h) => setHistory(h.sort((a, b) => b.created_at.localeCompare(a.created_at))));
    else setHistory([]);
  }, [sessionId]);

  // Re-render the displayed answer in the newly selected language (same stable ID).
  useEffect(() => {
    if (shown) setShown(faqById(shown.id, lang));
    setRes(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const ask = async (query: string) => {
    const r = searchFaq(query, lang);
    setRes(r);
    setShown(r.kind === "answer" ? r.entry : null);
    if (sessionId) {
      await addConversation({ local_session_id: sessionId, language: lang, query, result_id: r.kind === "answer" ? r.entry.id : null, outcome: r.kind });
      setHistory(await loadConversations(sessionId).then((h) => h.sort((a, b) => b.created_at.localeCompare(a.created_at))));
    }
  };

  const open = (e: FaqEntry) => { setShown(e); setRes(null); };

  return (
    <section aria-labelledby="assistant-title" className="space-y-4">
      <h2 id="assistant-title" className="font-display text-2xl font-bold">{t.assistantTitle}</h2>
      <p className="text-sm text-muted-foreground">{t.assistantHint}</p>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q.trim()); }} className="flex gap-2">
        <Input aria-label={t.ask} placeholder={t.askPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} />
        <Button type="submit"><Search className="mr-1 h-4 w-4" />{t.ask}</Button>
      </form>

      {res?.kind === "fallback" && (
        <p role="status" className="rounded-md border border-border bg-card p-4 font-medium">{res.text}</p>
      )}
      {res?.kind === "clarify" && (
        <div role="status" className="rounded-md border border-border bg-card p-4">
          <p className="mb-2 font-medium">{t.didYouMean}</p>
          <ul className="space-y-1">
            {res.options.map((e) => (
              <li key={e.id}><button className="text-left text-primary underline-offset-2 hover:underline" onClick={() => open(e)}>{e.id} · {e.question}</button></li>
            ))}
          </ul>
        </div>
      )}
      {shown && (
        <article className="rounded-md border border-primary/40 bg-card p-4" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t.source}: {shown.id}</p>
          <h3 className="mt-1 font-semibold">{shown.question}</h3>
          <p className="mt-2 leading-relaxed">{shown.approved_answer}</p>
          <div className="mt-3 text-xs text-muted-foreground">
            <span className="font-semibold">{t.references}:</span>{" "}
            {shown.references.map((r) => (
              <a key={r} href={REFERENCES[r].url} target="_blank" rel="noreferrer" className="mr-2 underline">[{r}] {REFERENCES[r].title}</a>
            ))}
          </div>
          {res?.kind === "answer" && res.related.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">{t.related}</p>
              <ul className="mt-1 space-y-1 text-sm">
                {res.related.map((e) => (
                  <li key={e.id}><button className="text-left text-primary hover:underline" onClick={() => open(faqById(e.id, lang))}>{e.id} · {e.question}</button></li>
                ))}
              </ul>
            </div>
          )}
        </article>
      )}

      {history.length > 0 && (
        <div>
          <p className="mb-1 flex items-center gap-1 text-sm font-semibold"><BookOpen className="h-4 w-4" />{t.history}</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {history.slice(0, 5).map((h) => (
              <li key={h.id}>
                <button className="text-left hover:text-foreground" onClick={() => (h.result_id ? open(faqById(h.result_id, lang)) : ask(h.query))}>
                  “{h.query}” {h.result_id ? `→ ${h.result_id}` : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
