import { 
  TreePine, 
  HardHat, 
  Award, 
  Landmark, 
  Building2,
  Scale
} from "lucide-react";

const agentTypes = [
  { icon: TreePine, title: "Proprietários", description: "Áreas para projetos" },
  { icon: HardHat, title: "Desenvolvedores", description: "Criação de projetos" },
  { icon: Award, title: "Certificadoras", description: "Validação e padrões" },
  { icon: Building2, title: "Auditores", description: "Verificação técnica" },
  { icon: Landmark, title: "Investidores", description: "Capital e funding" },
  { icon: Scale, title: "Jurídico", description: "Contratos e compliance" },
];

export function AgentTypesSection() {
  return (
    <section className="py-32 bg-background relative" id="como-funciona">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
            Ecossistema
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Todos os agentes.
            <br />
            <span className="text-muted-foreground">Uma plataforma.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {agentTypes.map((agent, index) => (
            <div 
              key={index} 
              className="group text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
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
          ))}
        </div>
      </div>
    </section>
  );
}
