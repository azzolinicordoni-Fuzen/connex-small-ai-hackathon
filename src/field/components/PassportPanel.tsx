// Hack-Nation 2026 — Connex Field Phase 5: Initial Passport panel (online, optional).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, FileText, Loader2, RefreshCw, ShieldAlert, Users } from "lucide-react";
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
    title: "Initial Passport", intro: "Optional online summary prepared from your synchronized assessment. Your offline result stays the reference.",
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
    title: "Passaporte Inicial", intro: "Resumo online opcional preparado a partir da sua avaliação sincronizada. Seu resultado offline continua sendo a referência.",
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
type UiState = "idle" | "generating" | "ready" | "unavailable" | "config" | "error" | "busy";

export function PassportPanel({ lang, online, session }: { lang: FieldLang; online: boolean; session: SessionRec }) {
  const s = S[lang];
  const { user } = useAuth();
  const [diag, setDiag] = useState<PassportDiag | null>(null);
  const [state, setState] = useState<UiState>("idle");
  const remote = session.remote_id;

  useEffect(() => {
    if (!remote) return;
    loadSavedPassport(session.local_session_id, remote, online && !!user).then((d) => { if (d) { setDiag(d); setState("ready"); } });
  }, [remote, online, user, session.local_session_id]);

  if (!remote) return null;

  const run = async () => {
    setState("generating");
    const r = await generatePassport(session.local_session_id, remote);
    if (r.ok === true) { setDiag(r.diag); setState("ready"); return; }
    const code = (r as { code: string }).code;
    if (code === "IN_PROGRESS") {
      setState("busy");
      setTimeout(async () => {
        const d = await loadSavedPassport(session.local_session_id, remote, true);
        if (d) { setDiag(d); setState("ready"); } else setState("error");
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
  const chips = (ids: string[]) => ids.map((k) => <span key={k} className="mr-1 inline-block rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{k}</span>);

  return (
    <section aria-labelledby="passport-title" className="rounded-lg border border-border bg-card p-4 text-sm" data-testid="passport-panel">
      <h2 id="passport-title" className="flex items-center gap-2 font-display text-lg font-semibold"><FileText className="h-5 w-5 text-primary" />{s.title}</h2>
      {!res && <p className="mt-1 text-muted-foreground">{s.intro}</p>}

      {!res && (
        <div className="mt-3 space-y-2" aria-live="polite">
          {state === "unavailable" && <p role="alert" className="text-destructive">{s.unavailable}</p>}
          {state === "config" && <p role="alert" className="text-destructive">{s.config}</p>}
          {state === "error" && <p role="alert" className="text-destructive">{s.error}</p>}
          {state === "busy" && <p className="text-muted-foreground">{s.busy}</p>}
          {!online && <p className="text-muted-foreground">{s.needOnline}</p>}
          {online && !user && <p className="text-muted-foreground">{s.needAuth}</p>}
          {state !== "config" && (
            <Button onClick={run} disabled={!canGen} data-testid="passport-generate">
              {state === "generating" || state === "busy" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : state === "error" || state === "unavailable" ? <RefreshCw className="mr-1 h-4 w-4" /> : <FileText className="mr-1 h-4 w-4" />}
              {state === "generating" ? s.generating : state === "error" || state === "unavailable" ? s.retry : s.gen}
            </Button>
          )}
        </div>
      )}

      {res && diag && (
        <div className="mt-3 space-y-5" data-testid="passport-ready">
          <div>
            <p className="font-semibold">{res.passport_title}</p>
            <p className="text-xs text-muted-foreground">{s.id}: <span className="font-mono">{diag.field_session_id.slice(0, 8)}</span> · v{diag.payload_version} · {s.date}: {diag.completed_at ? new Date(diag.completed_at).toLocaleString(lang === "pt" ? "pt-BR" : "en-GB") : "—"}</p>
            <p className="mt-2">{res.summary}</p>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="font-medium">{s.completeness}: <span className="text-primary">{s.comp[res.data_completeness]}</span></p>
            <p className="text-xs text-muted-foreground">{s.compNote}</p>
          </div>

          <Block title={s.facts}>
            <ul className="space-y-1">{res.declared_facts.map((f, i) => <li key={i}>{chips([f.field_id])}{f.statement}</li>)}</ul>
          </Block>

          <Block title={s.paths}>
            <ul className="space-y-3">{res.candidate_pathways.map((p) => (
              <li key={p.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{PATHWAY[p.id]?.[lang] ?? p.id}</p>
                <p className="mt-1">{p.explanation}</p>
                {p.supporting_fields.length > 0 && <p className="mt-1 text-xs">{s.fields}: {chips(p.supporting_fields)}</p>}
                {p.open_questions.length > 0 && <div className="mt-1 text-xs"><span className="font-medium">{s.openQ}:</span><ul className="list-disc pl-5">{p.open_questions.map((q, i) => <li key={i}>{q}</li>)}</ul></div>}
                <p className="mt-1 text-xs">{chips(p.faq_ids)}</p>
              </li>))}
            </ul>
          </Block>

          {res.safeguard_flags.length > 0 && <Block title={s.flags} icon={<ShieldAlert className="h-4 w-4 text-primary" />}>
            <ul className="space-y-3">{res.safeguard_flags.map((f) => (
              <li key={f.id} className="rounded-md border border-border p-3">
                <p className="flex items-center gap-1 font-medium"><AlertTriangle className="h-4 w-4 text-primary" />{FLAG[f.id]?.[lang] ?? f.id}</p>
                <p className="mt-1">{f.explanation}</p>
                <p className="mt-1 text-xs">{s.fields}: {chips(f.triggering_fields)} · {s.spec}: {f.specialist_type.replace(/_/g, " ")}</p>
                <p className="mt-1 text-xs">{chips(f.faq_ids)}</p>
                <p className="mt-1 text-xs italic text-muted-foreground">{f.notice}</p>
              </li>))}
            </ul>
          </Block>}

          {res.missing_information.length > 0 && <Block title={s.missing}>
            <ul className="space-y-1">{res.missing_information.map((m, i) => <li key={i}>{chips([m.field_id])}{m.why}</li>)}</ul>
          </Block>}

          <Block title={s.next}>
            <ol className="list-decimal space-y-1 pl-5">{res.next_steps.map((n, i) => <li key={i}>{n.step} {n.faq_ids && chips(n.faq_ids)}</li>)}</ol>
          </Block>

          <Block title={s.agents} icon={<Users className="h-4 w-4 text-primary" />}>
            <div className="flex flex-wrap gap-2">{res.suggested_agent_types.map((a) => <span key={a} className="rounded-full border border-primary/40 px-2 py-0.5 text-xs">{AGENT[a]?.[lang] ?? a}</span>)}</div>
            <Button asChild variant="outline" className="mt-3" data-testid="passport-find-agents">
              <Link to="/conexoes">{s.find}</Link>
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">{s.findNote}</p>
          </Block>

          <Block title={s.refs}>
            <ul className="space-y-1 text-xs">{res.knowledge_references.map((k) => <li key={k}><span className="font-mono">{k}</span> — {faq.find((f) => f.id === k)?.question}</li>)}</ul>
          </Block>

          <p className="text-xs text-muted-foreground">{s.meta}: <span className="font-mono">{diag.model_id} / {diag.prompt_version}</span></p>
          <p role="note" className="rounded-md border border-border bg-muted/40 p-3 text-xs">{res.disclaimer}</p>
        </div>
      )}
    </section>
  );
}

function Block({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <div><h3 className="mb-2 flex items-center gap-2 font-semibold">{icon}{title}</h3>{children}</div>;
}
