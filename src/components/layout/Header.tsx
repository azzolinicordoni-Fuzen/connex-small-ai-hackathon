import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";

const getNavItems = (isAuthenticated: boolean) => [
  { label: "Início", href: isAuthenticated ? "/dashboard" : "/" },
  { label: "Conexões", href: "/conexoes" },
  { label: "Feed", href: "/feed" },
  // Hack-Nation 2026 — public entry to the offline module
  { label: "Connex Field", mobileLabel: "Connex Field — IA Offline", href: "/field" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { user, loading } = useAuth();

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isLanding ? "bg-transparent" : "bg-card/90 backdrop-blur-xl border-b border-border/50"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <Logo 
              variant={isLanding ? "light" : "dark"} 
              size="lg" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {getNavItems(!!user).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === item.href
                    ? isLanding 
                      ? "bg-white/10 text-white" 
                      : "bg-primary/10 text-primary"
                    : isLanding 
                      ? "text-white/70 hover:text-white hover:bg-white/5" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
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
              "lg:hidden p-2 rounded-lg transition-colors",
              isLanding ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary"
            )}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={cn(
            "lg:hidden py-4 animate-fade-in",
            isLanding ? "bg-card/95 backdrop-blur-xl rounded-2xl mb-4 p-4" : ""
          )}>
            <nav className="flex flex-col gap-2">
              {getNavItems(!!user).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {"mobileLabel" in item && item.mobileLabel ? item.mobileLabel : item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
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