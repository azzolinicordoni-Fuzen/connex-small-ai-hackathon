import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ArrowRight, Clock, TrendingUp, Leaf, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";

const newsletterArticles = [
  {
    id: 1,
    title: "Mercado de Carbono Brasileiro Avança com Nova Regulamentação",
    description: "Nova legislação promete impulsionar o mercado voluntário de créditos de carbono no Brasil, trazendo maior segurança jurídica e transparência para investidores e desenvolvedores de projetos.",
    category: "Regulamentação",
    readTime: "5 min",
    trending: true,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
    date: "15 Dez 2024"
  },
  {
    id: 2,
    title: "REDD+ e o Futuro da Preservação Amazônica",
    description: "Como projetos de redução de emissões por desmatamento estão transformando a conservação florestal e gerando oportunidades de investimento sustentável.",
    category: "REDD+",
    readTime: "8 min",
    trending: false,
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=250&fit=crop",
    date: "14 Dez 2024"
  },
  {
    id: 3,
    title: "Tendências Globais: COP29 e Impactos no Mercado de Carbono",
    description: "Análise completa das decisões da conferência do clima e suas implicações para o setor de créditos de carbono no Brasil e no mundo.",
    category: "Global",
    readTime: "6 min",
    trending: true,
    image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=400&h=250&fit=crop",
    date: "13 Dez 2024"
  },
  {
    id: 4,
    title: "Agricultura Regenerativa: Nova Fronteira dos Créditos de Carbono",
    description: "Práticas agrícolas sustentáveis estão ganhando destaque como fonte promissora de créditos de carbono no mercado brasileiro.",
    category: "Agricultura",
    readTime: "7 min",
    trending: false,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop",
    date: "12 Dez 2024"
  }
];

const categoryIcons: Record<string, React.ElementType> = {
  "Regulamentação": Globe2,
  "REDD+": Leaf,
  "Global": TrendingUp,
  "Agricultura": Leaf
};

export function DashboardNewsletter() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-display">Carbon News</CardTitle>
              <p className="text-sm text-muted-foreground">Últimas notícias do mercado de carbono</p>
            </div>
          </div>
          <Link to="/feed">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              Ver tudo
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Featured Article */}
        <div className="relative group cursor-pointer overflow-hidden rounded-xl">
          <img 
            src={newsletterArticles[0].image} 
            alt={newsletterArticles[0].title}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-3">
              {newsletterArticles[0].trending && (
                <Badge className="bg-primary/90 text-primary-foreground text-xs px-2.5 py-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Em alta
                </Badge>
              )}
              <Badge variant="outline" className="text-xs border-border/50 bg-background/50 backdrop-blur-sm px-2.5 py-1">
                {newsletterArticles[0].category}
              </Badge>
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground leading-tight mb-2">
              {newsletterArticles[0].title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {newsletterArticles[0].description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {newsletterArticles[0].readTime}
              </span>
              <span>{newsletterArticles[0].date}</span>
            </div>
          </div>
        </div>

        {/* Other Articles */}
        <div className="grid grid-cols-1 gap-4">
          {newsletterArticles.slice(1).map((article) => {
            const CategoryIcon = categoryIcons[article.category] || Newspaper;
            return (
              <div 
                key={article.id} 
                className="group cursor-pointer p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary font-medium">{article.category}</span>
                      {article.trending && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-orange-500/10 text-orange-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Em alta
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}
                      </span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
