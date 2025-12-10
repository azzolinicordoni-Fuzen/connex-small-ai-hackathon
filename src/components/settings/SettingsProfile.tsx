import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Lock, 
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
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

interface SettingsProfileProps {
  profile: Profile | null;
  userEmail: string;
}

export function SettingsProfile({ profile, userEmail }: SettingsProfileProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const completionItems = [
    { label: "Nome completo", done: !!profile?.name },
    { label: "Foto de perfil", done: !!profile?.avatar_url },
    { label: "Foto de capa", done: !!profile?.cover_url },
    { label: "Biografia", done: !!profile?.bio },
    { label: "Localização", done: !!profile?.location },
    { label: "Telefone", done: !!profile?.phone },
    { label: "WhatsApp", done: !!profile?.whatsapp },
  ];

  const completedCount = completionItems.filter(item => item.done).length;
  const completionPercent = Math.round((completedCount / completionItems.length) * 100);
  const pendingItems = completionItems.filter(item => !item.done);

  const handleDeleteAccount = () => {
    toast.info("Funcionalidade de exclusão de conta será implementada em breve.");
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Completar Perfil
              </CardTitle>
              <CardDescription>
                Perfis completos recebem mais visibilidade na plataforma
              </CardDescription>
            </div>
            <Badge variant={completionPercent === 100 ? "default" : "secondary"}>
              {completionPercent}% completo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={completionPercent} className="h-2" />
          
          {pendingItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Campos pendentes:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {pendingItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Circle className="w-4 h-4" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {completionPercent === 100 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Seu perfil está completo!
            </div>
          )}

          <Button asChild className="w-full sm:w-auto">
            <Link to="/perfil">
              Editar Perfil Completo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Account Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Dados da Conta
          </CardTitle>
          <CardDescription>
            Informações de acesso à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-sm">E-mail</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <Badge variant="outline" className="text-emerald-600">Verificado</Badge>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-sm">Senha</p>
              <p className="text-sm text-muted-foreground">••••••••••••</p>
            </div>
            <Button variant="outline" size="sm">
              <Lock className="w-4 h-4 mr-1" />
              Alterar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Desativar Conta</p>
              <p className="text-sm text-muted-foreground">
                Sua conta ficará invisível temporariamente
              </p>
            </div>
            <Button variant="outline" size="sm">
              Desativar
            </Button>
          </div>
          
          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Excluir Conta</p>
              <p className="text-sm text-muted-foreground">
                Todos os seus dados serão removidos permanentemente
              </p>
            </div>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                    e removerá seus dados de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
