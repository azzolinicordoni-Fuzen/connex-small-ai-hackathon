export declare const FEATURE_WEIGHTS: { word: number; bigram: number; char: number };
export declare function normalize(s: string): string;
export declare function wordTokens(s: string, lang: "en" | "pt"): string[];
export declare function extractFeatures(text: string, lang: "en" | "pt"): Map<string, number>;
