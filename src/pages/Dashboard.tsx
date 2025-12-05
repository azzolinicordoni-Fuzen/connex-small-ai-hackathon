import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, 
  Home, 
  Users, 
  FolderOpen, 
  MessageSquare, 
  Settings, 
  Bell,
  TrendingUp,
  Eye,
  UserPlus,
  Calendar,
  ChevronRight,
  Plus,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Visão Geral", href: "/dashboard", active: true },
  { icon: Users, label: "Conexões", href: "/conexoes" },
  { icon: FolderOpen, label: "Meus Projetos", href: "/projetos" },
  { icon: MessageSquare, label: "Mensagens", href: "/mensagens", badge: 3 },
  { icon: Bell, label: "Notificações", href: "/notificacoes", badge: 5 },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

const stats = [
  { label: "Visualizações do Perfil", value: "1,234", change: "+12%", icon: Eye },
  { label: "Conexões", value: "156", change: "+8%", icon: Users },
  { label: "Solicitações Pendentes", value: "23", change: "+5", icon: UserPlus },
  { label: "Projetos Ativos", value: "4", change: "0", icon: FolderOpen },
];

const recentConnections = [
  {
    name: "João Silva",
    role: "Proprietário",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    time: "Há 2 horas",
  },
  {
    name: "Maria Santos",
    role: "Engenheira",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    time: "Há 5 horas",
  },
  {
    name: "Carlos Oliveira",
    role: "Desenvolvedor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    time: "Há 1 dia",
  },
];

const upcomingEvents = [
  {
    title: "Webinar: Mercado de Carbono 2024",
    date: "15 Jan",
    time: "14:00",
  },
  {
    title: "Reunião com Investidores",
    date: "18 Jan",
    time: "10:00",
  },
  {
    title: "Visita técnica - Fazenda Verde",
    date: "22 Jan",
    time: "08:00",
  },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" />
                <AvatarFallback>RL</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Ricardo Lima</p>
                <p className="text-xs text-muted-foreground truncate">Investidor</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm">
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
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-emerald-light" />
                    <span className="text-xs text-emerald-light font-medium">{stat.change}</span>
                    <span className="text-xs text-muted-foreground">vs. último mês</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Completion */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Complete seu Perfil</CardTitle>
                <CardDescription>
                  Perfis completos recebem 3x mais visualizações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">75% completo</span>
                    <span className="text-sm text-muted-foreground">Faltam 3 itens</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="grid sm:grid-cols-3 gap-3 pt-4">
                    {[
                      { label: "Adicionar foto de capa", done: false },
                      { label: "Verificar e-mail", done: true },
                      { label: "Adicionar certificações", done: false },
                      { label: "Completar bio", done: true },
                      { label: "Adicionar localização", done: true },
                      { label: "Conectar WhatsApp", done: false },
                    ].map((item) => (
                      <div 
                        key={item.label}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg text-sm",
                          item.done ? "bg-primary/5 text-primary" : "bg-secondary text-muted-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                          item.done ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {item.done ? "✓" : ""}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Próximos Eventos</CardTitle>
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.title}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary mb-0.5" />
                        <span className="text-[10px] font-medium text-primary">{event.date}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Connections */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Conexões Recentes</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/conexoes">
                      Ver todas
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {recentConnections.map((connection) => (
                    <div 
                      key={connection.name}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={connection.avatar} />
                        <AvatarFallback>{connection.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{connection.name}</p>
                        <p className="text-xs text-muted-foreground">{connection.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{connection.time}</p>
                        <Button variant="outline" size="sm" className="mt-1">
                          Mensagem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FolderOpen className="w-4 h-4" />
                    Criar novo projeto
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4" />
                    Buscar conexões
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4" />
                    Iniciar conversa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
