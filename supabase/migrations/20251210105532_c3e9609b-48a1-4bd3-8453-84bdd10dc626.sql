-- Create enum for project stages
CREATE TYPE public.project_stage AS ENUM (
  'documentos',
  'viabilidade', 
  'desenvolvimento',
  'certificacao',
  'auditoria',
  'venda'
);

-- Create enum for stage status
CREATE TYPE public.stage_status AS ENUM (
  'pendente',
  'em_andamento',
  'concluida'
);

-- Create carbon projects table
CREATE TABLE public.carbon_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  area_hectares NUMERIC,
  project_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project stages table
CREATE TABLE public.project_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.carbon_projects(id) ON DELETE CASCADE,
  stage project_stage NOT NULL,
  status stage_status NOT NULL DEFAULT 'pendente',
  deadline TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, stage)
);

-- Create project members (connections assigned to stages)
CREATE TABLE public.project_stage_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.project_stages(id) ON DELETE CASCADE,
  member_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stage_id, member_profile_id)
);

-- Create project messages table
CREATE TABLE public.project_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.carbon_projects(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.project_stages(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_stage_comment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.project_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.carbon_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.carbon_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stage_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check project ownership
CREATE OR REPLACE FUNCTION public.is_project_owner(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.carbon_projects cp
    JOIN public.profiles p ON cp.profile_id = p.id
    WHERE cp.id = p_project_id AND p.user_id = auth.uid()
  )
$$;

-- Helper function to check if user is project member
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_stage_members psm
    JOIN public.project_stages ps ON psm.stage_id = ps.id
    JOIN public.profiles p ON psm.member_profile_id = p.id
    WHERE ps.project_id = p_project_id AND p.user_id = auth.uid()
  )
$$;

-- Helper function to check premium status
CREATE OR REPLACE FUNCTION public.is_user_premium()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_premium = true
  )
$$;

-- RLS Policies for carbon_projects
CREATE POLICY "Users can view their own projects"
ON public.carbon_projects FOR SELECT
USING (public.is_project_owner(id) OR public.is_project_member(id));

CREATE POLICY "Premium users can create projects"
ON public.carbon_projects FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id)
  AND public.is_user_premium()
);

CREATE POLICY "Owners can update their projects"
ON public.carbon_projects FOR UPDATE
USING (public.is_project_owner(id));

CREATE POLICY "Owners can delete their projects"
ON public.carbon_projects FOR DELETE
USING (public.is_project_owner(id));

-- RLS Policies for project_stages
CREATE POLICY "Users can view stages of their projects"
ON public.project_stages FOR SELECT
USING (public.is_project_owner(project_id) OR public.is_project_member(project_id));

CREATE POLICY "Owners can manage stages"
ON public.project_stages FOR ALL
USING (public.is_project_owner(project_id));

-- RLS Policies for project_stage_members
CREATE POLICY "Users can view members of their projects"
ON public.project_stage_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    WHERE ps.id = stage_id 
    AND (public.is_project_owner(ps.project_id) OR public.is_project_member(ps.project_id))
  )
);

CREATE POLICY "Owners can manage members"
ON public.project_stage_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.project_stages ps
    WHERE ps.id = stage_id AND public.is_project_owner(ps.project_id)
  )
);

-- RLS Policies for project_messages
CREATE POLICY "Users can view messages of their projects"
ON public.project_messages FOR SELECT
USING (public.is_project_owner(project_id) OR public.is_project_member(project_id));

CREATE POLICY "Members can send messages"
ON public.project_messages FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = sender_id)
  AND (public.is_project_owner(project_id) OR public.is_project_member(project_id))
);

-- RLS Policies for project_notifications
CREATE POLICY "Users can view their own notifications"
ON public.project_notifications FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

CREATE POLICY "System can create notifications"
ON public.project_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.project_notifications FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- Trigger to create default stages when project is created
CREATE OR REPLACE FUNCTION public.create_default_project_stages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.project_stages (project_id, stage)
  VALUES 
    (NEW.id, 'documentos'),
    (NEW.id, 'viabilidade'),
    (NEW.id, 'desenvolvimento'),
    (NEW.id, 'certificacao'),
    (NEW.id, 'auditoria'),
    (NEW.id, 'venda');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_created
  AFTER INSERT ON public.carbon_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_project_stages();

-- Trigger to update updated_at
CREATE TRIGGER update_carbon_projects_updated_at
  BEFORE UPDATE ON public.carbon_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_stages_updated_at
  BEFORE UPDATE ON public.project_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_notifications;