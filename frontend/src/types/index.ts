export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  type: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  clientType: string;
  content: string;
  status: "DRAFT" | "SENT";
  createdAt: string;
  _count?: { logs: number };
}

export interface CampaignLog {
  id: string;
  campaignId: string;
  clientId: string;
  status: "SENT" | "ERROR";
  error: string | null;
  createdAt: string;
  client: Client;
}

export interface CampaignDetail extends Campaign {
  logs: CampaignLog[];
}
