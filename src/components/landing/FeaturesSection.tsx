import { 
  Network, 
  MessageSquare, 
  Map, 
  BarChart3,
  Shield,
  Zap
} from "lucide-react";
import { ScrollReveal } from "./ScrollRevealSection";

const features = [
  { icon: Network, title: "Conexões Inteligentes", description: "Match automático entre agentes" },
  { icon: MessageSquare, title: "Chat Direto", description: "Comunicação em tempo real" },
  { icon: Map, title: "Geolocalização", description: "Mapeamento de áreas" },
  { icon: BarChart3, title: "Analytics", description: "Métricas de performance" },
  { icon: Shield, title: "Segurança", description: "Dados protegidos" },
  { icon: Zap, title: "Automação", description: "Workflows otimizados" },
];

export function FeaturesSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-secondary/10">
      {/* Dynamic background */}
      <div className="absolute inset-0">
        {/* Animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 animate-pulse" style={{ animationDuration: "8s" }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <ScrollReveal>
              <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
                Plataforma Completa
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={100}>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Simples de usar.
                <br />
                <span className="text-muted-foreground">Poderoso nos resultados.</span>
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <p className="text-muted-foreground text-lg mb-10 max-w-md">
                Ferramentas desenvolvidas especificamente para o mercado de carbono brasileiro e global.
              </p>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={300 + index * 80}>
                  <div 
                    className="flex items-center gap-3 p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:bg-card transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <ScrollReveal className="relative hidden lg:block" delay={400}>
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full border border-primary/10 rounded-full animate-pulse" style={{ animationDuration: "4s" }} />
                <div className="absolute w-[75%] h-[75%] border border-primary/15 rounded-full animate-pulse" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
                <div className="absolute w-[50%] h-[50%] border border-primary/20 rounded-full animate-pulse" style={{ animationDuration: "2s", animationDelay: "1s" }} />
                <div className="absolute w-[25%] h-[25%] bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shadow-neon">
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
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                <path
                  d="M200,100 Q300,200 200,200"
                  stroke="rgba(158,255,31,0.2)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
                <path
                  d="M320,180 Q250,220 200,200"
                  stroke="rgba(158,255,31,0.2)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <path
                  d="M100,300 Q150,250 200,200"
                  stroke="rgba(158,255,31,0.2)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </svg>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
