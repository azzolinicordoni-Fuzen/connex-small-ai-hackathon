import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ProjectStage, STAGE_CONFIG, STATUS_CONFIG } from '@/types/project';

interface ProjectChartsProps {
  stages: ProjectStage[];
}

const COLORS = {
  pendente: '#9CA3AF',
  em_andamento: '#F59E0B',
  concluida: '#10B981',
};

export default function ProjectCharts({ stages }: ProjectChartsProps) {
  // Progress by stage
  const progressData = stages.map(stage => ({
    name: STAGE_CONFIG[stage.stage].label,
    progresso: stage.progress_percentage,
    stage: stage.stage,
  }));

  // Status distribution
  const statusCounts = stages.reduce((acc, stage) => {
    acc[stage.status] = (acc[stage.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
    value: count,
    color: COLORS[status as keyof typeof COLORS] || '#666',
  }));

  // KPIs
  const completedCount = stages.filter(s => s.status === 'concluida').length;
  const inProgressCount = stages.filter(s => s.status === 'em_andamento').length;
  const pendingCount = stages.filter(s => s.status === 'pendente').length;
  const overallProgress = stages.length > 0 
    ? Math.round(stages.reduce((sum, s) => sum + s.progress_percentage, 0) / stages.length)
    : 0;

  const overdueStages = stages.filter(s => {
    if (!s.deadline || s.status === 'concluida') return false;
    return new Date(s.deadline) < new Date();
  }).length;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Etapas Concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${overdueStages > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overdueStages}
            </div>
            <p className="text-xs text-muted-foreground">Prazos Vencidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Progress Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progresso por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Progresso']}
                />
                <Bar 
                  dataKey="progresso" 
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Etapas']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
