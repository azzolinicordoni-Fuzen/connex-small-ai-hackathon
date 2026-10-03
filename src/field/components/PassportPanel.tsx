// Hack-Nation 2026 — Connex Field Phase 5/5.2: Initial Passport panel — mobile-first action report.
// Presentation only: renders the saved structured result; never changes it and never calls the model on open.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Circle, ClipboardCheck, ChevronDown, Compass, FileText, Info, Landmark, Leaf, ListChecks, Loader2, MapPin, Maximize2, RefreshCw, Scale, ShieldAlert, ShoppingBag, Sprout, Trees, Users, Wrench } from "lucide-react";
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
    header: "Initial Passport", prelim: "Preliminary", purpose: "A first, plain-language guide to what your declared information suggests investigating.",
    lang: "Assessment language", langName: { en: "English", pt: "Portuguese" }, generated: "Generated",
    notice: "Initial guidance. It is not a certification or eligibility decision.",
    s1: "Your land at a glance", s2: "Pathways worth investigating", s3: "Points requiring attention", s4: "Information still needed", s5: "Your next 3 steps", s6: "Who can help",
    region: "Region", area: "Area size", biome: "Biome", use: "Land use", notProvided: "Not provided",
    why: "Why it appeared", verify: "What still needs verification", otherPaths: "Other possible paths",
    attnNote: "An attention point is not an automatic rejection — it is something a specialist should look at with you.",
    helper: "Who can help", allSteps: "See all next steps", noMissing: "Nothing was listed as missing.",
    find: "Find specialists on Connex", findNote: "Opens the Connex network. Your assessment answers are never published.",
    tech: "Technical basis and references", comp: { low: "Low information completeness", medium: "Medium information completeness", high: "High information completeness" },
    compNote: "Refers only to how much information you declared — not eligibility, quality or credit potential.",
    fieldsRef: "Assessment questions used", faqRef: "Approved answers referenced", model: "Model", prompt: "Prompt version", assess: "Assessment version",
    saved: "This online narrative was generated once, saved and is reused when you reopen it — no new AI call.",
    readyFocus: "Your Initial Passport is ready.", nextAction: "Next step", genIntro: "This online report organizes the information you declared and suggests next steps.",
  },
  pt: {
    header: "Passaporte Inicial", prelim: "Preliminar", purpose: "Um primeiro guia, em linguagem simples, do que vale investigar a partir das informações que você declarou.",
    lang: "Idioma da avaliação", langName: { en: "Inglês", pt: "Português" }, generated: "Gerado em",
    notice: "Orientação inicial. Não representa certificação ou decisão de elegibilidade.",
    s1: "Sua terra em resumo", s2: "Caminhos que podem ser investigados", s3: "Pontos que precisam de atenção", s4: "Informações que ainda faltam", s5: "Seus próximos 3 passos", s6: "Quem pode ajudar",
    region: "Região", area: "Tamanho da área", biome: "Bioma", use: "Uso da terra", notProvided: "Não informado",
    why: "Por que apareceu", verify: "O que ainda precisa ser verificado", otherPaths: "Outros caminhos possíveis",
    attnNote: "Um ponto de atenção não é uma rejeição automática — é algo que um especialista deve analisar com você.",
    helper: "Quem pode ajudar", allSteps: "Ver todos os próximos passos", noMissing: "Nenhuma informação foi listada como faltante.",
    find: "Encontrar especialistas na Connex", findNote: "Abre a rede Connex. As respostas da sua avaliação nunca são publicadas.",
    tech: "Base técnica e referências", comp: { low: "Baixa completude de informações", medium: "Média completude de informações", high: "Alta completude de informações" },
    compNote: "Refere-se apenas a quanta informação você declarou — não a elegibilidade, qualidade ou potencial de créditos.",
    fieldsRef: "Perguntas da avaliação usadas", faqRef: "Respostas aprovadas referenciadas", model: "Modelo", prompt: "Versão do prompt", assess: "Versão da avaliação",
    saved: "Esta narrativa online foi gerada uma vez, salva e é reutilizada ao reabrir — sem nova chamada de IA.",
    readyFocus: "Seu Passaporte Inicial está pronto.", nextAction: "Próximo passo", genIntro: "Este relatório online organiza as informações declaradas e sugere próximos passos.",
  },
};
// Plain-language pathway names first; technical term as secondary label.
const PLAIN: Record<string, { name: L; tech: L }> = {
  forest_conservation: { name: { en: "Keep native forest standing", pt: "Manter a floresta nativa em pé" }, tech: { en: "Forest conservation (REDD+)", pt: "Conservação florestal (REDD+)" } },
  restoration_reforestation: { name: { en: "Bring back native vegetation", pt: "Recuperar a vegetação nativa" }, tech: { en: "Restoration / reforestation (ARR)", pt: "Restauração / reflorestamento (ARR)" } },
  regenerative_agriculture_soil: { name: { en: "Farm in ways that build soil", pt: "Produzir cuidando do solo" }, tech: { en: "Regenerative agriculture and soil carbon", pt: "Agricultura regenerativa e carbono no solo" } },
  improved_livestock_management: { name: { en: "Improve how cattle are managed", pt: "Melhorar o manejo do gado" }, tech: { en: "Improved livestock management", pt: "Manejo pecuário aprimorado" } },
  waste_methane_management: { name: { en: "Handle waste and manure better", pt: "Tratar melhor resíduos e esterco" }, tech: { en: "Waste and methane management", pt: "Gestão de resíduos e metano" } },
  renewable_energy: { name: { en: "Produce clean energy on the land", pt: "Gerar energia limpa na propriedade" }, tech: { en: "Renewable energy", pt: "Energia renovável" } },
  specialist_assessment_required: { name: { en: "Get a specialist to look at the options", pt: "Pedir a um especialista para avaliar as opções" }, tech: { en: "Specialist assessment", pt: "Avaliação por especialista" } },
};
const SPEC: Record<string, L> = {
  land_rights_lawyer: { en: "Land-rights lawyer", pt: "Advogado fundiário" }, safeguards_social: { en: "Social safeguards specialist", pt: "Especialista em salvaguardas sociais" },
  carbon_project_developer: { en: "Carbon-project developer", pt: "Desenvolvedor de projetos de carbono" }, environmental_consultant: { en: "Environmental consultant", pt: "Consultor ambiental" },
  agronomist: { en: "Agronomist", pt: "Agrônomo" }, forestry_engineer: { en: "Forestry engineer", pt: "Engenheiro florestal" },
  mrv_specialist: { en: "Monitoring specialist", pt: "Especialista em monitoramento" }, auditor: { en: "Auditor", pt: "Auditor" },
  environmental_lawyer: { en: "Environmental lawyer", pt: "Advogado ambiental" }, surveyor: { en: "Land surveyor", pt: "Agrimensor" },
};
const spec = (k: string, lang: FieldLang) => SPEC[k]?.[lang] ?? k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const AGENT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  desenvolvedor: Sprout, engenheiro: Wrench, advogado: Scale, auditor: ClipboardCheck, certificadora: BadgeCheck,
  investidor: Landmark, financeira: Landmark, comprador: ShoppingBag, proprietario: Trees, projeto: Compass, outro: Users,
};
const uniq = <X,>(xs: X[], key: (x: X) => string) => { const seen = new Set<string>(); return xs.filter((x) => { const k = key(x).trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); };
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

  // ---- Ready Passport: plain-language action report (no C/K codes outside the technical accordion) ----
  const factOf = (id: string) => res.declared_facts.find((f) => f.field_id === id)?.statement;
  const glance = [
    { label: t.region, icon: MapPin, value: factOf("C06") },
    { label: t.area, icon: Maximize2, value: factOf("C07") },
    { label: t.biome, icon: Trees, value: factOf("C06.biome") },
    { label: t.use, icon: Leaf, value: factOf("C12") },
  ];
  const glanceShown = new Set(["C06", "C07", "C06.biome", "C12"]);
  const otherFacts = uniq(res.declared_facts.filter((f) => !glanceShown.has(f.field_id)), (f) => f.statement);
  const paths = uniq(res.candidate_pathways, (p) => p.id);
  const mainPaths = paths.slice(0, 3);
  const otherPaths = paths.slice(3);
  const missing = uniq(res.missing_information, (m) => m.field_id);
  const steps = uniq(res.next_steps, (n) => n.step);
  const helpers = uniq([
    ...res.suggested_agent_types.map((a) => ({ key: `a:${a}`, label: AGENT[a]?.[lang] ?? a, Icon: AGENT_ICON[a] ?? Users })),
    ...res.safeguard_flags.map((f) => ({ key: `s:${f.specialist_type}`, label: spec(f.specialist_type, lang), Icon: ShieldAlert })),
  ], (h) => h.label);
  const date = diag.completed_at ? new Date(diag.completed_at).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  const aLang = res.language === "pt" ? "pt" : "en";
  const evidence = (ids: string[]) => uniq(ids, (x) => fl(x, lang)).slice(0, 3);
  const allFields = [...new Set([...res.declared_facts.map((f) => f.field_id), ...paths.flatMap((p) => p.supporting_fields), ...res.safeguard_flags.flatMap((f) => f.triggering_fields), ...missing.map((m) => m.field_id)])].sort();

  const PathCard = ({ p }: { p: (typeof paths)[number] }) => (
    <li className="rounded-lg border border-border bg-background/60 p-4">
      <p className="flex items-start gap-2 text-base font-semibold leading-snug"><Compass className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />{PLAIN[p.id]?.name[lang] ?? PATHWAY[p.id]?.[lang] ?? p.id}</p>
      {PLAIN[p.id] && <p className="ml-7 text-xs text-muted-foreground">{PLAIN[p.id].tech[lang]}</p>}
      <p className="mt-2">{firstSentence(p.explanation)}</p>
      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.why}</p>
        {rest(p.explanation) && <p className="mt-1 text-sm text-muted-foreground">{firstSentence(rest(p.explanation))}</p>}
        {p.supporting_fields.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">{evidence(p.supporting_fields).map((f) => <li key={f} className="rounded-full bg-muted px-2.5 py-1 text-xs">{fl(f, lang)}</li>)}</ul>
        )}
      </div>
      {p.open_questions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.verify}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">{uniq(p.open_questions, (q) => q).map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}
    </li>
  );

  return (
    <section ref={sectionRef} aria-labelledby="passport-title" className="scroll-mt-4 space-y-5 text-sm" data-testid="passport-panel">
      <div className="space-y-5" data-testid="passport-ready">
        {/* 1. Header */}
        <header className="rounded-xl border border-primary/40 bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 id="passport-title" ref={readyRef} tabIndex={-1} className="flex items-center gap-2 font-display text-xl font-semibold leading-tight outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />{t.header}
            </h2>
            <span className="shrink-0 rounded-full border border-primary/60 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">{t.prelim}</span>
          </div>
          <p className="mt-2 text-muted-foreground">{t.purpose}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t.lang}: {t.langName[aLang]}{date && <> · {t.generated} {date}</>}</p>
          <p className="sr-only" aria-live="polite">{justGenerated.current ? t.readyFocus : ""}</p>
          {res.language && res.language !== lang && <p role="note" data-testid="passport-lang-note" className="mt-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{s.langNote}</p>}
          <p role="note" className="mt-3 flex gap-2 rounded-md bg-muted/40 p-3 text-xs"><Info className="h-4 w-4 shrink-0 text-primary" aria-hidden />{t.notice}</p>
        </header>

        {/* 2. Land at a glance */}
        <Card title={t.s1} icon={<MapPin className="h-4 w-4 text-primary" aria-hidden />}>
          <ul className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            {glance.map(({ label, icon: Icon, value }) => (
              <li key={label} className="rounded-lg bg-muted/40 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 text-primary" aria-hidden />{label}</p>
                <p className={`mt-1 text-sm leading-snug ${value ? "font-medium" : "text-muted-foreground"}`}>{value ?? t.notProvided}</p>
              </li>
            ))}
          </ul>
          {res.summary && <p className="mt-3 text-muted-foreground">{res.summary}</p>}
          {otherFacts.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">{otherFacts.map((f, i) => <li key={i}><span className="text-muted-foreground">{fl(f.field_id, lang)}: </span>{f.statement}</li>)}</ul>
          )}
        </Card>

        {/* 3. Pathways */}
        <Card title={t.s2} icon={<Compass className="h-4 w-4 text-primary" aria-hidden />} testid="passport-paths">
          <ul className="space-y-3">{mainPaths.map((p) => <PathCard key={p.id} p={p} />)}</ul>
          {otherPaths.length > 0 && (
            <Expand label={`${t.otherPaths} (${otherPaths.length})`} testid="passport-other-paths">
              <ul className="space-y-3">{otherPaths.map((p) => <PathCard key={p.id} p={p} />)}</ul>
            </Expand>
          )}
        </Card>

        {/* 4. Attention points */}
        {res.safeguard_flags.length > 0 && (
          <Card title={t.s3} icon={<ShieldAlert className="h-4 w-4 text-primary" aria-hidden />} testid="passport-flags">
            <p className="mb-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs" data-testid="passport-attn-note">{t.attnNote}</p>
            <ul className="space-y-3">{uniq(res.safeguard_flags, (f) => f.id).map((f) => (
              <li key={f.id} className="rounded-lg border border-border border-l-4 border-l-primary/60 bg-background/60 p-4">
                <p className="text-base font-semibold">{FLAG[f.id]?.[lang] ?? f.id}</p>
                <p className="text-xs text-muted-foreground">{calm(f.id, lang)}</p>
                <p className="mt-2">{firstSentence(f.explanation)}</p>
                {f.triggering_fields.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.why}</p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">{evidence(f.triggering_fields).map((x) => <li key={x} className="rounded-full bg-muted px-2.5 py-1 text-xs">{fl(x, lang)}</li>)}</ul>
                  </div>
                )}
                <p className="mt-3 text-xs"><span className="font-semibold uppercase tracking-wide text-muted-foreground">{t.helper}: </span>{spec(f.specialist_type, lang)}</p>
              </li>))}
            </ul>
          </Card>
        )}

        {/* 5. Next 3 steps — most prominent */}
        <section aria-label={t.s5} data-testid="passport-steps" className="rounded-xl border-2 border-primary bg-primary/10 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><ArrowRight className="h-5 w-5 text-primary" aria-hidden />{t.s5}</h3>
          <ol className="space-y-3">{steps.slice(0, 3).map((n, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-border bg-card p-4" data-testid="passport-step-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground" aria-hidden>{i + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{firstSentence(n.step)}</p>
                {rest(n.step) && <p className="mt-1 text-muted-foreground">{rest(n.step)}</p>}
              </div>
            </li>))}
          </ol>
          {steps.length > 3 && (
            <Expand label={t.allSteps}>
              <ol start={4} className="list-decimal space-y-1 pl-5">{steps.slice(3).map((n, i) => <li key={i}>{n.step}</li>)}</ol>
            </Expand>
          )}
        </section>

        {/* 6. Who can help */}
        <Card title={t.s6} icon={<Users className="h-4 w-4 text-primary" aria-hidden />}>
          <ul className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">{helpers.map(({ key, label, Icon }) => (
            <li key={key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm"><Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />{label}</li>))}
          </ul>
          <Button asChild size="lg" className="mt-4 min-h-[52px] w-full" data-testid="passport-find-agents">
            <Link to="/conexoes">{t.find}<ArrowRight className="ml-1 h-4 w-4" aria-hidden /></Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{t.findNote}</p>
        </Card>

        {/* 7. Missing information */}
        <Card title={t.s4} icon={<ListChecks className="h-4 w-4 text-primary" aria-hidden />} testid="passport-missing">
          {missing.length === 0 ? <p className="text-muted-foreground">{t.noMissing}</p> : (
            <ul className="space-y-2.5">{missing.map((m, i) => (
              <li key={i} className="flex gap-2.5"><Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span><span className="font-medium">{fl(m.field_id, lang)}</span><span className="block text-muted-foreground">{firstSentence(m.why)}</span></span></li>))}
            </ul>
          )}
        </Card>

        {/* Full disclaimer — shown once */}
        <p role="note" className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">{res.disclaimer}</p>

        {/* 8. Technical basis (collapsed) */}
        <Expand label={t.tech} testid="passport-tech" boxed>
          <div className="space-y-3 text-xs">
            <div><p className="font-semibold">{t.comp[res.data_completeness]}</p><p className="text-muted-foreground">{t.compNote}</p></div>
            <div><p className="font-semibold">{t.fieldsRef}</p><ul className="mt-1 space-y-0.5">{allFields.map((f) => <li key={f}><span className="font-mono">{f}</span> — {fl(f, lang)}</li>)}</ul></div>
            <div><p className="font-semibold">{t.faqRef}</p><ul className="mt-1 space-y-0.5">{res.knowledge_references.map((k) => <li key={k}><span className="font-mono">{k}</span> — {faq.find((f) => f.id === k)?.question}</li>)}</ul></div>
            {paths.map((p) => <p key={p.id}>{PLAIN[p.id]?.tech[lang] ?? p.id}: <span className="font-mono">{[...p.supporting_fields, ...p.faq_ids].join(", ")}</span></p>)}
            {res.safeguard_flags.map((f) => <p key={f.id}>{FLAG[f.id]?.[lang] ?? f.id}: <span className="font-mono">{[...f.triggering_fields, ...f.faq_ids].join(", ")}</span></p>)}
            <p>{t.model}: <span className="font-mono">{diag.model_id}</span> · {t.prompt}: <span className="font-mono">{diag.prompt_version}</span></p>
            <p>{t.assess}: <span className="font-mono">v{diag.payload_version} · {diag.field_session_id.slice(0, 8)}</span></p>
            <p className="text-muted-foreground">{t.saved}</p>
          </div>
        </Expand>
      </div>
    </section>
  );
}

function Card({ title, icon, children, testid }: { title: string; icon?: React.ReactNode; children: React.ReactNode; testid?: string }) {
  return (
    <section aria-label={title} data-testid={testid} className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">{icon}{title}</h3>
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
