import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Bookmark,
  Trash2,
  Flag,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Post } from "@/hooks/usePosts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const agentTypeLabels: Record<string, string> = {
  proprietario: "Proprietário Rural",
  desenvolvedor: "Desenvolvedor de Projetos",
  certificadora: "Certificadora",
  auditor: "Auditor",
  investidor: "Investidor",
  comprador: "Comprador",
  financeira: "Instituição Financeira",
  advogado: "Advogado",
  projeto: "Projeto",
  engenheiro: "Engenheiro",
  outro: "Profissional",
};

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
  isOwner?: boolean;
}

export function PostCard({ post, onLike, onDelete, isOwner }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.slice(0, 300) + '...' 
    : post.content;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-border">
                <AvatarImage src={post.author.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.author.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {post.author.is_premium && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                  {post.author.name}
                </h4>
                {post.author.is_premium && (
                  <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 bg-amber-50">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {agentTypeLabels[post.author.agent_type] || post.author.agent_type}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bookmark className="w-4 h-4 mr-2" />
                Salvar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="w-4 h-4 mr-2" />
                Denunciar
              </DropdownMenuItem>
              {isOwner && onDelete && (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Content */}
        <div>
          <p className="text-foreground whitespace-pre-line leading-relaxed">
            {displayContent}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary text-sm font-medium hover:underline mt-1"
            >
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
        
        {/* Image */}
        {post.image_url && (
          <div className="rounded-xl overflow-hidden -mx-2 bg-muted">
            <img 
              src={post.image_url} 
              alt="Post" 
              className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
          {post.likes_count > 0 && (
            <span>{post.likes_count} curtida{post.likes_count !== 1 ? 's' : ''}</span>
          )}
          {post.comments_count > 0 && (
            <span>{post.comments_count} comentário{post.comments_count !== 1 ? 's' : ''}</span>
          )}
          {post.shares_count > 0 && (
            <span>{post.shares_count} compartilhamento{post.shares_count !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={cn(
                "gap-2 hover:text-red-500 hover:bg-red-50 transition-colors",
                post.isLiked && "text-red-500"
              )}
            >
              <Heart className={cn(
                "w-5 h-5 transition-all",
                post.isLiked && "fill-current scale-110"
              )} />
              <span className="hidden sm:inline">Curtir</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary hover:bg-primary/10">
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Comentar</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary hover:bg-primary/10">
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
