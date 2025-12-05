-- Create enum for agent types
CREATE TYPE public.agent_type AS ENUM (
  'proprietario',
  'engenheiro',
  'desenvolvedor',
  'certificadora',
  'investidor',
  'projeto',
  'outro'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agent_type agent_type NOT NULL,
  bio TEXT,
  location TEXT,
  phone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create connections table
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS on connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Connections policies
CREATE POLICY "Users can view their own connections" 
ON public.connections FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = requester_id
    UNION
    SELECT user_id FROM profiles WHERE id = addressee_id
  )
);

CREATE POLICY "Authenticated users can create connection requests" 
ON public.connections FOR INSERT 
WITH CHECK (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = requester_id)
);

CREATE POLICY "Users can update connections they're part of" 
ON public.connections FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = requester_id
    UNION
    SELECT user_id FROM profiles WHERE id = addressee_id
  )
);

-- Create posts table for feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" 
ON public.posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.posts FOR INSERT 
WITH CHECK (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id)
);

CREATE POLICY "Users can update their own posts" 
ON public.posts FOR UPDATE 
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id)
);

CREATE POLICY "Users can delete their own posts" 
ON public.posts FOR DELETE 
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = author_id)
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Post likes policies
CREATE POLICY "Post likes are viewable by everyone" 
ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like posts" 
ON public.post_likes FOR INSERT 
WITH CHECK (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = post_likes.user_id)
);

CREATE POLICY "Users can remove their own likes" 
ON public.post_likes FOR DELETE 
USING (
  auth.uid() = (SELECT p.user_id FROM profiles p WHERE p.id = post_likes.user_id)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, agent_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'agent_type')::agent_type, 'outro')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();