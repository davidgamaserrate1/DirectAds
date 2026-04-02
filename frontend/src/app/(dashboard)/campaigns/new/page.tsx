"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Send,
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useClientTypes } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { types: clientTypes } = useClientTypes();
  const { create, send, generateContent } = useCampaigns();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [clientType, setClientType] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendAfterSave, setSendAfterSave] = useState(false);

  const handleGenerate = async () => {
    if (!clientType || !objective) {
      toast("Preencha o segmento do cliente e o objetivo primeiro", "error");
      return;
    }
    setGenerating(true);
    try {
      const generatedContent = await generateContent(clientType, objective);
      setContent(generatedContent);
      toast("Conteúdo gerado com IA!");
    } catch {
      toast("Erro ao gerar conteúdo com IA", "error");
    }
    setGenerating(false);
  };

  const handleSave = async (shouldSend = false) => {
    if (!name || !clientType || !objective || !content) {
      toast("Preencha todos os campos", "error");
      return;
    }
    setSaving(true);
    setSendAfterSave(shouldSend);
    try {
      const campaign = await create({ name, clientType, objective, content });

      if (shouldSend) {
        try {
          await send(campaign.id);
          toast("Campanha criada e enviada com sucesso!");
        } catch {
          toast("Campanha criada, mas falha ao enviar", "error");
        }
      } else {
        toast("Campanha criada como rascunho!");
      }

      router.push("/campaigns");
    } catch {
      toast("Erro ao criar campanha", "error");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Nova Campanha
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Crie uma campanha e gere conteúdo com IA
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Nome da Campanha
          </label>
          <Input
            placeholder="Ex: Black Friday Fitness"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Segmento do cliente */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Segmento do Cliente
          </label>
          <select
            value={clientType}
            onChange={(e) => setClientType(e.target.value)}
            className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{ padding: "12px 16px", borderRadius: "var(--radius-md)" }}
          >
            <option value="" disabled>
              Selecione um segmento
            </option>
            {clientTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Objetivo */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Objetivo
          </label>
          <Textarea
            placeholder="Descreva o objetivo da campanha..."
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>

        {/* Divider + AI button */}
        <div
          className="border border-[var(--color-border)] p-4"
          style={{
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-surface-2)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Conteúdo do E-mail
            </label>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Gerando..." : "Gerar com IA"}
            </Button>
          </div>

          <Textarea
            placeholder="O conteúdo será gerado pela IA ou você pode escrever manualmente..."
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1"
          >
            {saving && !sendAfterSave ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Salvar Rascunho
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex-1"
          >
            {saving && sendAfterSave ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Salvar e Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
