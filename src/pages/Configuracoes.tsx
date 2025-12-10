import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Shield, 
  Bell,
  Globe,
  Palette,
  Lock,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { SettingsPrivacy } from "@/components/settings/SettingsPrivacy";
import { SettingsLanguage } from "@/components/settings/SettingsLanguage";
import { SettingsPreferences } from "@/components/settings/SettingsPreferences";
import { SettingsSecurity } from "@/components/settings/SettingsSecurity";

interface Profile {
  id: string;
  name: string;
  agent_type: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
}

const settingsSections = [
  { id: "perfil", label: "Perfil e Conta", icon: User, description: "Gerencie seu perfil e dados da conta" },
  { id: "privacidade", label: "Privacidade", icon: Shield, description: "Controle de visibilidade e acesso" },
  { id: "notificacoes", label: "Notificações", icon: Bell, description: "Configure alertas e e-mails" },
  { id: "idioma", label: "Idioma e Região", icon: Globe, description: "Fuso horário e formato de data" },
  { id: "preferencias", label: "Preferências", icon: Palette, description: "Personalize a plataforma" },
  { id: "seguranca", label: "Segurança", icon: Lock, description: "Senha e sessões ativas" },
];

export default function Configuracoes() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeSection = searchParams.get("section") || "perfil";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setProfile(data as Profile);
      }
      setLoading(false);
    }
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSectionChange = (sectionId: string) => {
    setSearchParams({ section: sectionId });
    setMobileMenuOpen(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const currentSection = settingsSections.find(s => s.id === activeSection);

  const renderContent = () => {
    switch (activeSection) {
      case "perfil":
        return <SettingsProfile profile={profile} userEmail={user.email || ""} />;
      case "privacidade":
        return <SettingsPrivacy />;
      case "notificacoes":
        return <NotificationPreferences />;
      case "idioma":
        return <SettingsLanguage />;
      case "preferencias":
        return <SettingsPreferences />;
      case "seguranca":
        return <SettingsSecurity />;
      default:
        return <SettingsProfile profile={profile} userEmail={user.email || ""} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl pt-24">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: "Configurações", href: "/configuracoes" },
            { label: currentSection?.label || "Perfil" }
          ]} 
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Section Selector */}
          <div className="lg:hidden">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="flex items-center gap-2">
                {currentSection && <currentSection.icon className="w-4 h-4" />}
                {currentSection?.label}
              </div>
              <ChevronLeft className={cn("w-4 h-4 transition-transform", mobileMenuOpen && "-rotate-90")} />
            </Button>
            
            {mobileMenuOpen && (
              <div className="mt-2 p-2 rounded-lg border bg-card">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h1 className="text-2xl font-bold mb-6">Configurações</h1>
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{currentSection?.label}</h2>
              <p className="text-muted-foreground text-sm">{currentSection?.description}</p>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
