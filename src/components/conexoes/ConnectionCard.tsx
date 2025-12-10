import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, MessageSquare, UserMinus, MoreHorizontal, Check, X,
  TreePine, HardHat, Briefcase, Award, Landmark, FolderOpen, 
  Users, Building2, Scale, Banknote, ClipboardCheck, Clock, CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConnectionCardProps {
  connection: {
    id: string;
    status: string;
    profile: {
      id: string;
      name: string;
      bio: string | null;
      location: string | null;
      avatar_url: string | null;
      agent_type: string;
      is_premium: boolean | null;
    };
    isRequester: boolean;
  };
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  onRemove?: (connectionId: string) => void;
  onMessage?: (profileId: string) => void;
}

const AGENT_ICONS: Record<string, any> = {
  proprietario: TreePine,
  engenheiro: HardHat,
  desenvolvedor: Briefcase,
  certificadora: Award,
  investidor: Landmark,
  projeto: FolderOpen,
  comprador: Building2,
  auditor: ClipboardCheck,
  financeira: Banknote,
  advogado: Scale,
  outro: Users,
};

const AGENT_LABELS: Record<string, string> = {
  proprietario: "Proprietário Rural",
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

const AGENT_COLORS: Record<string, string> = {
  proprietario: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  engenheiro: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  desenvolvedor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  certificadora: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  investidor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  projeto: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  comprador: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  auditor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  financeira: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  advogado: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  outro: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
};

export default function ConnectionCard({ 
  connection, 
  onAccept, 
  onReject, 
  onRemove,
  onMessage 
}: ConnectionCardProps) {
  const { profile, status, isRequester } = connection;
  const TypeIcon = AGENT_ICONS[profile.agent_type] || Users;
  const typeLabel = AGENT_LABELS[profile.agent_type] || "Outro";
  const typeColor = AGENT_COLORS[profile.agent_type] || AGENT_COLORS.outro;

  const isPending = status === 'pending';
  const canAccept = isPending && !isRequester;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {profile.is_premium && (
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{profile.name}</h4>
              {isPending && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                  <Clock className="w-3 h-3 mr-1" />
                  Pendente
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${typeColor}`}>
                <TypeIcon className="w-3 h-3" />
                {typeLabel}
              </span>
              {profile.location && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {canAccept ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => onAccept?.(connection.id)}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onReject?.(connection.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : status === 'accepted' ? (
              <>
                {onMessage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => onMessage(profile.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onRemove?.(connection.id)}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remover conexão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
