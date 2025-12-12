import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  MessageSquare, 
  Map, 
  FileCheck, 
  BarChart3, 
  Shield,
  Sparkles,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Network,
    title: "Sistema de Conexões",
    description: "Conecte-se com agentes relevantes para seu negócio.",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    description: "Comunique-se diretamente com suas conexões.",
  },
  {
    icon: Map,
    title: "Georreferenciamento",
    description: "Visualize áreas e projetos no mapa.",
  },
  {
    icon: FileCheck,
    title: "Gestão de Documentos",
    description: "Organize documentos, certidões e contratos.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description: "Acompanhe métricas e engajamento.",
  },
  {
    icon: Shield,
    title: "Segurança de Dados",
    description: "Dados protegidos com criptografia.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              Funcionalidades
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Tudo que você precisa em{" "}
              <span className="text-gradient">uma plataforma</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Ferramentas desenvolvidas especificamente para o agronegócio sustentável, 
              facilitando conexões e gestão de projetos.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group flex gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-0.5">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl flex items-center justify-center p-6">
              {/* Dashboard Preview */}
              <div className="w-full h-full bg-card rounded-2xl shadow-lg overflow-hidden border border-border/50">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                  </div>
                  <div className="flex-1 h-4 bg-secondary rounded-lg ml-4" />
                </div>
                
                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-secondary rounded-lg w-2/3" />
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="h-16 bg-secondary rounded-xl" />
                    <div className="h-16 bg-secondary rounded-xl" />
                  </div>
                  
                  <div className="h-24 bg-secondary/60 rounded-xl" />
                  
                  <div className="flex gap-3">
                    <div className="h-9 bg-primary rounded-lg flex-1" />
                    <div className="h-9 bg-secondary rounded-lg flex-1" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-lg p-4 animate-float border border-border/50">
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
            
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-lg p-4 animate-float border border-border/50" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
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