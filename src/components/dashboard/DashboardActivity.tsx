import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity, 
  ChevronRight,
  Heart,
  MessageCircle,
  FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number | null;
  comments_count: number | null;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
    agent_type: string;
  };
}

interface DashboardActivityProps {
  posts: Post[];
  loading: boolean;
}

export function DashboardActivity({ posts, loading }: DashboardActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividades Recentes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/feed">
              Ver feed
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {posts.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Nenhuma atividade recente</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/feed">
                Ver feed completo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 4).map((post) => (
              <Link
                key={post.id}
                to="/feed"
                className="block"
              >
                <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={post.author.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{post.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Heart className="w-3 h-3" />
                          {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageCircle className="w-3 h-3" />
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
