"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import { Bell, CheckCheck } from "lucide-react";
import NotificationList from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    notificationsLoading,
    notificationsError,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useDataStore();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications({ page: 1, limit: 20 });
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotification(id);
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    }
  };

  const handleLoadMore = async () => {
    try {
      const nextPage = page + 1;
      const response = await fetchNotifications({ page: nextPage, limit: 20 });
      setPage(nextPage);
      // You might want to check if there are more pages based on response
      // setHasMore(response.pagination.hasNextPage);
    } catch (error) {
      console.error("Failed to load more notifications:", error);
    }
  };

  if (notificationsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-red-600">Error loading notifications</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{notificationsError}</p>
          <button
            onClick={() => fetchNotifications({ page: 1, limit: 20 })}
            className="mt-2 text-red-600 hover:text-red-500 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            disabled={notificationsLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notification List Component */}
      <NotificationList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={notificationsLoading}
      />
    </div>
  );
}
