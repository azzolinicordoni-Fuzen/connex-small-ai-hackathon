-- Subprofiles for Investidor (Bancos/Fundos) - Investment/Credit Requests
CREATE TABLE public.investidor_subperfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome_requisicao text NOT NULL,
  tipo_projeto text,
  volume_desejado numeric,
  certificacao_exigida text,
  localizacao_preferencial text[],
  modalidade text[], -- equity, revenue_share, forward
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subprofiles for Proprietário Rural - Property Areas
CREATE TABLE public.proprietario_subperfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome_area text NOT NULL,
  hectares numeric,
  tipo_uso text,
  tipo_projeto_desejado text[],
  car_numero text,
  car_documento_url text,
  documento_fundiario_url text,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subprofiles for Comprador (Empresas) - ESG Demands
CREATE TABLE public.comprador_subperfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome_demanda text NOT NULL,
  volume_creditos numeric,
  tipos_preferidos text[],
  setor_projeto text,
  ano_alvo integer,
  certificacao_exigida text,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subprofiles for Certificadora - Specific Services
CREATE TABLE public.certificadora_subperfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome_servico text NOT NULL,
  tipo_auditoria text,
  metodologia text,
  escopo text,
  portfolio_url text,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subprofiles for Projeto - Individual Projects
CREATE TABLE public.projeto_subperfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome_projeto text NOT NULL,
  estado text,
  municipio text,
  tipo_projeto text,
  status text,
  pdd_url text,
  car_url text,
  geometria_url text,
  emissoes_evitadas_ano numeric,
  prazo_projeto text,
  investimento_total numeric,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all subprofile tables
ALTER TABLE public.investidor_subperfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proprietario_subperfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprador_subperfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificadora_subperfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projeto_subperfis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investidor_subperfis
CREATE POLICY "Users can view all investidor subperfis" ON public.investidor_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own investidor subperfis" ON public.investidor_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own investidor subperfis" ON public.investidor_subperfis FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can delete their own investidor subperfis" ON public.investidor_subperfis FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for proprietario_subperfis
CREATE POLICY "Users can view all proprietario subperfis" ON public.proprietario_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own proprietario subperfis" ON public.proprietario_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own proprietario subperfis" ON public.proprietario_subperfis FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can delete their own proprietario subperfis" ON public.proprietario_subperfis FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for comprador_subperfis
CREATE POLICY "Users can view all comprador subperfis" ON public.comprador_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comprador subperfis" ON public.comprador_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own comprador subperfis" ON public.comprador_subperfis FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can delete their own comprador subperfis" ON public.comprador_subperfis FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for certificadora_subperfis
CREATE POLICY "Users can view all certificadora subperfis" ON public.certificadora_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own certificadora subperfis" ON public.certificadora_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own certificadora subperfis" ON public.certificadora_subperfis FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can delete their own certificadora subperfis" ON public.certificadora_subperfis FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- RLS Policies for projeto_subperfis
CREATE POLICY "Users can view all projeto subperfis" ON public.projeto_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own projeto subperfis" ON public.projeto_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can update their own projeto subperfis" ON public.projeto_subperfis FOR UPDATE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "Users can delete their own projeto subperfis" ON public.projeto_subperfis FOR DELETE USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- Add triggers for updated_at
CREATE TRIGGER update_investidor_subperfis_updated_at BEFORE UPDATE ON public.investidor_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proprietario_subperfis_updated_at BEFORE UPDATE ON public.proprietario_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comprador_subperfis_updated_at BEFORE UPDATE ON public.comprador_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificadora_subperfis_updated_at BEFORE UPDATE ON public.certificadora_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projeto_subperfis_updated_at BEFORE UPDATE ON public.projeto_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();