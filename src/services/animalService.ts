import { Animal, AnimalResponse } from "@/types";
import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

class AnimalService {
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
      credentials: "include", // Add this line to send cookies
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

  async getAllAnimals(): Promise<AnimalResponse> {
    return this.makeRequest<AnimalResponse>("/api/animals");
  }

  async getAnimal(id: string): Promise<AnimalResponse> {
    return this.makeRequest<AnimalResponse>(`/api/animals/${id}`);
  }

  async addAnimal(
    animalData: Omit<Animal, "_id" | "id" | "createdAt" | "updatedAt">
  ): Promise<AnimalResponse> {
    return this.makeRequest<AnimalResponse>("/api/animals", {
      method: "POST",
      body: JSON.stringify(animalData),
    });
  }

  async updateAnimal(
    id: string,
    animalData: Partial<Animal>
  ): Promise<AnimalResponse> {
    return this.makeRequest<AnimalResponse>(`/api/animals/${id}`, {
      method: "PUT",
      body: JSON.stringify(animalData),
    });
  }

  async deleteAnimal(id: string): Promise<AnimalResponse> {
    return this.makeRequest<AnimalResponse>(`/api/animals/${id}`, {
      method: "DELETE",
    });
  }
}

export const animalService = new AnimalService();
export default animalService;
