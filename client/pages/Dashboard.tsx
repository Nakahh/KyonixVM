import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  Plus,
} from "lucide-react";

const Dashboard = () => {
  // Mock data for charts
  const timelineData = [
    { time: "00:00", sucesso: 12, erro: 3, pendente: 2 },
    { time: "04:00", sucesso: 18, erro: 2, pendente: 1 },
    { time: "08:00", sucesso: 24, erro: 4, pendente: 2 },
    { time: "12:00", sucesso: 31, erro: 5, pendente: 3 },
    { time: "16:00", sucesso: 28, erro: 3, pendente: 1 },
    { time: "20:00", sucesso: 35, erro: 2, pendente: 2 },
    { time: "24:00", sucesso: 42, erro: 3, pendente: 0 },
  ];

  const strategyData = [
    { name: "Estratégia A", value: 45 },
    { name: "Estratégia B", value: 30 },
    { name: "Estratégia C", value: 25 },
  ];

  const retryData = [
    { tentativa: "1º", sucesso: 42, falha: 8 },
    { tentativa: "2º", sucesso: 6, falha: 2 },
    { tentativa: "3º", sucesso: 2, falha: 0 },
  ];

  const colors = {
    chart1: "hsl(220, 90%, 56%)",
    chart2: "hsl(280, 85%, 65%)",
    chart3: "hsl(170, 85%, 45%)",
    chart4: "hsl(0, 84%, 60%)",
  };

  const StatCard = ({
    label,
    value,
    icon: Icon,
    trend,
    color,
  }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color: string;
  }) => (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className="mt-2 text-xs text-accent">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${color}`}>{Icon}</div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Monitoramento em tempo real do provisionamento
            </p>
          </div>
          <Link to="/estrategia">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Estratégia
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Instâncias Criadas"
            value={156}
            icon={
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            }
            trend="+12 hoje"
            color="bg-green-500/10"
          />
          <StatCard
            label="Tentativas Falhadas"
            value={18}
            icon={
              <AlertCircle className="h-6 w-6 text-red-400" />
            }
            trend="-2 desde ontem"
            color="bg-red-500/10"
          />
          <StatCard
            label="Em Processamento"
            value={7}
            icon={<Activity className="h-6 w-6 text-blue-400" />}
            trend="Ativo agora"
            color="bg-blue-500/10"
          />
          <StatCard
            label="Taxa de Sucesso"
            value="89.7%"
            icon={<TrendingUp className="h-6 w-6 text-purple-400" />}
            trend="+2.3% esta semana"
            color="bg-purple-500/10"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Timeline Chart */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Histórico de Criações (24h)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorSucesso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.chart3} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors.chart3} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="sucesso"
                  stroke={colors.chart3}
                  fillOpacity={1}
                  fill="url(#colorSucesso)"
                  name="Sucesso"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution by Strategy */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Distribuição por Estratégia
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={strategyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={colors.chart1} />
                  <Cell fill={colors.chart2} />
                  <Cell fill={colors.chart3} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Retry Analysis */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Taxa de Sucesso por Tentativa
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={retryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tentativa" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Bar dataKey="sucesso" stackId="a" fill={colors.chart3} name="Sucesso" />
                <Bar dataKey="falha" stackId="a" fill={colors.chart4} name="Falha" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ciclo de Execução */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Próximo Ciclo de Execução
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tempo restante:</span>
                <span className="text-2xl font-bold text-primary">18s</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: "90%" }}
                />
              </div>
              <div className="pt-4">
                <Button className="w-full" variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Executar Agora
                </Button>
              </div>
              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Estratégias Ativas:</span>
                  <span className="font-semibold text-foreground">3</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Concorrência Máxima:</span>
                  <span className="font-semibold text-foreground">5</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Última Execução:</span>
                  <span className="font-semibold text-foreground">há 2m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Atividades Recentes
          </h3>
          <div className="space-y-3">
            {[
              {
                time: "há 2 minutos",
                action: "Instância criada com sucesso",
                status: "success",
              },
              {
                time: "há 5 minutos",
                action: "Ciclo de provisionamento iniciado",
                status: "info",
              },
              {
                time: "há 8 minutos",
                action: "Falha na criação - capacidade excedida",
                status: "error",
              },
              {
                time: "há 12 minutos",
                action: "Retry automático agendado",
                status: "pending",
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 border-b border-border pb-3 last:border-0"
              >
                <div
                  className={`h-3 w-3 rounded-full ${
                    activity.status === "success"
                      ? "bg-green-500"
                      : activity.status === "error"
                        ? "bg-red-500"
                        : activity.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
