import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileStatusBadgeProps {
  profile: {
    name: string;
    tipo_perfil?: string | null;
    cpf_cnpj?: string | null;
  };
}

export default function ProfileStatusBadge({ profile }: ProfileStatusBadgeProps) {
  const isComplete = !!profile.name && !!profile.tipo_perfil && !!profile.cpf_cnpj;

  if (isComplete) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Perfil Completo
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-200">
      <AlertCircle className="w-3 h-3" />
      Incompleto
    </Badge>
  );
}
