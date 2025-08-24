"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { Notification } from "@/types";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  AlertTriangle,
  Package,
  Calendar,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<Notification["type"] | "all">(
    "all"
  );

  const { notifications, markNotificationRead } = useDataStore();

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesReadStatus =
      filter === "all" ||
      (filter === "unread" && !notification.read) ||
      (filter === "read" && notification.read);
    const matchesType =
      typeFilter === "all" || notification.type === typeFilter;

    return matchesReadStatus && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "low_inventory":
        return Package;
      case "medical_checkup":
        return Calendar;
      case "feeding_due":
        return Calendar;
      case "alert":
        return AlertTriangle;
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

  const handleMarkAsRead = (id: string) => {
    markNotificationRead(id);
  };

  const handleMarkAllAsRead = () => {
    notifications
      .filter((n) => !n.read)
      .forEach((n) => markNotificationRead(n.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Read Status Filter */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {(["all", "unread", "read"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "unread" && unreadCount > 0 && (
                  <span className="ml-1 bg-red-100 text-red-600 text-xs rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="low_inventory">Low Inventory</option>
            <option value="medical_checkup">Medical Checkups</option>
            <option value="feeding_due">Feeding Due</option>
            <option value="alert">Alerts</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500">
              {filter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-6 border-l-4 transition-colors hover:bg-gray-50 ${
                    notification.read
                      ? "bg-white"
                      : getPriorityColor(notification.priority)
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
                          notification.priority === "critical"
                            ? "text-red-600"
                            : notification.priority === "high"
                            ? "text-orange-600"
                            : notification.priority === "medium"
                            ? "text-yellow-600"
                            : notification.priority === "low"
                            ? "text-blue-600"
                            : "text-gray-600"
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
                              notification.read
                                ? "text-gray-600"
                                : "text-gray-700"
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
                            {formatDistanceToNow(notification.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              notification.type === "low_inventory"
                                ? "text-orange-700 bg-orange-100"
                                : notification.type === "medical_checkup"
                                ? "text-red-700 bg-red-100"
                                : notification.type === "feeding_due"
                                ? "text-green-700 bg-green-100"
                                : notification.type === "alert"
                                ? "text-red-700 bg-red-100"
                                : "text-blue-700 bg-blue-100"
                            }`}
                          >
                            {notification.type.replace("_", " ")}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete notification"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this notification?"
                                )
                              ) {
                                // Handle delete - would need to add this to store
                                console.log(
                                  "Delete notification:",
                                  notification.id
                                );
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {filteredNotifications.length > 0 &&
          filteredNotifications.length >= 10 && (
            <div className="p-6 border-t border-gray-200 text-center">
              <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Load More Notifications
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
