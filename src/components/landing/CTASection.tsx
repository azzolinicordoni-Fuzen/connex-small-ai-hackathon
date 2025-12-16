import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoIcon } from "@/components/brand/Logo";

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-[hsl(220,25%,6%)]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(158,255,31,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(158,255,31,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[180px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-10">
            <LogoIcon size="xl" className="mx-auto scale-150 opacity-80" />
          </div>
          
          {/* Heading */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Faça parte da
            <br />
            <span className="text-primary">revolução verde</span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg text-white/50 mb-10 max-w-md mx-auto font-light">
            Entre para a maior rede de projetos de carbono do Brasil.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon">
              <Link to="/cadastro">
                Criar Conta Gratuita
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
