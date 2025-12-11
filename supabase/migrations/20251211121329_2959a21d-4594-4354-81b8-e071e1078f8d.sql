-- Add DELETE policy for connections table
-- Users should be able to delete connections they are part of (either as requester or addressee)

CREATE POLICY "Users can delete connections they're part of"
ON public.connections
FOR DELETE
USING (
  auth.uid() IN (
    SELECT profiles.user_id
    FROM profiles
    WHERE profiles.id = connections.requester_id
    UNION
    SELECT profiles.user_id
    FROM profiles
    WHERE profiles.id = connections.addressee_id
  )
);