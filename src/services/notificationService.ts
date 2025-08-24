import { getCookie } from "@/utils/cookies";
import API_CONFIG from "@/utils/config";

export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
  priority?: string;
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

class NotificationService {
  private baseURL = API_CONFIG.BASE_URL;

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<NotificationResponse> {
    const token = getCookie("token");

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
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

  // Get notifications with filters
  async getNotifications(
    filters: NotificationFilters = {}
  ): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.read !== undefined)
      queryParams.append("read", filters.read.toString());
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.priority) queryParams.append("priority", filters.priority);

    const queryString = queryParams.toString();
    const endpoint = `/api/notifications${
      queryString ? `?${queryString}` : ""
    }`;

    return this.makeRequest(endpoint);
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<NotificationResponse> {
    return this.makeRequest("/api/notifications/unread-count");
  }

  // Create a new notification (admin only)
  async createNotification(notification: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    userId?: string;
  }): Promise<NotificationResponse> {
    return this.makeRequest("/api/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    });
  }

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    return this.makeRequest(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<NotificationResponse> {
    return this.makeRequest("/api/notifications/mark-all-read", {
      method: "PATCH",
    });
  }

  // Delete a notification (admin only)
  async deleteNotification(
    notificationId: string
  ): Promise<NotificationResponse> {
    return this.makeRequest(`/api/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  // Get notification statistics (admin only)
  async getNotificationStats(): Promise<NotificationResponse> {
    return this.makeRequest("/api/notifications/stats");
  }

  // Create system notification utility
  async createSystemNotification(
    type: string,
    title: string,
    message: string,
    priority: string = "medium"
  ): Promise<NotificationResponse> {
    return this.createNotification({
      type,
      title,
      message,
      priority,
    });
  }

  // Create user-specific notification utility
  async createUserNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    priority: string = "medium"
  ): Promise<NotificationResponse> {
    return this.createNotification({
      userId,
      type,
      title,
      message,
      priority,
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
