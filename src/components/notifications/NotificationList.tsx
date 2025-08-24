"use client";

import { useState } from "react";
import { Notification, NotificationType } from "@/types";
import NotificationCard from "./NotificationCard";
import { Bell, Filter } from "lucide-react";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export default function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  onLoadMore,
  hasMore = false,
  loading = false,
}: NotificationListProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");

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

  return (
    <div className="space-y-4">
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
            <option value="health_alert">Health Alerts</option>
            <option value="maintenance">Maintenance</option>
            <option value="alert">Alerts</option>
            <option value="general">General</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading && filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
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
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification._id || notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && filteredNotifications.length > 0 && (
          <div className="p-6 border-t border-gray-200 text-center">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More Notifications"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
