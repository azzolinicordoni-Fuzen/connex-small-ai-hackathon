import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  MessageSquare, 
  Map, 
  FileCheck, 
  BarChart3, 
  Shield,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Network,
    title: "Sistema de Conexões",
    description: "Conecte-se com agentes relevantes para seu negócio, similar ao LinkedIn.",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    description: "Comunique-se diretamente com suas conexões dentro da plataforma.",
  },
  {
    icon: Map,
    title: "Georreferenciamento",
    description: "Visualize áreas e projetos no mapa com dados de localização precisos.",
  },
  {
    icon: FileCheck,
    title: "Gestão de Documentos",
    description: "Faça upload e organize documentos, certidões e contratos.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description: "Acompanhe métricas de conexões, visualizações e engajamento.",
  },
  {
    icon: Shield,
    title: "Segurança de Dados",
    description: "Seus dados protegidos com criptografia de ponta a ponta.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div>
            <Badge variant="emerald" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Funcionalidades
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Tudo que você precisa em{" "}
              <span className="text-primary">uma plataforma</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Desenvolvemos ferramentas específicas para o agronegócio sustentável, 
              facilitando conexões, comunicação e gestão de projetos.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-card transition-all animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/10 to-earth/20 rounded-3xl flex items-center justify-center">
              <div className="absolute inset-4 bg-card rounded-2xl shadow-card-hover overflow-hidden">
                {/* Mock Dashboard Preview */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-8 bg-secondary rounded-lg w-3/4" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-primary/10 rounded-xl" />
                    <div className="h-20 bg-accent/10 rounded-xl" />
                    <div className="h-20 bg-earth/10 rounded-xl" />
                  </div>
                  <div className="h-32 bg-secondary/50 rounded-xl" />
                  <div className="flex gap-3">
                    <div className="h-10 bg-primary rounded-lg flex-1" />
                    <div className="h-10 bg-secondary rounded-lg flex-1" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-card-hover p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Network className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">+15 conexões</div>
                  <div className="text-xs text-muted-foreground">Esta semana</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-card-hover p-4 animate-float" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold">1.2k visitas</div>
                  <div className="text-xs text-muted-foreground">Ao seu perfil</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
