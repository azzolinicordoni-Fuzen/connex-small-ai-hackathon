import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoIcon } from "@/components/brand/Logo";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex mb-8">
            <LogoIcon size="xl" className="animate-pulse-glow" />
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para conectar seu projeto ao{" "}
            <span className="text-gradient">futuro?</span>
          </h2>
          
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Junte-se a milhares de agentes que já estão construindo o agronegócio 
            sustentável do Brasil.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild className="bg-white text-slate hover:bg-white/90 group">
              <Link to="/cadastro">
                Criar Conta Gratuita
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/login">
                Já tenho uma conta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}