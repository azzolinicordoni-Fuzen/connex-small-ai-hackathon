-- Create unified subprofiles view
CREATE OR REPLACE VIEW public.unified_subprofiles AS
SELECT 
  id,
  profile_id,
  'proprietario' as subprofile_type,
  nome_area as name,
  descricao as description,
  hectares::text as detail_1,
  bioma as detail_2,
  tipo_uso as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM proprietario_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'desenvolvedor' as subprofile_type,
  nome_projeto as name,
  descricao as description,
  anos_experiencia::text as detail_1,
  tamanho_area_ideal as detail_2,
  numero_projetos::text as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM desenvolvedor_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'certificadora' as subprofile_type,
  nome_servico as name,
  descricao as description,
  tipo_auditoria as detail_1,
  metodologia as detail_2,
  escopo as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM certificadora_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'auditor' as subprofile_type,
  nome_servico as name,
  descricao as description,
  tempo_medio_verificacao as detail_1,
  NULL as detail_2,
  NULL as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM auditor_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'investidor' as subprofile_type,
  nome_requisicao as name,
  descricao as description,
  perfil_investidor as detail_1,
  tipo_projeto as detail_2,
  volume_desejado::text as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM investidor_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'comprador' as subprofile_type,
  nome_demanda as name,
  descricao as description,
  setor_projeto as detail_1,
  certificacao_exigida as detail_2,
  volume_creditos::text as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM comprador_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'financeira' as subprofile_type,
  nome_produto as name,
  descricao as description,
  exigencias_garantia as detail_1,
  ticket_medio::text as detail_2,
  NULL as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM financeira_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'advogado' as subprofile_type,
  nome_servico as name,
  descricao as description,
  experiencia_carbono::text as detail_1,
  NULL as detail_2,
  NULL as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM advogado_subperfis

UNION ALL

SELECT 
  id,
  profile_id,
  'projeto' as subprofile_type,
  nome_projeto as name,
  descricao as description,
  tipo_projeto as detail_1,
  padrao_certificacao as detail_2,
  status as detail_3,
  busca_plataforma,
  contato_preferido,
  permitir_mensagens,
  mostrar_nome_publico,
  mostrar_telefone,
  mostrar_localizacao_precisa,
  created_at,
  updated_at
FROM projeto_subperfis;

-- Create subprofile connections table
CREATE TABLE public.subprofile_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_subprofile_id UUID NOT NULL,
  requester_subprofile_type TEXT NOT NULL,
  requester_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_subprofile_id UUID NOT NULL,
  addressee_subprofile_type TEXT NOT NULL,
  addressee_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_subprofile_connection UNIQUE (requester_subprofile_id, addressee_subprofile_id)
);

-- Enable RLS
ALTER TABLE public.subprofile_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for subprofile_connections
CREATE POLICY "Users can view their own subprofile connections"
ON public.subprofile_connections
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = requester_profile_id
    UNION
    SELECT user_id FROM profiles WHERE id = addressee_profile_id
  )
);

CREATE POLICY "Users can create subprofile connection requests"
ON public.subprofile_connections
FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = requester_profile_id)
);

CREATE POLICY "Users can update subprofile connections they're part of"
ON public.subprofile_connections
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = requester_profile_id
    UNION
    SELECT user_id FROM profiles WHERE id = addressee_profile_id
  )
);

CREATE POLICY "Users can delete subprofile connections they're part of"
ON public.subprofile_connections
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = requester_profile_id
    UNION
    SELECT user_id FROM profiles WHERE id = addressee_profile_id
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_subprofile_connections_updated_at
BEFORE UPDATE ON public.subprofile_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if two subprofiles are connected
CREATE OR REPLACE FUNCTION public.are_subprofiles_connected(
  subprofile1_id UUID, 
  subprofile2_id UUID
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subprofile_connections
    WHERE status = 'accepted'
    AND (
      (requester_subprofile_id = subprofile1_id AND addressee_subprofile_id = subprofile2_id)
      OR (requester_subprofile_id = subprofile2_id AND addressee_subprofile_id = subprofile1_id)
    )
  )
$$;