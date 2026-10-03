// Hack-Nation 2026 — Connex Field triage C01–C19.
// Source of truth: "Connex Field — Especificação de Conteúdo e Implementação" v0.1.1, section 3.
// Stable IDs and snake_case values are shared by both languages.
import type { FieldLang } from "./i18n";

type L = { en: string; pt: string };
export type Option = { value: string; label: L };
export type QuestionKind = "single" | "multi" | "text" | "location";

export interface Question {
  id: string; // C01..C19
  field: string;
  kind: QuestionKind;
  label: L;
  rule?: L;
  options?: Option[];
  optional?: boolean;
}

const o = (value: string, en: string, pt: string): Option => ({ value, label: { en, pt } });
const NOT_SURE = o("not_sure", "Not sure", "Não sei");
const PREFER_NOT = o("prefer_not_to_answer", "Prefer not to answer", "Prefiro não responder");

export const QUESTIONS: Question[] = [
  {
    id: "C01", field: "language", kind: "single",
    label: { en: "Which language do you prefer?", pt: "Qual idioma você prefere?" },
    options: [o("pt", "Português", "Português"), o("en", "English", "English")],
  },
  {
    id: "C02", field: "local_storage_consent", kind: "single",
    label: {
      en: "May I save your answers on this device so the assessment works without internet?",
      pt: "Posso salvar suas respostas neste dispositivo para que a avaliação funcione sem internet?",
    },
    options: [o("yes", "Yes", "Sim"), o("no", "No", "Não")],
  },
  {
    id: "C03", field: "display_name", kind: "text", optional: true,
    label: { en: "What would you like to be called?", pt: "Como você gostaria de ser chamado?" },
    rule: { en: "Optional. A first name or nickname only.", pt: "Opcional. Apenas nome ou apelido." },
  },
  {
    id: "C04", field: "contact_channel", kind: "single",
    label: {
      en: "When you connect, how would you prefer to receive the result?",
      pt: "Quando você se conectar, como prefere receber o resultado?",
    },
    rule: {
      en: "Only your preference is saved. No phone number or email is collected offline.",
      pt: "Guardamos só a preferência. Telefone ou e-mail não são coletados offline.",
    },
    options: [
      o("whatsapp", "WhatsApp", "WhatsApp"), o("email", "Email", "E-mail"),
      o("connex_only", "Only on Connex", "Apenas na Connex"), o("decide_later", "Decide later", "Decidir depois"),
    ],
  },
  {
    id: "C05", field: "relationship_to_land", kind: "single",
    label: { en: "What is your relationship to the area?", pt: "Qual é sua relação com a área?" },
    options: [
      o("owner", "Owner", "Proprietário"), o("usufructuary", "Usufructuary", "Usufrutuário"),
      o("possessor", "Possessor (posseiro)", "Posseiro"), o("tenant", "Tenant", "Arrendatário"),
      o("representative", "Representative", "Representante"), o("community", "Community", "Comunidade"),
      o("other", "Other", "Outro"), NOT_SURE,
    ],
  },
  {
    id: "C06", field: "country_state_city", kind: "location",
    label: { en: "Where is the area located?", pt: "Onde a área está localizada?" },
    rule: {
      en: "Country, state and municipality only. No GPS coordinates.",
      pt: "Apenas país, estado e município. Sem coordenadas.",
    },
  },
  {
    id: "C07", field: "property_area_range", kind: "single",
    label: { en: "Approximately what is the total size of the area?", pt: "Qual é aproximadamente o tamanho total da área?" },
    rule: {
      en: "No area is rejected because of size. Small projects may need aggregation.",
      pt: "Nenhuma área é rejeitada pelo tamanho. Projetos pequenos podem precisar de agregação.",
    },
    options: [
      o("lt_10", "Less than 10 ha", "Menos de 10 ha"), o("10_50", "10 to 50 ha", "10 a 50 ha"),
      o("50_200", "50 to 200 ha", "50 a 200 ha"), o("200_1000", "200 to 1,000 ha", "200 a 1.000 ha"),
      o("1000_5000", "1,000 to 5,000 ha", "1.000 a 5.000 ha"), o("gt_5000", "More than 5,000 ha", "Mais de 5.000 ha"),
      NOT_SURE,
    ],
  },
  {
    id: "C08", field: "land_documentation", kind: "single",
    label: { en: "Which document best describes your situation regarding the area?", pt: "Qual documento melhor descreve sua situação sobre a área?" },
    rule: { en: "Only the declared type is recorded. No uploads.", pt: "Registramos apenas o tipo declarado. Sem envio de arquivos." },
    options: [
      o("registry_record", "Property registry record (matrícula)", "Matrícula"), o("deed", "Deed", "Escritura"),
      o("contract", "Contract", "Contrato"), o("possession_document", "Possession document", "Documento de posse"),
      o("settlement_title", "Settlement title", "Título de assentamento"), o("community_document", "Community document", "Documento comunitário"),
      o("other", "Other", "Outro"), NOT_SURE,
    ],
  },
  {
    id: "C09", field: "car_status", kind: "single",
    label: { en: "Is the property registered in the Rural Environmental Registry (CAR)?", pt: "O imóvel está inscrito no Cadastro Ambiental Rural?" },
    rule: { en: "The CAR is environmental data and does not prove ownership. Do not enter the CAR number.", pt: "O CAR é dado ambiental e não prova propriedade. Não informe o número do CAR." },
    options: [
      o("yes_analyzed", "Yes, analyzed", "Sim e analisado"), o("yes_pending_analysis", "Yes, awaiting analysis", "Sim aguardando análise"),
      o("yes_with_issues", "Yes, with pending issues", "Sim com pendência"), o("no", "No", "Não"),
      NOT_SURE, o("not_applicable", "Not applicable", "Não se aplica"),
    ],
  },
  {
    id: "C10", field: "overlap_dispute", kind: "single",
    label: {
      en: "Is there any dispute, overlapping area, or doubt about who can decide on the property?",
      pt: "Existe disputa, sobreposição de área ou dúvida sobre quem pode decidir pelo imóvel?",
    },
    options: [o("no", "No", "Não"), o("yes", "Yes", "Sim"), o("maybe", "Maybe", "Talvez"), PREFER_NOT],
  },
  {
    id: "C11", field: "existing_carbon_commitment", kind: "single",
    label: { en: "Does the area already take part in a carbon project, contract or program?", pt: "A área já participa de projeto, contrato ou programa de carbono?" },
    options: [
      o("no", "No", "Não"), o("private_project", "Private project", "Projeto privado"),
      o("jurisdictional_program", "Jurisdictional program", "Programa jurisdicional"),
      o("contract_in_negotiation", "Contract under negotiation", "Contrato em negociação"), NOT_SURE,
    ],
  },
  {
    id: "C12", field: "current_land_uses", kind: "multi",
    label: { en: "What activities exist in the area today?", pt: "Quais atividades existem hoje na área?" },
    options: [
      o("native_vegetation", "Native vegetation", "Vegetação nativa"), o("degraded_area", "Degraded area", "Área degradada"),
      o("agriculture", "Agriculture", "Agricultura"), o("livestock", "Livestock", "Pecuária"),
      o("forestry", "Forestry", "Silvicultura"), o("waste_or_manure", "Waste or manure", "Resíduos ou dejetos"),
      o("energy", "Energy", "Energia"), o("other", "Other", "Outra"),
    ],
  },
  {
    id: "C13", field: "desired_change", kind: "single",
    label: { en: "What are you considering doing in the coming years?", pt: "O que você considera fazer nos próximos anos?" },
    options: [
      o("conserve_vegetation", "Conserve vegetation", "Conservar vegetação"), o("restore_area", "Restore the area", "Restaurar área"),
      o("improve_agricultural_management", "Improve agricultural management", "Melhorar manejo agrícola"),
      o("improve_livestock_management", "Improve livestock management", "Melhorar manejo pecuário"),
      o("treat_waste", "Treat waste", "Tratar resíduos"), o("not_sure_yet", "Not sure yet", "Ainda não sei"),
    ],
  },
  {
    id: "C14", field: "activity_start_status", kind: "single",
    label: { en: "Has the change already started?", pt: "A mudança já começou?" },
    rule: {
      en: "Start dates may affect additionality and eligibility.",
      pt: "Datas de início podem afetar adicionalidade e elegibilidade.",
    },
    options: [
      o("not_started", "Not started", "Não começou"), o("planning", "In planning", "Está em planejamento"),
      o("started_lt_12m", "Started less than 12 months ago", "Começou há menos de 12 meses"),
      o("started_gt_12m", "Started more than 12 months ago", "Começou há mais de 12 meses"), NOT_SURE,
    ],
  },
  {
    id: "C15", field: "communities_rights", kind: "single",
    label: {
      en: "Are there Indigenous peoples, traditional communities, quilombolas, settlers or other groups with rights to or use of the area?",
      pt: "Há povos indígenas, comunidades tradicionais, quilombolas, assentados ou outros grupos com direitos ou uso da área?",
    },
    options: [o("no", "No", "Não"), o("yes", "Yes", "Sim"), o("maybe", "Maybe", "Talvez"), PREFER_NOT],
  },
  {
    id: "C16", field: "records_available", kind: "multi",
    label: { en: "What information can you already prove?", pt: "Quais informações você já consegue comprovar?" },
    rule: { en: "Selection only. No uploads.", pt: "Apenas seleção. Sem envio de arquivos." },
    options: [
      o("map", "Map", "Mapa"), o("car", "CAR", "CAR"), o("land_documents", "Land documents", "Documentos fundiários"),
      o("land_use_history", "Land-use history", "Histórico de uso"), o("invoices_and_production", "Invoices and production", "Notas e produção"),
      o("photos", "Photos", "Fotos"), o("inventory", "Inventory", "Inventário"), o("none", "None", "Nenhum"), NOT_SURE,
    ],
  },
  {
    id: "C17", field: "monitoring_readiness", kind: "single",
    label: {
      en: "Would you accept keeping records and receiving technical visits or measurements throughout the project?",
      pt: "Você aceitaria manter registros e receber visitas ou medições técnicas ao longo do projeto?",
    },
    options: [o("yes", "Yes", "Sim"), o("maybe", "Maybe", "Talvez"), o("no", "No", "Não")],
  },
  {
    id: "C18", field: "primary_goal", kind: "single",
    label: { en: "What is your main goal?", pt: "Qual é seu principal objetivo?" },
    options: [
      o("new_income", "New income", "Nova receita"), o("finance_restoration", "Finance restoration", "Financiar restauração"),
      o("conserve_area", "Conserve the area", "Conservar a área"), o("improve_production", "Improve production", "Melhorar produção"),
      o("find_partner", "Find a partner", "Encontrar parceiro"), o("understand_market", "Understand the market", "Entender o mercado"),
    ],
  },
  {
    id: "C19", field: "sync_consent", kind: "single",
    label: {
      en: "When the internet returns, do you authorize sending these answers to your Connex account?",
      pt: "Quando a internet voltar, você autoriza o envio dessas respostas para sua conta Connex?",
    },
    rule: {
      en: "Separate from local consent. Without authorization, nothing leaves this device.",
      pt: "Separado do consentimento local. Sem autorização, nada sai do dispositivo.",
    },
    options: [o("authorize_now", "Authorize now", "Autorizar agora"), o("ask_later", "Ask later", "Perguntar depois"), o("do_not_authorize", "Do not authorize", "Não autorizar")],
  },
];

export const BIOMES: Option[] = [
  o("amazon", "Amazon", "Amazônia"), o("atlantic_forest", "Atlantic Forest", "Mata Atlântica"),
  o("cerrado", "Cerrado", "Cerrado"), o("caatinga", "Caatinga", "Caatinga"), o("pampa", "Pampa", "Pampa"),
  o("pantanal", "Pantanal", "Pantanal"), o("other", "Other", "Outro"), NOT_SURE,
];

export const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

/** C06 value: biome is stored inside the location answer (spec: no change to C01–C19 sequence). */
export interface LocationValue { country: "BR" | "other"; state: string; municipality: string; biome: string }

export const STEPS: { key: string; questions: string[]; title: L }[] = [
  { key: "start", questions: ["C01", "C02"], title: { en: "Language and consent", pt: "Idioma e consentimento" } },
  { key: "you", questions: ["C03", "C04"], title: { en: "About you", pt: "Sobre você" } },
  { key: "land", questions: ["C05", "C06"], title: { en: "Land and location", pt: "Área e localização" } },
  { key: "size", questions: ["C07", "C06.biome"], title: { en: "Size and biome", pt: "Tamanho e bioma" } },
  { key: "docs", questions: ["C08", "C09"], title: { en: "Documentation", pt: "Documentação" } },
  { key: "use", questions: ["C12", "C13", "C14"], title: { en: "Land use and plans", pt: "Uso da terra e planos" } },
  { key: "rights", questions: ["C10", "C11", "C15"], title: { en: "Rights and commitments", pt: "Direitos e compromissos" } },
  { key: "readiness", questions: ["C16", "C17", "C18"], title: { en: "Records and goals", pt: "Registros e objetivos" } },
];

export const qById = (id: string) => QUESTIONS.find((q) => q.id === id)!;
export const optLabel = (q: Question | { options?: Option[] }, v: string, lang: FieldLang) =>
  q.options?.find((x) => x.value === v)?.label[lang] ?? v;

/** Fields that must never be collected offline (validated in tests). */
export const PROHIBITED_FIELDS = ["cpf", "cnpj", "email_address", "phone", "car_number", "registration_number", "land_document_file", "bank", "gps", "latitude", "longitude", "photo_file"];
