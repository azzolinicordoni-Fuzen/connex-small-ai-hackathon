import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  FolderOpen, 
  Bell,
  MessageSquare
} from "lucide-react";

interface DashboardStatsProps {
  activeConnections: number;
  activeProjects: number;
  unreadNotifications: number;
  unreadMessages: number;
}

export function DashboardStats({
  activeConnections,
  activeProjects,
  unreadNotifications,
  unreadMessages
}: DashboardStatsProps) {
  const stats = [
    { 
      label: "Projetos Ativos", 
      value: activeProjects, 
      icon: FolderOpen, 
      href: "/meus-projetos",
      color: "text-primary"
    },
    { 
      label: "Conexões", 
      value: activeConnections, 
      icon: Users, 
      href: "/minhas-conexoes",
      color: "text-blue-500"
    },
    { 
      label: "Notificações", 
      value: unreadNotifications, 
      icon: Bell, 
      href: "/notificacoes",
      color: "text-amber-500",
      highlight: unreadNotifications > 0
    },
    { 
      label: "Mensagens", 
      value: unreadMessages, 
      icon: MessageSquare, 
      href: "/mensagens",
      color: "text-emerald-500",
      highlight: unreadMessages > 0
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Link key={stat.label} to={stat.href}>
          <Card className={`transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${stat.highlight ? 'ring-2 ring-primary/20' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
