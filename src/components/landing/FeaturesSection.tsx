import { 
  Network, 
  MessageSquare, 
  Map, 
  BarChart3,
  Shield,
  Zap
} from "lucide-react";

const features = [
  { icon: Network, title: "Conexões Inteligentes", description: "Match automático entre agentes" },
  { icon: MessageSquare, title: "Chat Direto", description: "Comunicação em tempo real" },
  { icon: Map, title: "Geolocalização", description: "Mapeamento de áreas e projetos" },
  { icon: BarChart3, title: "Analytics", description: "Métricas de performance" },
  { icon: Shield, title: "Segurança", description: "Dados criptografados" },
  { icon: Zap, title: "Automação", description: "Workflows otimizados" },
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-secondary/20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
              Plataforma
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Simples.
              <br />
              <span className="text-muted-foreground">Poderoso.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-md">
              Ferramentas desenvolvidas para o mercado de carbono, 
              conectando oportunidades com eficiência.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:block">
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Concentric rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full border border-primary/10 rounded-full" />
                <div className="absolute w-[75%] h-[75%] border border-primary/15 rounded-full" />
                <div className="absolute w-[50%] h-[50%] border border-primary/20 rounded-full" />
                <div className="absolute w-[25%] h-[25%] bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              {/* Floating nodes */}
              <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg animate-float">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute top-[40%] right-[5%] w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute bottom-[20%] left-[10%] w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: "2s" }}>
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
