export declare const OOD: "__ood__";
export interface NBLangModel {
  classes: string[]; alpha: number; vocab: string[]; totals: number[]; logPrior: number[];
  counts: [number, number][][];
}
export interface Prepared extends NBLangModel { C: number; denom: number[]; index: Map<string, number> }
export interface Ranked { id: string; p: number }
export interface Prediction { ranked: Ranked[]; coverage: number; nWords: number }
export interface Thresholds { accept: number; margin: number; clarify: number; oodReject: number; minCoverage: number }
export type Decision =
  | { kind: "answer"; id: string; candidates: Ranked[] }
  | { kind: "clarify" | "reject" | "uncertain"; id?: undefined; candidates: Ranked[] };
export declare function prepare(m: NBLangModel): Prepared;
export declare function predictProba(pm: Prepared, text: string, lang: "en" | "pt", scale: number): Prediction;
export declare function decide(pred: Prediction, th: Thresholds): Decision;
export declare function detectLang(prepared: Record<string, Prepared>, text: string, fallback: string): string;
