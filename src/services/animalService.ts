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
    const response = await this.makeRequest<{
      message: string;
      animals: Animal[];
      count: number;
    }>("/api/animals");

    // Transform to match expected AnimalResponse format
    return {
      message: response.message,
      success: true,
      animals: response.animals,
      count: response.count,
    };
  }

  async getAnimal(id: string): Promise<AnimalResponse> {
    const response = await this.makeRequest<{
      message: string;
      animal: Animal;
    }>(`/api/animals/${id}`);

    // Transform to match expected AnimalResponse format
    return {
      message: response.message,
      success: true,
      animal: response.animal,
    };
  }

  async addAnimal(
    animalData: Omit<Animal, "_id" | "id" | "createdAt" | "updatedAt">
  ): Promise<AnimalResponse> {
    const response = await this.makeRequest<{
      message: string;
      success: boolean;
      animal: Animal;
    }>("/api/animals", {
      method: "POST",
      body: JSON.stringify(animalData),
    });

    return {
      message: response.message,
      success: response.success,
      animal: response.animal,
    };
  }

  async updateAnimal(
    id: string,
    animalData: Partial<Animal>
  ): Promise<AnimalResponse> {
    const response = await this.makeRequest<{
      message: string;
      success: boolean;
      animal: Animal;
    }>(`/api/animals/${id}`, {
      method: "PUT",
      body: JSON.stringify(animalData),
    });

    return {
      message: response.message,
      success: response.success,
      animal: response.animal,
    };
  }

  async deleteAnimal(id: string): Promise<AnimalResponse> {
    const response = await this.makeRequest<{
      message: string;
    }>(`/api/animals/${id}`, {
      method: "DELETE",
    });

    return {
      message: response.message,
      success: true,
    };
  }
}

export const animalService = new AnimalService();
export default animalService;
