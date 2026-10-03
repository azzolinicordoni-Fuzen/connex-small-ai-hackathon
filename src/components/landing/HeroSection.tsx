import { Button } from "@/components/ui/button";
import { ArrowRight, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoIcon } from "@/components/brand/Logo";
import { useEffect, useState } from "react";

const floatingWords = [
  { text: "Sustentabilidade", delay: 0 },
  { text: "Inovação", delay: 1.5 },
  { text: "Tecnologia", delay: 3 },
  { text: "Futuro", delay: 4.5 },
];

export function HeroSection() {
  const [activeWord, setActiveWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % floatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-start sm:items-center pt-20 sm:pt-0 justify-center overflow-hidden bg-[hsl(220,25%,6%)]">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-500/10 via-primary/10 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/8 rounded-full blur-[200px] animate-pulse" style={{ animationDuration: "10s" }} />
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(158,255,31,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(158,255,31,0.015)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${4 + Math.random() * 6}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>
        
        {/* Moving gradient line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Logo Icon */}
          <div className="mb-2 min-[360px]:mb-6 sm:mb-10 animate-fade-up">
            <div className="inline-flex relative p-4">
              <LogoIcon size="xl" className="scale-110 min-[360px]:scale-150 sm:scale-[1.8] opacity-90" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
            </div>
          </div>

          {/* Floating Concept Word */}
          <div className="h-8 mb-3 sm:mb-6 overflow-hidden">
            {floatingWords.map((word, index) => (
              <div
                key={word.text}
                className={`text-primary/60 text-sm tracking-[0.3em] uppercase font-medium transition-all duration-700 ${
                  activeWord === index 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ position: activeWord === index ? "relative" : "absolute" }}
              >
                {word.text}
              </div>
            ))}
          </div>

          {/* Headline - Updated */}
          <h1 className="font-display text-3xl min-[360px]:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 animate-fade-up leading-tight" style={{ animationDelay: "0.1s" }}>
            Conectando o mercado
            <br />
            <span className="text-primary">de créditos de carbono</span>
          </h1>

          {/* Subtitle - More institutional */}
          <p className="text-base sm:text-xl text-white/50 mb-4 max-w-2xl mx-auto animate-fade-up font-light" style={{ animationDelay: "0.2s" }}>
            A plataforma que conecta todos os agentes do ecossistema de créditos de carbono em um único lugar.
          </p>
          
          {/* Secondary tagline */}
          <p className="hidden min-[360px]:block text-sm text-white/30 mb-8 sm:mb-12 animate-fade-up" style={{ animationDelay: "0.25s" }}>
            Tecnologia • Transparência • Transformação
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon">
              <Link to="/cadastro">
                Entrar na Rede
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            {/* Mobile-only (<640px): full-width Connex Field CTA right below "Entrar na Rede" */}
            <Link
              to="/field"
              data-testid="hero-field-cta-mobile"
              className="sm:hidden group relative z-10 flex w-full min-h-[64px] items-center gap-3 rounded-xl border-2 border-primary bg-primary/15 px-4 py-3 text-left transition-colors active:bg-primary/25"
            >
              <WifiOff className="h-6 w-6 shrink-0 text-primary" />
              <span className="flex flex-1 flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Hack-Nation 2026 · World Bank</span>
                <span className="font-display text-base font-semibold text-white">Conheça o Connex Field</span>
                <span className="text-xs text-white/70">IA offline para produtores rurais</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
            </Link>
            <Button variant="ghost" size="xl" asChild className="text-white/60 hover:text-white hover:bg-white/5 border border-white/10">
              <Link to="/login">
                Já tenho conta
              </Link>
            </Button>
          </div>

          {/* Hack-Nation 2026 — Connex Field entry (public, no login) */}
          <div className="mt-6 hidden sm:flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Hack-Nation 2026 · World Bank Challenge
            </span>
            <Link
              to="/field"
              data-testid="hero-field-cta"
              className="group inline-flex items-center gap-3 rounded-xl border border-primary/40 bg-white/[0.03] px-5 py-3 text-left backdrop-blur transition-colors hover:border-primary hover:bg-primary/10"
            >
              <WifiOff className="h-5 w-5 shrink-0 text-primary" />
              <span className="flex flex-col">
                <span className="font-display text-base font-semibold text-white">Conheça o Connex Field</span>
                <span className="text-xs text-white/50">Offline AI for rural producers</span>
              </span>
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Minimal Stats */}
          <div className="mt-24 flex justify-center gap-12 lg:gap-20 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center group">
              <div className="font-display text-3xl lg:text-4xl font-bold text-primary transition-transform group-hover:scale-110">2.5k+</div>
              <div className="text-xs text-white/40 mt-1">Agentes Conectados</div>
            </div>
            <div className="text-center group">
              <div className="font-display text-3xl lg:text-4xl font-bold text-primary transition-transform group-hover:scale-110">850+</div>
              <div className="text-xs text-white/40 mt-1">Projetos Ativos</div>
            </div>
            <div className="text-center group">
              <div className="font-display text-3xl lg:text-4xl font-bold text-primary transition-transform group-hover:scale-110">R$120M+</div>
              <div className="text-xs text-white/40 mt-1">Em Negociações</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[hsl(220,25%,5%)] to-transparent" />
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
