import { MedicalRecord, MedicalRecordResponse } from "@/types";
import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface MedicalRecordFilters {
  animalId?: string;
  doctorId?: string;
  type?: string;
  page?: number;
  limit?: number;
}

class MedicalRecordService {
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
      credentials: "include", // Include cookies for authentication
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

  // Get all medical records with optional filters
  async getAllMedicalRecords(
    filters: MedicalRecordFilters = {}
  ): Promise<MedicalRecordResponse> {
    const queryParams = new URLSearchParams();

    if (filters.animalId) queryParams.append("animalId", filters.animalId);
    if (filters.doctorId) queryParams.append("doctorId", filters.doctorId);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const endpoint = `/api/medical-records${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return this.makeRequest<MedicalRecordResponse>(endpoint);
  }

  // Get a specific medical record by ID
  async getMedicalRecord(id: string): Promise<MedicalRecordResponse> {
    return this.makeRequest<MedicalRecordResponse>(
      `/api/medical-records/${id}`
    );
  }

  // Add a new medical record
  async addMedicalRecord(
    recordData: Omit<MedicalRecord, "_id" | "id" | "createdAt" | "updatedAt">
  ): Promise<MedicalRecordResponse> {
    return this.makeRequest<MedicalRecordResponse>("/api/medical-records", {
      method: "POST",
      body: JSON.stringify(recordData),
    });
  }

  // Update an existing medical record
  async updateMedicalRecord(
    id: string,
    recordData: Partial<MedicalRecord>
  ): Promise<MedicalRecordResponse> {
    return this.makeRequest<MedicalRecordResponse>(
      `/api/medical-records/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(recordData),
      }
    );
  }

  // Delete a medical record
  async deleteMedicalRecord(id: string): Promise<MedicalRecordResponse> {
    return this.makeRequest<MedicalRecordResponse>(
      `/api/medical-records/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // Get medical history for a specific animal
  async getAnimalMedicalHistory(
    animalId: string
  ): Promise<MedicalRecordResponse> {
    return this.makeRequest<MedicalRecordResponse>(
      `/api/medical-records/animal/${animalId}`
    );
  }
}

export const medicalRecordService = new MedicalRecordService();
export default medicalRecordService;
