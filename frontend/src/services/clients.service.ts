import api from "@/lib/api";
import { Client } from "@/types";

export interface CreateClientParams {
  name: string;
  email: string;
  type: string;
}

export type UpdateClientParams = Partial<CreateClientParams>;

export const clientsService = {
  async getAll(): Promise<Client[]> {
    const { data } = await api.get<Client[]>("/clients");
    return data;
  },

  async getById(id: string): Promise<Client> {
    const { data } = await api.get<Client>(`/clients/${id}`);
    return data;
  },

  async create(params: CreateClientParams): Promise<Client> {
    const { data } = await api.post<Client>("/clients", params);
    return data;
  },

  async update(id: string, params: UpdateClientParams): Promise<Client> {
    const { data } = await api.patch<Client>(`/clients/${id}`, params);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  async getTypes(): Promise<string[]> {
    const { data } = await api.get<string[]>("/clients/types");
    return data;
  },
};
