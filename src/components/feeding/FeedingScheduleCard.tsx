"use client";

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
  MapPin,
} from "lucide-react";

interface FeedingScheduleCardProps {
  schedule: FeedingSchedule;
  onEdit: (schedule: FeedingSchedule) => void;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string) => void;
}

export default function FeedingScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onMarkComplete,
}: FeedingScheduleCardProps) {
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
    if (!lastFed) return "Never fed";
    const date = new Date(lastFed);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Fed yesterday";
    if (diffDays < 7) return `Fed ${diffDays} days ago`;
    return `Fed on ${date.toLocaleDateString()}`;
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

  const getStatusColor = () => {
    if (schedule.isOverdue) return "border-red-200 bg-red-50";
    if (schedule.isActive) return "border-green-200 bg-green-50";
    return "border-gray-200 bg-gray-50";
  };

  const getStatusIcon = () => {
    if (schedule.isOverdue) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (schedule.isActive) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all hover:shadow-md ${getStatusColor()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900">
              {getAnimalName(schedule.animalId)}
            </h3>
            <p className="text-sm text-gray-600">{schedule.foodType}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onMarkComplete(schedule._id || schedule.id!)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
            title="Mark as fed"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(schedule)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
            title="Edit schedule"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(schedule._id || schedule.id!)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
            title="Delete schedule"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Package className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {getItemName(schedule.item)} - {schedule.quantity} units
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {formatTime(schedule.time)} - {schedule.frequency}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{getCaretakerName(schedule.caretakerId)}</span>
        </div>

        {schedule.lastFed && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatLastFed(schedule.lastFed)}</span>
          </div>
        )}

        {schedule.notes && (
          <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
            <p className="text-sm text-gray-700">{schedule.notes}</p>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {schedule.isOverdue
              ? "Overdue"
              : schedule.isActive
              ? "Active"
              : "Inactive"}
          </span>
          {schedule.isOverdue && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Feeding
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
