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
  LogOut,
  Menu,
  X,
  User,
  Newspaper,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { useMessages } from "@/hooks/useMessages";
import { useConnections } from "@/hooks/useConnections";
import { useProjects } from "@/hooks/useProjects";
import { usePosts } from "@/hooks/usePosts";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardProjects } from "@/components/dashboard/DashboardProjects";
import { DashboardConnections } from "@/components/dashboard/DashboardConnections";
import { DashboardActivity } from "@/components/dashboard/DashboardActivity";
import { DashboardProfile } from "@/components/dashboard/DashboardProfile";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { toast } from "sonner";

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

const agentTypeLabels: Record<string, string> = {
  proprietario: "Proprietário",
  engenheiro: "Engenheiro",
  desenvolvedor: "Desenvolvedor",
  certificadora: "Certificadora",
  investidor: "Investidor",
  projeto: "Projeto",
  comprador: "Comprador",
  auditor: "Auditor",
  financeira: "Financeira",
  advogado: "Advogado",
  outro: "Outro",
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectsWithStages, setProjectsWithStages] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(0);
  
  const { user, signOut, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const { totalUnreadCount: messagesUnreadCount } = useMessages();
  const { connections, loading: connectionsLoading, acceptConnection, rejectConnection } = useConnections(profile?.id || '');
  const { projects, loading: projectsLoading } = useProjects(profile?.id || '');
  const { posts, loading: postsLoading } = usePosts();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Visão Geral", href: "/dashboard", active: true },
    { icon: User, label: "Meu Perfil", href: "/perfil" },
    { icon: Newspaper, label: "Feed", href: "/feed" },
    { icon: Globe, label: "Rede de Contatos", href: "/conexoes" },
    { icon: Users, label: "Minhas Conexões", href: "/minhas-conexoes" },
    { icon: FolderOpen, label: "Meus Projetos", href: "/meus-projetos" },
    { icon: MessageSquare, label: "Mensagens", href: "/mensagens", badge: messagesUnreadCount || undefined },
    { icon: Bell, label: "Notificações", href: "/notificacoes", badge: unreadCount || undefined },
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
      
      const { data, error } = await supabase
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

  // Fetch projects with stages when profile is loaded
  useEffect(() => {
    async function fetchProjectsWithStages() {
      if (!profile?.id) return;

      const { data: projectsData, error } = await supabase
        .from("carbon_projects")
        .select(`
          *,
          stages:project_stages(*)
        `)
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (projectsData) {
        setProjectsWithStages(projectsData);
        
        // Calculate upcoming deadlines
        let deadlineCount = 0;
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        projectsData.forEach((project: any) => {
          project.stages?.forEach((stage: any) => {
            if (stage.deadline && stage.status !== 'concluida') {
              const deadline = new Date(stage.deadline);
              if (deadline >= today && deadline <= weekFromNow) {
                deadlineCount++;
              }
            }
          });
        });
        setUpcomingDeadlines(deadlineCount);
      }
    }

    fetchProjectsWithStages();
  }, [profile?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAcceptConnection = async (connectionId: string) => {
    await acceptConnection(connectionId);
    toast.success("Conexão aceita!");
  };

  const handleRejectConnection = async (connectionId: string) => {
    await rejectConnection(connectionId);
    toast.success("Solicitação rejeitada");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate stats from real data
  const activeConnections = connections.filter(c => c.status === 'accepted').length;
  const pendingConnections = connections.filter(c => c.status === 'pending' && !c.isRequester).length;
  const activeProjects = projectsWithStages.length;

  // Transform connections for the component
  const transformedConnections = connections.map(conn => ({
    id: conn.id,
    status: conn.status,
    profile: conn.profile,
    isRequester: conn.isRequester
  }));

  // Transform posts for the component
  const transformedPosts = posts.map(post => ({
    id: post.id,
    content: post.content,
    created_at: post.created_at,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
    author: post.author
  }));

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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                  <Badge variant="destructive" className="ml-auto h-5 min-w-5 flex items-center justify-center p-0 text-xs">
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

          <div className="flex-1 lg:flex-none">
            <h1 className="font-display text-xl font-semibold">Visão Geral</h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Welcome Message */}
          <div>
            <h2 className="text-2xl font-display font-bold">
              Bem-vindo, {profile?.name?.split(" ")[0] || "Usuário"}!
            </h2>
            <p className="text-muted-foreground">
              Aqui está o resumo das suas atividades e o que precisa da sua atenção
            </p>
          </div>

          {/* Stats - Resumo Rápido */}
          <DashboardStats
            profileViews={0}
            activeConnections={activeConnections}
            pendingConnections={pendingConnections}
            activeProjects={activeProjects}
            unreadNotifications={unreadCount}
            unreadMessages={messagesUnreadCount}
            upcomingDeadlines={upcomingDeadlines}
          />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Projects */}
            <div className="lg:col-span-2 space-y-6">
              <DashboardProjects 
                projects={projectsWithStages} 
                loading={loading} 
              />
              
              <DashboardActivity 
                posts={transformedPosts} 
                loading={postsLoading} 
              />
            </div>

            {/* Right Column - Profile, Connections, Actions */}
            <div className="space-y-6">
              <DashboardProfile profile={profile} />
              
              <DashboardConnections 
                connections={transformedConnections}
                pendingCount={pendingConnections}
                loading={connectionsLoading}
                onAccept={handleAcceptConnection}
                onReject={handleRejectConnection}
              />
              
              <DashboardQuickActions agentType={profile?.agent_type || 'outro'} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
