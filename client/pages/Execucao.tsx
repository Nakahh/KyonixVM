import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
} from "lucide-react";

const Execucao = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [cycleCount, setCycleCount] = useState(42);
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCycleCount((c) => c + 1);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const simulatedLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 5000),
      level: "info",
      message: "Ciclo 42 iniciado",
      details: "Verificando estratégias ativas",
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 4000),
      level: "info",
      message: "Estratégia A processando",
      details: "Limite de concorrência: 2/5",
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 3000),
      level: "success",
      message: "Job criado com sucesso",
      details: "instance-prod-001-1234567890",
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 2000),
      level: "success",
      message: "Job criado com sucesso",
      details: "instance-prod-002-1234567891",
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000),
      level: "info",
      message: "Estratégia B processando",
      details: "Limite de concorrência: 1/5",
    },
    {
      id: 6,
      timestamp: new Date(Date.now()),
      level: "warning",
      message: "Capacidade excedida na região",
      details: "sa-saopaulo-1 - Retry agendado",
    },
  ];

  const stats = [
    { label: "Ciclos Executados", value: cycleCount, icon: Activity },
    {
      label: "Instâncias Criadas",
      value: 156,
      icon: CheckCircle2,
    },
    {
      label: "Erros Recuperados",
      value: 8,
      icon: AlertCircle,
    },
    { label: "Próximo Ciclo em", value: `${countdown}s`, icon: Clock },
  ];

  return (
    <Layout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Execução em Tempo Real
            </h1>
            <p className="mt-1 text-muted-foreground">
              Monitoramento contínuo dos ciclos de provisionamento
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isRunning ? "default" : "outline"}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Retomar
                </>
              )}
            </Button>
            <Button variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Executar Agora
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cycle Timer */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-card to-muted bg-card p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Próximo Ciclo</p>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="4"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeDasharray={`${(countdown / 20) * 376.99} 376.99`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 1s linear" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {countdown}
                      </div>
                      <div className="text-xs text-muted-foreground">segundos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button size="lg">Executar Agora</Button>
              <Button size="lg" variant="outline">
                Parar Execução
              </Button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Log de Execução
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {simulatedLogs.map((log) => {
              const bgColor =
                log.level === "success"
                  ? "bg-green-500/10"
                  : log.level === "warning"
                    ? "bg-yellow-500/10"
                    : log.level === "error"
                      ? "bg-red-500/10"
                      : "bg-blue-500/10";

              const borderColor =
                log.level === "success"
                  ? "border-green-500/30"
                  : log.level === "warning"
                    ? "border-yellow-500/30"
                    : log.level === "error"
                      ? "border-red-500/30"
                      : "border-blue-500/30";

              const textColor =
                log.level === "success"
                  ? "text-green-400"
                  : log.level === "warning"
                    ? "text-yellow-400"
                    : log.level === "error"
                      ? "text-red-400"
                      : "text-blue-400";

              return (
                <div
                  key={log.id}
                  className={`rounded border ${borderColor} ${bgColor} p-3 animate-slide-in-right`}
                >
                  <div className="flex gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold uppercase ${textColor}`}
                        >
                          {log.level}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">
                        {log.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.details}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Concurrent Attempts */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Tentativas Simultâneas
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Estratégia A", region: "São Paulo", status: "Criando" },
              {
                name: "Estratégia B",
                region: "Phoenix",
                status: "Aguardando",
              },
              {
                name: "Estratégia C",
                region: "Frankfurt",
                status: "Retry",
              },
            ].map((attempt, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-muted bg-muted/30 p-4"
              >
                <div className="space-y-2">
                  <p className="font-medium text-foreground">{attempt.name}</p>
                  <p className="text-sm text-muted-foreground">{attempt.region}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        attempt.status === "Criando"
                          ? "bg-blue-500 animate-pulse"
                          : attempt.status === "Aguardando"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {attempt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Execucao;
