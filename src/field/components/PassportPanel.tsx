// Hack-Nation 2026 — Connex Field Phase 5/5.2: Initial Passport panel — mobile-first action report.
// Presentation only: renders the saved structured result; never changes it and never calls the model on open.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckSquare, ChevronDown, Compass, FileText, Info, ListChecks, Loader2, MapPin, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { SessionRec } from "@/field/db";
import type { FieldLang } from "@/field/i18n";
import { generatePassport, loadSavedPassport, type PassportDiag } from "@/field/passport";
import faqEn from "@/content/field/faq.en.json";
import faqPt from "@/content/field/faq.pt.json";

type L = Record<FieldLang, string>;
const PATHWAY: Record<string, L> = {
  forest_conservation: { en: "Forest conservation", pt: "Conservação florestal" },
  restoration_reforestation: { en: "Restoration / reforestation", pt: "Restauração / reflorestamento" },
  regenerative_agriculture_soil: { en: "Regenerative agriculture and soil", pt: "Agricultura regenerativa e solo" },
  improved_livestock_management: { en: "Improved livestock management", pt: "Manejo pecuário aprimorado" },
  waste_methane_management: { en: "Waste and methane management", pt: "Gestão de resíduos e metano" },
  renewable_energy: { en: "Renewable energy", pt: "Energia renovável" },
  specialist_assessment_required: { en: "Specialist assessment required", pt: "Avaliação por especialista necessária" },
};
const FLAG: Record<string, L> = {
  land_documentation_uncertain: { en: "Land documentation uncertain", pt: "Documentação fundiária incerta" },
  decision_rights_uncertain: { en: "Decision rights uncertain", pt: "Direito de decisão incerto" },
  land_dispute_overlap: { en: "Possible overlap or dispute", pt: "Possível sobreposição ou disputa" },
  existing_carbon_contract: { en: "Existing carbon commitment", pt: "Compromisso de carbono existente" },
  community_rights: { en: "Community rights", pt: "Direitos de comunidades" },
  car_absent_pending: { en: "CAR absent or pending", pt: "CAR ausente ou pendente" },
  activity_already_started: { en: "Activity already started", pt: "Atividade já iniciada" },
  insufficient_records: { en: "Insufficient records", pt: "Registros insuficientes" },
  monitoring_readiness: { en: "Monitoring readiness", pt: "Preparação para monitoramento" },
};
const AGENT: Record<string, L> = {
  proprietario: { en: "Landowners", pt: "Proprietários" }, engenheiro: { en: "Engineers", pt: "Engenheiros" },
  desenvolvedor: { en: "Project developers", pt: "Desenvolvedores" }, certificadora: { en: "Certification bodies", pt: "Certificadoras" },
  investidor: { en: "Investors", pt: "Investidores" }, projeto: { en: "Projects", pt: "Projetos" }, comprador: { en: "Buyers", pt: "Compradores" },
  auditor: { en: "Auditors", pt: "Auditores" }, financeira: { en: "Financial institutions", pt: "Instituições financeiras" },
  advogado: { en: "Lawyers", pt: "Advogados" }, outro: { en: "Other", pt: "Outros" },
};
const S = {
  en: {
    title: "Initial Passport", langNote: "This Passport was generated in the assessment language.", intro: "Optional online summary prepared from your synchronized assessment. Your offline result stays the reference.",
    gen: "Generate Initial Passport", generating: "Preparing your Initial Passport…", needOnline: "Connect to the internet to generate it.",
    needAuth: "Sign in to generate it.", unavailable: "The Initial Passport is temporarily unavailable. Your offline result is safe. Try again later.",
    config: "Model configuration required. The online passport is not available yet; your offline result is unaffected.",
    error: "The Initial Passport could not be prepared. Nothing was lost.", retry: "Try again", busy: "Already being prepared — checking again…",
    id: "Assessment", date: "Prepared", facts: "What you declared", paths: "Candidate pathways to investigate", flags: "Safeguards to review",
    missing: "Missing information", next: "Next steps", agents: "Suggested Connex agent categories", completeness: "Completeness of declared information",
    comp: { low: "Low", medium: "Medium", high: "High" }, compNote: "Refers only to how much information you declared — not eligibility, quality or credit potential.",
    refs: "Knowledge references", fields: "Based on", openQ: "Still to validate", spec: "Specialist", meta: "Model / prompt version",
    find: "Find compatible Connex agents", findNote: "Opens the Connex network. Your assessment answers are never published.",
  },
  pt: {
    title: "Passaporte Inicial", langNote: "Este Passaporte foi gerado no idioma da avaliação.", intro: "Resumo online opcional preparado a partir da sua avaliação sincronizada. Seu resultado offline continua sendo a referência.",
    gen: "Gerar Passaporte Inicial", generating: "Preparando seu Passaporte Inicial…", needOnline: "Conecte-se à internet para gerar.",
    needAuth: "Entre na sua conta para gerar.", unavailable: "O Passaporte Inicial está temporariamente indisponível. Seu resultado offline está seguro. Tente mais tarde.",
    config: "Configuração do modelo necessária. O passaporte online ainda não está disponível; seu resultado offline não foi afetado.",
    error: "Não foi possível preparar o Passaporte Inicial. Nada foi perdido.", retry: "Tentar novamente", busy: "Já está sendo preparado — verificando novamente…",
    id: "Avaliação", date: "Preparado em", facts: "O que você declarou", paths: "Caminhos candidatos a investigar", flags: "Salvaguardas a revisar",
    missing: "Informações faltantes", next: "Próximos passos", agents: "Categorias de agentes Connex sugeridas", completeness: "Completude das informações declaradas",
    comp: { low: "Baixa", medium: "Média", high: "Alta" }, compNote: "Refere-se apenas a quanta informação você declarou — não a elegibilidade, qualidade ou potencial de créditos.",
    refs: "Referências da base de conhecimento", fields: "Baseado em", openQ: "Ainda a validar", spec: "Especialista", meta: "Modelo / versão do prompt",
    find: "Encontrar agentes compatíveis", findNote: "Abre a rede Connex. As respostas da sua avaliação nunca são publicadas.",
  },
};

// Phase 5.2 presentation labels (server result is unchanged).
const FIELD: Record<string, L> = {
  C05: { en: "Relationship to the land", pt: "Relação com a terra" }, C06: { en: "Location", pt: "Localização" },
  "C06.biome": { en: "Biome", pt: "Bioma" }, C07: { en: "Approximate area", pt: "Área aproximada" },
  C08: { en: "Land documentation", pt: "Documentação da terra" }, C09: { en: "CAR status", pt: "Situação do CAR" },
  C10: { en: "Overlap or dispute", pt: "Sobreposição ou disputa" }, C11: { en: "Existing carbon commitment", pt: "Compromisso de carbono existente" },
  C12: { en: "Current land uses", pt: "Usos atuais da terra" }, C13: { en: "Desired change", pt: "Mudança desejada" },
  C14: { en: "Activity start", pt: "Início da atividade" }, C15: { en: "Communities and rights", pt: "Comunidades e direitos" },
  C16: { en: "Available records", pt: "Registros disponíveis" }, C17: { en: "Monitoring readiness", pt: "Preparo para monitoramento" },
  C18: { en: "Primary objective", pt: "Objetivo principal" },
};
const FACT_ORDER = ["C06", "C06.biome", "C07", "C05", "C12", "C18", "C13", "C09", "C17"];
const GROUPS: { key: string; label: L; fields: string[] }[] = [
  { key: "land", label: { en: "Land and documentation", pt: "Terra e documentação" }, fields: ["C05", "C06", "C07", "C08", "C09", "C10"] },
  { key: "env", label: { en: "Environmental information", pt: "Informações ambientais" }, fields: ["C06.biome", "C12", "C13"] },
  { key: "hist", label: { en: "Activity history", pt: "Histórico da atividade" }, fields: ["C14"] },
  { key: "mon", label: { en: "Monitoring information", pt: "Informações de monitoramento" }, fields: ["C16", "C17"] },
  { key: "rights", label: { en: "Contracts and rights", pt: "Contratos e direitos" }, fields: ["C11", "C15"] },
  { key: "other", label: { en: "Other", pt: "Outros" }, fields: ["C18"] },
];
const CALM: Record<string, L> = {
  community_rights: { en: "Rights and safeguards review", pt: "Revisão de direitos e salvaguardas" },
  decision_rights_uncertain: { en: "Rights and safeguards review", pt: "Revisão de direitos e salvaguardas" },
  land_dispute_overlap: { en: "Rights and safeguards review", pt: "Revisão de direitos e salvaguardas" },
  existing_carbon_contract: { en: "Specialist review recommended", pt: "Revisão por especialista recomendada" },
  activity_already_started: { en: "Specialist review recommended", pt: "Revisão por especialista recomendada" },
};
const calm = (id: string, lang: FieldLang) => CALM[id]?.[lang] ?? (lang === "pt" ? "Ponto importante a verificar" : "Important point to verify");
const T = {
  en: {
    header: "Connex Field — Initial Passport", prelim: "Preliminary assessment", lang: "Assessment language", langName: { en: "English", pt: "Portuguese" },
    comp: { low: "Low information completeness", medium: "Medium information completeness", high: "High information completeness" },
    warn: "This report organizes the information you declared. It is not an eligibility, certification, legal or financial decision.",
    s1: "Your land at a glance", s2: "Paths worth investigating", s3: "What needs attention", s4: "Information still missing", s5: "Your next three steps", s6: "Who can help",
    why: "Why this appeared", answers: "Your related answers", verify: "What still needs to be verified", faqRefs: "Related answers",
    pathLabel: "A path to investigate — not an eligibility conclusion.", otherPaths: "Other possible paths",
    trig: "Answer that triggered it", whyMatters: "Why review matters", helper: "Who can assist", notRejection: "This is not an automatic rejection.",
    allSteps: "See all next steps", noMissing: "No missing information was listed.", tech: "Technical details and sources",
    model: "Model", prompt: "Prompt version", assess: "Assessment version", saved: "This online narrative was generated once, saved and is reused when you reopen it — no new AI call.",
    readyFocus: "Your Initial Passport is ready.", nextAction: "Next step", genIntro: "This online report organizes the information you declared and suggests next steps.",
  },
  pt: {
    header: "Connex Field — Passaporte Inicial", prelim: "Avaliação preliminar", lang: "Idioma da avaliação", langName: { en: "Inglês", pt: "Português" },
    comp: { low: "Baixa completude de informações", medium: "Média completude de informações", high: "Alta completude de informações" },
    warn: "Este relatório organiza as informações declaradas por você. Ele não é uma decisão de elegibilidade, certificação, natureza jurídica ou financeira.",
    s1: "Sua terra em resumo", s2: "Caminhos que vale a pena investigar", s3: "O que precisa de atenção", s4: "Informações que ainda faltam", s5: "Seus próximos três passos", s6: "Quem pode ajudar",
    why: "Por que apareceu", answers: "Suas respostas relacionadas", verify: "O que ainda precisa ser verificado", faqRefs: "Respostas relacionadas",
    pathLabel: "Um caminho a investigar — não uma conclusão de elegibilidade.", otherPaths: "Outros caminhos possíveis",
    trig: "Resposta que gerou o alerta", whyMatters: "Por que a revisão importa", helper: "Quem pode ajudar", notRejection: "Isto não é uma rejeição automática.",
    allSteps: "Ver todos os próximos passos", noMissing: "Nenhuma informação faltante foi listada.", tech: "Detalhes técnicos e fontes",
    model: "Modelo", prompt: "Versão do prompt", assess: "Versão da avaliação", saved: "Esta narrativa online foi gerada uma vez, salva e é reutilizada ao reabrir — sem nova chamada de IA.",
    readyFocus: "Seu Passaporte Inicial está pronto.", nextAction: "Próximo passo", genIntro: "Este relatório online organiza as informações declaradas e sugere próximos passos.",
  },
};
const fl = (id: string, lang: FieldLang) => FIELD[id]?.[lang] ?? id;
const firstSentence = (s: string) => { const m = s.match(/^.*?[.!?](\s|$)/); return (m ? m[0] : s).trim(); };
const rest = (s: string) => s.slice(firstSentence(s).length).trim();

type UiState = "idle" | "generating" | "ready" | "unavailable" | "config" | "error" | "busy";

export function PassportPanel({ lang, online, session, onReady }: { lang: FieldLang; online: boolean; session: SessionRec; onReady?: (ready: boolean) => void }) {
  const s = S[lang];
  const t = T[lang];
  const { user } = useAuth();
  const [diag, setDiag] = useState<PassportDiag | null>(null);
  const [state, setState] = useState<UiState>("idle");
  const sectionRef = useRef<HTMLElement>(null);
  const genRef = useRef<HTMLButtonElement>(null);
  const readyRef = useRef<HTMLHeadingElement>(null);
  const justGenerated = useRef(false);
  const remote = session.remote_id;

  useEffect(() => {
    if (!remote) return;
    let alive = true;
    loadSavedPassport(session.local_session_id, remote, online && !!user).then((d) => {
      if (!alive) return;
      if (d) { setDiag(d); setState("ready"); }
      else {
        // Freshly synchronized: bring the next action into view; generation still requires a press.
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        genRef.current?.focus({ preventScroll: true });
      }
    });
    return () => { alive = false; };
  }, [remote, online, user, session.local_session_id]);

  useEffect(() => { onReady?.(!!diag?.result); }, [diag, onReady]);
  useEffect(() => {
    if (diag?.result && justGenerated.current) {
      justGenerated.current = false;
      readyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      readyRef.current?.focus({ preventScroll: true });
    }
  }, [diag]);

  if (!remote) return null;

  const run = async () => {
    setState("generating");
    const r = await generatePassport(session.local_session_id, remote);
    if (r.ok === true) { justGenerated.current = true; setDiag(r.diag); setState("ready"); return; }
    const code = (r as { code: string }).code;
    if (code === "IN_PROGRESS") {
      setState("busy");
      setTimeout(async () => {
        const d = await loadSavedPassport(session.local_session_id, remote, true);
        if (d) { justGenerated.current = true; setDiag(d); setState("ready"); } else setState("error");
      }, 8000);
      return;
    }
    if (code === "MODEL_NOT_CONFIGURED") setState("config");
    else if (["RATE_LIMITED", "CREDITS_EXHAUSTED", "GATEWAY_ACCESS", "GATEWAY_TIMEOUT", "NETWORK"].includes(code)) setState("unavailable");
    else setState("error");
  };

  const faq = (lang === "pt" ? faqPt : faqEn) as { id: string; question: string }[];
  const res = diag?.result;
  const canGen = online && !!user && state !== "generating" && state !== "busy";
  const chips = (ids: string[]) => ids.map((k) => <span key={k} title={faq.find((f) => f.id === k)?.question} className="mr-1 inline-block rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{k}</span>);

  if (!res || !diag) return (
    <section ref={sectionRef} aria-labelledby="passport-title" className="scroll-mt-4 rounded-xl border-2 border-primary bg-primary/10 p-4 text-sm shadow-lg" data-testid="passport-panel">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.nextAction}</p>
      <h2 id="passport-title" className="mt-1 flex items-center gap-2 font-display text-lg font-semibold"><FileText className="h-5 w-5 text-primary" />{s.title}</h2>
      <p className="mt-1 text-muted-foreground">{t.genIntro}</p>
      <div className="mt-3 space-y-2" aria-live="polite">
        {state === "unavailable" && <p role="alert" className="text-destructive">{s.unavailable}</p>}
        {state === "config" && <p role="alert" className="text-destructive">{s.config}</p>}
        {state === "error" && <p role="alert" className="text-destructive">{s.error}</p>}
        {state === "busy" && <p className="text-muted-foreground">{s.busy}</p>}
        {!online && <p className="text-muted-foreground">{s.needOnline}</p>}
        {online && !user && <p className="text-muted-foreground">{s.needAuth}</p>}
        {state !== "config" && (
          <Button ref={genRef} size="lg" onClick={run} disabled={!canGen} className="min-h-[48px] w-full sm:w-auto" data-testid="passport-generate">
            {state === "generating" || state === "busy" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : state === "error" || state === "unavailable" ? <RefreshCw className="mr-1 h-4 w-4" /> : <FileText className="mr-1 h-4 w-4" />}
            {state === "generating" ? s.generating : state === "error" || state === "unavailable" ? s.retry : s.gen}
          </Button>
        )}
      </div>
    </section>
  );

  // ---- Ready Passport: action report ----
  const facts = [...res.declared_facts].sort((a, b) => {
    const ia = FACT_ORDER.indexOf(a.field_id), ib = FACT_ORDER.indexOf(b.field_id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const mainPaths = res.candidate_pathways.slice(0, 3);
  const otherPaths = res.candidate_pathways.slice(3);
  const missingFor = (fields: string[]) => res.missing_information.filter((m) => fields.includes(m.field_id));
  const grouped = GROUPS.map((g) => ({ ...g, items: missingFor(g.fields) })).filter((g) => g.items.length);
  const ungrouped = res.missing_information.filter((m) => !GROUPS.some((g) => g.fields.includes(m.field_id)));
  const date = diag.completed_at ? new Date(diag.completed_at).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const aLang = res.language === "pt" ? "pt" : "en";

  const PathCard = ({ p }: { p: (typeof res.candidate_pathways)[number] }) => (
    <li className="rounded-lg border border-border bg-background/60 p-4">
      <p className="flex items-start gap-2 font-semibold"><Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{PATHWAY[p.id]?.[lang] ?? p.id}</p>
      <p className="mt-2">{firstSentence(p.explanation)}</p>
      {(rest(p.explanation) || p.supporting_fields.length > 0) && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.why}</p>
          {rest(p.explanation) && <p className="mt-1 text-sm text-muted-foreground">{rest(p.explanation)}</p>}
          {p.supporting_fields.length > 0 && (
            <p className="mt-1 text-xs"><span className="sr-only">{t.answers}: </span>{p.supporting_fields.map((f) => <span key={f} className="mr-1 mt-1 inline-block rounded-full bg-muted px-2 py-0.5">{fl(f, lang)}</span>)}</p>
          )}
        </div>
      )}
      {p.open_questions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.verify}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">{p.open_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}
      <p className="mt-3 text-xs"><span className="text-muted-foreground">{t.faqRefs}: </span>{chips(p.faq_ids)}</p>
      <p className="mt-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{t.pathLabel}</p>
    </li>
  );

  return (
    <section ref={sectionRef} aria-labelledby="passport-title" className="scroll-mt-4 space-y-4 text-sm" data-testid="passport-panel">
      <div className="space-y-4" data-testid="passport-ready">
        {/* Header */}
        <header className="rounded-xl border border-primary/40 bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/60 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">{t.prelim}</span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs" data-testid="passport-completeness">{t.comp[res.data_completeness]}</span>
          </div>
          <h2 id="passport-title" ref={readyRef} tabIndex={-1} className="mt-2 flex items-center gap-2 font-display text-lg font-semibold leading-tight outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />{t.header}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{date} · {t.lang}: {t.langName[aLang]}</p>
          <p className="sr-only" aria-live="polite">{justGenerated.current ? t.readyFocus : ""}</p>
          {res.language && res.language !== lang && <p role="note" data-testid="passport-lang-note" className="mt-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{s.langNote}</p>}
          <p role="note" className="mt-3 flex gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs"><Info className="h-4 w-4 shrink-0 text-primary" aria-hidden />{t.warn}</p>
          {res.summary && <p className="mt-3">{res.summary}</p>}
        </header>

        {/* 1. Land at a glance */}
        <Card n={1} title={t.s1} icon={<MapPin className="h-4 w-4 text-primary" aria-hidden />}>
          <dl className="grid gap-2 sm:grid-cols-2">
            {facts.map((f, i) => (
              <div key={i} className="rounded-md bg-muted/40 px-3 py-2">
                <dt className="text-xs text-muted-foreground">{fl(f.field_id, lang)}</dt>
                <dd className="font-medium">{f.statement}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* 2. Paths */}
        <Card n={2} title={t.s2} icon={<Compass className="h-4 w-4 text-primary" aria-hidden />} testid="passport-paths">
          <ul className="space-y-3">{mainPaths.map((p) => <PathCard key={p.id} p={p} />)}</ul>
          {otherPaths.length > 0 && (
            <Expand label={`${t.otherPaths} (${otherPaths.length})`} testid="passport-other-paths">
              <ul className="space-y-3">{otherPaths.map((p) => <PathCard key={p.id} p={p} />)}</ul>
            </Expand>
          )}
        </Card>

        {/* 3. Attention */}
        {res.safeguard_flags.length > 0 && (
          <Card n={3} title={t.s3} icon={<ShieldCheck className="h-4 w-4 text-primary" aria-hidden />} testid="passport-flags">
            <ul className="space-y-3">{res.safeguard_flags.map((f) => (
              <li key={f.id} className="rounded-lg border-l-4 border-l-accent border border-border bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/80">{calm(f.id, lang)}</p>
                <p className="mt-1 font-semibold">{FLAG[f.id]?.[lang] ?? f.id}</p>
                {f.triggering_fields.length > 0 && <p className="mt-2 text-xs"><span className="text-muted-foreground">{t.trig}: </span>{f.triggering_fields.map((x) => fl(x, lang)).join(", ")}</p>}
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.whyMatters}</p>
                <p className="mt-1">{f.explanation}</p>
                <p className="mt-2 text-xs"><span className="text-muted-foreground">{t.helper}: </span>{f.specialist_type.replace(/_/g, " ")}</p>
                <p className="mt-1 text-xs"><span className="text-muted-foreground">{t.faqRefs}: </span>{chips(f.faq_ids)}</p>
                <p className="mt-2 text-xs font-medium">{t.notRejection}</p>
                {f.notice && <p className="mt-1 text-xs italic text-muted-foreground">{f.notice}</p>}
              </li>))}
            </ul>
          </Card>
        )}

        {/* 4. Missing */}
        <Card n={4} title={t.s4} icon={<ListChecks className="h-4 w-4 text-primary" aria-hidden />} testid="passport-missing">
          {res.missing_information.length === 0 ? <p className="text-muted-foreground">{t.noMissing}</p> : (
            <div className="space-y-3">
              {[...grouped, ...(ungrouped.length ? [{ key: "x", label: GROUPS[5].label, items: ungrouped, fields: [] }] : [])].map((g) => (
                <div key={g.key}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label[lang]}</p>
                  <ul className="mt-1 space-y-2">{g.items.map((m, i) => (
                    <li key={i} className="flex gap-2"><CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span><span className="font-medium">{fl(m.field_id, lang)}</span> — {m.why}</span></li>))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 5. Next steps */}
        <Card n={5} title={t.s5} icon={<ArrowRight className="h-4 w-4 text-primary" aria-hidden />} testid="passport-steps" highlight>
          <ol className="space-y-2">{res.next_steps.slice(0, 3).map((n, i) => (
            <li key={i} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground" aria-hidden>{i + 1}</span>
              <span className="pt-0.5">{n.step} {n.faq_ids && n.faq_ids.length > 0 && chips(n.faq_ids)}</span></li>))}
          </ol>
          {res.next_steps.length > 3 && (
            <Expand label={t.allSteps}>
              <ol start={4} className="list-decimal space-y-1 pl-5">{res.next_steps.slice(3).map((n, i) => <li key={i}>{n.step} {n.faq_ids && chips(n.faq_ids)}</li>)}</ol>
            </Expand>
          )}
        </Card>

        {/* 6. Who can help */}
        <Card n={6} title={t.s6} icon={<Users className="h-4 w-4 text-primary" aria-hidden />}>
          <ul className="flex flex-wrap gap-2">{res.suggested_agent_types.map((a) => <li key={a} className="rounded-full border border-primary/40 px-3 py-1 text-xs">{AGENT[a]?.[lang] ?? a}</li>)}</ul>
          <Button asChild size="lg" className="mt-4 min-h-[48px] w-full sm:w-auto" data-testid="passport-find-agents">
            <Link to="/conexoes">{s.find}<ArrowRight className="ml-1 h-4 w-4" aria-hidden /></Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{s.findNote}</p>
        </Card>

        {/* Technical details (collapsed) */}
        <Expand label={t.tech} testid="passport-tech" boxed>
          <div className="space-y-3 text-xs">
            <ul className="space-y-1">{res.knowledge_references.map((k) => <li key={k}><span className="font-mono">{k}</span> — {faq.find((f) => f.id === k)?.question}</li>)}</ul>
            <p>{t.model}: <span className="font-mono">{diag.model_id}</span></p>
            <p>{t.prompt}: <span className="font-mono">{diag.prompt_version}</span></p>
            <p>{t.assess}: <span className="font-mono">v{diag.payload_version} · {diag.field_session_id.slice(0, 8)}</span></p>
            <p className="text-muted-foreground">{t.saved}</p>
            <p role="note" className="rounded-md border border-border bg-muted/40 p-3">{res.disclaimer}</p>
          </div>
        </Expand>
      </div>
    </section>
  );
}

function Card({ n, title, icon, children, testid, highlight }: { n: number; title: string; icon?: React.ReactNode; children: React.ReactNode; testid?: string; highlight?: boolean }) {
  return (
    <section aria-label={title} data-testid={testid} className={`rounded-xl border bg-card p-4 ${highlight ? "border-primary" : "border-border"}`}>
      <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
        <span className="text-xs font-mono text-muted-foreground" aria-hidden>{n}</span>{icon}{title}
      </h3>
      {children}
    </section>
  );
}

function Expand({ label, children, testid, boxed }: { label: string; children: React.ReactNode; testid?: string; boxed?: boolean }) {
  return (
    <details data-testid={testid} className={`group mt-3 ${boxed ? "rounded-xl border border-border bg-card p-2" : ""}`}>
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 font-medium text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {label}<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="px-2 pb-2 pt-1">{children}</div>
    </details>
  );
}
