// Hack-Nation 2026 — Connex Field offline summary rules (transparent, no scoring).
// Flags derive from spec section 3 rules and section 5 "Análise especializada antes de avançar".
import type { FieldLang } from "./i18n";
import { QUESTIONS, type LocationValue } from "./questions";

export interface Flag { id: string; faq: string; text: Record<FieldLang, string> }

export function computeFlags(a: Record<string, unknown>): Flag[] {
  const f: Flag[] = [];
  if (a.C10 === "yes" || a.C10 === "maybe")
    f.push({ id: "dispute", faq: "K06", text: {
      en: "Dispute, overlap or doubt about who can decide: specialist legal/land review before moving forward.",
      pt: "Disputa, sobreposição ou dúvida sobre quem decide: revisão jurídica/fundiária especializada antes de avançar." } });
  if (a.C11 && a.C11 !== "no")
    f.push({ id: "existing_contract", faq: "K22", text: {
      en: "Existing or possible carbon commitment: do not start a new negotiation before documentary review.",
      pt: "Compromisso de carbono existente ou possível: não iniciar nova negociação antes da revisão documental." } });
  if (a.C15 === "yes" || a.C15 === "maybe")
    f.push({ id: "community_rights", faq: "K23", text: {
      en: "Community rights: safeguards route and specialist consultation required.",
      pt: "Direitos de comunidades: exige rota de salvaguardas e consulta especializada." } });
  if (a.C05 === "not_sure" || a.C08 === "not_sure")
    f.push({ id: "rights_uncertain", faq: "K06", text: {
      en: "Uncertain rights or documentation: specialist review required.",
      pt: "Direitos ou documentação incertos: revisão especializada necessária." } });
  if (a.C14 === "started_lt_12m" || a.C14 === "started_gt_12m")
    f.push({ id: "activity_started", faq: "K09", text: {
      en: "Activity already started: start dates may affect additionality and eligibility.",
      pt: "Atividade já iniciada: datas de início podem afetar adicionalidade e elegibilidade." } });
  return f;
}

export function missingAnswers(a: Record<string, unknown>): string[] {
  const miss: string[] = [];
  for (const q of QUESTIONS) {
    if (q.optional || q.id === "C01" || q.id === "C02" || q.id === "C19") continue;
    const v = a[q.id];
    if (q.kind === "location") {
      const l = v as LocationValue | undefined;
      if (!l?.state || !l?.municipality) miss.push("C06");
      if (!l?.biome) miss.push("C06.biome");
    } else if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) miss.push(q.id);
  }
  return miss;
}
