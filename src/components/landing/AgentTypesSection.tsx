import { 
  TreePine, 
  HardHat, 
  Award, 
  Landmark, 
  Building2,
  Scale
} from "lucide-react";
import { ScrollReveal, FloatingText } from "./ScrollRevealSection";

const agentTypes = [
  { icon: TreePine, title: "Proprietários", description: "Áreas para projetos" },
  { icon: HardHat, title: "Desenvolvedores", description: "Criação de projetos" },
  { icon: Award, title: "Certificadoras", description: "Validação e padrões" },
  { icon: Building2, title: "Auditores", description: "Verificação técnica" },
  { icon: Landmark, title: "Investidores", description: "Capital e funding" },
  { icon: Scale, title: "Jurídico", description: "Contratos e compliance" },
];

const keywords = ["REDD+", "ARR", "Verra", "Gold Standard", "ESG", "Net Zero"];

export function AgentTypesSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden" id="como-funciona">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDuration: `${5 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <ScrollReveal className="text-center max-w-xl mx-auto mb-8">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
            Ecossistema Completo
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Todos os agentes.
            <br />
            <span className="text-muted-foreground">Uma plataforma.</span>
          </h2>
          <p className="text-muted-foreground">
            Do proprietário rural ao investidor institucional, conectamos toda a cadeia.
          </p>
        </ScrollReveal>

        {/* Floating keywords */}
        <ScrollReveal className="mb-16" delay={200}>
          <FloatingText words={keywords} />
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {agentTypes.map((agent, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div 
                className="group text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 hover:scale-105 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 mb-4 flex items-center justify-center mx-auto group-hover:bg-primary group-hover:shadow-neon transition-all duration-300">
                  <agent.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {agent.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
