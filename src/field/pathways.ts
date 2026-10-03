// Hack-Nation 2026 — Connex Field explainable local pathway & safeguard engine.
// Transparent rules over declared answers. It never determines eligibility and never estimates
// credit volume, emissions, price, revenue, cost, time or approval probability.
import type { FieldLang } from "./i18n";
import { QUESTIONS, type LocationValue } from "./questions";
import { missingAnswers } from "./summary";
import { MODEL_INFO } from "./ai/inference";

type L = Record<FieldLang, string>;
export type Answers = Record<string, unknown>;
export const ASSESSMENT_VERSION = "local-assessment-1.0";

export type PathwayId =
  | "forest_conservation" | "restoration_reforestation" | "regenerative_agriculture_soil"
  | "improved_livestock_management" | "waste_methane_management" | "renewable_energy"
  | "specialist_assessment_required";

export interface Contribution { question: string; value: string }
export interface Pathway {
  id: PathwayId; label: L; why: L; contributions: Contribution[]; missing: string[];
  faq: string[]; specialists: string[]; notice: L;
}
export interface Safeguard { id: string; trigger: Contribution[]; why: L; faq: string; notice: L; specialists: string[] }

export const SPECIALISTS: Record<string, L> = {
  carbon_project_developer: { en: "Carbon project developer", pt: "Desenvolvedor de projetos de carbono" },
  forest_engineer: { en: "Forest engineer / inventory specialist", pt: "Engenheiro florestal / inventário" },
  restoration_technician: { en: "Restoration technician", pt: "Técnico em restauração" },
  agronomist: { en: "Agronomist (soil and crop management)", pt: "Agrônomo (manejo de solo e cultivo)" },
  livestock_specialist: { en: "Livestock and pasture specialist", pt: "Especialista em pecuária e pastagem" },
  waste_engineer: { en: "Waste and biogas engineer", pt: "Engenheiro de resíduos e biogás" },
  energy_engineer: { en: "Renewable energy engineer", pt: "Engenheiro de energia renovável" },
  land_legal: { en: "Land-tenure / legal specialist", pt: "Especialista fundiário / jurídico" },
  environmental_regularization: { en: "Environmental regularization (CAR) consultant", pt: "Consultor de regularização ambiental (CAR)" },
  safeguards_social: { en: "Social safeguards and community consultation specialist", pt: "Especialista em salvaguardas sociais e consulta a comunidades" },
  contract_lawyer: { en: "Contract lawyer (carbon agreements)", pt: "Advogado de contratos (acordos de carbono)" },
  mrv_specialist: { en: "MRV / monitoring specialist", pt: "Especialista em MRV / monitoramento" },
};

const PATH_NOTICE: L = {
  en: "A path to investigate with a specialist — not an eligibility conclusion.",
  pt: "Um caminho a investigar com um especialista — não é uma conclusão de elegibilidade.",
};
const FLAG_NOTICE: L = {
  en: "This flag is not an automatic rejection. It indicates a point a specialist should review.",
  pt: "Este alerta não é uma rejeição automática. Indica um ponto que um especialista deve revisar.",
};

const has = (a: Answers, id: string, v: string) => (Array.isArray(a[id]) ? (a[id] as string[]).includes(v) : a[id] === v);
const biome = (a: Answers) => (a.C06 as LocationValue | undefined)?.biome;
const val = (a: Answers, id: string): string => {
  if (id === "C06.biome") return biome(a) ?? "";
  const v = a[id];
  return Array.isArray(v) ? v.join(",") : String(v ?? "");
};
const unknown = (a: Answers, id: string) => {
  const v = id === "C06.biome" ? biome(a) : a[id];
  return v === undefined || v === "" || v === "not_sure" || v === "not_sure_yet" || (Array.isArray(v) && (v.length === 0 || v.includes("not_sure")));
};

interface Rule {
  id: Exclude<PathwayId, "specialist_assessment_required">;
  label: L; why: L; faq: string[]; specialists: string[]; needs: string[];
  triggers: [string, string][]; // [question, value]
}

const RULES: Rule[] = [
  {
    id: "forest_conservation",
    label: { en: "Forest conservation", pt: "Conservação florestal" },
    why: { en: "You declared native vegetation and/or an intention to conserve it.", pt: "Você declarou vegetação nativa e/ou intenção de conservá-la." },
    triggers: [["C12", "native_vegetation"], ["C13", "conserve_vegetation"], ["C18", "conserve_area"]],
    needs: ["C06.biome", "C07", "C08", "C09", "C14", "C16"],
    faq: ["K02", "K09", "K10", "K13", "K14"],
    specialists: ["carbon_project_developer", "forest_engineer", "land_legal"],
  },
  {
    id: "restoration_reforestation",
    label: { en: "Restoration / reforestation", pt: "Restauração / reflorestamento" },
    why: { en: "You declared degraded area and/or an intention to restore or finance restoration.", pt: "Você declarou área degradada e/ou intenção de restaurar ou financiar restauração." },
    triggers: [["C12", "degraded_area"], ["C13", "restore_area"], ["C18", "finance_restoration"]],
    needs: ["C06.biome", "C07", "C08", "C14", "C16", "C17"],
    faq: ["K10", "K11", "K13", "K16"],
    specialists: ["restoration_technician", "forest_engineer", "carbon_project_developer"],
  },
  {
    id: "regenerative_agriculture_soil",
    label: { en: "Regenerative agriculture / soil", pt: "Agricultura regenerativa / solo" },
    why: { en: "You declared agriculture and/or an intention to improve agricultural management.", pt: "Você declarou agricultura e/ou intenção de melhorar o manejo agrícola." },
    triggers: [["C12", "agriculture"], ["C13", "improve_agricultural_management"], ["C18", "improve_production"]],
    needs: ["C07", "C14", "C16", "C17"],
    faq: ["K09", "K10", "K11", "K16"],
    specialists: ["agronomist", "mrv_specialist"],
  },
  {
    id: "improved_livestock_management",
    label: { en: "Improved livestock management", pt: "Melhoria do manejo pecuário" },
    why: { en: "You declared livestock and/or an intention to improve livestock management.", pt: "Você declarou pecuária e/ou intenção de melhorar o manejo pecuário." },
    triggers: [["C12", "livestock"], ["C13", "improve_livestock_management"]],
    needs: ["C07", "C14", "C16", "C17"],
    faq: ["K09", "K10", "K11", "K16"],
    specialists: ["livestock_specialist", "mrv_specialist"],
  },
  {
    id: "waste_methane_management",
    label: { en: "Waste / methane management", pt: "Gestão de resíduos / metano" },
    why: { en: "You declared waste or manure and/or an intention to treat waste.", pt: "Você declarou resíduos ou dejetos e/ou intenção de tratar resíduos." },
    triggers: [["C12", "waste_or_manure"], ["C13", "treat_waste"]],
    needs: ["C14", "C16", "C17"],
    faq: ["K09", "K11", "K16"],
    specialists: ["waste_engineer", "mrv_specialist"],
  },
  {
    id: "renewable_energy",
    label: { en: "Renewable energy", pt: "Energia renovável" },
    why: { en: "You declared an energy activity on the area.", pt: "Você declarou uma atividade de energia na área." },
    triggers: [["C12", "energy"]],
    needs: ["C14", "C16"],
    faq: ["K09", "K15", "K16"],
    specialists: ["energy_engineer", "carbon_project_developer"],
  },
];

export function computeSafeguards(a: Answers): Safeguard[] {
  const out: Safeguard[] = [];
  const add = (id: string, trigger: string[], why: L, faq: string, specialists: string[]) =>
    out.push({ id, trigger: trigger.map((q) => ({ question: q, value: val(a, q) })), why, faq, notice: FLAG_NOTICE, specialists });

  if (a.C11 && a.C11 !== "no")
    add("existing_carbon_contract", ["C11"], {
      en: "An existing or possible carbon commitment must be reviewed before any new negotiation, to avoid conflicting claims.",
      pt: "Um compromisso de carbono existente ou possível deve ser revisado antes de qualquer nova negociação, para evitar reivindicações conflitantes.",
    }, "K22", ["contract_lawyer"]);
  if (a.C10 === "yes")
    add("land_dispute_overlap", ["C10"], {
      en: "A declared dispute or overlap needs land-tenure review before a project can move forward.",
      pt: "Uma disputa ou sobreposição declarada exige revisão fundiária antes que um projeto possa avançar.",
    }, "K06", ["land_legal"]);
  if (a.C10 === "maybe" || a.C10 === "prefer_not_to_answer" || a.C05 === "not_sure")
    add("decision_rights_uncertain", ["C05", "C10"].filter((q) => a[q] !== undefined), {
      en: "It is not yet clear who can decide on the area. Rights over credits depend on who holds rights to the land.",
      pt: "Ainda não está claro quem pode decidir pela área. Direitos sobre créditos dependem de quem tem direitos sobre a terra.",
    }, "K06", ["land_legal"]);
  if (a.C15 === "yes" || a.C15 === "maybe" || a.C15 === "prefer_not_to_answer")
    add("community_rights", ["C15"], {
      en: "Indigenous Peoples or traditional-community rights require a safeguards route and appropriate consultation.",
      pt: "Direitos de povos indígenas ou comunidades tradicionais exigem rota de salvaguardas e consulta adequada.",
    }, "K23", ["safeguards_social"]);
  if (a.C08 === "not_sure" || a.C08 === "other")
    add("land_documentation_uncertain", ["C08"], {
      en: "The type of land document is uncertain; a specialist must check which documents support the rights declared.",
      pt: "O tipo de documento da terra é incerto; um especialista deve verificar quais documentos sustentam os direitos declarados.",
    }, "K08", ["land_legal"]);
  if (["no", "yes_pending_analysis", "yes_with_issues", "not_sure"].includes(String(a.C09)))
    add("car_absent_pending", ["C09"], {
      en: "The CAR is absent, pending or uncertain. It is environmental data and does not prove ownership, but its status is usually reviewed.",
      pt: "O CAR está ausente, pendente ou incerto. É dado ambiental e não prova propriedade, mas sua situação costuma ser analisada.",
    }, "K07", ["environmental_regularization"]);
  if (a.C14 === "started_lt_12m" || a.C14 === "started_gt_12m")
    add("activity_already_started", ["C14"], {
      en: "The activity already started. Start dates may affect additionality and must be reviewed.",
      pt: "A atividade já começou. Datas de início podem afetar a adicionalidade e devem ser revisadas.",
    }, "K09", ["carbon_project_developer"]);
  const rec = a.C16 as string[] | undefined;
  if (!rec || rec.length === 0 || rec.includes("none") || rec.includes("not_sure"))
    add("insufficient_records", ["C16"], {
      en: "Few or no records were declared. Projects usually need maps, land-use history and other evidence.",
      pt: "Poucos ou nenhum registro foi declarado. Projetos costumam precisar de mapas, histórico de uso e outras evidências.",
    }, "K08", ["mrv_specialist"]);
  if (a.C17 === "no" || a.C17 === "maybe")
    add("monitoring_readiness", ["C17"], {
      en: "Projects require records, visits and measurements over time (MRV). Uncertainty here should be discussed early.",
      pt: "Projetos exigem registros, visitas e medições ao longo do tempo (MRV). Essa incerteza deve ser discutida cedo.",
    }, "K11", ["mrv_specialist"]);
  return out;
}

const BLOCKING = new Set(["existing_carbon_contract", "land_dispute_overlap", "decision_rights_uncertain", "community_rights"]);

export function computePathways(a: Answers, flags: Safeguard[]): Pathway[] {
  const out: Pathway[] = [];
  for (const r of RULES) {
    const hits = r.triggers.filter(([q, v]) => has(a, q, v));
    if (!hits.length) continue;
    out.push({
      id: r.id, label: r.label, why: r.why,
      contributions: [...new Set(hits.map(([q]) => q))].map((q) => ({ question: q, value: val(a, q) })),
      missing: r.needs.filter((q) => unknown(a, q)),
      faq: r.faq, specialists: r.specialists, notice: PATH_NOTICE,
    });
  }
  const blocking = flags.filter((f) => BLOCKING.has(f.id));
  if (blocking.length || out.length === 0) {
    out.push({
      id: "specialist_assessment_required",
      label: { en: "Specialist assessment required", pt: "Avaliação especializada necessária" },
      why: blocking.length
        ? { en: "Some declared answers need specialist review before any pathway can be investigated.", pt: "Algumas respostas declaradas exigem revisão especializada antes de investigar qualquer caminho." }
        : { en: "Your answers do not yet point to a specific pathway.", pt: "Suas respostas ainda não apontam para um caminho específico." },
      contributions: blocking.length ? blocking.flatMap((f) => f.trigger) : (["C12", "C13"].filter((q) => a[q] !== undefined).map((q) => ({ question: q, value: val(a, q) }))),
      missing: ["C12", "C13"].filter((q) => unknown(a, q)),
      faq: blocking.length ? [...new Set(blocking.map((f) => f.faq))] : ["K26"],
      specialists: blocking.length ? [...new Set(blocking.flatMap((f) => f.specialists))] : ["carbon_project_developer"],
      notice: PATH_NOTICE,
    });
  }
  return out;
}

export interface LocalResult {
  assessment_version: string;
  model: { name: string; version: string };
  generated_at: string;
  facts: Contribution[];
  pathways: Pathway[];
  safeguards: Safeguard[];
  missing: string[];
  next_steps: { id: string; text: L }[];
  specialists: string[];
}

export function nextSteps(missing: string[], flags: Safeguard[], pathways: Pathway[]): { id: string; text: L }[] {
  const s: { id: string; text: L }[] = [];
  const f = new Set(flags.map((x) => x.id));
  if (missing.length) s.push({ id: "complete_missing", text: { en: "Complete the missing answers when you can.", pt: "Complete as respostas que faltam quando puder." } });
  if (f.has("existing_carbon_contract")) s.push({ id: "review_contract", text: { en: "Do not sign a new carbon agreement before the existing commitment is reviewed.", pt: "Não assine novo acordo de carbono antes de revisar o compromisso existente." } });
  if (f.has("land_dispute_overlap") || f.has("decision_rights_uncertain") || f.has("land_documentation_uncertain"))
    s.push({ id: "clarify_rights", text: { en: "Talk to a land-tenure specialist to clarify who can decide on the area.", pt: "Converse com um especialista fundiário para esclarecer quem pode decidir pela área." } });
  if (f.has("community_rights")) s.push({ id: "safeguards", text: { en: "Plan an appropriate consultation process with the communities involved.", pt: "Planeje um processo de consulta adequado com as comunidades envolvidas." } });
  if (f.has("car_absent_pending")) s.push({ id: "car", text: { en: "Check the status of the CAR with an environmental regularization consultant.", pt: "Verifique a situação do CAR com um consultor de regularização ambiental." } });
  if (f.has("insufficient_records")) s.push({ id: "records", text: { en: "Gather the records you already have, such as maps and land-use history.", pt: "Reúna os registros que você já tem, como mapas e histórico de uso." } });
  if (pathways.some((p) => p.id !== "specialist_assessment_required"))
    s.push({ id: "talk_specialist", text: { en: "Discuss the candidate pathways with a qualified specialist on Connex.", pt: "Discuta os caminhos candidatos com um especialista qualificado na Connex." } });
  s.push({ id: "read_faq", text: { en: "Read the related questions in the offline assistant.", pt: "Leia as perguntas relacionadas no assistente offline." } });
  return s;
}

export function buildLocalResult(a: Answers): LocalResult {
  const safeguards = computeSafeguards(a);
  const pathways = computePathways(a, safeguards);
  const missing = missingAnswers(a);
  const facts: Contribution[] = [];
  for (const q of QUESTIONS) {
    if (["C02", "C19"].includes(q.id) || a[q.id] === undefined) continue;
    if (q.id === "C06") {
      const l = a.C06 as LocationValue;
      facts.push({ question: "C06", value: [l.country, l.state, l.municipality].filter(Boolean).join(" · ") });
      if (l.biome) facts.push({ question: "C06.biome", value: l.biome });
    } else facts.push({ question: q.id, value: val(a, q.id) });
  }
  return {
    assessment_version: ASSESSMENT_VERSION,
    model: { name: MODEL_INFO.name, version: MODEL_INFO.version },
    generated_at: new Date().toISOString(),
    facts, pathways, safeguards, missing,
    next_steps: nextSteps(missing, safeguards, pathways),
    specialists: [...new Set([...pathways.flatMap((p) => p.specialists), ...safeguards.flatMap((f) => f.specialists)])],
  };
}
