import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  MapPin, 
  UserPlus, 
  MessageSquare,
  TreePine,
  HardHat,
  Briefcase,
  Award,
  Landmark,
  FolderOpen,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const agentTypeIcons: Record<string, any> = {
  proprietario: TreePine,
  engenheiro: HardHat,
  desenvolvedor: Briefcase,
  certificadora: Award,
  investidor: Landmark,
  projeto: FolderOpen,
  outro: Users,
};

const agentTypeLabels: Record<string, string> = {
  proprietario: "Proprietário",
  engenheiro: "Engenheiro",
  desenvolvedor: "Desenvolvedor",
  certificadora: "Certificadora",
  investidor: "Investidor",
  projeto: "Projeto",
  outro: "Outro",
};

const filters = [
  { id: "todos", label: "Todos" },
  { id: "proprietario", label: "Proprietários" },
  { id: "engenheiro", label: "Engenheiros" },
  { id: "desenvolvedor", label: "Desenvolvedores" },
  { id: "certificadora", label: "Certificadoras" },
  { id: "investidor", label: "Investidores" },
];

const mockAgents = [
  {
    id: 1,
    name: "João Silva",
    type: "proprietario",
    location: "Mato Grosso",
    bio: "Proprietário de 5.000 hectares com interesse em projetos de carbono e reflorestamento.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    connections: 234,
    projects: 3,
  },
  {
    id: 2,
    name: "Maria Santos",
    type: "engenheiro",
    location: "São Paulo",
    bio: "Engenheira florestal com 15 anos de experiência em projetos de restauração.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    connections: 567,
    projects: 12,
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    type: "desenvolvedor",
    location: "Goiás",
    bio: "Desenvolvedor de projetos de crédito de carbono com mais de 50 projetos implementados.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    connections: 890,
    projects: 52,
  },
  {
    id: 4,
    name: "Ana Costa",
    type: "certificadora",
    location: "Paraná",
    bio: "Representante da Verra Brasil, especialista em certificação de projetos VCS.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    connections: 1234,
    projects: 89,
  },
  {
    id: 5,
    name: "Ricardo Lima",
    type: "investidor",
    location: "Rio de Janeiro",
    bio: "Gestor de fundo de investimento focado em agricultura sustentável e créditos de carbono.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    connections: 456,
    projects: 8,
  },
  {
    id: 6,
    name: "Fernanda Alves",
    type: "proprietario",
    location: "Tocantins",
    bio: "Proprietária de fazenda com área de reserva legal disponível para projetos ambientais.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    connections: 123,
    projects: 1,
  },
];

export default function Conexoes() {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesFilter = activeFilter === "todos" || agent.type === activeFilter;
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleConnect = (name: string) => {
    toast.success(`Solicitação de conexão enviada para ${name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Descobrir Conexões
            </h1>
            <p className="text-muted-foreground text-lg">
              Encontre agentes relevantes para expandir sua rede e fazer negócios
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, localização ou área de atuação..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="whitespace-nowrap"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const TypeIcon = agentTypeIcons[agent.type];
              return (
                <Card key={agent.id} hover className="group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar size="lg">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>{agent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {agent.location}
                        </div>
                      </div>
                      <Badge variant="emerald" className="flex items-center gap-1">
                        <TypeIcon className="w-3 h-3" />
                        {agentTypeLabels[agent.type]}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {agent.bio}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{agent.connections} conexões</span>
                      <span>{agent.projects} projetos</span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => handleConnect(agent.name)}
                      >
                        <UserPlus className="w-4 h-4" />
                        Conectar
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum agente encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar seus filtros ou termos de busca
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
