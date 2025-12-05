-- Add new agent type for buyers
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'comprador';

-- Table for Proprietário Rural details
CREATE TABLE public.proprietario_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  -- A. Informações Pessoais
  cpf_cnpj text,
  phone text,
  whatsapp text,
  estado text,
  municipio text,
  -- B. Propriedade
  nome_fazenda text,
  area_total_ha numeric,
  area_disponivel_ha numeric,
  tipo_uso_atual text, -- pecuaria, agricultura, floresta, mista
  car_numero text,
  car_documento_url text,
  documento_fundiario_url text,
  -- C. Histórico Ambiental
  possui_projeto_carbono boolean DEFAULT false,
  areas_degradadas_percentual numeric,
  possui_app boolean DEFAULT false,
  app_descricao text,
  possui_reserva_legal boolean DEFAULT false,
  reserva_legal_descricao text,
  -- D. Interesses
  interesses_atrair text[], -- desenvolvedores, consultorias, certificadoras, investidores
  tipos_projeto_desejado text[], -- redd, arr, agricultura_regenerativa, pecuaria_sustentavel
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for Certificadora details
CREATE TABLE public.certificadora_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  -- A. Informações da Instituição
  cnpj text,
  selos_credenciamento text[], -- Verra, Gold Standard, etc.
  numero_auditores integer,
  -- B. Experiência
  metodologias_certificadas text[],
  projetos_auditados_florestal integer,
  projetos_auditados_agricultura integer,
  projetos_auditados_energia integer,
  projetos_auditados_outros integer,
  areas_atuacao text[], -- estados/países
  -- C. Serviços Oferecidos
  servico_auditoria_inicial boolean DEFAULT false,
  servico_auditoria_monitoramento boolean DEFAULT false,
  servico_revisao_inventario boolean DEFAULT false,
  servico_verificacao_baseline boolean DEFAULT false,
  -- D. Uploads
  portfolio_url text,
  certificados_url text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for Investidor (Fundos e Bancos) details
CREATE TABLE public.investidor_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  -- A. Instituição
  cnpj text,
  website text,
  tipo_investidor text, -- fundo_esg, banco, venture_capital, family_office
  -- B. Tese de Investimento
  ticket_minimo numeric,
  ticket_maximo numeric,
  interesse_financeiro text[], -- equity, revenue_share, forward
  -- C. Tipos de Projetos Buscados
  busca_floresta_nativa boolean DEFAULT false,
  busca_agricultura_regenerativa boolean DEFAULT false,
  busca_biodiversidade boolean DEFAULT false,
  busca_energia_renovavel boolean DEFAULT false,
  -- D. Restrições
  exigencia_certificadora text,
  localizacao_preferencial text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for Comprador (Empresas Compradoras de Crédito) details
CREATE TABLE public.comprador_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  -- A. Dados Corporativos
  cnpj text,
  setor text,
  numero_funcionarios integer,
  -- B. Metas ESG
  compromissos_publicos text,
  ano_net_zero integer,
  -- C. Necessidades
  volume_anual_creditos numeric, -- tCO₂e
  preferencia_florestal boolean DEFAULT false,
  preferencia_solo boolean DEFAULT false,
  preferencia_metano boolean DEFAULT false,
  preferencia_energia boolean DEFAULT false,
  -- D. Políticas
  exigencia_certificacao text,
  criterios_sociais text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for Projeto details
CREATE TABLE public.projeto_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  -- A. Identificação
  nome_projeto text,
  estado text,
  municipio text,
  responsavel text,
  cnpj text,
  -- B. Tipo de Projeto
  tipo_projeto text, -- redd, arr, ar, agricultura_regenerativa, outros
  -- C. Status
  status text, -- ideacao, validacao, em_certificacao, certificado, creditos_emitidos
  -- D. Documentação
  pdd_url text,
  car_url text,
  geometria_url text, -- shapefile/KML
  -- E. Estimativas
  emissoes_evitadas_ano numeric, -- tCO₂e/ano
  prazo_projeto text,
  investimento_total numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.proprietario_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificadora_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investidor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprador_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projeto_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proprietario_details
CREATE POLICY "Users can view all proprietario details" ON public.proprietario_details FOR SELECT USING (true);
CREATE POLICY "Users can insert their own proprietario details" ON public.proprietario_details FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own proprietario details" ON public.proprietario_details FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for certificadora_details
CREATE POLICY "Users can view all certificadora details" ON public.certificadora_details FOR SELECT USING (true);
CREATE POLICY "Users can insert their own certificadora details" ON public.certificadora_details FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own certificadora details" ON public.certificadora_details FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for investidor_details
CREATE POLICY "Users can view all investidor details" ON public.investidor_details FOR SELECT USING (true);
CREATE POLICY "Users can insert their own investidor details" ON public.investidor_details FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own investidor details" ON public.investidor_details FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for comprador_details
CREATE POLICY "Users can view all comprador details" ON public.comprador_details FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comprador details" ON public.comprador_details FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own comprador details" ON public.comprador_details FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for projeto_details
CREATE POLICY "Users can view all projeto details" ON public.projeto_details FOR SELECT USING (true);
CREATE POLICY "Users can insert their own projeto details" ON public.projeto_details FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own projeto details" ON public.projeto_details FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- Add triggers for updated_at
CREATE TRIGGER update_proprietario_details_updated_at BEFORE UPDATE ON public.proprietario_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificadora_details_updated_at BEFORE UPDATE ON public.certificadora_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_investidor_details_updated_at BEFORE UPDATE ON public.investidor_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comprador_details_updated_at BEFORE UPDATE ON public.comprador_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projeto_details_updated_at BEFORE UPDATE ON public.projeto_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();