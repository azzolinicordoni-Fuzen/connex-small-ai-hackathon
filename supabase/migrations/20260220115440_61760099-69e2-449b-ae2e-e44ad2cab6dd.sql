
-- Drop the recursive policy
DROP POLICY IF EXISTS "Connected users can view profiles" ON public.profiles;

-- Create a security definer function to get the current user's profile ID without triggering RLS
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Recreate the policy using the security definer function to avoid recursion
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
