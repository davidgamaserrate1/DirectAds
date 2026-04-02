"use client";

import { useMemo } from "react";
import { Users, Megaphone, Send } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useClients } from "@/hooks/useClients";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DashboardPage() {
  const { clients, loading: loadingClients } = useClients();
  const { campaigns, loading: loadingCampaigns } = useCampaigns();

  const loading = loadingClients || loadingCampaigns;

  const stats = useMemo(() => ({
    totalClients: clients.length,
    totalCampaigns: campaigns.length,
    sentCampaigns: campaigns.filter((c) => c.status === "SENT").length,
  }), [clients, campaigns]);

  const recentCampaigns = useMemo(() => campaigns.slice(0, 5), [campaigns]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[100px] rounded-xl animate-pulse"
              style={{ backgroundColor: "var(--color-surface-2)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total de Clientes",
      value: stats.totalClients,
      icon: Users,
      color: "var(--color-primary)",
    },
    {
      label: "Total de Campanhas",
      value: stats.totalCampaigns,
      icon: Megaphone,
      color: "var(--color-accent, #ea5153)",
    },
    {
      label: "Campanhas Enviadas",
      value: stats.sentCampaigns,
      icon: Send,
      color: "var(--color-success)",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Visão geral das suas campanhas e clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border border-[var(--color-border)] p-5 flex items-center gap-4"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-surface)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: card.color + "18" }}
            >
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {card.value}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent campaigns */}
      <div
        className="border border-[var(--color-border)] overflow-hidden"
        style={{
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-text)]">
            Últimas Campanhas
          </h2>
          <Link
            href="/campaigns"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
            Nenhuma campanha criada ainda.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Megaphone
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--color-primary)" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {campaign.clientType}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={campaign.status === "SENT" ? "success" : "default"}
                >
                  {campaign.status === "SENT" ? "Enviada" : "Rascunho"}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
