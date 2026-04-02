import { useEffect, useState, useCallback } from "react";
import { clientsService, CreateClientParams, UpdateClientParams } from "@/services/clients.service";
import { Client } from "@/types";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientsService.getAll();
      setClients(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(async (params: CreateClientParams) => {
    const client = await clientsService.create(params);
    setClients((prev) => [...prev, client]);
    return client;
  }, []);

  const update = useCallback(async (id: string, params: UpdateClientParams) => {
    const client = await clientsService.update(id, params);
    setClients((prev) => prev.map((c) => (c.id === id ? client : c)));
    return client;
  }, []);

  const remove = useCallback(async (id: string) => {
    await clientsService.delete(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { clients, loading, refetch: fetch, create, update, remove };
}

export function useClientTypes() {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsService
      .getTypes()
      .then(setTypes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { types, loading };
}
