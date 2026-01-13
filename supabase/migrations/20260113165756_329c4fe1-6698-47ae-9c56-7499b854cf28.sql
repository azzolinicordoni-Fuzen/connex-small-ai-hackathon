-- ============================================
-- FIX #1: Profiles Table - Create Public View and Restrict Access
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a public view with sanitized fields (excludes sensitive PII)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  name,
  agent_type,
  bio,
  avatar_url,
  cover_url,
  is_premium,
  nome_publico,
  areas_atuacao,
  objetivo_plataforma,
  tipo_perfil,
  -- Exclude sensitive fields: phone, whatsapp, cpf_cnpj, location
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the public view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Create policy: Users can see their own full profile
CREATE POLICY "Users can view their own full profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Connected users can see full profiles of connections
CREATE POLICY "Users can view connected profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM connections c
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = profiles.id AND c.addressee_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
      OR (c.addressee_id = profiles.id AND c.requester_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
    )
  )
);

-- ============================================
-- FIX #2: All Subprofile Tables - Enforce Privacy Flags
-- ============================================

-- 1. proprietario_subperfis
DROP POLICY IF EXISTS "Users can view all proprietario subperfis" ON public.proprietario_subperfis;

CREATE POLICY "Users can view proprietario subperfis with privacy"
ON public.proprietario_subperfis FOR SELECT
USING (
  -- Owner can always see their own
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  -- OR authenticated users can see if explicitly public
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 2. investidor_subperfis
DROP POLICY IF EXISTS "Users can view all investidor subperfis" ON public.investidor_subperfis;

CREATE POLICY "Users can view investidor subperfis with privacy"
ON public.investidor_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 3. comprador_subperfis
DROP POLICY IF EXISTS "Users can view all comprador subperfis" ON public.comprador_subperfis;

CREATE POLICY "Users can view comprador subperfis with privacy"
ON public.comprador_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 4. certificadora_subperfis
DROP POLICY IF EXISTS "Users can view all certificadora subperfis" ON public.certificadora_subperfis;

CREATE POLICY "Users can view certificadora subperfis with privacy"
ON public.certificadora_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 5. projeto_subperfis
DROP POLICY IF EXISTS "Users can view all projeto subperfis" ON public.projeto_subperfis;

CREATE POLICY "Users can view projeto subperfis with privacy"
ON public.projeto_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 6. desenvolvedor_subperfis
DROP POLICY IF EXISTS "Users can view all desenvolvedor subperfis" ON public.desenvolvedor_subperfis;

CREATE POLICY "Users can view desenvolvedor subperfis with privacy"
ON public.desenvolvedor_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 7. auditor_subperfis
DROP POLICY IF EXISTS "Users can view all auditor subperfis" ON public.auditor_subperfis;

CREATE POLICY "Users can view auditor subperfis with privacy"
ON public.auditor_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 8. financeira_subperfis
DROP POLICY IF EXISTS "Users can view all financeira subperfis" ON public.financeira_subperfis;

CREATE POLICY "Users can view financeira subperfis with privacy"
ON public.financeira_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);

-- 9. advogado_subperfis
DROP POLICY IF EXISTS "Users can view all advogado subperfis" ON public.advogado_subperfis;

CREATE POLICY "Users can view advogado subperfis with privacy"
ON public.advogado_subperfis FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  OR (
    auth.uid() IS NOT NULL
    AND mostrar_nome_publico = true
  )
);