-- ============================================
-- SECURITY FIX: Replace overly permissive RLS policies
-- ============================================

-- Drop the overly permissive policies on notifications table
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create proper policy that only allows authenticated users to insert notifications for themselves
-- OR allows the system (via triggers/functions) to create notifications
CREATE POLICY "Users can receive notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    -- User can only create notifications for themselves (for system-generated ones)
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    -- OR they are connected to the target user (for connection notifications, etc.)
    OR profile_id IN (
      SELECT p.id FROM public.profiles p
      JOIN public.connections c ON (c.addressee_id = p.id OR c.requester_id = p.id)
      WHERE (c.addressee_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
         OR c.requester_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    )
  )
);

-- Drop the overly permissive policy on project_notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.project_notifications;

-- Create proper policy for project notifications - only project owners/members can create
CREATE POLICY "Project members can create notifications"
ON public.project_notifications
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    -- User owns the project
    public.is_project_owner(project_id)
    -- OR user is a member of the project
    OR public.is_project_member(project_id)
  )
);

-- ============================================
-- SECURITY FIX: Add input validation constraints via triggers
-- (Using triggers instead of CHECK constraints for flexibility)
-- ============================================

-- Create validation function for text length limits
CREATE OR REPLACE FUNCTION public.validate_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate name length (max 100 chars)
  IF NEW.name IS NOT NULL AND length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validate bio length (max 5000 chars)
  IF NEW.bio IS NOT NULL AND length(NEW.bio) > 5000 THEN
    RAISE EXCEPTION 'Bio deve ter no máximo 5000 caracteres';
  END IF;
  
  -- Validate location length (max 200 chars)
  IF NEW.location IS NOT NULL AND length(NEW.location) > 200 THEN
    RAISE EXCEPTION 'Localização deve ter no máximo 200 caracteres';
  END IF;
  
  -- Validate phone format (only digits, spaces, parentheses, plus, dash - max 20 chars)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF length(NEW.phone) > 20 THEN
      RAISE EXCEPTION 'Telefone deve ter no máximo 20 caracteres';
    END IF;
    IF NEW.phone !~ '^[0-9+\-() ]+$' THEN
      RAISE EXCEPTION 'Telefone contém caracteres inválidos';
    END IF;
  END IF;
  
  -- Validate whatsapp format
  IF NEW.whatsapp IS NOT NULL AND NEW.whatsapp != '' THEN
    IF length(NEW.whatsapp) > 20 THEN
      RAISE EXCEPTION 'WhatsApp deve ter no máximo 20 caracteres';
    END IF;
    IF NEW.whatsapp !~ '^[0-9+\-() ]+$' THEN
      RAISE EXCEPTION 'WhatsApp contém caracteres inválidos';
    END IF;
  END IF;
  
  -- Validate CPF/CNPJ format (only formatted digits)
  IF NEW.cpf_cnpj IS NOT NULL AND NEW.cpf_cnpj != '' THEN
    IF length(NEW.cpf_cnpj) > 20 THEN
      RAISE EXCEPTION 'CPF/CNPJ deve ter no máximo 20 caracteres';
    END IF;
    IF NEW.cpf_cnpj !~ '^[0-9.\-/]+$' THEN
      RAISE EXCEPTION 'CPF/CNPJ contém caracteres inválidos';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile validation
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;
CREATE TRIGGER validate_profile_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_fields();

-- Create validation function for posts
CREATE OR REPLACE FUNCTION public.validate_post_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate content length (max 10000 chars)
  IF NEW.content IS NOT NULL AND length(NEW.content) > 10000 THEN
    RAISE EXCEPTION 'Conteúdo deve ter no máximo 10000 caracteres';
  END IF;
  
  -- Validate image_url length
  IF NEW.image_url IS NOT NULL AND length(NEW.image_url) > 2000 THEN
    RAISE EXCEPTION 'URL da imagem deve ter no máximo 2000 caracteres';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for post validation
DROP TRIGGER IF EXISTS validate_post_trigger ON public.posts;
CREATE TRIGGER validate_post_trigger
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.validate_post_fields();

-- Create validation function for messages
CREATE OR REPLACE FUNCTION public.validate_message_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate content length (max 5000 chars)
  IF NEW.content IS NOT NULL AND length(NEW.content) > 5000 THEN
    RAISE EXCEPTION 'Mensagem deve ter no máximo 5000 caracteres';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for message validation
DROP TRIGGER IF EXISTS validate_message_trigger ON public.messages;
CREATE TRIGGER validate_message_trigger
BEFORE INSERT OR UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_message_fields();

-- Create trigger for project_messages validation
DROP TRIGGER IF EXISTS validate_project_message_trigger ON public.project_messages;
CREATE TRIGGER validate_project_message_trigger
BEFORE INSERT OR UPDATE ON public.project_messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_message_fields();

-- ============================================
-- SECURITY FIX: Create storage buckets with proper RLS
-- ============================================

-- Create avatars bucket (public read, owner write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- Create covers bucket for profile covers (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('covers', 'covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================
-- RLS policies for storage.objects
-- ============================================

-- Policy: Anyone can view avatar images (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatars
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view cover images (public bucket)
CREATE POLICY "Cover images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

-- Policy: Authenticated users can upload their own covers
CREATE POLICY "Users can upload own covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own covers
CREATE POLICY "Users can update own covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own covers
CREATE POLICY "Users can delete own covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);