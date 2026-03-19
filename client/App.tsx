import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Estrategia from "./pages/Estrategia";
import Execucao from "./pages/Execucao";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/estrategia" element={<Estrategia />} />
          <Route path="/execucao" element={<Execucao />} />
          <Route
            path="/instancias"
            element={
              <Placeholder
                title="Instâncias"
                description="Página de gerenciamento de instâncias criadas. Continue desenvolvendo para visualizar, gerenciar e monitorar todas as suas instâncias OCI."
              />
            }
          />
          <Route
            path="/logs"
            element={
              <Placeholder
                title="Logs"
                description="Centro de logs completo com busca avançada e filtros. Continue desenvolvendo para analisar históricos detalhados de todas as operações."
              />
            }
          />
          <Route
            path="/monitoramento"
            element={
              <Placeholder
                title="Monitoramento"
                description="Painel de monitoramento avançado com métricas de CPU, memória, rede e mais. Continue desenvolvendo para análise profunda."
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
