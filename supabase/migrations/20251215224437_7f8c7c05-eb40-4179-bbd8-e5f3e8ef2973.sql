-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create their own projects" ON public.carbon_projects;

-- Create a new PERMISSIVE INSERT policy
CREATE POLICY "Users can create their own projects" 
ON public.carbon_projects 
FOR INSERT 
TO authenticated
WITH CHECK (user_owns_profile(profile_id));