import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const CONTEXT_CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'parceria', label: 'Parceria' },
  { value: 'projeto', label: 'Projeto Específico' },
  { value: 'duvida_tecnica', label: 'Dúvida Técnica' },
  { value: 'comercial', label: 'Comercial / Negociação' },
] as const;

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  context_category: string;
  project_id: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  other_participant?: {
    id: string;
    name: string;
    avatar_url: string | null;
    agent_type: string;
  };
  project?: {
    id: string;
    name: string;
  } | null;
  settings?: {
    archived: boolean;
    muted: boolean;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's profile ID
  useEffect(() => {
    async function fetchProfileId() {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfileId(data.id);
      }
    }
    
    fetchProfileId();
  }, [user]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!profileId) return;
    
    setLoading(true);
    
    const { data: convs, error } = await supabase
      .from('conversations')
      .select(`
        *,
        project:carbon_projects(id, name)
      `)
      .or(`participant_1_id.eq.${profileId},participant_2_id.eq.${profileId}`)
      .order('last_message_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    // Fetch other participants and settings
    const conversationsWithDetails = await Promise.all(
      (convs || []).map(async (conv) => {
        const otherParticipantId = conv.participant_1_id === profileId 
          ? conv.participant_2_id 
          : conv.participant_1_id;
        
        const { data: participant } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, agent_type')
          .eq('id', otherParticipantId)
          .single();
        
        const { data: settings } = await supabase
          .from('conversation_settings')
          .select('archived, muted')
          .eq('conversation_id', conv.id)
          .eq('profile_id', profileId)
          .single();
        
        // Count unread messages
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', profileId);
        
        return {
          ...conv,
          other_participant: participant,
          settings: settings || { archived: false, muted: false },
          unread_count: count || 0,
        };
      })
    );
    
    setConversations(conversationsWithDetails);
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            if (prev.length > 0 && prev[0].conversation_id !== newMessage.conversation_id) {
              return prev;
            }
            return [...prev, newMessage];
          });
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchConversations]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!profileId) return;
    
    setMessagesLoading(true);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      setMessagesLoading(false);
      return;
    }

    // Fetch sender info for each message
    const messagesWithSenders = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        
        return { ...msg, sender };
      })
    );
    
    setMessages(messagesWithSenders);
    setMessagesLoading(false);
    
    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', profileId)
      .eq('read', false);
    
    fetchConversations();
  }, [profileId, fetchConversations]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!profileId || !content.trim()) return false;
    
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: profileId,
        content: content.trim(),
      });
    
    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  }, [profileId, toast]);

  // Create or get existing conversation
  const createConversation = useCallback(async (
    otherProfileId: string,
    contextCategory: string = 'geral',
    projectId?: string
  ) => {
    if (!profileId) return null;
    
    // Order IDs to match constraint
    const [p1, p2] = [profileId, otherProfileId].sort();
    
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant_1_id', p1)
      .eq('participant_2_id', p2)
      .single();
    
    if (existing) {
      // Update context if needed
      await supabase
        .from('conversations')
        .update({ 
          context_category: contextCategory,
          project_id: projectId || null,
        })
        .eq('id', existing.id);
      
      return existing.id;
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: p1,
        participant_2_id: p2,
        context_category: contextCategory,
        project_id: projectId || null,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar a conversa. Verifique se você está conectado com este usuário.',
        variant: 'destructive',
      });
      return null;
    }
    
    fetchConversations();
    return data.id;
  }, [profileId, toast, fetchConversations]);

  // Update conversation settings
  const updateSettings = useCallback(async (
    conversationId: string,
    settings: { archived?: boolean; muted?: boolean }
  ) => {
    if (!profileId) return;
    
    const { data: existing } = await supabase
      .from('conversation_settings')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId)
      .single();
    
    if (existing) {
      await supabase
        .from('conversation_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('conversation_settings')
        .insert({
          conversation_id: conversationId,
          profile_id: profileId,
          ...settings,
        });
    }
    
    fetchConversations();
  }, [profileId, fetchConversations]);

  // Get total unread count
  const totalUnreadCount = conversations.reduce((acc, conv) => {
    if (conv.settings?.archived || conv.settings?.muted) return acc;
    return acc + (conv.unread_count || 0);
  }, 0);

  return {
    conversations,
    messages,
    loading,
    messagesLoading,
    profileId,
    totalUnreadCount,
    fetchMessages,
    sendMessage,
    createConversation,
    updateSettings,
    refetch: fetchConversations,
  };
}