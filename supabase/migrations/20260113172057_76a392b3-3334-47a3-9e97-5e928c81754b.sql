-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all certificadora details" ON public.certificadora_details;

-- Create a security definer function to check if users are connected via profile
CREATE OR REPLACE FUNCTION public.is_connected_to_profile(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM connections c
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE c.status = 'accepted'
    AND (
      (c.requester_id = target_profile_id AND c.addressee_id = p.id)
      OR (c.addressee_id = target_profile_id AND c.requester_id = p.id)
    )
  )
$$;

-- Create restricted SELECT policy for certificadora_details
-- Only allow: owner OR connected users
CREATE POLICY "Users can view certificadora details with access control"
ON public.certificadora_details FOR SELECT
USING (
  -- Owner can always view
  auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id)
  -- OR connected users can view
  OR public.is_connected_to_profile(profile_id)
);