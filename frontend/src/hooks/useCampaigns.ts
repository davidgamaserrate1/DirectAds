import { useEffect, useState, useCallback } from "react";
import { campaignsService, CreateCampaignParams } from "@/services/campaigns.service";
import { Campaign } from "@/types";

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await campaignsService.getAll();
      setCampaigns(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(async (params: CreateCampaignParams) => {
    return campaignsService.create(params);
  }, []);

  const remove = useCallback(async (id: string) => {
    await campaignsService.delete(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const send = useCallback(async (id: string) => {
    const result = await campaignsService.send(id);
    await fetch();
    return result;
  }, [fetch]);

  const generateContent = useCallback(
    async (clientType: string, objective: string) => {
      return campaignsService.generateContent({ clientType, objective });
    },
    [],
  );

  return { campaigns, loading, refetch: fetch, create, remove, send, generateContent };
}
