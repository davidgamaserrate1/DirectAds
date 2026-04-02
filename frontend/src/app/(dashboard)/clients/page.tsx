"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { clientSchema, ClientFormData } from "@/lib/validators";
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
  const [customType, setCustomType] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const formType = watch("type", "");

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
    reset({ name: "", email: "", type: "" });
    setCustomType(false);
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    reset({ name: client.name, email: client.email, type: client.type });
    setCustomType(!types.includes(client.type));
    setModalOpen(true);
  };

  const onSubmit = async (data: ClientFormData) => {
    setSaving(true);
    try {
      if (editingClient) {
        await update(editingClient.id, data);
        toast("Cliente atualizado!");
      } else {
        await create(data);
        toast("Cliente criado!");
      }
      setModalOpen(false);
    } catch(error: any) {
      toast(error.message || "Erro ao salvar cliente", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      toast("Cliente excluído!");
    } catch(error: any) {
      console.log('error' , error);
      toast(error.message || "Erro ao excluir cliente", "error");
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
          <option value="">Todos os segmentos</option>
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
                    Segmento
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome do cliente"
            error={errors.name?.message}
            {...registerField("name")}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
            error={errors.email?.message}
            {...registerField("email")}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Segmento
            </label>
            {types.length > 0 && !customType && (
              <div className="flex flex-wrap gap-2 mb-2">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("type", t, { shouldValidate: true })}
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
                  onClick={() => { setCustomType(true); setValue("type", "", { shouldValidate: false }); }}
                  className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  + Novo segmento
                </button>
              </div>
            )}
            {(customType || types.length === 0) && (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o novo segmento..."
                  error={errors.type?.message}
                  {...registerField("type")}
                  autoFocus
                />
                {types.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCustomType(false); setValue("type", "", { shouldValidate: false }); }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )}
            {errors.type?.message && !customType && (
              <span className="text-xs text-[var(--color-error)] mt-1 block">{errors.type.message}</span>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingClient ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
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
