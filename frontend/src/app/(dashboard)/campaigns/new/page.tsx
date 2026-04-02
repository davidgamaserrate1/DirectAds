"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Send,
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useClientTypes } from "@/hooks/useClients";
import { campaignSchema, CampaignFormData } from "@/lib/validators";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { types: clientTypes } = useClientTypes();
  const { create, send, generateContent } = useCampaigns();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { name: "", objective: "", clientType: "", content: "" },
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendAfterSave, setSendAfterSave] = useState(false);

  const clientType = watch("clientType");
  const objective = watch("objective");

  const handleGenerate = async () => {
    if (!clientType || !objective) {
      toast("Preencha o segmento do cliente e o objetivo primeiro", "error");
      return;
    }
    setGenerating(true);
    try {
      const generatedContent = await generateContent(clientType, objective);
      setValue("content", generatedContent, { shouldValidate: true });
      toast("Conteúdo gerado com IA!");
    } catch (error) {
      toast(getErrorMessage(error, "Erro ao gerar conteúdo com IA"), "error");
    }
    setGenerating(false);
  };

  const onSubmit = async (data: CampaignFormData, shouldSend = false) => {
    setSaving(true);
    setSendAfterSave(shouldSend);
    try {
      const campaign = await create(data);

      if (shouldSend) {
        try {
          await send(campaign.id);
          toast("Campanha criada e enviada com sucesso!");
        } catch (sendError) {
          toast(getErrorMessage(sendError, "Campanha criada, mas falha ao enviar"), "error");
        }
      } else {
        toast("Campanha criada como rascunho!");
      }

      router.push("/campaigns");
    } catch (error) {
      toast(getErrorMessage(error, "Erro ao criar campanha"), "error");
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
      <form className="space-y-5">
        {/* Nome */}
        <Input
          label="Nome da Campanha"
          placeholder="Ex: Black Friday Fitness"
          error={errors.name?.message}
          {...register("name")}
        />

        {/* Segmento do cliente */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            Segmento do Cliente
          </label>
          <select
            {...register("clientType")}
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
          {errors.clientType?.message && (
            <span className="text-xs text-[var(--color-error)] mt-1 block">{errors.clientType.message}</span>
          )}
        </div>

        {/* Objetivo */}
        <Textarea
          label="Objetivo"
          placeholder="Descreva o objetivo da campanha..."
          rows={3}
          error={errors.objective?.message}
          {...register("objective")}
        />

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
            error={errors.content?.message}
            {...register("content")}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="secondary"
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={saving}
            className="flex-1"
          >
            {saving && !sendAfterSave ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Salvar Rascunho
          </Button>
          <Button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, true))}
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
      </form>
    </div>
  );
}
