import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, Trash2, MapPin, TreePine, FileText, 
  DollarSign, Calendar, Building2, Target
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

interface Props {
  subperfil: any;
  agentType: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SubperfilCard({ subperfil, agentType, onEdit, onDelete }: Props) {
  const renderContent = () => {
    switch (agentType) {
      case "proprietario":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_area}</CardTitle>
                  {subperfil.hectares && (
                    <p className="text-sm text-muted-foreground">{subperfil.hectares} hectares</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir área?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A área será removida permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.tipo_uso && (
                <div className="flex items-center gap-2 text-sm">
                  <TreePine className="w-4 h-4 text-muted-foreground" />
                  <span>Uso: {subperfil.tipo_uso}</span>
                </div>
              )}
              {subperfil.tipo_projeto_desejado?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.tipo_projeto_desejado.map((tipo: string) => (
                    <Badge key={tipo} variant="secondary" className="text-xs">{tipo}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground">{subperfil.descricao}</p>
              )}
            </CardContent>
          </>
        );

      case "investidor":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_requisicao}</CardTitle>
                  {subperfil.tipo_projeto && (
                    <Badge variant="outline" className="mt-1">{subperfil.tipo_projeto}</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir requisição?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.volume_desejado && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>Volume: {subperfil.volume_desejado.toLocaleString()} tCO₂e</span>
                </div>
              )}
              {subperfil.modalidade?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.modalidade.map((mod: string) => (
                    <Badge key={mod} variant="secondary" className="text-xs">{mod}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground">{subperfil.descricao}</p>
              )}
            </CardContent>
          </>
        );

      case "comprador":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_demanda}</CardTitle>
                  {subperfil.ano_alvo && (
                    <p className="text-sm text-muted-foreground">Meta: {subperfil.ano_alvo}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir demanda?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.volume_creditos && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>Volume: {subperfil.volume_creditos.toLocaleString()} tCO₂e/ano</span>
                </div>
              )}
              {subperfil.tipos_preferidos?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.tipos_preferidos.map((tipo: string) => (
                    <Badge key={tipo} variant="secondary" className="text-xs">{tipo}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground">{subperfil.descricao}</p>
              )}
            </CardContent>
          </>
        );

      case "certificadora":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_servico}</CardTitle>
                  {subperfil.tipo_auditoria && (
                    <Badge variant="outline" className="mt-1">{subperfil.tipo_auditoria}</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.metodologia && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>Metodologia: {subperfil.metodologia}</span>
                </div>
              )}
              {subperfil.escopo && (
                <p className="text-sm text-muted-foreground">{subperfil.escopo}</p>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground">{subperfil.descricao}</p>
              )}
            </CardContent>
          </>
        );

      case "projeto":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_projeto}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {subperfil.tipo_projeto && (
                      <Badge variant="outline">{subperfil.tipo_projeto}</Badge>
                    )}
                    {subperfil.status && (
                      <Badge variant="secondary">{subperfil.status}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(subperfil.estado || subperfil.municipio) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{[subperfil.municipio, subperfil.estado].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {subperfil.emissoes_evitadas_ano && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>{subperfil.emissoes_evitadas_ano.toLocaleString()} tCO₂e/ano</span>
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground">{subperfil.descricao}</p>
              )}
            </CardContent>
          </>
        );

      default:
        return (
          <CardContent>
            <p className="text-muted-foreground">Tipo não suportado</p>
          </CardContent>
        );
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      {renderContent()}
    </Card>
  );
}