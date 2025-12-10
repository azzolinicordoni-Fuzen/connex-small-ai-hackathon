-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own projects" ON public.carbon_projects;

-- Create a simple security definer function
CREATE OR REPLACE FUNCTION public.user_owns_profile(p_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id FROM profiles WHERE id = p_profile_id;
  RETURN v_user_id = auth.uid();
END;
$$;

-- Create new INSERT policy using the function
CREATE POLICY "Users can create their own projects" 
ON public.carbon_projects 
FOR INSERT 
WITH CHECK (public.user_owns_profile(profile_id));