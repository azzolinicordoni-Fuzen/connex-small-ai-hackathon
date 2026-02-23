
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Connected users can view profiles" ON public.profiles;

-- Recreate: users can view their own profile (no recursion)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Recreate: connected users can view profiles without calling get_current_user_profile_id()
-- Instead, inline the lookup to avoid recursion
CREATE POLICY "Connected users can view profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM connections c
    JOIN profiles p ON p.user_id = auth.uid() AND p.id != profiles.id
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = profiles.id AND c.addressee_id = p.id)
      OR (c.addressee_id = profiles.id AND c.requester_id = p.id)
    )
  )
);
