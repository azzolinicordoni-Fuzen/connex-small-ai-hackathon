import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileStatusBadgeProps {
  profile: {
    name: string;
    bio: string | null;
    location: string | null;
    phone: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
  };
}

export default function ProfileStatusBadge({ profile }: ProfileStatusBadgeProps) {
  const fields = [
    { key: "name", filled: !!profile.name },
    { key: "bio", filled: !!profile.bio },
    { key: "location", filled: !!profile.location },
    { key: "phone", filled: !!profile.phone },
    { key: "avatar_url", filled: !!profile.avatar_url },
  ];

  const filledCount = fields.filter(f => f.filled).length;
  const isComplete = filledCount === fields.length;

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
