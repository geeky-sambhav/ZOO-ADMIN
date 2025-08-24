import { InventoryItem } from "@/types";
import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface InventoryResponse {
  success: boolean;
  message: string;
  inventoryItem?: InventoryItem;
  inventoryItems?: InventoryItem[];
  count?: number;
  error?: string;
}

export interface InventoryFilters {
  category?: "food" | "medicine" | "supplies" | "equipment";
  lowStock?: boolean;
  expired?: boolean;
}

class InventoryService {
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

  // Get all inventory items with optional filters
  async getAllInventoryItems(
    filters?: InventoryFilters
  ): Promise<InventoryResponse> {
    const searchParams = new URLSearchParams();

    if (filters?.category) searchParams.append("category", filters.category);
    if (filters?.lowStock) searchParams.append("lowStock", "true");
    if (filters?.expired) searchParams.append("expired", "true");

    const queryString = searchParams.toString();
    const endpoint = `/api/inventory${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<InventoryResponse>(endpoint);
  }

  // Get a single inventory item by ID
  async getInventoryItem(id: string): Promise<InventoryResponse> {
    return this.makeRequest<InventoryResponse>(`/api/inventory/${id}`);
  }

  // Add a new inventory item
  async addInventoryItem(
    itemData: Omit<InventoryItem, "id">
  ): Promise<InventoryResponse> {
    return this.makeRequest<InventoryResponse>("/api/inventory", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  }

  // Update an existing inventory item
  async updateInventoryItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryResponse> {
    return this.makeRequest<InventoryResponse>(`/api/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Delete an inventory item
  async deleteInventoryItem(id: string): Promise<InventoryResponse> {
    return this.makeRequest<InventoryResponse>(`/api/inventory/${id}`, {
      method: "DELETE",
    });
  }

  // Restock an inventory item
  async restockInventoryItem(
    id: string,
    quantity: number
  ): Promise<InventoryResponse> {
    return this.makeRequest<InventoryResponse>(`/api/inventory/${id}/restock`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  // Use inventory item (reduce quantity)
  async useInventoryItem(
    id: string,
    quantity: number
  ): Promise<InventoryResponse> {
    return this.makeRequest<InventoryResponse>(`/api/inventory/${id}/use`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
