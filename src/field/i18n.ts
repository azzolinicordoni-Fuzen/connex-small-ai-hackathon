// Hack-Nation 2026 — Connex Field bilingual strings. Stable keys shared across languages.
export type FieldLang = "en" | "pt";

export const fieldStrings = {
  en: {
    tagline: "Offline AI for rural carbon-market access",
    intro:
      "Connex Field helps rural landowners understand carbon-project pathways, identify missing information and safeguards, and connect with qualified technical and financial partners when connectivity returns.",
    point1: "Works without internet after the first visit",
    point2: "Your answers stay on this device until you choose to sync",
    point3: "Available in English and Portuguese",
    online: "Online",
    offline: "Offline",
    begin: "Begin assessment",
    comingNext: "Coming next",
    disclaimerTitle: "Preliminary assessment",
    disclaimer:
      "This is a preliminary, informational assessment. It is not a certification, legal opinion, financial advice, or a guarantee of eligibility or carbon-credit value. Specialist review is always required.",
    language: "Language",
    back: "Back to Connex",
  },
  pt: {
    tagline: "IA offline para acesso rural ao mercado de carbono",
    intro:
      "O Connex Field ajuda proprietários rurais a entender caminhos para projetos de carbono, identificar informações e salvaguardas faltantes e se conectar a parceiros técnicos e financeiros qualificados quando a conexão voltar.",
    point1: "Funciona sem internet após o primeiro acesso",
    point2: "Suas respostas ficam neste aparelho até você decidir sincronizar",
    point3: "Disponível em inglês e português",
    online: "Online",
    offline: "Offline",
    begin: "Iniciar avaliação",
    comingNext: "Em breve",
    disclaimerTitle: "Avaliação preliminar",
    disclaimer:
      "Esta é uma avaliação preliminar e informativa. Não é certificação, parecer jurídico, recomendação financeira nem garantia de elegibilidade ou de valor em créditos de carbono. A revisão por especialista é sempre necessária.",
    language: "Idioma",
    back: "Voltar à Connex",
  },
} as const;

export type FieldStringKey = keyof (typeof fieldStrings)["en"];
