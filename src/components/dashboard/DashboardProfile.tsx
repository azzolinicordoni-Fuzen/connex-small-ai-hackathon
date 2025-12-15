import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

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

interface DashboardProfileProps {
  profile: Profile | null;
}

const agentTypeLabels: Record<string, string> = {
  proprietario: "Proprietário Rural",
  engenheiro: "Engenheiro",
  desenvolvedor: "Desenvolvedor de Projetos",
  certificadora: "Certificadora",
  investidor: "Investidor / Comprador",
  projeto: "Projeto",
  comprador: "Comprador",
  auditor: "Auditor",
  financeira: "Instituição Financeira",
  juridico: "Jurídico",
  outro: "Outro",
};

export function DashboardProfile({ profile }: DashboardProfileProps) {
  const completionItems = [
    { label: "Foto de perfil", done: !!profile?.avatar_url },
    { label: "Biografia", done: !!profile?.bio },
    { label: "Localização", done: !!profile?.location },
    { label: "Telefone", done: !!profile?.phone },
  ];

  const completedCount = completionItems.filter(item => item.done).length;
  const isComplete = completedCount === completionItems.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5" />
            Meu Perfil
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/perfil">
              Editar
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Profile Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{profile?.name || "Seu nome"}</span>
              {isComplete ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Básico
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.agent_type ? agentTypeLabels[profile.agent_type] : "Tipo de agente"}
            </p>
          </div>
        </div>

        {/* Status Info */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            {isComplete 
              ? "Seu perfil está completo! Continue ativo para aumentar sua visibilidade."
              : "Complete seu perfil para aparecer melhor nas conexões."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
