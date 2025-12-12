import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, TreePine, Banknote, Award } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { icon: Users, value: "2.500+", label: "Agentes Conectados" },
  { icon: TreePine, value: "850+", label: "Projetos Cadastrados" },
  { icon: Banknote, value: "R$ 120M+", label: "Em Investimentos" },
  { icon: Award, value: "45+", label: "Certificadoras" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
        <div className="absolute top-40 left-40 w-1.5 h-1.5 bg-primary/60 rounded-full animate-float" />
        <div className="absolute bottom-40 right-40 w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="outline" className="mb-6 animate-fade-up bg-white/5 text-white/90 border-white/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 animate-pulse" />
            A maior rede de agronegócio sustentável do Brasil
          </Badge>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Conecte seu projeto ao{" "}
            <span className="text-gradient">
              futuro sustentável
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            A plataforma que conecta proprietários de terra, desenvolvedores, 
            certificadoras e investidores para projetos de carbono e sustentabilidade.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild className="group">
              <Link to="/cadastro">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="#como-funciona">
                Como Funciona
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300"
              >
                <stat.icon className="w-6 h-6 text-primary mb-3 mx-auto" />
                <div className="font-display text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs lg:text-sm text-white/50">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}