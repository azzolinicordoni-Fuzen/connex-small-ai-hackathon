import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/layout/BackButton";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePostCard } from "@/components/feed/CreatePostCard";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscoverProfiles } from "@/hooks/useConnections";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Sparkles, Clock, Users } from "lucide-react";

export default function Feed() {
  const { user } = useAuth();
  const { posts, loading, userProfileId, createPost, toggleLike, deletePost, refetch } = usePosts();
  const { profiles: suggestedProfiles } = useDiscoverProfiles(userProfileId);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [filter, setFilter] = useState<'recent' | 'popular' | 'connections'>('recent');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const filteredPosts = [...posts].sort((a, b) => {
    if (filter === 'popular') {
      return (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const suggestedConnections = suggestedProfiles.slice(0, 5).map(p => ({
    id: p.id,
    name: p.name,
    role: p.agent_type,
    avatar_url: p.avatar_url,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BackButton />
              <h1 className="text-3xl font-bold text-foreground">Feed</h1>
            </div>
            <p className="text-muted-foreground ml-12">
              Acompanhe as novidades e insights do mercado de créditos de carbono
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Main Feed */}
            <div className="space-y-6">
              {/* Create Post */}
              <CreatePostCard
                userAvatar={userProfile?.avatar_url}
                userName={userProfile?.name}
                onPost={createPost}
                isLoggedIn={!!user}
              />

              {/* Filters */}
              <div className="flex items-center justify-between">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                  <TabsList className="bg-card border">
                    <TabsTrigger value="recent" className="gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="hidden sm:inline">Recentes</span>
                    </TabsTrigger>
                    <TabsTrigger value="popular" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Destaques</span>
                    </TabsTrigger>
                    <TabsTrigger value="connections" className="gap-2">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Conexões</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Atualizar</span>
                </Button>
              </div>

              {/* Posts */}
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-xl p-6 space-y-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-card rounded-xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma publicação ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Seja o primeiro a compartilhar uma novidade com a comunidade!
                  </p>
                  {!user && (
                    <Button asChild>
                      <a href="/login">Fazer login para publicar</a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={toggleLike}
                      onDelete={deletePost}
                      isOwner={post.author.id === userProfileId}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <FeedSidebar 
                  suggestedConnections={suggestedConnections}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
