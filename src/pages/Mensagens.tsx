import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationView } from '@/components/messages/ConversationView';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export default function Mensagens() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get('conversation')
  );
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    conversations,
    messages,
    loading,
    messagesLoading,
    profileId,
    fetchMessages,
    sendMessage,
    createConversation,
    updateSettings,
  } = useMessages();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Handle conversation selection
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      setSearchParams({ conversation: selectedConversationId });
      setShowMobileConversation(true);
    } else {
      setSearchParams({});
    }
  }, [selectedConversationId, fetchMessages, setSearchParams]);

  // Handle new conversation from URL params
  useEffect(() => {
    const newConvWith = searchParams.get('new');
    const profileTarget = searchParams.get('profile');
    const context = searchParams.get('context') || 'geral';
    const projectId = searchParams.get('project');
    
    if (newConvWith && profileId) {
      createConversation(newConvWith, context, projectId || undefined).then((id) => {
        if (id) {
          setSelectedConversationId(id);
          setSearchParams({ conversation: id });
        }
      });
    } else if (profileTarget && profileId) {
      // Check if we already have a conversation with this profile
      const existingConv = conversations.find(c => 
        c.participant_1_id === profileTarget || c.participant_2_id === profileTarget
      );
      
      if (existingConv) {
        setSelectedConversationId(existingConv.id);
        setSearchParams({ conversation: existingConv.id });
      } else if (!loading) {
        // Create new conversation only after conversations have loaded
        createConversation(profileTarget, context, projectId || undefined).then((id) => {
          if (id) {
            setSelectedConversationId(id);
            setSearchParams({ conversation: id });
          }
        });
      }
    }
  }, [searchParams, profileId, createConversation, conversations, loading]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return false;
    return sendMessage(selectedConversationId, content);
  };

  const handleUpdateSettings = (settings: { archived?: boolean; muted?: boolean }) => {
    if (!selectedConversationId) return;
    updateSettings(selectedConversationId, settings);
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleBackToList = () => {
    setShowMobileConversation(false);
    setSelectedConversationId(null);
  };

  const handleCreateConversation = async (
    otherProfileId: string,
    contextCategory: string,
    projectId?: string
  ) => {
    const id = await createConversation(otherProfileId, contextCategory, projectId);
    if (id) {
      setSelectedConversationId(id);
    }
    return id;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center px-4 gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="font-display text-xl font-semibold">Mensagens</h1>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Two-column layout */}
        <div className="hidden lg:flex flex-1">
          {/* Conversation list */}
          <div className="w-80 xl:w-96 shrink-0">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelect={handleSelectConversation}
              onNewConversation={() => setShowNewDialog(true)}
            />
          </div>

          {/* Conversation view */}
          <div className="flex-1 bg-card">
            {selectedConversation && profileId ? (
              <ConversationView
                conversation={selectedConversation}
                messages={messages}
                loading={messagesLoading}
                profileId={profileId}
                onSendMessage={handleSendMessage}
                onUpdateSettings={handleUpdateSettings}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">ou inicie uma nova conversa com suas conexões</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowNewDialog(true)}
                >
                  Nova Conversa
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Single view at a time */}
        <div className="lg:hidden flex-1">
          {showMobileConversation && selectedConversation && profileId ? (
            <div className="h-full bg-card">
              <ConversationView
                conversation={selectedConversation}
                messages={messages}
                loading={messagesLoading}
                profileId={profileId}
                onSendMessage={handleSendMessage}
                onUpdateSettings={handleUpdateSettings}
                onBack={handleBackToList}
              />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelect={handleSelectConversation}
              onNewConversation={() => setShowNewDialog(true)}
            />
          )}
        </div>
      </div>

      {/* New conversation dialog */}
      <NewConversationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        profileId={profileId}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
}