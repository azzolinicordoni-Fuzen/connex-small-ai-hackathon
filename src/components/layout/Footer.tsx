import { Link } from "react-router-dom";
import { Leaf, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  Plataforma: [
    { label: "Como Funciona", href: "#" },
    { label: "Conexões", href: "/conexoes" },
    { label: "Feed", href: "/feed" },
    { label: "Projetos", href: "/projetos" },
  ],
  Agentes: [
    { label: "Proprietários", href: "#" },
    { label: "Engenheiros", href: "#" },
    { label: "Desenvolvedores", href: "#" },
    { label: "Certificadoras", href: "#" },
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
    <footer className="bg-forest text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl">AgroConnect</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6 max-w-xs">
              Conectando proprietários de terra, engenheiros, investidores e desenvolvedores 
              para um agronegócio mais sustentável.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} AgroConnect. Todos os direitos reservados.
          </p>
          <p className="text-sm text-primary-foreground/60">
            Feito com 💚 para o agronegócio sustentável
          </p>
        </div>
      </div>
    </footer>
  );
}
