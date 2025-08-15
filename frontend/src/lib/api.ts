import {
  Platform,
  Company,
  Brand,
  Inbox,
  User,
  Person,
  Campaign,
  GPhone,
  Message,
  Conversation,
  Broadcast,
  OnboardingSession,
} from '../types/api';

const API_BASE_URL = 'http://localhost:3001';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Platform endpoints
  async getPlatforms(): Promise<Platform[]> {
    return this.request<Platform[]>('/platforms');
  }

  async getPlatformById(id: number): Promise<Platform> {
    return this.request<Platform>(`/platforms/${id}`);
  }

  async getPlatformByType(type: string): Promise<Platform> {
    return this.request<Platform>(`/platforms/type/${type}`);
  }

  async createPlatform(platform: Partial<Platform>): Promise<Platform> {
    return this.request<Platform>('/platforms', {
      method: 'POST',
      body: JSON.stringify(platform),
    });
  }

  async updatePlatform(
    id: number,
    platform: Partial<Platform>
  ): Promise<Platform> {
    return this.request<Platform>(`/platforms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(platform),
    });
  }

  async deletePlatform(id: number): Promise<void> {
    return this.request<void>(`/platforms/${id}`, {
      method: 'DELETE',
    });
  }

  async seedPlatforms(): Promise<void> {
    return this.request<void>('/platforms/seed', {
      method: 'POST',
    });
  }

  // Company endpoints
  async getCompanies(): Promise<Company[]> {
    return this.request<Company[]>('/companies');
  }

  async getCompanyById(id: number): Promise<Company> {
    return this.request<Company>(`/companies/${id}`);
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    return this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  }

  // Brand endpoints
  async getBrands(): Promise<Brand[]> {
    return this.request<Brand[]>('/brands');
  }

  async getBrandById(id: number): Promise<Brand> {
    return this.request<Brand>(`/brands/${id}`);
  }

  async createBrand(brand: Partial<Brand>): Promise<Brand> {
    return this.request<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    });
  }

  // Inbox endpoints
  async getInboxes(): Promise<Inbox[]> {
    return this.request<Inbox[]>('/inboxes');
  }

  async getInboxById(id: number): Promise<Inbox> {
    return this.request<Inbox>(`/inboxes/${id}`);
  }

  async createInbox(inbox: Partial<Inbox>): Promise<Inbox> {
    return this.request<Inbox>('/inboxes', {
      method: 'POST',
      body: JSON.stringify(inbox),
    });
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserById(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(user: Partial<User>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  // Person endpoints
  async getPersons(): Promise<Person[]> {
    return this.request<Person[]>('/persons');
  }

  async getPersonById(id: number): Promise<Person> {
    return this.request<Person>(`/persons/${id}`);
  }

  async createPerson(person: Partial<Person>): Promise<Person> {
    return this.request<Person>('/persons', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> { return this.request<Campaign[]>('/campaigns'); }
  async getCampaign(id: number): Promise<Campaign> { return this.request<Campaign>(`/campaigns/${id}`); }
  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> { return this.request<Campaign>('/campaigns', { method: 'POST', body: campaign }); }
  async updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign> { return this.request<Campaign>(`/campaigns/${id}`, { method: 'PUT', body: campaign }); }
  async deleteCampaign(id: number): Promise<void> { return this.request<void>(`/campaigns/${id}`, { method: 'DELETE' }); }

  // Inboxes
  async getInboxes(): Promise<Inbox[]> { return this.request<Inbox[]>('/inboxes'); }
  async getInbox(id: number): Promise<Inbox> { return this.request<Inbox>(`/inboxes/${id}`); }
  async createInbox(inbox: Partial<Inbox>): Promise<Inbox> { return this.request<Inbox>('/inboxes', { method: 'POST', body: inbox }); }
  async updateInbox(id: number, inbox: Partial<Inbox>): Promise<Inbox> { return this.request<Inbox>(`/inboxes/${id}`, { method: 'PUT', body: inbox }); }
  async deleteInbox(id: number): Promise<void> { return this.request<void>(`/inboxes/${id}`, { method: 'DELETE' }); }

  // gPhone endpoints
  async getGPhones(): Promise<GPhone[]> {
    return this.request<GPhone[]>('/g-phones');
  }

  async getGPhoneById(id: number): Promise<GPhone> {
    return this.request<GPhone>(`/g-phones/${id}`);
  }

  async createGPhone(gPhone: Partial<GPhone>): Promise<GPhone> {
    return this.request<GPhone>('/g-phones', {
      method: 'POST',
      body: JSON.stringify(gPhone),
    });
  }

  // Message endpoints
  async getMessages(): Promise<Message[]> {
    return this.request<Message[]>('/messages');
  }

  async getMessageById(id: number): Promise<Message> {
    return this.request<Message>(`/messages/${id}`);
  }

  async createMessage(message: Partial<Message>): Promise<Message> {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Conversation endpoints
  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/conversations');
  }

  async getConversationById(id: number): Promise<Conversation> {
    return this.request<Conversation>(`/conversations/${id}`);
  }

  async createConversation(
    conversation: Partial<Conversation>
  ): Promise<Conversation> {
    return this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(conversation),
    });
  }

  // Broadcast endpoints
  async getBroadcasts(): Promise<Broadcast[]> {
    return this.request<Broadcast[]>('/broadcasts');
  }

  async getBroadcastById(id: number): Promise<Broadcast> {
    return this.request<Broadcast>(`/broadcasts/${id}`);
  }

  async createBroadcast(broadcast: Partial<Broadcast>): Promise<Broadcast> {
    return this.request<Broadcast>('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(broadcast),
    });
  }

  // Onboarding endpoints
  async getOnboardingSessions(): Promise<OnboardingSession[]> {
    return this.request<OnboardingSession[]>('/onboarding-sessions');
  }

  async getOnboardingSessionById(id: number): Promise<OnboardingSession> {
    return this.request<OnboardingSession>(`/onboarding-sessions/${id}`);
  }

  async createOnboardingSession(
    session: Partial<OnboardingSession>
  ): Promise<OnboardingSession> {
    return this.request<OnboardingSession>('/onboarding-sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
