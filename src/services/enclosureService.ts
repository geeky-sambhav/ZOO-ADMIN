import { Enclosure, EnclosureResponse } from "@/types";
import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

class EnclosureService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async getAllEnclosures(): Promise<EnclosureResponse> {
    return this.makeRequest<EnclosureResponse>("/api/enclosures");
  }

  async getEnclosure(id: string): Promise<EnclosureResponse> {
    return this.makeRequest<EnclosureResponse>(`/api/enclosures/${id}`);
  }

  async addEnclosure(
    enclosureData: Omit<
      Enclosure,
      "_id" | "id" | "createdAt" | "updatedAt" | "currentOccupancy"
    >
  ): Promise<EnclosureResponse> {
    return this.makeRequest<EnclosureResponse>("/api/enclosures", {
      method: "POST",
      body: JSON.stringify(enclosureData),
    });
  }

  async updateEnclosure(
    id: string,
    enclosureData: Partial<Enclosure>
  ): Promise<EnclosureResponse> {
    return this.makeRequest<EnclosureResponse>(`/api/enclosures/${id}`, {
      method: "PUT",
      body: JSON.stringify(enclosureData),
    });
  }

  async deleteEnclosure(id: string): Promise<EnclosureResponse> {
    return this.makeRequest<EnclosureResponse>(`/api/enclosures/${id}`, {
      method: "DELETE",
    });
  }
}

export const enclosureService = new EnclosureService();
export default enclosureService;
