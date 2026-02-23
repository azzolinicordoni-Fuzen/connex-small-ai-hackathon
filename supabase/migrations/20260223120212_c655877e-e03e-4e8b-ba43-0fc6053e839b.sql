
-- Fix: the "Connected users" policy still joins profiles, causing potential recursion
-- Use the existing SECURITY DEFINER function instead
DROP POLICY IF EXISTS "Connected users can view profiles" ON public.profiles;

CREATE POLICY "Connected users can view profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM connections c
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = profiles.id AND c.addressee_id = get_current_user_profile_id())
      OR (c.addressee_id = profiles.id AND c.requester_id = get_current_user_profile_id())
    )
  )
);
