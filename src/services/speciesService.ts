import { Species } from "@/types";
import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface SpeciesResponse {
  message: string;
  success?: boolean;
  species?: Species[];
  count?: number;
  error?: string;
}

export interface SingleSpeciesResponse {
  message: string;
  success?: boolean;
  species?: Species;
  error?: string;
}

class SpeciesService {
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

  async getAllSpecies(): Promise<SpeciesResponse> {
    const response = await this.makeRequest<{
      message: string;
      count: number;
      species: Species[];
    }>("/api/species");

    return {
      message: response.message,
      success: true,
      species: response.species,
      count: response.count,
    };
  }

  async getSpecies(id: string): Promise<SingleSpeciesResponse> {
    const response = await this.makeRequest<{
      message: string;
      species: Species;
    }>(`/api/species/${id}`);

    return {
      message: response.message,
      success: true,
      species: response.species,
    };
  }

  async addSpecies(
    speciesData: Omit<Species, "_id" | "createdAt" | "updatedAt">
  ): Promise<SingleSpeciesResponse> {
    const response = await this.makeRequest<{
      message: string;
      success: boolean;
      species: Species;
    }>("/api/species", {
      method: "POST",
      body: JSON.stringify(speciesData),
    });

    return {
      message: response.message,
      success: response.success,
      species: response.species,
    };
  }

  async updateSpecies(
    id: string,
    speciesData: Partial<Species>
  ): Promise<SingleSpeciesResponse> {
    const response = await this.makeRequest<{
      message: string;
      success: boolean;
      species: Species;
    }>(`/api/species/${id}`, {
      method: "PUT",
      body: JSON.stringify(speciesData),
    });

    return {
      message: response.message,
      success: response.success,
      species: response.species,
    };
  }
}

export const speciesService = new SpeciesService();
export default speciesService;
