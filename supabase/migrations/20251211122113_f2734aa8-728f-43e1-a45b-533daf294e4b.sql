-- Fix the view to use SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.unified_subprofiles;

CREATE VIEW public.unified_subprofiles
WITH (security_invoker = true)
AS
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