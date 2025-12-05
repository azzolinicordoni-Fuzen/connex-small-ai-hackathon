-- Add new columns to existing subperfil tables for common fields

-- Common fields for proprietario_subperfis
ALTER TABLE public.proprietario_subperfis 
ADD COLUMN IF NOT EXISTS bioma text,
ADD COLUMN IF NOT EXISTS documentacao_fundiaria boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS interesse_projeto text[],
ADD COLUMN IF NOT EXISTS busca_plataforma text[],
ADD COLUMN IF NOT EXISTS contato_preferido text,
ADD COLUMN IF NOT EXISTS mostrar_nome_publico boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_telefone boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_localizacao_precisa boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS permitir_mensagens boolean DEFAULT true;

-- Common fields for investidor_subperfis  
ALTER TABLE public.investidor_subperfis
ADD COLUMN IF NOT EXISTS perfil_investidor text,
ADD COLUMN IF NOT EXISTS interesse_principal text[],
ADD COLUMN IF NOT EXISTS tipo_credito_desejado text[],
ADD COLUMN IF NOT EXISTS busca_plataforma text[],
ADD COLUMN IF NOT EXISTS contato_preferido text,
ADD COLUMN IF NOT EXISTS mostrar_nome_publico boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_telefone boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_localizacao_precisa boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS permitir_mensagens boolean DEFAULT true;

-- Common fields for comprador_subperfis
ALTER TABLE public.comprador_subperfis
ADD COLUMN IF NOT EXISTS busca_plataforma text[],
ADD COLUMN IF NOT EXISTS contato_preferido text,
ADD COLUMN IF NOT EXISTS mostrar_nome_publico boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_telefone boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_localizacao_precisa boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS permitir_mensagens boolean DEFAULT true;

-- Common fields for certificadora_subperfis
ALTER TABLE public.certificadora_subperfis
ADD COLUMN IF NOT EXISTS padroes_oferecidos text[],
ADD COLUMN IF NOT EXISTS metodologias_suportadas text[],
ADD COLUMN IF NOT EXISTS requisitos_especificos text,
ADD COLUMN IF NOT EXISTS paises_atuacao text[],
ADD COLUMN IF NOT EXISTS busca_plataforma text[],
ADD COLUMN IF NOT EXISTS contato_preferido text,
ADD COLUMN IF NOT EXISTS mostrar_nome_publico boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_telefone boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_localizacao_precisa boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS permitir_mensagens boolean DEFAULT true;

-- Common fields for projeto_subperfis
ALTER TABLE public.projeto_subperfis
ADD COLUMN IF NOT EXISTS padrao_certificacao text,
ADD COLUMN IF NOT EXISTS ano_inicio integer,
ADD COLUMN IF NOT EXISTS creditos_disponiveis numeric,
ADD COLUMN IF NOT EXISTS co_beneficios text[],
ADD COLUMN IF NOT EXISTS busca_plataforma text[],
ADD COLUMN IF NOT EXISTS contato_preferido text,
ADD COLUMN IF NOT EXISTS mostrar_nome_publico boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_telefone boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_localizacao_precisa boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS permitir_mensagens boolean DEFAULT true;

-- Create table for desenvolvedores de projetos
CREATE TABLE IF NOT EXISTS public.desenvolvedor_subperfis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_projeto text NOT NULL,
  tipos_projeto text[],
  anos_experiencia integer,
  numero_projetos integer,
  certificadoras_parceiras text[],
  tamanho_area_ideal text,
  descricao text,
  busca_plataforma text[],
  contato_preferido text,
  mostrar_nome_publico boolean DEFAULT true,
  mostrar_telefone boolean DEFAULT true,
  mostrar_localizacao_precisa boolean DEFAULT false,
  permitir_mensagens boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.desenvolvedor_subperfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all desenvolvedor subperfis" ON public.desenvolvedor_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = desenvolvedor_subperfis.profile_id));
CREATE POLICY "Users can update their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis FOR UPDATE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = desenvolvedor_subperfis.profile_id));
CREATE POLICY "Users can delete their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis FOR DELETE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = desenvolvedor_subperfis.profile_id));

-- Create table for auditores/VVBs
CREATE TABLE IF NOT EXISTS public.auditor_subperfis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_servico text NOT NULL,
  padroes_acreditados text[],
  tipos_projeto_aceitos text[],
  tempo_medio_verificacao text,
  descricao text,
  busca_plataforma text[],
  contato_preferido text,
  mostrar_nome_publico boolean DEFAULT true,
  mostrar_telefone boolean DEFAULT true,
  mostrar_localizacao_precisa boolean DEFAULT false,
  permitir_mensagens boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.auditor_subperfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all auditor subperfis" ON public.auditor_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own auditor subperfis" ON public.auditor_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = auditor_subperfis.profile_id));
CREATE POLICY "Users can update their own auditor subperfis" ON public.auditor_subperfis FOR UPDATE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = auditor_subperfis.profile_id));
CREATE POLICY "Users can delete their own auditor subperfis" ON public.auditor_subperfis FOR DELETE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = auditor_subperfis.profile_id));

-- Create table for instituições financeiras
CREATE TABLE IF NOT EXISTS public.financeira_subperfis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_produto text NOT NULL,
  tipos_financiamento text[],
  ticket_medio numeric,
  exigencias_garantia text,
  modalidades text[],
  descricao text,
  busca_plataforma text[],
  contato_preferido text,
  mostrar_nome_publico boolean DEFAULT true,
  mostrar_telefone boolean DEFAULT true,
  mostrar_localizacao_precisa boolean DEFAULT false,
  permitir_mensagens boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.financeira_subperfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all financeira subperfis" ON public.financeira_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own financeira subperfis" ON public.financeira_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = financeira_subperfis.profile_id));
CREATE POLICY "Users can update their own financeira subperfis" ON public.financeira_subperfis FOR UPDATE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = financeira_subperfis.profile_id));
CREATE POLICY "Users can delete their own financeira subperfis" ON public.financeira_subperfis FOR DELETE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = financeira_subperfis.profile_id));

-- Create table for advogados/jurídico
CREATE TABLE IF NOT EXISTS public.advogado_subperfis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_servico text NOT NULL,
  areas_atuacao text[],
  experiencia_carbono boolean DEFAULT false,
  clientes_atendidos text[],
  descricao text,
  busca_plataforma text[],
  contato_preferido text,
  mostrar_nome_publico boolean DEFAULT true,
  mostrar_telefone boolean DEFAULT true,
  mostrar_localizacao_precisa boolean DEFAULT false,
  permitir_mensagens boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.advogado_subperfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all advogado subperfis" ON public.advogado_subperfis FOR SELECT USING (true);
CREATE POLICY "Users can insert their own advogado subperfis" ON public.advogado_subperfis FOR INSERT WITH CHECK (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = advogado_subperfis.profile_id));
CREATE POLICY "Users can update their own advogado subperfis" ON public.advogado_subperfis FOR UPDATE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = advogado_subperfis.profile_id));
CREATE POLICY "Users can delete their own advogado subperfis" ON public.advogado_subperfis FOR DELETE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = advogado_subperfis.profile_id));

-- Add triggers for updated_at
CREATE TRIGGER update_desenvolvedor_subperfis_updated_at BEFORE UPDATE ON public.desenvolvedor_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auditor_subperfis_updated_at BEFORE UPDATE ON public.auditor_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financeira_subperfis_updated_at BEFORE UPDATE ON public.financeira_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advogado_subperfis_updated_at BEFORE UPDATE ON public.advogado_subperfis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update agent_type enum to include new types
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'desenvolvedor';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'auditor';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'financeira';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'advogado';