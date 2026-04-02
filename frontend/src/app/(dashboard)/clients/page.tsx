"use client";

import { useMemo, useState } from "react";
import {
  Users,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Mail,
  Tag,
  Loader2,
} from "lucide-react";
import { useClients, useClientTypes } from "@/hooks/useClients";
import { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ClientsPage() {
  const { toast } = useToast();
  const { clients, loading, create, update, remove, refetch } = useClients();
  const { types } = useClientTypes();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formType, setFormType] = useState("");
  const [customType, setCustomType] = useState(false);

  const filtered = useMemo(() =>
    clients.filter((c) => {
      if (filterType && c.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        );
      }
      return true;
    }),
    [clients, filterType, search],
  );

  const openCreateModal = () => {
    setEditingClient(null);
    setFormName("");
    setFormEmail("");
    setFormType("");
    setCustomType(false);
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormType(client.type);
    setCustomType(!types.includes(client.type));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formEmail || !formType) {
      toast("Preencha todos os campos", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: formName, email: formEmail, type: formType };
      if (editingClient) {
        await update(editingClient.id, payload);
        toast("Cliente atualizado!");
      } else {
        await create(payload);
        toast("Cliente criado!");
      }
      setModalOpen(false);
    } catch {
      toast("Erro ao salvar cliente", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      toast("Cliente excluído!");
    } catch {
      toast("Erro ao excluir cliente", "error");
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl animate-pulse"
            style={{ backgroundColor: "var(--color-surface-2)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Clientes
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {clients.length} cliente(s) cadastrado(s)
          </p>
        </div>
        <Button size="md" onClick={openCreateModal}>
          <PlusCircle className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{
              borderRadius: "var(--radius-md)",
              padding: "8px 12px 8px 36px",
            }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]"
          style={{ padding: "8px 16px", borderRadius: "var(--radius-md)" }}
        >
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 border border-[var(--color-border)]"
          style={{
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <Users className="w-12 h-12 text-[var(--color-text-secondary)] opacity-30 mb-3" />
          <p className="text-[var(--color-text-secondary)] text-sm">
            Nenhum cliente encontrado
          </p>
          <Button size="sm" className="mt-4" onClick={openCreateModal}>
            <PlusCircle className="w-4 h-4" />
            Adicionar Cliente
          </Button>
        </div>
      ) : (
        <div
          className="border border-[var(--color-border)] overflow-hidden"
          style={{
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] px-4 py-3">
                    Nome
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] px-4 py-3">
                    E-mail
                  </th>
                  <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] px-4 py-3">
                    Tipo
                  </th>
                  <th className="text-right text-xs font-medium text-[var(--color-text-secondary)] px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "var(--accent-gradient)" }}
                        >
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                        <Mail className="w-3.5 h-3.5" />
                        {client.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{client.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                        </button>
                        <button
                          onClick={() => setDeleteId(client.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[var(--color-border)]">
            {filtered.map((client) => (
              <div key={client.id} className="p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {client.email}
                  </p>
                  <Badge>{client.type}</Badge>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </button>
                  <button
                    onClick={() => setDeleteId(client.id)}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-[var(--color-accent)]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Nome
            </label>
            <Input
              placeholder="Nome do cliente"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              E-mail
            </label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Tipo
            </label>
            {types.length > 0 && !customType && (
              <div className="flex flex-wrap gap-2 mb-2">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormType(t)}
                    className="px-3 py-1.5 text-sm rounded-lg border transition-all cursor-pointer"
                    style={{
                      borderRadius: "var(--radius-md)",
                      borderColor: formType === t ? "var(--color-primary)" : "var(--color-border)",
                      backgroundColor: formType === t ? "var(--color-primary)" : "transparent",
                      color: formType === t ? "#fff" : "var(--color-text)",
                    }}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setCustomType(true); setFormType(""); }}
                  className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  + Novo tipo
                </button>
              </div>
            )}
            {(customType || types.length === 0) && (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o novo tipo..."
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  autoFocus
                />
                {types.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCustomType(false); setFormType(""); }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingClient ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir Cliente"
      >
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Tem certeza que deseja excluir este cliente? Esta ação não pode ser
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
