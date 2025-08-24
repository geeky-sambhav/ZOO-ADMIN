"use client";

import { Enclosure } from "@/types";
import {
  Building,
  Users,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Thermometer,
  Droplets,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

interface EnclosureTableProps {
  enclosures: Enclosure[];
}

const EnclosureTable = ({ enclosures }: EnclosureTableProps) => {
  const { hasPermission } = useAuthStore();
  const { deleteEnclosure } = useDataStore();

  const getOccupancyColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return "text-red-600 bg-red-50";
    if (percentage >= 75) return "text-orange-600 bg-orange-50";
    if (percentage >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes("mammal")) return "text-brown-600 bg-brown-50";
    if (normalizedType.includes("reptile")) return "text-green-600 bg-green-50";
    if (normalizedType.includes("bird")) return "text-blue-600 bg-blue-50";
    if (normalizedType.includes("aquatic") || normalizedType.includes("fish"))
      return "text-cyan-600 bg-cyan-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Enclosure
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Occupancy
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Environment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Cleaned
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {enclosures.map((enclosure) => {
            const enclosureId = enclosure._id || enclosure.id;
            const currentOccupancy = enclosure.currentOccupancy || 0;
            const occupancyPercentage = Math.round(
              (currentOccupancy / enclosure.capacity) * 100
            );

            return (
              <tr key={enclosureId} className="hover:bg-gray-50">
                {/* Enclosure Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {enclosure.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Capacity: {enclosure.capacity}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                      enclosure.type
                    )}`}
                  >
                    {enclosure.type}
                  </span>
                </td>

                {/* Occupancy */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {currentOccupancy} / {enclosure.capacity}
                      </span>
                      <span
                        className={`text-xs px-1 py-0.5 rounded ${getOccupancyColor(
                          currentOccupancy,
                          enclosure.capacity
                        )}`}
                      >
                        {occupancyPercentage}% full
                      </span>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {enclosure.location}
                  </div>
                </td>

                {/* Environment */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4 text-sm text-gray-900">
                    {enclosure.temperature && (
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-1 text-red-400" />
                        <span>{enclosure.temperature}°C</span>
                      </div>
                    )}
                    {enclosure.humidity && (
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-1 text-blue-400" />
                        <span>{enclosure.humidity}%</span>
                      </div>
                    )}
                    {!enclosure.temperature && !enclosure.humidity && (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </td>

                {/* Last Cleaned */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enclosure.lastCleaned
                    ? formatDistanceToNow(new Date(enclosure.lastCleaned), {
                        addSuffix: true,
                      })
                    : "Never"}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/dashboard/enclosures/${enclosureId}`}
                      className="text-blue-600 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    {hasPermission(["admin", "caretaker"]) && (
                      <>
                        <Link
                          href={`/dashboard/enclosures/${enclosureId}/edit`}
                          className="text-gray-600 hover:text-gray-500 p-1 rounded-md hover:bg-gray-50 transition-colors"
                          title="Edit Enclosure"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>

                        {hasPermission(["admin"]) && (
                          <button
                            className="text-red-600 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete Enclosure"
                            onClick={async () => {
                              if (
                                confirm(
                                  `Are you sure you want to delete ${enclosure.name}? This action cannot be undone.`
                                )
                              ) {
                                try {
                                  await deleteEnclosure(enclosureId);
                                } catch (error) {
                                  console.error(
                                    "Failed to delete enclosure:",
                                    error
                                  );
                                  alert(
                                    error instanceof Error
                                      ? error.message
                                      : "Failed to delete enclosure"
                                  );
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EnclosureTable;
