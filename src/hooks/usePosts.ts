import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Post {
  id: string;
  content: string;
  image_url: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
    agent_type: string;
    is_premium: boolean;
  };
  isLiked: boolean;
}

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    fetchPosts();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setUserProfileId(data.id);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts with author info
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          tags,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          author_id
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(p => p.author_id))];
      
      // Fetch profiles for authors
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, agent_type, is_premium')
        .in('id', authorIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Get user's likes if logged in
      let userLikes: string[] = [];
      if (userProfileId) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userProfileId);
        
        userLikes = likesData?.map(l => l.post_id) || [];
      }

      // Map posts with author info
      const mappedPosts: Post[] = postsData.map(post => {
        const author = profilesMap.get(post.author_id);
        return {
          id: post.id,
          content: post.content,
          image_url: post.image_url,
          tags: post.tags || [],
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          created_at: post.created_at,
          author: {
            id: post.author_id,
            name: author?.name || 'Usuário',
            avatar_url: author?.avatar_url,
            agent_type: author?.agent_type || 'outro',
            is_premium: author?.is_premium || false,
          },
          isLiked: userLikes.includes(post.id),
        };
      });

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erro ao carregar publicações');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, imageUrl?: string, tags?: string[]) => {
    if (!userProfileId) {
      toast.error('Você precisa estar logado para publicar');
      return false;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: userProfileId,
          content,
          image_url: imageUrl || null,
          tags: tags || [],
        });

      if (error) throw error;

      toast.success('Publicação criada com sucesso!');
      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao criar publicação');
      return false;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!userProfileId) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isCurrentlyLiked = post.isLiked;

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !isCurrentlyLiked,
          likes_count: isCurrentlyLiked ? p.likes_count - 1 : p.likes_count + 1,
        };
      }
      return p;
    }));

    try {
      if (isCurrentlyLiked) {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userProfileId);

        // Update likes count
        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId);
      } else {
        // Add like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userProfileId });

        // Update likes count
        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      // Revert on error
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: isCurrentlyLiked,
            likes_count: post.likes_count,
          };
        }
        return p;
      }));
      console.error('Error toggling like:', error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Publicação excluída');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao excluir publicação');
    }
  };

  return {
    posts,
    loading,
    userProfileId,
    createPost,
    toggleLike,
    deletePost,
    refetch: fetchPosts,
  };
}
