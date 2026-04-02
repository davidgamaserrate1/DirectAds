import api from "@/lib/api";
import { AuthResponse, User } from "@/types";

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const authService = {
  async login(params: LoginParams): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", params);
    this.setSession(data);
    return data;
  },

  async register(params: RegisterParams): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", params);
    this.setSession(data);
    return data;
  },

  setSession(auth: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;
  },

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
