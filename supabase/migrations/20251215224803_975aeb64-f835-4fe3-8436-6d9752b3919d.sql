-- Fix carbon_projects SELECT policy to avoid recursive owner check during INSERT ... RETURNING

DROP POLICY IF EXISTS "Users can view their own projects" ON public.carbon_projects;

CREATE POLICY "Users can view their own projects"
ON public.carbon_projects
FOR SELECT
TO public
USING (
  user_owns_profile(profile_id)
  OR is_project_member(id)
);
