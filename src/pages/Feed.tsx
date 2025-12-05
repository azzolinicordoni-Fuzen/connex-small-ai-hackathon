import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon,
  FileText,
  MoreHorizontal,
  Send,
  TrendingUp,
  Users,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockPosts = [
  {
    id: 1,
    author: {
      name: "Maria Santos",
      role: "Engenheira Florestal",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    },
    content: "Acabamos de concluir o primeiro projeto de carbono certificado pela Verra no Tocantins! 🌱 Foram 3 anos de trabalho intenso, mas o resultado é incrível: 50.000 hectares restaurados e mais de 2 milhões de toneladas de CO2 sequestradas. Agradeço a todos os parceiros envolvidos!",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop",
    likes: 234,
    comments: 45,
    shares: 12,
    time: "2h",
    tags: ["carbono", "verra", "restauração"],
  },
  {
    id: 2,
    author: {
      name: "Carlos Oliveira",
      role: "Desenvolvedor de Projetos",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    },
    content: "Nova regulamentação do mercado de carbono brasileiro saiu hoje! 📋 Principais pontos:\n\n• Registro obrigatório de projetos\n• Novas metodologias aprovadas\n• Incentivos fiscais para proprietários rurais\n\nQuem quiser discutir os impactos, estou disponível para uma call.",
    likes: 567,
    comments: 89,
    shares: 156,
    time: "5h",
    tags: ["regulamentação", "mercadodecarbono", "brasil"],
  },
  {
    id: 3,
    author: {
      name: "Ana Costa",
      role: "Certificadora - Verra Brasil",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    },
    content: "Estamos com vagas abertas para auditores de projetos de carbono! Se você tem experiência em engenharia florestal ou ambiental, entre em contato. Salário competitivo e oportunidade de trabalhar com os maiores projetos do Brasil. 🌿",
    likes: 123,
    comments: 34,
    shares: 67,
    time: "1d",
    tags: ["vagas", "auditoria", "carreira"],
  },
];

const trendingTopics = [
  { tag: "mercadodecarbono", posts: "1.2k" },
  { tag: "regeneração", posts: "856" },
  { tag: "ESG", posts: "743" },
  { tag: "agrofloresta", posts: "621" },
  { tag: "sustentabilidade", posts: "589" },
];

const suggestedConnections = [
  {
    name: "Pedro Mendes",
    role: "Investidor ESG",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    name: "Lucia Fernandes",
    role: "Eng. Agrônoma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  },
];

export default function Feed() {
  const [newPost, setNewPost] = useState("");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const handleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handlePost = () => {
    if (newPost.trim()) {
      toast.success("Publicação criada com sucesso!");
      setNewPost("");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Feed */}
            <div className="space-y-6">
              {/* Create Post */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Compartilhe uma atualização, artigo ou notícia..."
                        className="resize-none border-0 p-0 focus-visible:ring-0 text-base"
                        rows={3}
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                      />
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <ImageIcon className="w-4 h-4" />
                            Foto
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                            Documento
                          </Button>
                        </div>
                        <Button size="sm" onClick={handlePost} disabled={!newPost.trim()}>
                          <Send className="w-4 h-4" />
                          Publicar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              {mockPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground">{post.author.name}</h4>
                          <p className="text-sm text-muted-foreground">{post.author.role}</p>
                          <p className="text-xs text-muted-foreground">{post.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-foreground whitespace-pre-line mb-4">{post.content}</p>
                    
                    {post.image && (
                      <div className="rounded-xl overflow-hidden mb-4 -mx-2">
                        <img 
                          src={post.image} 
                          alt="Post" 
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/10">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            likedPosts.includes(post.id) && "text-destructive"
                          )}
                        >
                          <Heart className={cn(
                            "w-4 h-4",
                            likedPosts.includes(post.id) && "fill-current"
                          )} />
                          {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                          {post.shares}
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Em Alta</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {trendingTopics.map((topic) => (
                      <div 
                        key={topic.tag}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                      >
                        <span className="font-medium text-primary">#{topic.tag}</span>
                        <span className="text-sm text-muted-foreground">{topic.posts} posts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Connections */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Sugestões de Conexão</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {suggestedConnections.map((person) => (
                      <div key={person.name} className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage src={person.avatar} />
                          <AvatarFallback>{person.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{person.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Conectar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
