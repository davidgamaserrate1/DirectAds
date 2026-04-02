"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Pencil,
  Loader2,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useCampaignDetail } from "@/hooks/useCampaignDetail";
import { campaignsService } from "@/services/campaigns.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { campaign, loading, refetch } = useCampaignDetail(id);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await campaignsService.send(id);
      toast(result.message || "Campanha enviada!");
      await refetch();
    } catch {
      toast("Erro ao enviar campanha", "error");
    }
    setSending(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl animate-pulse"
            style={{ backgroundColor: "var(--color-surface-2)" }}
          />
        ))}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-[var(--color-text-secondary)]">
          Campanha não encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                {campaign.name}
              </h1>
              <Badge
                variant={campaign.status === "SENT" ? "success" : "default"}
              >
                {campaign.status === "SENT" ? "Enviada" : "Rascunho"}
              </Badge>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {campaign.clientType}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {campaign.status === "DRAFT" && (
            <>
              <Button variant="secondary" onClick={() => router.push(`/campaigns/${id}/edit`)}>
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
              <Button onClick={handleSend} disabled={sending}>
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Calendar,
            label: "Criado em",
            value: formatDate(campaign.createdAt),
          },
          { icon: Users, label: "Segmento", value: campaign.clientType },
          {
            icon: CheckCircle,
            label: "Envios OK",
            value: campaign.logs?.filter((l) => l.status === "SENT").length ?? 0,
          },
          {
            icon: XCircle,
            label: "Erros",
            value: campaign.logs?.filter((l) => l.status === "ERROR").length ?? 0,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-3 border border-[var(--color-border)] flex items-center gap-3"
            style={{
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <item.icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Objective */}
      <div
        className="p-4 border border-[var(--color-border)]"
        style={{
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-2">
          Objetivo
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {campaign.objective}
        </p>
      </div>

      {/* Content */}
      <div
        className="p-4 border border-[var(--color-border)]"
        style={{
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-2">
          Conteúdo do E-mail
        </h2>
        <div
          className="text-sm text-[var(--color-text-secondary)] leading-relaxed"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {campaign.content}
        </div>
      </div>

      {/* Logs */}
      {campaign.logs && campaign.logs.length > 0 && (
        <div
          className="border border-[var(--color-border)] overflow-hidden"
          style={{
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Logs de Envio ({campaign.logs.length})
            </h2>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {campaign.logs.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-center gap-3">
                {log.status === "SENT" ? (
                  <CheckCircle className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--color-text)] truncate">
                    {log.client.email}
                  </p>
                  {log.error && (
                    <p className="text-xs text-[var(--color-accent)] truncate">
                      {log.error}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatDate(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
