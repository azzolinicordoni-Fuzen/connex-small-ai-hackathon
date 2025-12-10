-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Premium users can create projects" ON public.carbon_projects;

-- Drop the function if exists
DROP FUNCTION IF EXISTS public.can_create_project(uuid);

-- Create simple INSERT policy - just check user owns the profile
CREATE POLICY "Users can create their own projects" 
ON public.carbon_projects 
FOR INSERT 
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);