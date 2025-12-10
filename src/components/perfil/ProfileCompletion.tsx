import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCompletionProps {
  profile: {
    name: string;
    bio: string | null;
    location: string | null;
    phone: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
    agent_type: string;
  };
  onComplete: () => void;
}

export default function ProfileCompletion({ profile, onComplete }: ProfileCompletionProps) {
  const fields = [
    { key: "name", label: "Nome/Razão Social", filled: !!profile.name },
    { key: "bio", label: "Descrição", filled: !!profile.bio },
    { key: "location", label: "Localização", filled: !!profile.location },
    { key: "phone", label: "Telefone", filled: !!profile.phone },
    { key: "whatsapp", label: "WhatsApp", filled: !!profile.whatsapp },
    { key: "avatar_url", label: "Foto/Logo", filled: !!profile.avatar_url },
  ];

  const filledCount = fields.filter(f => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);
  const isComplete = percentage === 100;

  if (isComplete) return null;

  return (
    <div className={cn(
      "rounded-xl border p-4 mb-6",
      percentage < 50 ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" : "bg-primary/5 border-primary/20"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {percentage < 50 ? (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
            <span className="font-semibold">
              {percentage < 50 ? "Perfil incompleto" : "Quase lá!"}
            </span>
            <Badge variant={percentage < 50 ? "outline" : "secondary"}>
              {percentage}% completo
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            Complete seu perfil para aparecer melhor nas conexões e ter mais credibilidade.
          </p>

          <Progress value={percentage} className="h-2 mb-3" />

          <div className="flex flex-wrap gap-2">
            {fields.filter(f => !f.filled).map((field) => (
              <Badge key={field.key} variant="outline" className="text-xs">
                {field.label}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={onComplete} size="sm" className="shrink-0">
          Completar
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
