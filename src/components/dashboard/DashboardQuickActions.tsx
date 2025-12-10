import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FolderPlus,
  UserPlus,
  Newspaper
} from "lucide-react";

export function DashboardQuickActions() {
  const actions = [
    { 
      label: "Novo Projeto", 
      icon: FolderPlus, 
      href: "/meus-projetos"
    },
    { 
      label: "Buscar Conexões", 
      icon: UserPlus, 
      href: "/conexoes"
    },
    { 
      label: "Ver Feed", 
      icon: Newspaper, 
      href: "/feed"
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="justify-start h-10"
              asChild
            >
              <Link to={action.href}>
                <action.icon className="w-4 h-4 mr-2 text-primary" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
