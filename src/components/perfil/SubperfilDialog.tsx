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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: string;
  profileId: string;
  editData?: any;
  onSaved: () => void;
}

const BUSCA_PLATAFORMA_OPTIONS = [
  "Parcerias",
  "Financiamento",
  "Desenvolver projeto",
  "Vender créditos",
  "Comprar créditos",
  "Consultoria",
  "Auditoria",
  "Outro"
];

const CONTATO_OPTIONS = ["E-mail", "WhatsApp", "Plataforma (chat interno)"];

const BIOMAS = ["Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal"];

export default function SubperfilDialog({ open, onOpenChange, agentType, profileId, editData, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  
  const getInitialData = () => {
    const commonFields = {
      busca_plataforma: [],
      contato_preferido: "",
      mostrar_nome_publico: true,
      mostrar_telefone: true,
      mostrar_localizacao_precisa: false,
      permitir_mensagens: true,
    };

    switch (agentType) {
      case "proprietario":
        return { 
          nome_area: "", hectares: "", tipo_uso: "", tipo_projeto_desejado: [], 
          bioma: "", documentacao_fundiaria: false, interesse_projeto: [],
          descricao: "", ...commonFields 
        };
      case "investidor":
        return { 
          nome_requisicao: "", tipo_projeto: "", volume_desejado: "", certificacao_exigida: "", 
          localizacao_preferencial: [], modalidade: [], perfil_investidor: "",
          interesse_principal: [], tipo_credito_desejado: [],
          descricao: "", ...commonFields 
        };
      case "comprador":
        return { 
          nome_demanda: "", volume_creditos: "", tipos_preferidos: [], setor_projeto: "", 
          ano_alvo: "", certificacao_exigida: "", descricao: "", ...commonFields 
        };
      case "certificadora":
        return { 
          nome_servico: "", tipo_auditoria: "", metodologia: "", escopo: "",
          padroes_oferecidos: [], metodologias_suportadas: [], requisitos_especificos: "",
          paises_atuacao: [], descricao: "", ...commonFields 
        };
      case "projeto":
        return { 
          nome_projeto: "", estado: "", municipio: "", tipo_projeto: "", status: "", 
          emissoes_evitadas_ano: "", prazo_projeto: "", investimento_total: "",
          padrao_certificacao: "", ano_inicio: "", creditos_disponiveis: "", co_beneficios: [],
          descricao: "", ...commonFields 
        };
      case "desenvolvedor":
        return {
          nome_projeto: "", tipos_projeto: [], anos_experiencia: "", numero_projetos: "",
          certificadoras_parceiras: [], tamanho_area_ideal: "", descricao: "", ...commonFields
        };
      case "auditor":
        return {
          nome_servico: "", padroes_acreditados: [], tipos_projeto_aceitos: [],
          tempo_medio_verificacao: "", descricao: "", ...commonFields
        };
      case "financeira":
        return {
          nome_produto: "", tipos_financiamento: [], ticket_medio: "",
          exigencias_garantia: "", modalidades: [], descricao: "", ...commonFields
        };
      case "advogado":
        return {
          nome_servico: "", areas_atuacao: [], experiencia_carbono: false,
          clientes_atendidos: [], descricao: "", ...commonFields
        };
      default:
        return { ...commonFields };
    }
  };

  const [formData, setFormData] = useState<any>(editData || getInitialData());

  useEffect(() => {
    if (open) {
      setFormData(editData || getInitialData());
    }
  }, [open, editData, agentType]);

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
      desenvolvedor: "desenvolvedor_subperfis",
      auditor: "auditor_subperfis",
      financeira: "financeira_subperfis",
      advogado: "advogado_subperfis",
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

  const renderCommonFields = () => (
    <>
      <Separator className="my-4" />
      <h4 className="font-medium text-sm mb-3">Preferências de Conexão</h4>
      
      <div className="space-y-3">
        <Label>O que busca na plataforma?</Label>
        <div className="grid grid-cols-2 gap-2">
          {BUSCA_PLATAFORMA_OPTIONS.map((option) => (
            <div
              key={option}
              onClick={() => handleArrayToggle("busca_plataforma", option)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.busca_plataforma || []).includes(option) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.busca_plataforma || []).includes(option)} />
              <span>{option}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Forma de contato preferida</Label>
        <RadioGroup
          value={formData.contato_preferido || ""}
          onValueChange={(value) => setFormData({ ...formData, contato_preferido: value })}
          className="flex flex-wrap gap-2"
        >
          {CONTATO_OPTIONS.map((option) => (
            <div key={option} className="flex items-center space-x-2 border rounded-lg p-2">
              <RadioGroupItem value={option} id={`contato-${option}`} />
              <Label htmlFor={`contato-${option}`} className="cursor-pointer text-sm">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator className="my-4" />
      <h4 className="font-medium text-sm mb-3">Configurações de Privacidade</h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="mostrar_nome">Mostrar nome publicamente</Label>
          <Switch
            id="mostrar_nome"
            checked={formData.mostrar_nome_publico}
            onCheckedChange={(checked) => setFormData({ ...formData, mostrar_nome_publico: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="mostrar_telefone">Mostrar telefone</Label>
          <Switch
            id="mostrar_telefone"
            checked={formData.mostrar_telefone}
            onCheckedChange={(checked) => setFormData({ ...formData, mostrar_telefone: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="mostrar_local">Mostrar localização precisa</Label>
          <Switch
            id="mostrar_local"
            checked={formData.mostrar_localizacao_precisa}
            onCheckedChange={(checked) => setFormData({ ...formData, mostrar_localizacao_precisa: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="permitir_msg">Permitir mensagens</Label>
          <Switch
            id="permitir_msg"
            checked={formData.permitir_mensagens}
            onCheckedChange={(checked) => setFormData({ ...formData, permitir_mensagens: checked })}
          />
        </div>
      </div>
    </>
  );

  const renderProprietarioForm = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Informações da Área</h4>
      <div className="space-y-2">
        <Label htmlFor="nome_area">Nome da Área *</Label>
        <Input
          id="nome_area"
          value={formData.nome_area || ""}
          onChange={(e) => setFormData({ ...formData, nome_area: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hectares">Tamanho (ha)</Label>
          <Input
            id="hectares"
            type="number"
            value={formData.hectares || ""}
            onChange={(e) => setFormData({ ...formData, hectares: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Bioma</Label>
          <RadioGroup
            value={formData.bioma || ""}
            onValueChange={(value) => setFormData({ ...formData, bioma: value })}
            className="grid grid-cols-2 gap-1"
          >
            {BIOMAS.map((bioma) => (
              <div key={bioma} className="flex items-center space-x-2 border rounded-lg p-2">
                <RadioGroupItem value={bioma} id={`bioma-${bioma}`} />
                <Label htmlFor={`bioma-${bioma}`} className="cursor-pointer text-xs">{bioma}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="doc_fundiaria"
          checked={formData.documentacao_fundiaria || false}
          onCheckedChange={(checked) => setFormData({ ...formData, documentacao_fundiaria: checked })}
        />
        <Label htmlFor="doc_fundiaria">Possui documentação fundiária</Label>
      </div>

      <Separator className="my-2" />
      <h4 className="font-medium text-sm">Interesse no Projeto</h4>
      <div className="grid grid-cols-1 gap-2">
        {["Desenvolver projeto", "Vender créditos existentes", "Procurar parceiros / investidores"].map((interesse) => (
          <div
            key={interesse}
            onClick={() => handleArrayToggle("interesse_projeto", interesse)}
            className={cn(
              "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
              (formData.interesse_projeto || []).includes(interesse) ? "border-primary bg-primary/5" : ""
            )}
          >
            <Checkbox checked={(formData.interesse_projeto || []).includes(interesse)} />
            <span>{interesse}</span>
          </div>
        ))}
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

  const renderDesenvolvedorForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome_projeto">Nome do Projeto/Serviço *</Label>
        <Input
          id="nome_projeto"
          value={formData.nome_projeto || ""}
          onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipos de projeto que desenvolve</Label>
        <div className="grid grid-cols-2 gap-2">
          {["REDD+", "ARR (reflorestamento)", "IFM", "Agricultura regenerativa", "Energia", "Resíduos", "Outros"].map((tipo) => (
            <div
              key={tipo}
              onClick={() => handleArrayToggle("tipos_projeto", tipo)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.tipos_projeto || []).includes(tipo) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.tipos_projeto || []).includes(tipo)} />
              <span>{tipo}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="anos_experiencia">Anos de experiência</Label>
          <Input
            id="anos_experiencia"
            type="number"
            value={formData.anos_experiencia || ""}
            onChange={(e) => setFormData({ ...formData, anos_experiencia: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero_projetos">Nº projetos desenvolvidos</Label>
          <Input
            id="numero_projetos"
            type="number"
            value={formData.numero_projetos || ""}
            onChange={(e) => setFormData({ ...formData, numero_projetos: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tamanho_area_ideal">Tamanho de área ideal</Label>
        <Input
          id="tamanho_area_ideal"
          placeholder="Ex: Acima de 1000 ha"
          value={formData.tamanho_area_ideal || ""}
          onChange={(e) => setFormData({ ...formData, tamanho_area_ideal: e.target.value })}
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

  const renderCertificadoraForm = () => (
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
        <Label>Padrões oferecidos</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Verra (VCS)", "Gold Standard", "Plan Vivo", "Cercarbono", "ACR", "Outros"].map((padrao) => (
            <div
              key={padrao}
              onClick={() => handleArrayToggle("padroes_oferecidos", padrao)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.padroes_oferecidos || []).includes(padrao) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.padroes_oferecidos || []).includes(padrao)} />
              <span>{padrao}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metodologia">Metodologias suportadas</Label>
        <Input
          id="metodologia"
          placeholder="Ex: VM0007, AR-AM0014"
          value={formData.metodologia || ""}
          onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requisitos_especificos">Requisitos específicos</Label>
        <Textarea
          id="requisitos_especificos"
          value={formData.requisitos_especificos || ""}
          onChange={(e) => setFormData({ ...formData, requisitos_especificos: e.target.value })}
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

  const renderAuditorForm = () => (
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
        <Label>Padrões para os quais é acreditado</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Verra (VCS)", "Gold Standard", "Plan Vivo", "Cercarbono", "ACR", "CDM", "Outros"].map((padrao) => (
            <div
              key={padrao}
              onClick={() => handleArrayToggle("padroes_acreditados", padrao)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.padroes_acreditados || []).includes(padrao) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.padroes_acreditados || []).includes(padrao)} />
              <span>{padrao}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipos de projeto aceitos</Label>
        <div className="grid grid-cols-2 gap-2">
          {["REDD+", "ARR", "IFM", "Energia", "Resíduos", "Agricultura"].map((tipo) => (
            <div
              key={tipo}
              onClick={() => handleArrayToggle("tipos_projeto_aceitos", tipo)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.tipos_projeto_aceitos || []).includes(tipo) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.tipos_projeto_aceitos || []).includes(tipo)} />
              <span>{tipo}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tempo_medio">Tempo médio de verificação</Label>
        <Input
          id="tempo_medio"
          placeholder="Ex: 3-6 meses"
          value={formData.tempo_medio_verificacao || ""}
          onChange={(e) => setFormData({ ...formData, tempo_medio_verificacao: e.target.value })}
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

  const renderInvestidorForm = () => (
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
        <Label>Perfil do Investidor</Label>
        <RadioGroup
          value={formData.perfil_investidor || ""}
          onValueChange={(value) => setFormData({ ...formData, perfil_investidor: value })}
          className="grid grid-cols-3 gap-2"
        >
          {["Corporativo", "Fundo", "Broker"].map((perfil) => (
            <div key={perfil} className="flex items-center space-x-2 border rounded-lg p-2">
              <RadioGroupItem value={perfil} id={`perfil-${perfil}`} />
              <Label htmlFor={`perfil-${perfil}`} className="cursor-pointer text-sm">{perfil}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Interesse Principal</Label>
        <div className="grid grid-cols-1 gap-2">
          {["Compra de créditos", "Pré-financiamento", "Equity em projetos"].map((interesse) => (
            <div
              key={interesse}
              onClick={() => handleArrayToggle("interesse_principal", interesse)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.interesse_principal || []).includes(interesse) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.interesse_principal || []).includes(interesse)} />
              <span>{interesse}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="volume_desejado">Volume Desejado (tCO₂/ano)</Label>
        <Input
          id="volume_desejado"
          type="number"
          value={formData.volume_desejado || ""}
          onChange={(e) => setFormData({ ...formData, volume_desejado: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de crédito desejado</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Removal", "Avoidance", "Natureza", "Energia"].map((tipo) => (
            <div
              key={tipo}
              onClick={() => handleArrayToggle("tipo_credito_desejado", tipo)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.tipo_credito_desejado || []).includes(tipo) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.tipo_credito_desejado || []).includes(tipo)} />
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

  const renderFinanceiraForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome_produto">Nome do Produto *</Label>
        <Input
          id="nome_produto"
          value={formData.nome_produto || ""}
          onChange={(e) => setFormData({ ...formData, nome_produto: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipos de financiamento</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Crédito rural", "Project finance", "Antecipação de recebíveis", "Equity", "Outros"].map((tipo) => (
            <div
              key={tipo}
              onClick={() => handleArrayToggle("tipos_financiamento", tipo)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.tipos_financiamento || []).includes(tipo) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.tipos_financiamento || []).includes(tipo)} />
              <span>{tipo}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticket_medio">Ticket médio (R$)</Label>
        <Input
          id="ticket_medio"
          type="number"
          value={formData.ticket_medio || ""}
          onChange={(e) => setFormData({ ...formData, ticket_medio: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exigencias_garantia">Exigências de garantia</Label>
        <Textarea
          id="exigencias_garantia"
          value={formData.exigencias_garantia || ""}
          onChange={(e) => setFormData({ ...formData, exigencias_garantia: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Modalidades</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Dívida", "CPR verde", "Antecipação", "Outro"].map((mod) => (
            <div
              key={mod}
              onClick={() => handleArrayToggle("modalidades", mod)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.modalidades || []).includes(mod) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.modalidades || []).includes(mod)} />
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

  const renderAdvogadoForm = () => (
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
        <Label>Áreas de atuação</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Contratos", "Ambiental", "Societário", "Tributário", "Regulatório", "Due diligence"].map((area) => (
            <div
              key={area}
              onClick={() => handleArrayToggle("areas_atuacao", area)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.areas_atuacao || []).includes(area) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.areas_atuacao || []).includes(area)} />
              <span>{area}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="experiencia_carbono"
          checked={formData.experiencia_carbono || false}
          onCheckedChange={(checked) => setFormData({ ...formData, experiencia_carbono: checked })}
        />
        <Label htmlFor="experiencia_carbono">Experiência em contratos de carbono</Label>
      </div>

      <div className="space-y-2">
        <Label>Atende</Label>
        <div className="grid grid-cols-3 gap-2">
          {["Proprietários", "Desenvolvedores", "Investidores"].map((cliente) => (
            <div
              key={cliente}
              onClick={() => handleArrayToggle("clientes_atendidos", cliente)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.clientes_atendidos || []).includes(cliente) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.clientes_atendidos || []).includes(cliente)} />
              <span>{cliente}</span>
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

  const renderCompradorForm = () => (
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
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="setor_projeto">Setor</Label>
          <Input
            id="setor_projeto"
            value={formData.setor_projeto || ""}
            onChange={(e) => setFormData({ ...formData, setor_projeto: e.target.value })}
          />
        </div>
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

  const renderProjetoForm = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Identificação</h4>
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
          {["REDD+", "ARR", "AR", "Agricultura Regenerativa", "Energia", "Outros"].map((tipo) => (
            <div key={tipo} className="flex items-center space-x-2 border rounded-lg p-2">
              <RadioGroupItem value={tipo} id={`tipo-${tipo}`} />
              <Label htmlFor={`tipo-${tipo}`} className="cursor-pointer text-sm">{tipo}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="padrao_certificacao">Padrão de certificação</Label>
          <Input
            id="padrao_certificacao"
            placeholder="Ex: Verra VCS"
            value={formData.padrao_certificacao || ""}
            onChange={(e) => setFormData({ ...formData, padrao_certificacao: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ano_inicio">Ano de início</Label>
          <Input
            id="ano_inicio"
            type="number"
            value={formData.ano_inicio || ""}
            onChange={(e) => setFormData({ ...formData, ano_inicio: e.target.value })}
          />
        </div>
      </div>

      <Separator className="my-2" />
      <h4 className="font-medium text-sm">Informação de Mercado</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="creditos_disponiveis">Créditos disponíveis</Label>
          <Input
            id="creditos_disponiveis"
            type="number"
            value={formData.creditos_disponiveis || ""}
            onChange={(e) => setFormData({ ...formData, creditos_disponiveis: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emissoes_evitadas_ano">Emissões evitadas/ano</Label>
          <Input
            id="emissoes_evitadas_ano"
            type="number"
            value={formData.emissoes_evitadas_ano || ""}
            onChange={(e) => setFormData({ ...formData, emissoes_evitadas_ano: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Co-benefícios (ODS)</Label>
        <div className="grid grid-cols-3 gap-2">
          {["ODS 1", "ODS 2", "ODS 3", "ODS 13", "ODS 15", "Outros"].map((ods) => (
            <div
              key={ods}
              onClick={() => handleArrayToggle("co_beneficios", ods)}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-2 cursor-pointer text-sm",
                (formData.co_beneficios || []).includes(ods) ? "border-primary bg-primary/5" : ""
              )}
            >
              <Checkbox checked={(formData.co_beneficios || []).includes(ods)} />
              <span>{ods}</span>
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

  const renderForm = () => {
    switch (agentType) {
      case "proprietario": return renderProprietarioForm();
      case "desenvolvedor": return renderDesenvolvedorForm();
      case "certificadora": return renderCertificadoraForm();
      case "auditor": return renderAuditorForm();
      case "investidor": return renderInvestidorForm();
      case "financeira": return renderFinanceiraForm();
      case "advogado": return renderAdvogadoForm();
      case "comprador": return renderCompradorForm();
      case "projeto": return renderProjetoForm();
      default: return <p className="text-muted-foreground">Tipo de agente não suportado para subperfis.</p>;
    }
  };

  const getTitle = () => {
    const action = editData ? "Editar" : "Adicionar";
    const typeLabels: Record<string, string> = {
      proprietario: "Área",
      investidor: "Requisição",
      comprador: "Demanda",
      certificadora: "Serviço",
      projeto: "Projeto",
      desenvolvedor: "Projeto",
      auditor: "Serviço",
      financeira: "Produto",
      advogado: "Serviço",
    };
    return `${action} ${typeLabels[agentType] || "Subperfil"}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderForm()}
            {renderCommonFields()}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
