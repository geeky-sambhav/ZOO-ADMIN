"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { FeedingSchedule } from "@/types";
import feedingService from "@/services/feedingService";
import FeedingScheduleTable from "@/components/feeding/FeedingScheduleTable";
import FeedingScheduleCard from "@/components/feeding/FeedingScheduleCard";
import {
  Plus,
  Calendar,
  Filter,
  Grid,
  List,
  AlertTriangle,
  Clock,
  Search,
  Download,
} from "lucide-react";

export default function FeedingSchedulesPage() {
  const { user, hasPermission } = useAuthStore();
  const router = useRouter();

  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "overdue"
  >("all");
  const [editingSchedule, setEditingSchedule] =
    useState<FeedingSchedule | null>(null);

  useEffect(() => {
    fetchFeedingSchedules();
  }, [filterStatus]);

  const fetchFeedingSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (filterStatus === "active") filters.isActive = true;
      if (filterStatus === "overdue") filters.isOverdue = true;

      const response = await feedingService.getAllFeedingSchedules(filters);
      setSchedules(response.feedingSchedules || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch feeding schedules"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: FeedingSchedule) => {
    setEditingSchedule(schedule);
    router.push(`/dashboard/feeding/edit/${schedule._id || schedule.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feeding schedule?")) {
      return;
    }

    try {
      await feedingService.deleteFeedingSchedule(id);
      await fetchFeedingSchedules();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete feeding schedule"
      );
    }
  };

  const handleMarkComplete = async (id: string, notes?: string) => {
    try {
      await feedingService.markFeedingCompleted(id, notes);
      await fetchFeedingSchedules();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark feeding as complete"
      );
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const searchLower = searchTerm.toLowerCase();
    const animalName =
      typeof schedule.animalId === "string"
        ? schedule.animalId
        : schedule.animalId.name;
    const itemName =
      typeof schedule.item === "string" ? schedule.item : schedule.item.name;

    return (
      animalName.toLowerCase().includes(searchLower) ||
      itemName.toLowerCase().includes(searchLower) ||
      schedule.foodType.toLowerCase().includes(searchLower) ||
      schedule.frequency.toLowerCase().includes(searchLower)
    );
  });

  const overdueCount = schedules.filter((s) => s.isOverdue).length;
  const activeCount = schedules.filter((s) => s.isActive).length;

  if (!hasPermission("manage_feeding")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to manage feeding schedules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Feeding Schedules
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track animal feeding schedules
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/dashboard/feeding/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Schedules
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {schedules.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Schedules
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {activeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overdueCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Schedules</option>
              <option value="active">Active Only</option>
              <option value="overdue">Overdue Only</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedules Display */}
      {viewMode === "table" ? (
        <FeedingScheduleTable
          schedules={filteredSchedules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkComplete={handleMarkComplete}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : filteredSchedules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No feeding schedules found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Create your first feeding schedule to get started."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Link
                  href="/dashboard/feeding/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
                </Link>
              )}
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <FeedingScheduleCard
                key={schedule._id || schedule.id}
                schedule={schedule}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkComplete={handleMarkComplete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
