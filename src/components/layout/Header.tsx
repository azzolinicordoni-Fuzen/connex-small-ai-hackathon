import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Conexões", href: "/conexoes" },
  { label: "Feed", href: "/feed" },
  { label: "Perfil", href: "/perfil" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { user, loading } = useAuth();

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isLanding ? "bg-transparent" : "bg-card/80 backdrop-blur-lg border-b border-border"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className={cn(
              "font-display font-bold text-xl",
              isLanding ? "text-primary-foreground" : "text-foreground"
            )}>
              AgroConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? isLanding ? "bg-primary-foreground/10 text-primary-foreground" : "bg-primary/10 text-primary"
                    : isLanding ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <Link to="/dashboard" className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant={isLanding ? "glass" : "outline"} size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Button variant={isLanding ? "glass" : "ghost"} asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button variant={isLanding ? "hero" : "default"} asChild>
                  <Link to="/cadastro">Começar Grátis</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg",
              isLanding ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : isLanding ? "text-primary-foreground/80 hover:bg-primary-foreground/10" : "text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/20 mt-2">
                {user ? (
                  <Button variant="default" asChild className="w-full">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login" onClick={() => setIsOpen(false)}>Entrar</Link>
                    </Button>
                    <Button variant="default" asChild className="w-full">
                      <Link to="/cadastro" onClick={() => setIsOpen(false)}>Começar Grátis</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
