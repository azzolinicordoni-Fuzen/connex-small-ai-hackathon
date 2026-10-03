// Hack-Nation 2026 — Connex Field small-AI feature extraction.
// Shared, byte-for-byte, by the training script (Node) and the in-browser runtime.
// Word unigrams + word bigrams + character 3/4-grams (typo tolerance). Pure function, no I/O.

const STOP = {
  en: new Set("a an the is are was be do does did i my me you your it of to in on for and or can could will would should this that with from about if any".split(" ")),
  pt: new Set("o a os as um uma de da do das dos e em no na nos nas para por que eu meu minha voce se ser isso esse essa com sobre".split(" ")),
};

export const FEATURE_WEIGHTS = { word: 1, bigram: 1, char: 0.3 };

export function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordTokens(s, lang) {
  const stop = STOP[lang] || STOP.en;
  return normalize(s).split(" ").filter((t) => t && !stop.has(t));
}

/** Returns a Map feature -> weight. */
export function extractFeatures(text, lang) {
  const f = new Map();
  const add = (k, w) => f.set(k, (f.get(k) || 0) + w);
  const toks = wordTokens(text, lang);
  for (const t of toks) {
    add("w:" + t, FEATURE_WEIGHTS.word);
    const p = "#" + t + "#";
    for (const n of [3, 4]) for (let i = 0; i + n <= p.length; i++) add("c:" + p.slice(i, i + n), FEATURE_WEIGHTS.char);
  }
  for (let i = 0; i + 1 < toks.length; i++) add("b:" + toks[i] + "_" + toks[i + 1], FEATURE_WEIGHTS.bigram);
  return f;
}
