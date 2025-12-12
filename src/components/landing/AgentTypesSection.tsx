import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TreePine, 
  HardHat, 
  Briefcase, 
  Award, 
  Landmark, 
  FolderOpen,
  Users,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const agentTypes = [
  {
    icon: TreePine,
    title: "Proprietários de Terra",
    description: "Cadastre suas áreas e encontre oportunidades de projetos sustentáveis.",
  },
  {
    icon: HardHat,
    title: "Desenvolvedores",
    description: "Encontre terras e parceiros para desenvolver seus projetos de carbono.",
  },
  {
    icon: Award,
    title: "Certificadoras",
    description: "Ofereça seus serviços de certificação para projetos verificados.",
  },
  {
    icon: Briefcase,
    title: "Auditores",
    description: "Conecte-se com projetos que precisam de verificação e auditoria.",
  },
  {
    icon: Landmark,
    title: "Investidores",
    description: "Descubra oportunidades de investimento em projetos sustentáveis.",
  },
  {
    icon: FolderOpen,
    title: "Projetos",
    description: "Divulgue projetos prontos para investimento ou parceria.",
  },
];

export function AgentTypesSection() {
  return (
    <section className="py-24 bg-background relative" id="como-funciona">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-glow opacity-50" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Users className="w-3 h-3 mr-1" />
            Tipos de Agentes
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Uma plataforma para todos os{" "}
            <span className="text-gradient">agentes do agro</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Independente do seu papel no ecossistema, encontre as conexões certas 
            para fazer seus projetos acontecerem.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agentTypes.map((agent, index) => (
            <Card 
              key={index} 
              hover
              className="group animate-fade-up border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 mb-4 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:shadow-neon">
                  <agent.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {agent.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {agent.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link 
            to="/cadastro" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium group"
          >
            Encontre seu perfil ideal
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}