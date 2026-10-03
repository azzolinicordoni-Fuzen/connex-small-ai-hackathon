// Hack-Nation 2026 — Connex Field high-precision domain-relevance gate (Phase 3.1).
// Supports, never replaces, the trained classifier: when a question has no carbon / land /
// project / Connex Field evidence, the classifier is not allowed to auto-answer it.
// Lexicon written from the training data only (evaluation files were not used to design it).
// Matching: normalised word starts with a stem, or is within edit distance 1 of a stem (len >= 5).
import { normalize } from "./features.js";

const STEMS = {
  en: "carbon credit credt co2 forest tree deforest land farm propert market regul voluntar complian sbce emission trading connex certif car rural registr owner own title document paper addition aditional additional baseline baselin reference scenario mrv monitor measur report verif valid perman revers burn fire cut leak displac moves double twice count claim method metodolog standard hectare area size small minim project develop cost cots expens invest fee budget price worth wroth value paid pay sell sold money tonne ton issu forward advance contract agreement signed communit indigen quilomb tradition right consent data offline privat device phone saved stored answers sent internet reconnect connection sync online approv guarant business usual counterfactual financ timeline long years results process differ",
  pt: "carbono credito credto co2 floresta florest arvore mata desmat terra fazenda sitio propriedade mercado regulado voluntario conformidade sbce emiss comercio connex certific car rural cadastro dono propriet titul document papel papelada adicional adicionalidad adcional linha base cenario referencia contrafactual mrv m monitor mensur relato verific valid permanen revers fogo incendio cortad vazament vazamneto desloc dupla duas contag contad metodolog metodo regras procediment padrao hectare area tamanho pequen minim projeto desenvolv custo custa cusata caro invest taxa orcament despesa preco valor vale paga receber vend dinheiro tonelada emit emissao antecip contrato acordo assinei desenvolvedora comunidad indigen quilombol tradicion direito consentiment dados informac aparelho celular privad salv respostas enviad internet reconect conexao sincroniz online aprov garant certeza passa tempo demora prazo anos resultado processo negocio usuais financiament diferenc normalmente",
};
const LEX = Object.fromEntries(Object.entries(STEMS).map(([l, s]) => [l, s.split(" ").filter(Boolean)]));

function ed1(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, e = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++e > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return e + (a.length - i) + (b.length - j) <= 1;
}

/** Number of words in the question that carry domain evidence. */
export function domainEvidence(text, lang) {
  const stems = LEX[lang] || LEX.en;
  let hits = 0;
  for (const w of normalize(text).split(" ")) {
    if (!w) continue;
    if (stems.some((s) => (s.length === 1 ? w === s : w.startsWith(s)) || (w.length >= 5 && s.length >= 5 && (ed1(w, s) || ed1(w.slice(0, s.length), s))))) hits++;
  }
  return hits;
}
