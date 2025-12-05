import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: string;
  profileId: string;
  editData?: any;
  onSaved: () => void;
}

export default function SubperfilDialog({ open, onOpenChange, agentType, profileId, editData, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData(getInitialData());
    }
  }, [editData, agentType, open]);

  const getInitialData = () => {
    switch (agentType) {
      case "proprietario":
        return { nome_area: "", hectares: "", tipo_uso: "", tipo_projeto_desejado: [], descricao: "" };
      case "investidor":
        return { nome_requisicao: "", tipo_projeto: "", volume_desejado: "", certificacao_exigida: "", localizacao_preferencial: [], modalidade: [], descricao: "" };
      case "comprador":
        return { nome_demanda: "", volume_creditos: "", tipos_preferidos: [], setor_projeto: "", ano_alvo: "", certificacao_exigida: "", descricao: "" };
      case "certificadora":
        return { nome_servico: "", tipo_auditoria: "", metodologia: "", escopo: "", descricao: "" };
      case "projeto":
        return { nome_projeto: "", estado: "", municipio: "", tipo_projeto: "", status: "", emissoes_evitadas_ano: "", prazo_projeto: "", investimento_total: "", descricao: "" };
      default:
        return {};
    }
  };

  const handleArrayToggle = (field: string, value: string) => {
    const current = formData[field] || [];
    setFormData({
      ...formData,
      [field]: current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tableMap: Record<string, string> = {
      proprietario: "proprietario_subperfis",
      certificadora: "certificadora_subperfis",
      investidor: "investidor_subperfis",
      comprador: "comprador_subperfis",
      projeto: "projeto_subperfis",
    };

    const tableName = tableMap[agentType];
    if (!tableName) {
      toast.error("Tipo de agente inválido");
      setLoading(false);
      return;
    }

    try {
      const dataToSave = { ...formData, profile_id: profileId };
      delete dataToSave.id;
      delete dataToSave.created_at;
      delete dataToSave.updated_at;

      if (editData?.id) {
        const { error } = await supabase
          .from(tableName as any)
          .update(dataToSave)
          .eq("id", editData.id);
        if (error) throw error;
        toast.success("Subperfil atualizado com sucesso");
      } else {
        const { error } = await supabase
          .from(tableName as any)
          .insert(dataToSave);
        if (error) throw error;
        toast.success("Subperfil criado com sucesso");
      }

      onSaved();
    } catch (error: any) {
      console.error("Error saving subperfil:", error);
      toast.error(error.message || "Erro ao salvar subperfil");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (agentType) {
      case "proprietario":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_area">Nome da Área *</Label>
              <Input
                id="nome_area"
                value={formData.nome_area || ""}
                onChange={(e) => setFormData({ ...formData, nome_area: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hectares">Hectares</Label>
              <Input
                id="hectares"
                type="number"
                value={formData.hectares || ""}
                onChange={(e) => setFormData({ ...formData, hectares: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Uso</Label>
              <RadioGroup
                value={formData.tipo_uso || ""}
                onValueChange={(value) => setFormData({ ...formData, tipo_uso: value })}
                className="grid grid-cols-2 gap-2"
              >
                {["Pecuária", "Agricultura", "Floresta", "Mista"].map((tipo) => (
                  <div key={tipo} className="flex items-center space-x-2 border rounded-lg p-2">
                    <RadioGroupItem value={tipo} id={tipo} />
                    <Label htmlFor={tipo} className="cursor-pointer text-sm">{tipo}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Projeto Desejado</Label>
              <div className="grid grid-cols-2 gap-2">
                {["REDD+", "ARR", "Reflorestamento", "Pecuária Sustentável"].map((tipo) => (
                  <div
                    key={tipo}
                    onClick={() => handleArrayToggle("tipo_projeto_desejado", tipo)}
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                      (formData.tipo_projeto_desejado || []).includes(tipo) ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <Checkbox checked={(formData.tipo_projeto_desejado || []).includes(tipo)} />
                    <span>{tipo}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>
        );

      case "investidor":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_requisicao">Nome da Requisição *</Label>
              <Input
                id="nome_requisicao"
                placeholder="Ex: Compra 1.000 créditos REDD+"
                value={formData.nome_requisicao || ""}
                onChange={(e) => setFormData({ ...formData, nome_requisicao: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_projeto">Tipo de Projeto</Label>
              <Input
                id="tipo_projeto"
                value={formData.tipo_projeto || ""}
                onChange={(e) => setFormData({ ...formData, tipo_projeto: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume_desejado">Volume Desejado (tCO₂e)</Label>
              <Input
                id="volume_desejado"
                type="number"
                value={formData.volume_desejado || ""}
                onChange={(e) => setFormData({ ...formData, volume_desejado: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificacao_exigida">Certificação Exigida</Label>
              <Input
                id="certificacao_exigida"
                value={formData.certificacao_exigida || ""}
                onChange={(e) => setFormData({ ...formData, certificacao_exigida: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Modalidade</Label>
              <div className="grid grid-cols-3 gap-2">
                {["Equity", "Revenue Share", "Forward"].map((mod) => (
                  <div
                    key={mod}
                    onClick={() => handleArrayToggle("modalidade", mod)}
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                      (formData.modalidade || []).includes(mod) ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <Checkbox checked={(formData.modalidade || []).includes(mod)} />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>
        );

      case "comprador":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_demanda">Nome da Demanda *</Label>
              <Input
                id="nome_demanda"
                value={formData.nome_demanda || ""}
                onChange={(e) => setFormData({ ...formData, nome_demanda: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume_creditos">Volume de Créditos (tCO₂e/ano)</Label>
              <Input
                id="volume_creditos"
                type="number"
                value={formData.volume_creditos || ""}
                onChange={(e) => setFormData({ ...formData, volume_creditos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipos Preferidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Florestal", "Solo", "Metano", "Energia"].map((tipo) => (
                  <div
                    key={tipo}
                    onClick={() => handleArrayToggle("tipos_preferidos", tipo)}
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                      (formData.tipos_preferidos || []).includes(tipo) ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <Checkbox checked={(formData.tipos_preferidos || []).includes(tipo)} />
                    <span>{tipo}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano_alvo">Ano-Alvo</Label>
              <Input
                id="ano_alvo"
                type="number"
                placeholder="Ex: 2030"
                value={formData.ano_alvo || ""}
                onChange={(e) => setFormData({ ...formData, ano_alvo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificacao_exigida">Certificação Exigida</Label>
              <Input
                id="certificacao_exigida"
                value={formData.certificacao_exigida || ""}
                onChange={(e) => setFormData({ ...formData, certificacao_exigida: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>
        );

      case "certificadora":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_servico">Nome do Serviço *</Label>
              <Input
                id="nome_servico"
                value={formData.nome_servico || ""}
                onChange={(e) => setFormData({ ...formData, nome_servico: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_auditoria">Tipo de Auditoria</Label>
              <Input
                id="tipo_auditoria"
                placeholder="Ex: Auditoria Inicial, Monitoramento"
                value={formData.tipo_auditoria || ""}
                onChange={(e) => setFormData({ ...formData, tipo_auditoria: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodologia">Metodologia</Label>
              <Input
                id="metodologia"
                placeholder="Ex: VM0007, AR-AM0014"
                value={formData.metodologia || ""}
                onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escopo">Escopo</Label>
              <Textarea
                id="escopo"
                value={formData.escopo || ""}
                onChange={(e) => setFormData({ ...formData, escopo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>
        );

      case "projeto":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_projeto">Nome do Projeto *</Label>
              <Input
                id="nome_projeto"
                value={formData.nome_projeto || ""}
                onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado || ""}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipio">Município</Label>
                <Input
                  id="municipio"
                  value={formData.municipio || ""}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Projeto</Label>
              <RadioGroup
                value={formData.tipo_projeto || ""}
                onValueChange={(value) => setFormData({ ...formData, tipo_projeto: value })}
                className="grid grid-cols-2 gap-2"
              >
                {["REDD+", "ARR", "AR", "Agricultura Regenerativa", "Outros"].map((tipo) => (
                  <div key={tipo} className="flex items-center space-x-2 border rounded-lg p-2">
                    <RadioGroupItem value={tipo} id={`tipo-${tipo}`} />
                    <Label htmlFor={`tipo-${tipo}`} className="cursor-pointer text-sm">{tipo}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={formData.status || ""}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                className="grid grid-cols-2 gap-2"
              >
                {["Ideação", "Validação", "Certificação", "Emitindo Créditos", "Créditos Emitidos"].map((status) => (
                  <div key={status} className="flex items-center space-x-2 border rounded-lg p-2">
                    <RadioGroupItem value={status} id={`status-${status}`} />
                    <Label htmlFor={`status-${status}`} className="cursor-pointer text-sm">{status}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emissoes_evitadas_ano">Emissões Evitadas (tCO₂e/ano)</Label>
              <Input
                id="emissoes_evitadas_ano"
                type="number"
                value={formData.emissoes_evitadas_ano || ""}
                onChange={(e) => setFormData({ ...formData, emissoes_evitadas_ano: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return <p>Tipo não suportado</p>;
    }
  };

  const getTitle = () => {
    const action = editData ? "Editar" : "Criar";
    switch (agentType) {
      case "proprietario": return `${action} Área`;
      case "investidor": return `${action} Requisição`;
      case "comprador": return `${action} Demanda ESG`;
      case "certificadora": return `${action} Serviço`;
      case "projeto": return `${action} Projeto`;
      default: return `${action} Subperfil`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderForm()}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}