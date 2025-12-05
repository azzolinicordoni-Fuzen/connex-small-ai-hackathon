import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, Trash2, MapPin, TreePine, FileText, 
  DollarSign, Calendar, Building2, Target, Users,
  Scale, Landmark, Briefcase, Clock
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
  const renderActionButtons = (deleteLabel: string) => (
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
            <AlertDialogTitle>Excluir {deleteLabel}?</AlertDialogTitle>
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
  );

  const renderBuscaPlataforma = () => {
    if (!subperfil.busca_plataforma?.length) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {subperfil.busca_plataforma.slice(0, 3).map((item: string) => (
          <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
        ))}
        {subperfil.busca_plataforma.length > 3 && (
          <Badge variant="outline" className="text-xs">+{subperfil.busca_plataforma.length - 3}</Badge>
        )}
      </div>
    );
  };

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
                {renderActionButtons("área")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.bioma && (
                <Badge variant="secondary" className="text-xs">{subperfil.bioma}</Badge>
              )}
              {subperfil.tipo_uso && (
                <div className="flex items-center gap-2 text-sm">
                  <TreePine className="w-4 h-4 text-muted-foreground" />
                  <span>Uso: {subperfil.tipo_uso}</span>
                </div>
              )}
              {subperfil.interesse_projeto?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.interesse_projeto.map((interesse: string) => (
                    <Badge key={interesse} variant="outline" className="text-xs">{interesse}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
            </CardContent>
          </>
        );

      case "desenvolvedor":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_projeto}</CardTitle>
                  {subperfil.anos_experiencia && (
                    <p className="text-sm text-muted-foreground">{subperfil.anos_experiencia} anos de experiência</p>
                  )}
                </div>
                {renderActionButtons("projeto")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.tipos_projeto?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.tipos_projeto.map((tipo: string) => (
                    <Badge key={tipo} variant="secondary" className="text-xs">{tipo}</Badge>
                  ))}
                </div>
              )}
              {subperfil.numero_projetos && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{subperfil.numero_projetos} projetos desenvolvidos</span>
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
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
                  {subperfil.perfil_investidor && (
                    <Badge variant="outline" className="mt-1">{subperfil.perfil_investidor}</Badge>
                  )}
                </div>
                {renderActionButtons("requisição")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.volume_desejado && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>Volume: {Number(subperfil.volume_desejado).toLocaleString()} tCO₂e</span>
                </div>
              )}
              {subperfil.interesse_principal?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.interesse_principal.map((interesse: string) => (
                    <Badge key={interesse} variant="secondary" className="text-xs">{interesse}</Badge>
                  ))}
                </div>
              )}
              {subperfil.tipo_credito_desejado?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.tipo_credito_desejado.map((tipo: string) => (
                    <Badge key={tipo} variant="outline" className="text-xs">{tipo}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
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
                {renderActionButtons("demanda")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.volume_creditos && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>Volume: {Number(subperfil.volume_creditos).toLocaleString()} tCO₂e/ano</span>
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
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
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
                {renderActionButtons("serviço")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.padroes_oferecidos?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.padroes_oferecidos.map((padrao: string) => (
                    <Badge key={padrao} variant="secondary" className="text-xs">{padrao}</Badge>
                  ))}
                </div>
              )}
              {subperfil.metodologia && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>Metodologia: {subperfil.metodologia}</span>
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
            </CardContent>
          </>
        );

      case "auditor":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_servico}</CardTitle>
                </div>
                {renderActionButtons("serviço")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.padroes_acreditados?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.padroes_acreditados.map((padrao: string) => (
                    <Badge key={padrao} variant="secondary" className="text-xs">{padrao}</Badge>
                  ))}
                </div>
              )}
              {subperfil.tempo_medio_verificacao && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Tempo: {subperfil.tempo_medio_verificacao}</span>
                </div>
              )}
              {subperfil.tipos_projeto_aceitos?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.tipos_projeto_aceitos.map((tipo: string) => (
                    <Badge key={tipo} variant="outline" className="text-xs">{tipo}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
            </CardContent>
          </>
        );

      case "financeira":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_produto}</CardTitle>
                </div>
                {renderActionButtons("produto")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.tipos_financiamento?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.tipos_financiamento.map((tipo: string) => (
                    <Badge key={tipo} variant="secondary" className="text-xs">{tipo}</Badge>
                  ))}
                </div>
              )}
              {subperfil.ticket_medio && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Ticket: R$ {Number(subperfil.ticket_medio).toLocaleString()}</span>
                </div>
              )}
              {subperfil.modalidades?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.modalidades.map((mod: string) => (
                    <Badge key={mod} variant="outline" className="text-xs">{mod}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
            </CardContent>
          </>
        );

      case "advogado":
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subperfil.nome_servico}</CardTitle>
                  {subperfil.experiencia_carbono && (
                    <Badge variant="secondary" className="mt-1 text-xs">Experiência em Carbono</Badge>
                  )}
                </div>
                {renderActionButtons("serviço")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subperfil.areas_atuacao?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.areas_atuacao.map((area: string) => (
                    <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                  ))}
                </div>
              )}
              {subperfil.clientes_atendidos?.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Atende: {subperfil.clientes_atendidos.join(", ")}</span>
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
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
                {renderActionButtons("projeto")}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(subperfil.estado || subperfil.municipio) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{[subperfil.municipio, subperfil.estado].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {subperfil.creditos_disponiveis && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>{Number(subperfil.creditos_disponiveis).toLocaleString()} créditos disponíveis</span>
                </div>
              )}
              {subperfil.co_beneficios?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subperfil.co_beneficios.map((ods: string) => (
                    <Badge key={ods} variant="outline" className="text-xs">{ods}</Badge>
                  ))}
                </div>
              )}
              {subperfil.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{subperfil.descricao}</p>
              )}
              {renderBuscaPlataforma()}
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
