"use client";

import { MedicalRecord, Animal, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  Stethoscope,
  Calendar,
  FileText,
  Edit,
  Trash2,
  User as UserIcon,
} from "lucide-react";

interface MedicalRecordCardProps {
  record: MedicalRecord;
  animal?: Animal;
  doctor?: User;
  onEdit?: (record: MedicalRecord) => void;
  onDelete?: (record: MedicalRecord) => void;
  showActions?: boolean;
}

export default function MedicalRecordCard({
  record,
  animal,
  doctor,
  onEdit,
  onDelete,
  showActions = true,
}: MedicalRecordCardProps) {
  const getTypeColor = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "checkup":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "vaccination":
        return "text-green-600 bg-green-50 border-green-200";
      case "treatment":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "surgery":
        return "text-red-600 bg-red-50 border-red-200";
      case "emergency":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "surgery":
      case "emergency":
        return "🏥";
      case "vaccination":
        return "💉";
      case "treatment":
        return "💊";
      default:
        return "🩺";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Type Icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${getTypeColor(
              record.type
            )}`}
          >
            {getTypeIcon(record.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {animal?.name || "Unknown Animal"}
                  </span>
                  <span className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Dr.{" "}
                    {typeof record.doctorId === "object"
                      ? record.doctorId.name
                      : doctor?.name || "Unknown Doctor"}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDistanceToNow(new Date(record.date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(
                    record.type
                  )}`}
                >
                  {record.type}
                </span>
                {showActions && (
                  <div className="flex space-x-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(record)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit record"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(record)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-3">
              {record.diagnosis && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Diagnosis:{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    {record.diagnosis}
                  </span>
                </div>
              )}

              {record.treatment && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Treatment:{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    {record.treatment}
                  </span>
                </div>
              )}

              {record.medications && record.medications.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Medications:{" "}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.medications.map((medication, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                      >
                        {medication}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {record.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Notes:{" "}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                </div>
              )}

              {record.nextCheckup && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-700">
                    Next checkup:{" "}
                    {new Date(record.nextCheckup).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
