"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { FeedingSchedule } from "@/types";
import feedingService from "@/services/feedingService";
import FeedingScheduleForm from "@/components/feeding/FeedingScheduleForm";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function NewFeedingSchedulePage() {
  const { hasPermission } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: Partial<FeedingSchedule>) => {
    try {
      setLoading(true);
      setError(null);

      await feedingService.addFeedingSchedule(data as any);
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/feeding");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create feeding schedule"
      );
    } finally {
      setLoading(false);
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
            You don't have permission to create feeding schedules.
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

  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Schedule Created Successfully
          </h3>
          <p className="text-gray-500 mb-4">
            The feeding schedule has been created and is now active.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to feeding schedules...
          </p>
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
            Create Feeding Schedule
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up a new feeding schedule for an animal
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
                Error Creating Schedule
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <FeedingScheduleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Tips for Creating Feeding Schedules
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Ensure the selected food item has sufficient quantity in inventory
          </li>
          <li>
            • Set realistic feeding times that align with caretaker schedules
          </li>
          <li>
            • Consider the animal's dietary requirements and feeding frequency
          </li>
          <li>• Add detailed notes for special feeding instructions</li>
          <li>• Mark schedules as active to enable overdue tracking</li>
        </ul>
      </div>
    </div>
  );
}
