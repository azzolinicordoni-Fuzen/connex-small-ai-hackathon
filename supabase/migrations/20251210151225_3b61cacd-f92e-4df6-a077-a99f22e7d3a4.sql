-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_category TEXT NOT NULL DEFAULT 'geral',
  project_id UUID REFERENCES public.carbon_projects(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure unique conversation between two users
  CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id),
  -- Ensure participant_1_id < participant_2_id to avoid duplicates
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation settings table for archive/mute per user
CREATE TABLE public.conversation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  archived BOOLEAN NOT NULL DEFAULT false,
  muted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_conversation_setting UNIQUE (conversation_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_settings ENABLE ROW LEVEL SECURITY;

-- Function to check if users are connected
CREATE OR REPLACE FUNCTION public.are_users_connected(user1_profile_id UUID, user2_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
    AND (
      (requester_id = user1_profile_id AND addressee_id = user2_profile_id)
      OR (requester_id = user2_profile_id AND addressee_id = user1_profile_id)
    )
  )
$$;

-- Function to check if user is participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.profiles p ON (c.participant_1_id = p.id OR c.participant_2_id = p.id)
    WHERE c.id = conv_id AND p.user_id = auth.uid()
  )
$$;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = participant_1_id
    UNION
    SELECT user_id FROM profiles WHERE id = participant_2_id
  )
);

CREATE POLICY "Users can create conversations with connections"
ON public.conversations FOR INSERT
WITH CHECK (
  -- User must be one of the participants
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = participant_1_id
    UNION
    SELECT user_id FROM profiles WHERE id = participant_2_id
  )
  -- Users must be connected
  AND are_users_connected(participant_1_id, participant_2_id)
);

CREATE POLICY "Participants can update their conversations"
ON public.conversations FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = participant_1_id
    UNION
    SELECT user_id FROM profiles WHERE id = participant_2_id
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (is_conversation_participant(conversation_id));

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  is_conversation_participant(conversation_id)
  AND auth.uid() = (SELECT user_id FROM profiles WHERE id = sender_id)
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (
  is_conversation_participant(conversation_id)
);

-- RLS Policies for conversation_settings
CREATE POLICY "Users can view their own settings"
ON public.conversation_settings FOR SELECT
USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can insert their own settings"
ON public.conversation_settings FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Users can update their own settings"
ON public.conversation_settings FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Create indexes for performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();