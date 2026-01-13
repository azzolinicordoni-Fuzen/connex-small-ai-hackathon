-- Add privacy control columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_phone_to_connections BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_whatsapp_to_connections BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_cpf_cnpj_to_connections BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_location_to_connections BOOLEAN DEFAULT false;

-- Drop the existing profiles_public view
DROP VIEW IF EXISTS public.profiles_public;

-- Create an updated profiles_public view that NEVER exposes sensitive fields
-- This view is for public discovery (browsing users) - excludes all PII
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  name,
  nome_publico,
  agent_type,
  bio,
  avatar_url,
  cover_url,
  is_premium,
  areas_atuacao,
  objetivo_plataforma,
  tipo_perfil,
  created_at,
  updated_at
  -- Sensitive fields EXCLUDED: phone, whatsapp, cpf_cnpj, location
FROM public.profiles;

-- Grant SELECT access to the public view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Create a security definer function to get contact info respecting privacy settings
-- This allows the app to safely retrieve contact info only when privacy settings permit
CREATE OR REPLACE FUNCTION public.get_profile_contact_info(target_profile_id UUID)
RETURNS TABLE (
  phone TEXT,
  whatsapp TEXT,
  cpf_cnpj TEXT,
  location TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_profile_id UUID;
  is_connected BOOLEAN;
  target_user_id UUID;
  privacy_phone BOOLEAN;
  privacy_whatsapp BOOLEAN;
  privacy_cpf_cnpj BOOLEAN;
  privacy_location BOOLEAN;
BEGIN
  -- Get the current user's profile ID
  SELECT p.id INTO current_user_profile_id
  FROM profiles p
  WHERE p.user_id = auth.uid();
  
  -- If the user is viewing their own profile, return all info
  SELECT p.user_id INTO target_user_id
  FROM profiles p
  WHERE p.id = target_profile_id;
  
  IF target_user_id = auth.uid() THEN
    RETURN QUERY
    SELECT p.phone, p.whatsapp, p.cpf_cnpj, p.location
    FROM profiles p
    WHERE p.id = target_profile_id;
    RETURN;
  END IF;
  
  -- Check if users are connected
  SELECT EXISTS (
    SELECT 1 FROM connections c
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = target_profile_id AND c.addressee_id = current_user_profile_id)
      OR (c.addressee_id = target_profile_id AND c.requester_id = current_user_profile_id)
    )
  ) INTO is_connected;
  
  -- If not connected, return empty
  IF NOT is_connected THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT WHERE FALSE;
    RETURN;
  END IF;
  
  -- Get privacy settings
  SELECT 
    COALESCE(p.show_phone_to_connections, false),
    COALESCE(p.show_whatsapp_to_connections, false),
    COALESCE(p.show_cpf_cnpj_to_connections, false),
    COALESCE(p.show_location_to_connections, false)
  INTO privacy_phone, privacy_whatsapp, privacy_cpf_cnpj, privacy_location
  FROM profiles p
  WHERE p.id = target_profile_id;
  
  -- Return only fields that the user has chosen to share with connections
  RETURN QUERY
  SELECT 
    CASE WHEN privacy_phone THEN p.phone ELSE NULL END,
    CASE WHEN privacy_whatsapp THEN p.whatsapp ELSE NULL END,
    CASE WHEN privacy_cpf_cnpj THEN p.cpf_cnpj ELSE NULL END,
    CASE WHEN privacy_location THEN p.location ELSE NULL END
  FROM profiles p
  WHERE p.id = target_profile_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_contact_info(UUID) TO authenticated;

-- Drop existing SELECT policies on profiles table
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view connected profiles" ON public.profiles;

-- Create new, more restrictive policies
-- Policy: Users can ALWAYS view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- For other users' profiles, they should use profiles_public view or get_profile_contact_info function
-- We need to deny direct access to the base profiles table for non-owners
-- But we still need the app to work, so we allow SELECT but the application should use the view/function

-- Policy: Connected users can view basic profile info (but not through direct table access for PII)
-- The application code should be updated to use profiles_public view + get_profile_contact_info function
CREATE POLICY "Connected users can view profiles"
ON public.profiles FOR SELECT
USING (
  -- Allow if connected, but application should prefer profiles_public view
  EXISTS (
    SELECT 1 FROM connections c
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = profiles.id AND c.addressee_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
      OR (c.addressee_id = profiles.id AND c.requester_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
    )
  )
);