import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Image as ImageIcon,
  Send,
  X,
  Link as LinkIcon,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatePostCardProps {
  userAvatar?: string | null;
  userName?: string;
  onPost: (content: string, imageUrl?: string, tags?: string[]) => Promise<boolean>;
  isLoggedIn: boolean;
}

export function CreatePostCard({ userAvatar, userName, onPost, isLoggedIn }: CreatePostCardProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const success = await onPost(
      content.trim(),
      imageUrl.trim() || undefined,
      tags.length > 0 ? tags : undefined
    );
    
    if (success) {
      setContent("");
      setImageUrl("");
      setTags([]);
      setShowImageInput(false);
      setShowTagInput(false);
    }
    setIsSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-3">
            Faça login para compartilhar suas ideias e novidades
          </p>
          <Button variant="default" size="sm" asChild>
            <a href="/login">Entrar na plataforma</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-transparent focus-within:border-primary/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-border">
            <AvatarImage src={userAvatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userName?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Compartilhe uma atualização, notícia ou insight do setor..."
              className={cn(
                "resize-none border-0 p-0 focus-visible:ring-0 text-base",
                "placeholder:text-muted-foreground/60 min-h-[80px]"
              )}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
            
            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Image URL Input */}
            {showImageInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="URL da imagem..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setShowImageInput(false);
                    setImageUrl("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Tag Input */}
            {showTagInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma tag e pressione Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1"
                  maxLength={20}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  Adicionar
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowTagInput(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative rounded-lg overflow-hidden bg-muted max-w-xs">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={cn(showImageInput && "text-primary bg-primary/10")}
                >
                  <ImageIcon className="w-4 h-4 mr-1.5" />
                  Imagem
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className={cn(showTagInput && "text-primary bg-primary/10")}
                >
                  <Hash className="w-4 h-4 mr-1.5" />
                  Tags
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {content.length}/2000
                </span>
                <Button 
                  size="sm" 
                  onClick={handleSubmit} 
                  disabled={!content.trim() || isSubmitting}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
