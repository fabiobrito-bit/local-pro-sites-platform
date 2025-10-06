
interface ViteEnv {
  VITE_API_URL: string;
}

declare global {
  interface ImportMeta {
    env: ViteEnv;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

  return response.json() as Promise<T>;
  }

  // Auth
  async login(email: string, password: string, totpToken?: string) {
    return this.post<{ user: { id: string; email: string; role: string }; token: string; requiresTwoFa?: boolean }>('/auth/login', { email, password, totpToken });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName?: string;
  }) {
    return this.post<{ user: { id: string; email: string; role: string } }>('/auth/register', data);
  }

  async logout() {
    return this.post<{ message: string }>('/auth/logout', {});
  }

  async getMe() {
    return this.get<{ user: { id: string; email: string; role: string } }>('/auth/me');
  }

  async setup2FA() {
    return this.post<{ secret: string; qrCode: string; backupCodes: string[] }>('/auth/2fa/setup', {});
  }

  async enable2FA(token: string) {
    return this.post<{ success: boolean }>('/auth/2fa/enable', { token });
  }

  async disable2FA() {
    return this.post<{ success: boolean }>('/auth/2fa/disable', {});
  }

  // Chat
  async createChatSession(websiteId?: string) {
    return this.post<{ sessionId: string }>('/chat/sessions', { websiteId });
  }

  async sendMessage(sessionId: string, message: string, websiteId?: string) {
    return this.post<{ messageId: string }>('/chat/messages', { sessionId, message, websiteId });
  }

  async getChatSessions() {
    return this.get<{ id: string; title: string }[]>('/chat/sessions');
  }

  async getChatMessages(sessionId: string) {
    return this.get<{ id: string; content: string }[]>(`/chat/sessions/${sessionId}/messages`);
  }

  async escalateToSupport(sessionId: string, reason: string) {
    return this.post<{ success: boolean }>(`/chat/sessions/${sessionId}/escalate`, { reason });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient(API_URL);
