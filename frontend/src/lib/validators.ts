import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  type: z.string().min(2, "Segmento deve ter pelo menos 2 caracteres"),
});

export const campaignSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  objective: z.string().min(5, "Objetivo deve ter pelo menos 5 caracteres"),
  clientType: z.string().min(2, "Selecione o segmento do cliente"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>;
