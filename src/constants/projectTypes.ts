// Comprehensive carbon credit project types categorization

export interface ProjectSubtype {
  id: string;
  label: string;
}

export interface ProjectCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  subtypes: ProjectSubtype[];
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  {
    id: 'nbs_florestal',
    label: 'Florestais (NBS)',
    icon: '🌲',
    description: 'Projetos baseados em florestas e silvicultura',
    subtypes: [
      { id: 'redd_plus', label: 'REDD+ (Redução de Emissões por Desmatamento)' },
      { id: 'conservacao_florestal', label: 'Conservação Florestal' },
      { id: 'manejo_florestal', label: 'Manejo Florestal Sustentável' },
      { id: 'reflorestamento', label: 'Reflorestamento' },
      { id: 'aflorestamento', label: 'Aflorestamento' },
      { id: 'restauracao_florestal', label: 'Restauração Florestal' },
      { id: 'enriquecimento_florestal', label: 'Enriquecimento Florestal' },
      { id: 'silvicultura', label: 'Silvicultura Sustentável' },
      { id: 'plantios_mistos', label: 'Plantios Mistos (nativos + comerciais)' },
    ]
  },
  {
    id: 'nbs_afolu',
    label: 'Agricultura e Uso da Terra (AFOLU)',
    icon: '🌾',
    description: 'Projetos de agricultura regenerativa e manejo de solos',
    subtypes: [
      { id: 'agricultura_regenerativa', label: 'Agricultura Regenerativa' },
      { id: 'agricultura_baixo_carbono', label: 'Agricultura de Baixo Carbono' },
      { id: 'ilpf', label: 'Integração Lavoura-Pecuária-Floresta (ILPF)' },
      { id: 'manejo_solos', label: 'Manejo de Solos' },
      { id: 'sequestro_solo', label: 'Sequestro de Carbono no Solo' },
      { id: 'saf', label: 'Sistemas Agroflorestais (SAF)' },
      { id: 'pastagens_sustentaveis', label: 'Pastagens Sustentáveis' },
      { id: 'recuperacao_degradadas', label: 'Recuperação de Áreas Degradadas' },
      { id: 'biochar', label: 'Biochar aplicado ao solo' },
    ]
  },
  {
    id: 'nbs_ecossistemas',
    label: 'Ecossistemas Naturais',
    icon: '🏞️',
    description: 'Conservação de biomas e ecossistemas',
    subtypes: [
      { id: 'manguezais', label: 'Manguezais (Blue Carbon)' },
      { id: 'restinga', label: 'Restinga' },
      { id: 'pantanos', label: 'Pântanos e Áreas Alagadas' },
      { id: 'turfeiras', label: 'Turfeiras' },
      { id: 'cerrado', label: 'Cerrado' },
      { id: 'caatinga', label: 'Caatinga' },
      { id: 'pantanal', label: 'Pantanal' },
      { id: 'savanas', label: 'Savanas' },
      { id: 'biomas_costeiros', label: 'Biomas Costeiros' },
    ]
  },
  {
    id: 'energia_renovavel',
    label: 'Energia Renovável',
    icon: '⚡',
    description: 'Geração de energia limpa e sustentável',
    subtypes: [
      { id: 'solar_fotovoltaica', label: 'Energia Solar Fotovoltaica' },
      { id: 'solar_termica', label: 'Energia Solar Térmica' },
      { id: 'eolica', label: 'Energia Eólica (onshore e offshore)' },
      { id: 'hidreletrica', label: 'Energia Hidrelétrica (pequena escala)' },
      { id: 'biomassa', label: 'Biomassa' },
      { id: 'biogas', label: 'Biogás' },
      { id: 'geotermica', label: 'Energia Geotérmica' },
      { id: 'oceanica', label: 'Energia Oceânica' },
      { id: 'substituicao_fosseis', label: 'Substituição de combustíveis fósseis' },
      { id: 'cogeracao', label: 'Cogeração de energia' },
    ]
  },
  {
    id: 'eficiencia_energetica',
    label: 'Eficiência Energética',
    icon: '💡',
    description: 'Otimização e redução de consumo energético',
    subtypes: [
      { id: 'eficiencia_industrial', label: 'Eficiência energética industrial' },
      { id: 'eficiencia_edificios', label: 'Eficiência energética em edifícios' },
      { id: 'retrofit', label: 'Retrofit energético' },
      { id: 'iluminacao_led', label: 'Iluminação eficiente (LED)' },
      { id: 'otimizacao_processos', label: 'Otimização de processos industriais' },
      { id: 'recuperacao_calor', label: 'Recuperação de calor' },
      { id: 'automacao_energetica', label: 'Automação energética' },
    ]
  },
  {
    id: 'gestao_residuos',
    label: 'Gestão de Resíduos',
    icon: '♻️',
    description: 'Tratamento e valorização de resíduos',
    subtypes: [
      { id: 'aterros_metano', label: 'Aterros Sanitários (captura de metano)' },
      { id: 'tratamento_solidos', label: 'Tratamento de resíduos sólidos' },
      { id: 'compostagem', label: 'Compostagem' },
      { id: 'reciclagem', label: 'Reciclagem' },
      { id: 'waste_to_energy', label: 'Waste-to-Energy' },
      { id: 'tratamento_efluentes', label: 'Tratamento de efluentes' },
      { id: 'biodigestores', label: 'Biodigestores' },
      { id: 'residuos_agricolas', label: 'Gestão de resíduos agrícolas' },
      { id: 'residuos_industriais', label: 'Gestão de resíduos industriais' },
    ]
  },
  {
    id: 'metano_gases',
    label: 'Metano e Gases Industriais',
    icon: '🏭',
    description: 'Captura e redução de gases de efeito estufa',
    subtypes: [
      { id: 'captura_metano', label: 'Captura e destruição de metano' },
      { id: 'reducao_gases', label: 'Redução de gases industriais (HFCs, N₂O, PFCs)' },
      { id: 'substituicao_refrigerantes', label: 'Substituição de gases refrigerantes' },
      { id: 'emissoes_industriais', label: 'Tratamento de emissões industriais' },
      { id: 'emissoes_fugitivas', label: 'Redução de emissões fugitivas' },
    ]
  },
  {
    id: 'transporte',
    label: 'Transporte Sustentável',
    icon: '🚗',
    description: 'Mobilidade de baixo carbono',
    subtypes: [
      { id: 'eletrificacao_frotas', label: 'Eletrificação de frotas' },
      { id: 'biocombustiveis', label: 'Biocombustíveis (etanol, biodiesel, SAF)' },
      { id: 'transporte_publico', label: 'Transporte público sustentável' },
      { id: 'logistica_baixo_carbono', label: 'Logística de baixo carbono' },
      { id: 'mobilidade_urbana', label: 'Mobilidade urbana sustentável' },
      { id: 'veiculos_hibridos', label: 'Veículos híbridos' },
      { id: 'hidrogenio_transporte', label: 'Hidrogênio verde para transporte' },
    ]
  },
  {
    id: 'industrial_tecnologico',
    label: 'Industrial e Tecnológico',
    icon: '🔬',
    description: 'Tecnologias de captura e descarbonização',
    subtypes: [
      { id: 'ccs', label: 'Captura e Armazenamento de Carbono (CCS)' },
      { id: 'ccus', label: 'Captura, Uso e Armazenamento de Carbono (CCUS)' },
      { id: 'hidrogenio_verde', label: 'Hidrogênio Verde' },
      { id: 'hidrogenio_azul', label: 'Hidrogênio Azul' },
      { id: 'processos_baixo_carbono', label: 'Processos industriais de baixo carbono' },
      { id: 'descarbonizacao_cadeias', label: 'Descarbonização de cadeias produtivas' },
      { id: 'dac', label: 'Tecnologias de remoção direta de CO₂ (DAC)' },
    ]
  },
  {
    id: 'blue_carbon',
    label: 'Carbono Azul (Blue Carbon)',
    icon: '🌊',
    description: 'Ecossistemas costeiros e marinhos',
    subtypes: [
      { id: 'conservacao_manguezais', label: 'Conservação de manguezais' },
      { id: 'restauracao_manguezais', label: 'Restauração de manguezais' },
      { id: 'pradarias_marinhas', label: 'Pradarias marinhas' },
      { id: 'marismas', label: 'Marismas' },
      { id: 'ecossistemas_costeiros', label: 'Ecossistemas costeiros e marinhos' },
    ]
  },
  {
    id: 'comunitario_social',
    label: 'Comunitários e Sociais',
    icon: '👥',
    description: 'Projetos com impacto social e climático',
    subtypes: [
      { id: 'comunidades_tradicionais', label: 'Projetos com comunidades tradicionais' },
      { id: 'povos_indigenas', label: 'Projetos com povos indígenas' },
      { id: 'desenvolvimento_local', label: 'Desenvolvimento sustentável local' },
      { id: 'geracao_renda', label: 'Geração de renda com impacto climático' },
      { id: 'acesso_energia', label: 'Acesso à energia limpa' },
      { id: 'agua_saneamento', label: 'Água e saneamento com redução de emissões' },
    ]
  },
  {
    id: 'hibrido_multicomponente',
    label: 'Híbridos / Multicomponentes',
    icon: '🔗',
    description: 'Projetos integrados e programas jurisdicionais',
    subtypes: [
      { id: 'florestal_energia', label: 'Florestal + Energia' },
      { id: 'agricultura_tecnologia', label: 'Agricultura + Tecnologia' },
      { id: 'residuos_energia', label: 'Resíduos + Energia' },
      { id: 'natureza_comunidade', label: 'Natureza + Comunidade' },
      { id: 'mitigacao_adaptacao', label: 'Projetos integrados de mitigação e adaptação' },
      { id: 'programas_jurisdicionais', label: 'Programas jurisdicionais' },
      { id: 'programas_corporativos', label: 'Programas corporativos de neutralização' },
    ]
  },
];

// Flatten all subtypes for simple lookups
export const ALL_PROJECT_TYPES: ProjectSubtype[] = PROJECT_CATEGORIES.flatMap(
  category => category.subtypes
);

// Get category by subtype id
export const getCategoryBySubtypeId = (subtypeId: string): ProjectCategory | undefined => {
  return PROJECT_CATEGORIES.find(category =>
    category.subtypes.some(subtype => subtype.id === subtypeId)
  );
};

// Get subtype label by id
export const getSubtypeLabel = (subtypeId: string): string => {
  const subtype = ALL_PROJECT_TYPES.find(s => s.id === subtypeId);
  return subtype?.label || subtypeId;
};

// Get category label by subtype id
export const getCategoryLabel = (subtypeId: string): string => {
  const category = getCategoryBySubtypeId(subtypeId);
  return category?.label || '';
};

// Get multiple labels from array of ids
export const getProjectTypeLabels = (typeIds: string[]): string[] => {
  return typeIds.map(id => getSubtypeLabel(id));
};
