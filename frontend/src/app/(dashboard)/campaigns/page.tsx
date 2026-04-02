"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  PlusCircle,
  Search,
  MoreVertical,
  Send,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import api from "@/lib/api";
import { Campaign } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type FilterTab = "all" | "DRAFT" | "SENT";

export default function CampaignsPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/campaigns");
      setCampaigns(res.data);
    } catch {
      toast("Erro ao carregar campanhas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filtered = campaigns.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const counts = {
    all: campaigns.length,
    SENT: campaigns.filter((c) => c.status === "SENT").length,
    DRAFT: campaigns.filter((c) => c.status === "DRAFT").length,
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/campaigns/${deleteId}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteId));
      toast("Campanha excluída com sucesso");
    } catch {
      toast("Erro ao excluir campanha", "error");
    }
    setDeleteId(null);
  };

  const handleSend = async (id: string) => {
    setSendingId(id);
    try {
      const res = await api.post(`/campaigns/${id}/send`);
      toast(res.data.message || "Campanha enviada!");
      fetchCampaigns();
    } catch {
      toast("Erro ao enviar campanha", "error");
    }
    setSendingId(null);
    setOpenMenuId(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "SENT", label: "Enviadas" },
    { key: "DRAFT", label: "Rascunhos" },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[180px] rounded-xl animate-pulse"
              style={{ backgroundColor: "var(--color-surface-2)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Campanhas
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gerencie e envie campanhas para seus clientes
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="md">
            <PlusCircle className="w-4 h-4" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--color-surface-2)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                filter === tab.key
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key
                    ? "bg-white/20"
                    : "bg-[var(--color-border)]"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[240px] pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{ borderRadius: "var(--radius-md)", padding: "8px 12px 8px 36px" }}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 border border-[var(--color-border)]"
          style={{
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <Megaphone className="w-12 h-12 text-[var(--color-text-secondary)] opacity-30 mb-3" />
          <p className="text-[var(--color-text-secondary)] text-sm">
            Nenhuma campanha encontrada
          </p>
          <Link href="/campaigns/new" className="mt-4">
            <Button size="sm">
              <PlusCircle className="w-4 h-4" />
              Criar Campanha
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((campaign) => (
            <div
              key={campaign.id}
              className="relative border border-[var(--color-border)] flex flex-col"
              style={{
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-surface)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              {/* Card header */}
              <div className="p-4 pb-3 flex items-start justify-between">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="flex items-start gap-3 min-w-0 flex-1"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        campaign.status === "SENT"
                          ? "var(--color-success)" + "18"
                          : "var(--color-primary)" + "18",
                    }}
                  >
                    <Megaphone
                      className="w-4 h-4"
                      style={{
                        color:
                          campaign.status === "SENT"
                            ? "var(--color-success)"
                            : "var(--color-primary)",
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {campaign.clientType}
                    </p>
                  </div>
                </Link>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === campaign.id ? null : campaign.id,
                      )
                    }
                    className="p-1 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </button>
                  {openMenuId === campaign.id && (
                    <div
                      className="absolute right-0 top-8 z-10 w-40 border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden"
                      style={{ backgroundColor: "var(--color-surface)" }}
                    >
                      {campaign.status === "DRAFT" && (
                        <button
                          onClick={() => handleSend(campaign.id)}
                          disabled={sendingId === campaign.id}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Enviar
                        </button>
                      )}
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteId(campaign.id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[var(--color-accent,#ea5153)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status + date */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <Badge
                  variant={campaign.status === "SENT" ? "success" : "default"}
                >
                  {campaign.status === "SENT" ? "Enviada" : "Rascunho"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                  <Calendar className="w-3 h-3" />
                  {formatDate(campaign.createdAt)}
                </span>
              </div>

              {/* Objective */}
              <div className="px-4 pb-4">
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                  {campaign.objective}
                </p>
              </div>

              {/* Footer */}
              {campaign._count && (
                <div className="mt-auto px-4 py-3 border-t border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {campaign._count.logs} envio(s) registrado(s)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir Campanha"
      >
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Tem certeza que deseja excluir esta campanha? Esta ação não pode ser
          desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
