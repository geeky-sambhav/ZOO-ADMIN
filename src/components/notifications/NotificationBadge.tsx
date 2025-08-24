"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationBadgeProps {
  unreadCount: number;
  showDropdown?: boolean;
  className?: string;
}

export default function NotificationBadge({
  unreadCount,
  showDropdown = false,
  className = "",
}: NotificationBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <Link
      href="/dashboard/notifications"
      className={`relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      <Bell className={`h-6 w-6 ${isAnimating ? "animate-pulse" : ""}`} />
      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium ${
            isAnimating ? "animate-bounce" : ""
          }`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
