
-- Create a SECURITY DEFINER function to check if a profile is connected to current user
-- This bypasses RLS on both profiles and connections tables
CREATE OR REPLACE FUNCTION public.is_connected_to_current_user(target_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM connections c
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = target_profile_id AND c.addressee_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1))
      OR (c.addressee_id = target_profile_id AND c.requester_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1))
    )
  )
$$;

-- Drop and recreate the problematic policy using the new function
DROP POLICY IF EXISTS "Connected users can view profiles" ON public.profiles;

CREATE POLICY "Connected users can view profiles"
ON public.profiles FOR SELECT
USING (is_connected_to_current_user(id));
