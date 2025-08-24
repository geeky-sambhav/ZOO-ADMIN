import { FeedingSchedule, FeedingScheduleResponse } from "@/types";
import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

class FeedingService {
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

  // Get all feeding schedules with optional filters
  async getAllFeedingSchedules(filters?: {
    animalId?: string;
    caretakerId?: string;
    isActive?: boolean;
    isOverdue?: boolean;
  }): Promise<FeedingScheduleResponse> {
    const searchParams = new URLSearchParams();
    if (filters?.animalId) searchParams.append("animalId", filters.animalId);
    if (filters?.caretakerId)
      searchParams.append("caretakerId", filters.caretakerId);
    if (filters?.isActive !== undefined)
      searchParams.append("isActive", filters.isActive.toString());
    if (filters?.isOverdue !== undefined)
      searchParams.append("isOverdue", filters.isOverdue.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/feeding-schedules${
      queryString ? `?${queryString}` : ""
    }`;

    return this.makeRequest<FeedingScheduleResponse>(endpoint);
  }

  // Get a single feeding schedule by ID
  async getFeedingSchedule(id: string): Promise<FeedingScheduleResponse> {
    return this.makeRequest<FeedingScheduleResponse>(
      `/api/feeding-schedules/${id}`
    );
  }

  // Create a new feeding schedule
  async addFeedingSchedule(
    scheduleData: Omit<
      FeedingSchedule,
      "_id" | "id" | "createdAt" | "updatedAt" | "isOverdue"
    >
  ): Promise<FeedingScheduleResponse> {
    return this.makeRequest<FeedingScheduleResponse>("/api/feeding-schedules", {
      method: "POST",
      body: JSON.stringify(scheduleData),
    });
  }

  // Update an existing feeding schedule
  async updateFeedingSchedule(
    id: string,
    scheduleData: Partial<FeedingSchedule>
  ): Promise<FeedingScheduleResponse> {
    return this.makeRequest<FeedingScheduleResponse>(
      `/api/feeding-schedules/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(scheduleData),
      }
    );
  }

  // Delete a feeding schedule
  async deleteFeedingSchedule(id: string): Promise<FeedingScheduleResponse> {
    return this.makeRequest<FeedingScheduleResponse>(
      `/api/feeding-schedules/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // Mark feeding as completed
  async markFeedingCompleted(
    id: string,
    notes?: string
  ): Promise<FeedingScheduleResponse> {
    return this.makeRequest<FeedingScheduleResponse>(
      `/api/feeding-schedules/${id}/complete`,
      {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      }
    );
  }

  // Get overdue feeding schedules
  async getOverdueFeedings(): Promise<FeedingScheduleResponse> {
    return this.makeRequest<FeedingScheduleResponse>(
      "/api/feeding-schedules/overdue"
    );
  }

  // Get feeding schedules by animal ID
  async getFeedingSchedulesByAnimal(
    animalId: string
  ): Promise<FeedingScheduleResponse> {
    return this.makeRequest<FeedingScheduleResponse>(
      `/api/feeding-schedules/animal/${animalId}`
    );
  }
}

export const feedingService = new FeedingService();
export default feedingService;
