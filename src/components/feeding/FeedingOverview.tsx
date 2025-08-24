"use client";

import { useState, useEffect } from "react";
import { FeedingSchedule, Animal, User, InventoryItem } from "@/types";
import feedingService from "@/services/feedingService";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Package,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Loader,
} from "lucide-react";
import Link from "next/link";

interface FeedingOverviewProps {
  limit?: number;
  showOverdueOnly?: boolean;
  className?: string;
}

export default function FeedingOverview({
  limit = 5,
  showOverdueOnly = false,
  className = "",
}: FeedingOverviewProps) {
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, [showOverdueOnly]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = showOverdueOnly
        ? { isOverdue: true }
        : { isActive: true };
      const response = await feedingService.getAllFeedingSchedules(filters);

      if (response.feedingSchedules) {
        // Sort by time and limit results
        const sortedSchedules = response.feedingSchedules
          .sort((a, b) => {
            if (showOverdueOnly && a.isOverdue && b.isOverdue) {
              // For overdue, show most overdue first
              const aLastFed = a.lastFed ? new Date(a.lastFed).getTime() : 0;
              const bLastFed = b.lastFed ? new Date(b.lastFed).getTime() : 0;
              return aLastFed - bLastFed;
            }
            // For regular schedules, sort by time
            return a.time.localeCompare(b.time);
          })
          .slice(0, limit);

        setSchedules(sortedSchedules);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch feeding schedules"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      await feedingService.markFeedingCompleted(id);
      await fetchSchedules(); // Refresh the list
    } catch (err) {
      console.error("Failed to mark feeding as complete:", err);
    }
  };

  const formatTime = (time: string) => {
    try {
      const date = new Date(`2000-01-01T${time}`);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return time;
    }
  };

  const formatLastFed = (lastFed?: Date) => {
    if (!lastFed) return "Never";
    const date = new Date(lastFed);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getAnimalName = (animal: string | Animal): string => {
    return typeof animal === "string" ? animal : animal.name;
  };

  const getCaretakerName = (caretaker: string | User): string => {
    return typeof caretaker === "string" ? caretaker : caretaker.name;
  };

  const getItemName = (item: string | InventoryItem): string => {
    return typeof item === "string" ? item : item.name;
  };

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {showOverdueOnly ? "Overdue Feedings" : "Upcoming Feedings"}
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {showOverdueOnly ? "Overdue Feedings" : "Upcoming Feedings"}
          </h3>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchSchedules}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {showOverdueOnly ? "Overdue Feedings" : "Upcoming Feedings"}
          </h3>
          <Link
            href="/dashboard/feeding"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {showOverdueOnly
                ? "No overdue feedings found"
                : "No upcoming feedings scheduled"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule._id || schedule.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  schedule.isOverdue
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div
                    className={`p-2 rounded-full ${
                      schedule.isOverdue ? "bg-red-100" : "bg-blue-100"
                    }`}
                  >
                    {schedule.isOverdue ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getAnimalName(schedule.animalId)}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-xs text-gray-500">
                        {formatTime(schedule.time)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {getItemName(schedule.item)} ({schedule.quantity})
                      </span>
                      <span className="flex items-center">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {getCaretakerName(schedule.caretakerId)}
                      </span>
                      {schedule.lastFed && (
                        <span>Last fed: {formatLastFed(schedule.lastFed)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleMarkComplete(schedule._id || schedule.id!)
                  }
                  className={`p-2 rounded-full transition-colors ${
                    schedule.isOverdue
                      ? "text-red-600 hover:bg-red-100"
                      : "text-green-600 hover:bg-green-100"
                  }`}
                  title="Mark as fed"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
