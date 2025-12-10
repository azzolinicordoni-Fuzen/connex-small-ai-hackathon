import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap,
  FolderPlus,
  UserPlus,
  FileEdit,
  Globe,
  MessageSquare
} from "lucide-react";

interface DashboardQuickActionsProps {
  agentType: string;
}

export function DashboardQuickActions({ agentType }: DashboardQuickActionsProps) {
  // Actions personalized by agent type
  const getActionsForAgent = () => {
    const baseActions = [
      { 
        label: "Criar Projeto", 
        icon: FolderPlus, 
        href: "/meus-projetos",
        description: "Inicie um novo projeto de carbono"
      },
      { 
        label: "Buscar Conexões", 
        icon: UserPlus, 
        href: "/conexoes",
        description: "Encontre parceiros e colaboradores"
      },
      { 
        label: "Publicar no Feed", 
        icon: FileEdit, 
        href: "/feed",
        description: "Compartilhe atualizações"
      },
    ];

    // Add specific actions based on agent type
    switch (agentType) {
      case 'proprietario':
        return [
          ...baseActions,
          { 
            label: "Ver Desenvolvedores", 
            icon: Globe, 
            href: "/conexoes?filter=desenvolvedor",
            description: "Encontre desenvolvedores de projetos"
          },
        ];
      case 'desenvolvedor':
        return [
          ...baseActions,
          { 
            label: "Ver Proprietários", 
            icon: Globe, 
            href: "/conexoes?filter=proprietario",
            description: "Encontre áreas disponíveis"
          },
        ];
      case 'investidor':
      case 'comprador':
        return [
          ...baseActions,
          { 
            label: "Ver Projetos", 
            icon: Globe, 
            href: "/conexoes?filter=projeto",
            description: "Encontre projetos para investir"
          },
        ];
      case 'certificadora':
      case 'auditor':
        return [
          ...baseActions,
          { 
            label: "Ver Projetos", 
            icon: Globe, 
            href: "/conexoes?filter=projeto",
            description: "Encontre projetos para certificar"
          },
        ];
      default:
        return baseActions;
    }
  };

  const actions = getActionsForAgent();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-3 flex-col items-start gap-1 text-left"
              asChild
            >
              <Link to={action.href}>
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{action.label}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1 w-full">
                  {action.description}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
