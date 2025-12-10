-- Add visibility settings to carbon_projects
ALTER TABLE public.carbon_projects 
ADD COLUMN IF NOT EXISTS visibility_mode text NOT NULL DEFAULT 'private' CHECK (visibility_mode IN ('private', 'partial', 'public')),
ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false;

-- Add visibility to project_stages
ALTER TABLE public.project_stages 
ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT false;

-- Create index for filtering online projects
CREATE INDEX IF NOT EXISTS idx_carbon_projects_is_online ON public.carbon_projects(is_online) WHERE is_online = true;

-- Update RLS to allow viewing online projects
CREATE POLICY "Anyone can view online projects" 
ON public.carbon_projects 
FOR SELECT 
USING (is_online = true);

-- Allow viewing stages of online projects
CREATE POLICY "Anyone can view stages of online projects" 
ON public.project_stages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.carbon_projects cp 
    WHERE cp.id = project_stages.project_id 
    AND cp.is_online = true
  )
  AND is_visible = true
);