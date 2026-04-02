import { useEffect, useState } from "react";
import { campaignsService } from "@/services/campaigns.service";
import { CampaignDetail } from "@/types";

export function useCampaignDetail(id: string) {
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsService
      .getById(id)
      .then(setCampaign)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const refetch = async () => {
    const data = await campaignsService.getById(id);
    setCampaign(data);
  };

  return { campaign, loading, refetch };
}
