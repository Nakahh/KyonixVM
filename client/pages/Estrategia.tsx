import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Link } from "react-router-dom";

const Estrategia = () => {
  const [targets, setTargets] = useState([
    { id: 1, region: "", availabilityDomain: "", subnet: "" },
  ]);

  const addTarget = () => {
    setTargets([
      ...targets,
      {
        id: Math.max(...targets.map((t) => t.id), 0) + 1,
        region: "",
        availabilityDomain: "",
        subnet: "",
      },
    ]);
  };

  const removeTarget = (id: number) => {
    if (targets.length > 1) {
      setTargets(targets.filter((t) => t.id !== id));
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Criar Estratégia
            </h1>
            <p className="mt-1 text-muted-foreground">
              Configure uma nova estratégia de provisionamento
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Informações Básicas
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">
                  Nome da Estratégia
                </Label>
                <Input
                  id="name"
                  placeholder="ex: Produção - Oracle Cloud"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o propósito desta estratégia..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="imageType" className="text-foreground">
                    Imagem (OS)
                  </Label>
                  <Select>
                    <SelectTrigger id="imageType" className="mt-2">
                      <SelectValue placeholder="Selecione a imagem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ubuntu22">Ubuntu 22.04 LTS</SelectItem>
                      <SelectItem value="ubuntu20">Ubuntu 20.04 LTS</SelectItem>
                      <SelectItem value="centos8">CentOS 8</SelectItem>
                      <SelectItem value="debian11">Debian 11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shape" className="text-foreground">
                    Shape (Tipo de Instância)
                  </Label>
                  <Select>
                    <SelectTrigger id="shape" className="mt-2">
                      <SelectValue placeholder="Selecione o shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard1">
                        VM.Standard3.Flex (2 OCPUs)
                      </SelectItem>
                      <SelectItem value="standard2">
                        VM.Standard3.Flex (4 OCPUs)
                      </SelectItem>
                      <SelectItem value="compute1">
                        VM.Compute3.Flex (2 OCPUs)
                      </SelectItem>
                      <SelectItem value="memory1">
                        VM.Memory3.Flex (8 OCPUs)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Configuração
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="concurrency" className="text-foreground">
                    Concorrência Máxima
                  </Label>
                  <Input
                    id="concurrency"
                    type="number"
                    placeholder="5"
                    className="mt-2"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <Label htmlFor="interval" className="text-foreground">
                    Intervalo de Execução (segundos)
                  </Label>
                  <Input
                    id="interval"
                    type="number"
                    placeholder="20"
                    className="mt-2"
                    min="10"
                    value={20}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="maxRetries" className="text-foreground">
                    Máximo de Tentativas
                  </Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    placeholder="3"
                    className="mt-2"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="targetInstances" className="text-foreground">
                    Número de Instâncias a Criar
                  </Label>
                  <Input
                    id="targetInstances"
                    type="number"
                    placeholder="10"
                    className="mt-2"
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="timeout" className="text-foreground">
                    Timeout por Tentativa (segundos)
                  </Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="300"
                    className="mt-2"
                    min="30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Targets */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Alvos de Provisionamento
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={addTarget}
                className="ml-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Alvo
              </Button>
            </div>

            <div className="space-y-6">
              {targets.map((target) => (
                <div
                  key={target.id}
                  className="space-y-4 rounded-lg border border-muted bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">
                      Alvo {target.id}
                    </h3>
                    {targets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTarget(target.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-foreground">
                        Região
                      </Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione a região" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sa-saopaulo-1">
                            São Paulo
                          </SelectItem>
                          <SelectItem value="us-phoenix-1">Phoenix</SelectItem>
                          <SelectItem value="us-ashburn-1">Ashburn</SelectItem>
                          <SelectItem value="eu-frankfurt-1">
                            Frankfurt
                          </SelectItem>
                          <SelectItem value="ap-singapore-1">
                            Singapore
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-foreground">
                        Domínio de Disponibilidade
                      </Label>
                      <Input
                        placeholder="ex: fDEo:PHX-AD-1"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-foreground">
                        Subnet OCID
                      </Label>
                      <Input
                        placeholder="ocid1.subnet.oc1..."
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Estratégia
            </Button>
            <Link to="/">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Estrategia;
