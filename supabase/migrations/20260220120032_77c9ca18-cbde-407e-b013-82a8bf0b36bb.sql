
-- Step 1: Drop the policy that depends on get_current_user_profile_id, then drop the function
DROP POLICY IF EXISTS "Connected users can view profiles" ON public.profiles;
DROP FUNCTION IF EXISTS public.get_current_user_profile_id();

-- Step 2: Recreate user_owns_profile as SECURITY DEFINER (already exists but ensure it's correct)
CREATE OR REPLACE FUNCTION public.user_owns_profile(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_profile_id AND user_id = auth.uid()
  );
$$;

-- Step 3: Create a helper to get current user's profile id (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 4: Recreate the "Connected users can view profiles" policy using the function
CREATE POLICY "Connected users can view profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM connections c
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = profiles.id AND c.addressee_id = public.get_current_user_profile_id())
      OR (c.addressee_id = profiles.id AND c.requester_id = public.get_current_user_profile_id())
    )
  )
);

-- Step 5: Fix ALL subperfil tables to use user_owns_profile() instead of inline subqueries

-- proprietario_subperfis
DROP POLICY IF EXISTS "Users can insert their own proprietario subperfis" ON public.proprietario_subperfis;
DROP POLICY IF EXISTS "Users can update their own proprietario subperfis" ON public.proprietario_subperfis;
DROP POLICY IF EXISTS "Users can delete their own proprietario subperfis" ON public.proprietario_subperfis;
DROP POLICY IF EXISTS "Users can view proprietario subperfis with privacy" ON public.proprietario_subperfis;
CREATE POLICY "Users can insert their own proprietario subperfis" ON public.proprietario_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own proprietario subperfis" ON public.proprietario_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own proprietario subperfis" ON public.proprietario_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view proprietario subperfis with privacy" ON public.proprietario_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- desenvolvedor_subperfis
DROP POLICY IF EXISTS "Users can insert their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis;
DROP POLICY IF EXISTS "Users can update their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis;
DROP POLICY IF EXISTS "Users can delete their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis;
DROP POLICY IF EXISTS "Users can view desenvolvedor subperfis with privacy" ON public.desenvolvedor_subperfis;
CREATE POLICY "Users can insert their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own desenvolvedor subperfis" ON public.desenvolvedor_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view desenvolvedor subperfis with privacy" ON public.desenvolvedor_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- certificadora_subperfis
DROP POLICY IF EXISTS "Users can insert their own certificadora subperfis" ON public.certificadora_subperfis;
DROP POLICY IF EXISTS "Users can update their own certificadora subperfis" ON public.certificadora_subperfis;
DROP POLICY IF EXISTS "Users can delete their own certificadora subperfis" ON public.certificadora_subperfis;
DROP POLICY IF EXISTS "Users can view certificadora subperfis with privacy" ON public.certificadora_subperfis;
CREATE POLICY "Users can insert their own certificadora subperfis" ON public.certificadora_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own certificadora subperfis" ON public.certificadora_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own certificadora subperfis" ON public.certificadora_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view certificadora subperfis with privacy" ON public.certificadora_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- auditor_subperfis
DROP POLICY IF EXISTS "Users can insert their own auditor subperfis" ON public.auditor_subperfis;
DROP POLICY IF EXISTS "Users can update their own auditor subperfis" ON public.auditor_subperfis;
DROP POLICY IF EXISTS "Users can delete their own auditor subperfis" ON public.auditor_subperfis;
DROP POLICY IF EXISTS "Users can view auditor subperfis with privacy" ON public.auditor_subperfis;
CREATE POLICY "Users can insert their own auditor subperfis" ON public.auditor_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own auditor subperfis" ON public.auditor_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own auditor subperfis" ON public.auditor_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view auditor subperfis with privacy" ON public.auditor_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- investidor_subperfis
DROP POLICY IF EXISTS "Users can insert their own investidor subperfis" ON public.investidor_subperfis;
DROP POLICY IF EXISTS "Users can update their own investidor subperfis" ON public.investidor_subperfis;
DROP POLICY IF EXISTS "Users can delete their own investidor subperfis" ON public.investidor_subperfis;
DROP POLICY IF EXISTS "Users can view investidor subperfis with privacy" ON public.investidor_subperfis;
CREATE POLICY "Users can insert their own investidor subperfis" ON public.investidor_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own investidor subperfis" ON public.investidor_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own investidor subperfis" ON public.investidor_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view investidor subperfis with privacy" ON public.investidor_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- financeira_subperfis
DROP POLICY IF EXISTS "Users can insert their own financeira subperfis" ON public.financeira_subperfis;
DROP POLICY IF EXISTS "Users can update their own financeira subperfis" ON public.financeira_subperfis;
DROP POLICY IF EXISTS "Users can delete their own financeira subperfis" ON public.financeira_subperfis;
DROP POLICY IF EXISTS "Users can view financeira subperfis with privacy" ON public.financeira_subperfis;
CREATE POLICY "Users can insert their own financeira subperfis" ON public.financeira_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own financeira subperfis" ON public.financeira_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own financeira subperfis" ON public.financeira_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view financeira subperfis with privacy" ON public.financeira_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- advogado_subperfis
DROP POLICY IF EXISTS "Users can insert their own advogado subperfis" ON public.advogado_subperfis;
DROP POLICY IF EXISTS "Users can update their own advogado subperfis" ON public.advogado_subperfis;
DROP POLICY IF EXISTS "Users can delete their own advogado subperfis" ON public.advogado_subperfis;
DROP POLICY IF EXISTS "Users can view advogado subperfis with privacy" ON public.advogado_subperfis;
CREATE POLICY "Users can insert their own advogado subperfis" ON public.advogado_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own advogado subperfis" ON public.advogado_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own advogado subperfis" ON public.advogado_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view advogado subperfis with privacy" ON public.advogado_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- comprador_subperfis
DROP POLICY IF EXISTS "Users can insert their own comprador subperfis" ON public.comprador_subperfis;
DROP POLICY IF EXISTS "Users can update their own comprador subperfis" ON public.comprador_subperfis;
DROP POLICY IF EXISTS "Users can delete their own comprador subperfis" ON public.comprador_subperfis;
DROP POLICY IF EXISTS "Users can view comprador subperfis with privacy" ON public.comprador_subperfis;
CREATE POLICY "Users can insert their own comprador subperfis" ON public.comprador_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own comprador subperfis" ON public.comprador_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own comprador subperfis" ON public.comprador_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view comprador subperfis with privacy" ON public.comprador_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- projeto_subperfis
DROP POLICY IF EXISTS "Users can insert their own projeto subperfis" ON public.projeto_subperfis;
DROP POLICY IF EXISTS "Users can update their own projeto subperfis" ON public.projeto_subperfis;
DROP POLICY IF EXISTS "Users can delete their own projeto subperfis" ON public.projeto_subperfis;
DROP POLICY IF EXISTS "Users can view projeto subperfis with privacy" ON public.projeto_subperfis;
CREATE POLICY "Users can insert their own projeto subperfis" ON public.projeto_subperfis FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own projeto subperfis" ON public.projeto_subperfis FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can delete their own projeto subperfis" ON public.projeto_subperfis FOR DELETE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view projeto subperfis with privacy" ON public.projeto_subperfis FOR SELECT USING (public.user_owns_profile(profile_id) OR (auth.uid() IS NOT NULL AND mostrar_nome_publico = true));

-- notification_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.notification_preferences;
CREATE POLICY "Users can view their own preferences" ON public.notification_preferences FOR SELECT USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can insert their own preferences" ON public.notification_preferences FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own preferences" ON public.notification_preferences FOR UPDATE USING (public.user_owns_profile(profile_id));

-- posts
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (public.user_owns_profile(author_id));
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (public.user_owns_profile(author_id));
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (public.user_owns_profile(author_id));

-- post_likes
DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can remove their own likes" ON public.post_likes;
CREATE POLICY "Authenticated users can like posts" ON public.post_likes FOR INSERT WITH CHECK (public.user_owns_profile(user_id));
CREATE POLICY "Users can remove their own likes" ON public.post_likes FOR DELETE USING (public.user_owns_profile(user_id));

-- notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (public.user_owns_profile(profile_id));

-- project_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.project_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.project_notifications;
CREATE POLICY "Users can view their own notifications" ON public.project_notifications FOR SELECT USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own notifications" ON public.project_notifications FOR UPDATE USING (public.user_owns_profile(profile_id));

-- certificadora_details
DROP POLICY IF EXISTS "Users can insert their own certificadora details" ON public.certificadora_details;
DROP POLICY IF EXISTS "Users can update their own certificadora details" ON public.certificadora_details;
DROP POLICY IF EXISTS "Users can view certificadora details with access control" ON public.certificadora_details;
CREATE POLICY "Users can insert their own certificadora details" ON public.certificadora_details FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own certificadora details" ON public.certificadora_details FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view certificadora details with access control" ON public.certificadora_details FOR SELECT USING (public.user_owns_profile(profile_id) OR public.is_connected_to_profile(profile_id));

-- investidor_details
DROP POLICY IF EXISTS "Users can insert their own investidor details" ON public.investidor_details;
DROP POLICY IF EXISTS "Users can update their own investidor details" ON public.investidor_details;
DROP POLICY IF EXISTS "Users can view all investidor details" ON public.investidor_details;
CREATE POLICY "Users can insert their own investidor details" ON public.investidor_details FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own investidor details" ON public.investidor_details FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view all investidor details" ON public.investidor_details FOR SELECT USING (true);

-- comprador_details
DROP POLICY IF EXISTS "Users can insert their own comprador details" ON public.comprador_details;
DROP POLICY IF EXISTS "Users can update their own comprador details" ON public.comprador_details;
DROP POLICY IF EXISTS "Users can view all comprador details" ON public.comprador_details;
CREATE POLICY "Users can insert their own comprador details" ON public.comprador_details FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own comprador details" ON public.comprador_details FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view all comprador details" ON public.comprador_details FOR SELECT USING (true);

-- projeto_details
DROP POLICY IF EXISTS "Users can insert their own projeto details" ON public.projeto_details;
DROP POLICY IF EXISTS "Users can update their own projeto details" ON public.projeto_details;
DROP POLICY IF EXISTS "Users can view all projeto details" ON public.projeto_details;
CREATE POLICY "Users can insert their own projeto details" ON public.projeto_details FOR INSERT WITH CHECK (public.user_owns_profile(profile_id));
CREATE POLICY "Users can update their own projeto details" ON public.projeto_details FOR UPDATE USING (public.user_owns_profile(profile_id));
CREATE POLICY "Users can view all projeto details" ON public.projeto_details FOR SELECT USING (true);

-- subprofile_connections
DROP POLICY IF EXISTS "Users can create subprofile connection requests" ON public.subprofile_connections;
DROP POLICY IF EXISTS "Users can view their own subprofile connections" ON public.subprofile_connections;
DROP POLICY IF EXISTS "Users can update subprofile connections they're part of" ON public.subprofile_connections;
DROP POLICY IF EXISTS "Users can delete subprofile connections they're part of" ON public.subprofile_connections;
CREATE POLICY "Users can create subprofile connection requests" ON public.subprofile_connections FOR INSERT WITH CHECK (public.user_owns_profile(requester_profile_id));
CREATE POLICY "Users can view their own subprofile connections" ON public.subprofile_connections FOR SELECT USING (public.user_owns_profile(requester_profile_id) OR public.user_owns_profile(addressee_profile_id));
CREATE POLICY "Users can update subprofile connections they're part of" ON public.subprofile_connections FOR UPDATE USING (public.user_owns_profile(requester_profile_id) OR public.user_owns_profile(addressee_profile_id));
CREATE POLICY "Users can delete subprofile connections they're part of" ON public.subprofile_connections FOR DELETE USING (public.user_owns_profile(requester_profile_id) OR public.user_owns_profile(addressee_profile_id));
