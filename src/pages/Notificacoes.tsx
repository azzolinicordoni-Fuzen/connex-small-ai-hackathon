import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Leaf, 
  Home, 
  Users, 
  FolderOpen, 
  MessageSquare, 
  Settings, 
  Bell,
  UserPlus,
  LogOut,
  Menu,
  X,
  User,
  Newspaper
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "@/components/notifications/NotificationList";
import { BackButton } from "@/components/layout/BackButton";

interface Profile {
  id: string;
  name: string;
  agent_type: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
}

const agentTypeLabels: Record<string, string> = {
  proprietario: "Proprietário",
  engenheiro: "Engenheiro",
  desenvolvedor: "Desenvolvedor",
  certificadora: "Certificadora",
  investidor: "Investidor",
  projeto: "Projeto",
  outro: "Outro",
};

export default function Notificacoes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user, signOut, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Visão Geral", href: "/dashboard" },
    { icon: User, label: "Meu Perfil", href: "/perfil" },
    { icon: Newspaper, label: "Feed", href: "/feed" },
    { icon: Users, label: "Conexões", href: "/conexoes" },
    { icon: UserPlus, label: "Minhas Conexões", href: "/minhas-conexoes" },
    { icon: FolderOpen, label: "Meus Projetos", href: "/meus-projetos" },
    { icon: MessageSquare, label: "Mensagens", href: "/mensagens", badge: 3 },
    { icon: Bell, label: "Notificações", href: "/notificacoes", active: true, badge: unreadCount || undefined },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ];

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">AgroConnect</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.badge && (
                  <Badge variant={item.active ? "secondary" : "destructive"} className="ml-auto h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.name || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.agent_type ? agentTypeLabels[profile.agent_type] : "Usuário"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 lg:flex-none flex items-center gap-3">
            <BackButton className="hidden lg:flex" />
            <h1 className="font-display text-xl font-semibold">Notificações</h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <NotificationList />
        </main>
      </div>
    </div>
  );
}
