import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoIcon } from "@/components/brand/Logo";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[hsl(220,25%,6%)]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(158,255,31,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(158,255,31,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px]" />
        
        {/* Accent glows */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/5 w-48 h-48 bg-primary/8 rounded-full blur-[80px]" />
        
        {/* Floating particles */}
        <div className="absolute top-[20%] right-[15%] w-1 h-1 bg-primary rounded-full animate-pulse" />
        <div className="absolute top-[60%] right-[25%] w-0.5 h-0.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[20%] w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[30%] left-[15%] w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Logo Icon */}
          <div className="mb-10 animate-fade-up">
            <div className="inline-flex relative">
              <LogoIcon size="xl" className="scale-[2.5] opacity-90" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </div>
          </div>

          {/* Headline - Minimal and Impactful */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 animate-fade-up leading-tight" style={{ animationDelay: "0.1s" }}>
            O futuro do{" "}
            <span className="text-primary">carbono</span>
            <br />
            <span className="text-white/90">começa aqui</span>
          </h1>

          {/* Subtitle - Short and Direct */}
          <p className="text-lg sm:text-xl text-white/50 mb-12 max-w-lg mx-auto animate-fade-up font-light" style={{ animationDelay: "0.2s" }}>
            Conectamos quem tem terra com quem transforma.
          </p>

          {/* CTA - Single Focus */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon">
              <Link to="/cadastro">
                Entrar na Rede
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="ghost" size="xl" asChild className="text-white/60 hover:text-white hover:bg-white/5">
              <Link to="/login">
                Já tenho conta
              </Link>
            </Button>
          </div>

          {/* Minimal Stats */}
          <div className="mt-20 flex justify-center gap-12 lg:gap-20 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="font-display text-3xl lg:text-4xl font-bold text-primary">2.5k+</div>
              <div className="text-xs text-white/40 mt-1">Agentes</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl lg:text-4xl font-bold text-primary">850+</div>
              <div className="text-xs text-white/40 mt-1">Projetos</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl lg:text-4xl font-bold text-primary">R$120M+</div>
              <div className="text-xs text-white/40 mt-1">Investidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
