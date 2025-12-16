import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Globe, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoIcon } from "@/components/brand/Logo";
import { ScrollReveal } from "./ScrollRevealSection";

const highlights = [
  { icon: Leaf, text: "Impacto Ambiental Real" },
  { icon: Globe, text: "Alcance Global" },
  { icon: TrendingUp, text: "Mercado em Crescimento" },
];

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-[hsl(220,25%,6%)]">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] animate-pulse" style={{ animationDuration: "10s" }} />
        
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(158,255,31,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(158,255,31,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDuration: `${4 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
        
        {/* Moving light beams */}
        <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" />
        <div className="absolute top-2/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <ScrollReveal>
            <div className="mb-10">
              <LogoIcon size="xl" className="mx-auto scale-150 opacity-80" />
            </div>
          </ScrollReveal>
          
          {/* Heading */}
          <ScrollReveal delay={100}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              O futuro do carbono
              <br />
              <span className="text-primary">começa agora</span>
            </h2>
          </ScrollReveal>
          
          {/* Subtitle */}
          <ScrollReveal delay={200}>
            <p className="text-lg text-white/50 mb-8 max-w-md mx-auto font-light">
              Junte-se à maior rede de projetos de carbono da América Latina.
            </p>
          </ScrollReveal>

          {/* Highlights */}
          <ScrollReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {highlights.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.text}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon">
                <Link to="/cadastro">
                  Criar Conta Gratuita
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
          
          {/* Trust text */}
          <ScrollReveal delay={500}>
            <p className="mt-8 text-xs text-white/30">
              Cadastro gratuito • Sem compromisso • Comece em minutos
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
