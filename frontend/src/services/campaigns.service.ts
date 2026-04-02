import api from "@/lib/api";
import { Campaign, CampaignDetail } from "@/types";

export interface CreateCampaignParams {
  name: string;
  objective: string;
  clientType: string;
  content: string;
}

export interface GenerateContentParams {
  clientType: string;
  objective: string;
}

export const campaignsService = {
  async getAll(): Promise<Campaign[]> {
    const { data } = await api.get<Campaign[]>("/campaigns");
    return data;
  },

  async getById(id: string): Promise<CampaignDetail> {
    const { data } = await api.get<CampaignDetail>(`/campaigns/${id}`);
    return data;
  },

  async create(params: CreateCampaignParams): Promise<Campaign> {
    const { data } = await api.post<Campaign>("/campaigns", params);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },

  async send(id: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(`/campaigns/${id}/send`);
    return data;
  },

  async generateContent(params: GenerateContentParams): Promise<string> {
    const { data } = await api.post<{ content: string }>(
      "/campaigns/generate-content",
      params,
    );
    return data.content;
  },
};
