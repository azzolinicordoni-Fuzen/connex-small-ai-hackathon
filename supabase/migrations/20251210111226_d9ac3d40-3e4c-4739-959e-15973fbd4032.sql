-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Premium users can create projects" ON public.carbon_projects;

-- Create simplified INSERT policy using security definer function
CREATE OR REPLACE FUNCTION public.can_create_project(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_profile_id
    AND user_id = auth.uid()
    AND is_premium = true
  )
$$;

-- Create new INSERT policy using the function
CREATE POLICY "Premium users can create projects" 
ON public.carbon_projects 
FOR INSERT 
WITH CHECK (public.can_create_project(profile_id));