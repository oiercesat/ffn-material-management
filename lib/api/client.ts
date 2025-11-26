const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4566/restapis/YOUR_API_ID/dev/_user_request_";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Materials endpoints
  async getMaterials() {
    return this.request("/materials", { method: "GET" });
  }

  async getMaterialById(id: string) {
    return this.request(`/materials/${id}`, { method: "GET" });
  }

  async createMaterial(data: any) {
    return this.request("/materials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMaterial(id: string, data: any) {
    return this.request(`/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMaterial(id: string) {
    return this.request(`/materials/${id}`, { method: "DELETE" });
  }

  // Loans endpoints
  async getLoans() {
    return this.request("/loans", { method: "GET" });
  }

  async getLoanById(id: string) {
    return this.request(`/loans/${id}`, { method: "GET" });
  }

  async createLoan(data: any) {
    return this.request("/loans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLoan(id: string, data: any) {
    return this.request(`/loans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteLoan(id: string) {
    return this.request(`/loans/${id}`, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);