import { User } from "@/types";
import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface UserResponse {
  message: string;
  success: boolean;
  users?: User[];
  user?: User;
  caretakers?: User[];
  error?: string;
}

class UserService {
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

  async getCaretakers(): Promise<UserResponse> {
    return this.makeRequest<UserResponse>("/api/caretakers");
  }

  async getAllUsers(): Promise<UserResponse> {
    return this.makeRequest<UserResponse>("/api/users");
  }
}

export const userService = new UserService();
export default userService;
