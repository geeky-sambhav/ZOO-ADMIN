"use client";

import { useState, useEffect } from "react";
import { FeedingSchedule, Animal, User, InventoryItem } from "@/types";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Package,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

interface FeedingScheduleTableProps {
  schedules: FeedingSchedule[];
  onEdit: (schedule: FeedingSchedule) => void;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string, notes?: string) => void;
  loading?: boolean;
}

export default function FeedingScheduleTable({
  schedules,
  onEdit,
  onDelete,
  onMarkComplete,
  loading = false,
}: FeedingScheduleTableProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);

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

  const handleMarkComplete = async (id: string) => {
    if (showNotesModal && completingId === id) {
      await onMarkComplete(id, completionNotes);
      setShowNotesModal(false);
      setCompletionNotes("");
      setCompletingId(null);
    } else {
      setCompletingId(id);
      setShowNotesModal(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No feeding schedules found
        </h3>
        <p className="text-gray-500">
          Create your first feeding schedule to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Mark Feeding Complete
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about this feeding..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleMarkComplete(completingId!)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setCompletionNotes("");
                  setCompletingId(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Animal & Food
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Caretaker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Fed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr
                key={schedule._id || schedule.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getAnimalName(schedule.animalId)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {getItemName(schedule.item)} - {schedule.quantity} units
                    </div>
                    <div className="text-sm text-gray-500">
                      {schedule.foodType}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(schedule.time)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {schedule.frequency}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {getCaretakerName(schedule.caretakerId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatLastFed(schedule.lastFed)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {schedule.isOverdue ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </span>
                    ) : schedule.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() =>
                        handleMarkComplete(schedule._id || schedule.id!)
                      }
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                      title="Mark as fed"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(schedule)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                      title="Edit schedule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(schedule._id || schedule.id!)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                      title="Delete schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
