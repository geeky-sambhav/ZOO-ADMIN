"use client";

import { Enclosure } from "@/types";
import {
  Building,
  Users,
  MapPin,
  Thermometer,
  Droplets,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface EnclosureCardProps {
  enclosure: Enclosure;
}

const EnclosureCard = ({ enclosure }: EnclosureCardProps) => {
  const enclosureId = enclosure._id || enclosure.id;
  const occupancyPercentage = enclosure.currentOccupancy
    ? Math.round((enclosure.currentOccupancy / enclosure.capacity) * 100)
    : 0;

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 bg-red-50 border-red-200";
    if (percentage >= 75)
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (percentage >= 50)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
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
    <Link href={`/dashboard/enclosures/${enclosureId}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {enclosure.name}
                </h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                    enclosure.type
                  )}`}
                >
                  {enclosure.type}
                </span>
              </div>
            </div>

            {/* Occupancy Badge */}
            <div className="text-right">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${getOccupancyColor(
                  occupancyPercentage
                )}`}
              >
                {occupancyPercentage}% Full
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Capacity Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                {enclosure.currentOccupancy || 0} / {enclosure.capacity} animals
              </span>
            </div>

            {/* Capacity Bar */}
            <div className="flex-1 ml-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    occupancyPercentage >= 90
                      ? "bg-red-500"
                      : occupancyPercentage >= 75
                      ? "bg-orange-500"
                      : occupancyPercentage >= 50
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{enclosure.location}</span>
          </div>

          {/* Environmental Conditions */}
          <div className="grid grid-cols-2 gap-4">
            {enclosure.temperature && (
              <div className="flex items-center text-sm text-gray-600">
                <Thermometer className="h-4 w-4 mr-2 flex-shrink-0 text-red-400" />
                <span>{enclosure.temperature}°C</span>
              </div>
            )}

            {enclosure.humidity && (
              <div className="flex items-center text-sm text-gray-600">
                <Droplets className="h-4 w-4 mr-2 flex-shrink-0 text-blue-400" />
                <span>{enclosure.humidity}%</span>
              </div>
            )}
          </div>

          {/* Last Cleaned */}
          {enclosure.lastCleaned && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                Last cleaned{" "}
                {formatDistanceToNow(new Date(enclosure.lastCleaned), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}

          {/* Footer Stats */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                Capacity: {enclosure.capacity}
              </span>
              <span
                className={`font-medium ${
                  occupancyPercentage >= 90
                    ? "text-red-600"
                    : occupancyPercentage >= 75
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {enclosure.currentOccupancy || 0} occupied
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EnclosureCard;
