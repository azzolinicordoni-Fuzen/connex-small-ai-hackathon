-- Add new fields to profiles table for identification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS tipo_perfil TEXT DEFAULT 'pessoa_fisica',
ADD COLUMN IF NOT EXISTS nome_publico TEXT;