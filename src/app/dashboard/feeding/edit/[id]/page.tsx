"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { FeedingSchedule } from "@/types";
import feedingService from "@/services/feedingService";
import FeedingScheduleForm from "@/components/feeding/FeedingScheduleForm";
import { ArrowLeft, AlertTriangle, CheckCircle, Loader } from "lucide-react";
import Link from "next/link";

export default function EditFeedingSchedulePage() {
  const { hasPermission } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  const [schedule, setSchedule] = useState<FeedingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedingService.getFeedingSchedule(scheduleId);
      if (response.feedingSchedule) {
        setSchedule(response.feedingSchedule);
      } else {
        setError("Feeding schedule not found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch feeding schedule"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<FeedingSchedule>) => {
    try {
      setSubmitting(true);
      setError(null);

      await feedingService.updateFeedingSchedule(scheduleId, data);
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/feeding");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update feeding schedule"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/feeding");
  };

  if (!hasPermission("manage_feeding")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to edit feeding schedules.
          </p>
          <Link
            href="/dashboard/feeding"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feeding Schedules
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Schedule
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch the feeding schedule...
          </p>
        </div>
      </div>
    );
  }

  if (error && !schedule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Schedule
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchSchedule}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/dashboard/feeding"
              className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schedules
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Schedule Updated Successfully
          </h3>
          <p className="text-gray-500 mb-4">
            The feeding schedule has been updated.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to feeding schedules...
          </p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Schedule Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            The requested feeding schedule could not be found.
          </p>
          <Link
            href="/dashboard/feeding"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feeding Schedules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/feeding"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Feeding Schedule
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the feeding schedule details
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Updating Schedule
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <FeedingScheduleForm
        schedule={schedule}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />

      {/* Schedule Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Schedule Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span>{" "}
            {schedule.createdAt
              ? new Date(schedule.createdAt).toLocaleDateString()
              : "Unknown"}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{" "}
            {schedule.updatedAt
              ? new Date(schedule.updatedAt).toLocaleDateString()
              : "Never"}
          </div>
          <div>
            <span className="font-medium">Last Fed:</span>{" "}
            {schedule.lastFed
              ? new Date(schedule.lastFed).toLocaleDateString()
              : "Never"}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                schedule.isOverdue
                  ? "bg-red-100 text-red-800"
                  : schedule.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {schedule.isOverdue
                ? "Overdue"
                : schedule.isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Editing Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Changes will take effect immediately after saving</li>
          <li>• Ensure the animal still requires this feeding schedule</li>
          <li>• Update quantities based on current inventory levels</li>
          <li>• Consider seasonal dietary changes or animal growth</li>
          <li>• Deactivate schedules that are no longer needed</li>
        </ul>
      </div>
    </div>
  );
}
