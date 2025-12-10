import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Leaf,
  Newspaper,
  ExternalLink
} from "lucide-react";

const trendingTopics = [
  { tag: "mercadodecarbono", posts: "1.2k" },
  { tag: "regeneracao", posts: "856" },
  { tag: "ESG", posts: "743" },
  { tag: "agrofloresta", posts: "621" },
  { tag: "sustentabilidade", posts: "589" },
  { tag: "creditodecarbono", posts: "512" },
];

const sectorNews = [
  {
    title: "Nova regulamentação do mercado de carbono brasileiro",
    source: "Governo Federal",
    time: "2h",
  },
  {
    title: "Preços do crédito de carbono atingem máxima histórica",
    source: "Reuters",
    time: "5h",
  },
  {
    title: "COP29: Novas metas para o setor florestal",
    source: "ONU",
    time: "1d",
  },
];

interface SuggestedConnection {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

interface FeedSidebarProps {
  suggestedConnections?: SuggestedConnection[];
  onConnect?: (id: string) => void;
}

export function FeedSidebar({ suggestedConnections = [], onConnect }: FeedSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold">Em Alta no Setor</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <div 
                key={topic.tag}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <span className="font-medium text-primary group-hover:underline">
                    #{topic.tag}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {topic.posts}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sector News */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Newspaper className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-semibold">Notícias do Setor</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {sectorNews.map((news, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
              >
                <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                  {news.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{news.time}</span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-primary">
            Ver mais notícias
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      {suggestedConnections.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold">Sugestões de Conexão</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {suggestedConnections.slice(0, 3).map((person) => (
                <div key={person.id} className="flex items-center gap-3">
                  <Link to={`/perfil/${person.id}`}>
                    <Avatar className="h-10 w-10 cursor-pointer transition-transform hover:scale-105">
                      <AvatarImage src={person.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {person.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/perfil/${person.id}`}>
                      <h4 className="font-medium text-sm truncate hover:text-primary transition-colors cursor-pointer">
                        {person.name}
                      </h4>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onConnect?.(person.id)}
                    className="shrink-0"
                  >
                    Conectar
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-primary" asChild>
              <Link to="/conexoes">
                Ver todas as sugestões
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Carbon Tips */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Leaf className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">
                Dica do Dia
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                Projetos com documentação completa e verificação independente 
                têm 40% mais chances de atrair investidores qualificados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
