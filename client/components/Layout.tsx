import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Zap,
  Activity,
  Settings,
  FileText,
  BarChart3,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Criar Estratégia",
      href: "/estrategia",
      icon: Plus,
    },
    {
      label: "Execução em Tempo Real",
      href: "/execucao",
      icon: Activity,
    },
    {
      label: "Instâncias",
      href: "/instancias",
      icon: Zap,
    },
    {
      label: "Logs",
      href: "/logs",
      icon: FileText,
    },
    {
      label: "Monitoramento",
      href: "/monitoramento",
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar">
        <div className="flex items-center gap-3 border-b border-sidebar-border p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Settings className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-sidebar-foreground">
              OCI Auto
            </h1>
            <p className="text-xs text-sidebar-accent-foreground">Provisioner</p>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 w-64 border-t border-sidebar-border p-4">
          <Button variant="outline" className="w-full" size="sm">
            Configurações
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-border bg-card px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              OCI Auto Provisioner
            </h2>
            <div className="text-sm text-muted-foreground">
              Status: <span className="font-semibold text-primary">Ativo</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
