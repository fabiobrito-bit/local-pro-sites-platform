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

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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

    return response.json();
  }

  // Auth
  async login(email: string, password: string, totpToken?: string) {
    return this.request<{ user: any; token: string; requiresTwoFa?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, totpToken }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName?: string;
  }) {
    return this.request<{ user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  async setup2FA() {
    return this.request<{ secret: string; qrCode: string; backupCodes: string[] }>('/auth/2fa/setup', {
      method: 'POST',
    });
  }

  async enable2FA(token: string) {
    return this.request<{ success: boolean }>('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async disable2FA() {
    return this.request<{ success: boolean }>('/auth/2fa/disable', {
      method: 'POST',
    });
  }

  // Chat
  async createChatSession(websiteId?: string) {
    return this.request<any>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ websiteId }),
    });
  }

  async sendMessage(sessionId: string, message: string, websiteId?: string) {
    return this.request<any>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message, websiteId }),
    });
  }

  async getChatSessions() {
    return this.request<any[]>('/chat/sessions');
  }

  async getChatMessages(sessionId: string) {
    return this.request<any[]>(`/chat/sessions/${sessionId}/messages`);
  }

  async escalateToSupport(sessionId: string, reason: string) {
    return this.request<{ success: boolean }>(`/chat/sessions/${sessionId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

export const api = new ApiClient(API_URL);
