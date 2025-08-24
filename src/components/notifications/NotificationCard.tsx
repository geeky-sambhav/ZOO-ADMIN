"use client";

import { Notification, NotificationType } from "@/types";
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Package,
  Calendar,
  Info,
  Heart,
  Settings,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
}: NotificationCardProps) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "low_inventory":
        return Package;
      case "medical_checkup":
        return Calendar;
      case "feeding_due":
        return Calendar;
      case "alert":
        return AlertTriangle;
      case "health_alert":
        return Heart;
      case "maintenance":
        return Settings;
      case "general":
        return MessageCircle;
      case "system":
        return Info;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getPriorityTextColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "low_inventory":
        return "text-orange-700 bg-orange-100";
      case "medical_checkup":
        return "text-red-700 bg-red-100";
      case "feeding_due":
        return "text-green-700 bg-green-100";
      case "health_alert":
        return "text-red-700 bg-red-100";
      case "maintenance":
        return "text-purple-700 bg-purple-100";
      case "alert":
        return "text-red-700 bg-red-100";
      case "general":
        return "text-gray-700 bg-gray-100";
      case "system":
        return "text-blue-700 bg-blue-100";
      default:
        return "text-blue-700 bg-blue-100";
    }
  };

  const Icon = getNotificationIcon(notification.type);
  const notificationId = notification._id || notification.id || "";

  return (
    <div
      className={`p-6 border-l-4 transition-colors hover:bg-gray-50 ${
        notification.read ? "bg-white" : getPriorityColor(notification.priority)
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            notification.read ? "bg-gray-100" : "bg-white"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              notification.read
                ? "text-gray-600"
                : getPriorityTextColor(notification.priority)
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className={`text-sm font-medium ${
                  notification.read
                    ? "text-gray-900"
                    : "text-gray-900 font-semibold"
                }`}
              >
                {notification.title}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  notification.read ? "text-gray-600" : "text-gray-700"
                }`}
              >
                {notification.message}
              </p>
            </div>

            {/* Priority Badge */}
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                notification.priority === "critical"
                  ? "text-red-700 bg-red-100"
                  : notification.priority === "high"
                  ? "text-orange-700 bg-orange-100"
                  : notification.priority === "medium"
                  ? "text-yellow-700 bg-yellow-100"
                  : notification.priority === "low"
                  ? "text-blue-700 bg-blue-100"
                  : "text-gray-700 bg-gray-100"
              }`}
            >
              {notification.priority}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(
                  notification.type
                )}`}
              >
                {notification.type.replace("_", " ")}
              </span>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-2">
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notificationId)}
                    className="text-blue-600 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                  title="Delete notification"
                  onClick={() => onDelete(notificationId)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
