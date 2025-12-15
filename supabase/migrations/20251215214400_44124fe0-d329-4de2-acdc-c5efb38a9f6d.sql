-- Add description fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS areas_atuacao TEXT,
ADD COLUMN IF NOT EXISTS objetivo_plataforma TEXT;