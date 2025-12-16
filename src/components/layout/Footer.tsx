import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ScrollReveal } from "@/components/landing/ScrollRevealSection";

const footerLinks = {
  Plataforma: [
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Conexões", href: "/conexoes" },
    { label: "Feed", href: "/feed" },
    { label: "Projetos", href: "/projetos" },
  ],
  Agentes: [
    { label: "Proprietários", href: "#" },
    { label: "Desenvolvedores", href: "#" },
    { label: "Certificadoras", href: "#" },
    { label: "Investidores", href: "#" },
  ],
  Empresa: [
    { label: "Sobre Nós", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Contato", href: "#" },
  ],
  Legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Twitter, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <ScrollReveal className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <Logo variant="dark" size="lg" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              A plataforma que conecta proprietários de terra, desenvolvedores, 
              certificadoras e investidores para projetos de carbono e sustentabilidade.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </ScrollReveal>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links], groupIndex) => (
            <ScrollReveal key={title} delay={groupIndex * 100}>
              <h4 className="font-display font-semibold mb-4 text-foreground">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CONNEX. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Construindo o futuro sustentável
              <span className="text-primary animate-pulse">●</span>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
