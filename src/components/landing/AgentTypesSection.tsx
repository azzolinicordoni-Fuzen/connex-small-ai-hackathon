import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TreePine, 
  HardHat, 
  Briefcase, 
  Award, 
  Landmark, 
  FolderOpen,
  Users 
} from "lucide-react";

const agentTypes = [
  {
    icon: TreePine,
    title: "Proprietários de Terra",
    description: "Cadastre suas áreas e encontre oportunidades de projetos sustentáveis.",
    color: "emerald",
  },
  {
    icon: HardHat,
    title: "Engenheiros",
    description: "Conecte-se com projetos que precisam da sua expertise técnica.",
    color: "accent",
  },
  {
    icon: Briefcase,
    title: "Desenvolvedores",
    description: "Encontre terras e parceiros para desenvolver seus projetos.",
    color: "earth",
  },
  {
    icon: Award,
    title: "Certificadoras",
    description: "Ofereça seus serviços de certificação para projetos verificados.",
    color: "emerald",
  },
  {
    icon: Landmark,
    title: "Bancos e Fundos",
    description: "Descubra oportunidades de investimento em projetos sustentáveis.",
    color: "accent",
  },
  {
    icon: FolderOpen,
    title: "Projetos Prontos",
    description: "Divulgue projetos prontos para investimento ou parceria.",
    color: "earth",
  },
];

export function AgentTypesSection() {
  return (
    <section className="py-24 bg-background" id="como-funciona">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="emerald" className="mb-4">
            <Users className="w-3 h-3 mr-1" />
            Tipos de Agentes
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Uma plataforma para todos os{" "}
            <span className="text-primary">agentes do agro</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Independente do seu papel no ecossistema, encontre as conexões certas 
            para fazer seus projetos acontecerem.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentTypes.map((agent, index) => (
            <Card 
              key={index} 
              hover
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  agent.color === "emerald" ? "bg-primary/10" :
                  agent.color === "accent" ? "bg-accent/10" :
                  "bg-earth/10"
                }`}>
                  <agent.icon className={`w-7 h-7 ${
                    agent.color === "emerald" ? "text-primary" :
                    agent.color === "accent" ? "text-accent" :
                    "text-earth"
                  }`} />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {agent.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {agent.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
