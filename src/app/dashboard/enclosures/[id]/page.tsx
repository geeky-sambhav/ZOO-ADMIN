"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { Enclosure } from "@/types";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building,
  Users,
  MapPin,
  Thermometer,
  Droplets,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function EnclosureDetailPage() {
  const [enclosure, setEnclosure] = useState<Enclosure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { fetchEnclosure, deleteEnclosure, animals } = useDataStore();
  const { hasPermission } = useAuthStore();

  const enclosureId = params.id as string;

  useEffect(() => {
    const loadEnclosure = async () => {
      if (!enclosureId) return;

      setIsLoading(true);
      setError(null);

      try {
        const enclosureData = await fetchEnclosure(enclosureId);
        if (enclosureData) {
          setEnclosure(enclosureData);
        } else {
          setError("Enclosure not found");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load enclosure"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEnclosure();
  }, [enclosureId, fetchEnclosure]);

  const handleDelete = async () => {
    if (!enclosure) return;

    const confirmMessage = `Are you sure you want to delete "${enclosure.name}"? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await deleteEnclosure(enclosureId);
      router.push("/dashboard/enclosures");
    } catch (error) {
      console.error("Failed to delete enclosure:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete enclosure. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Get animals in this enclosure
  const enclosureAnimals = animals.filter((animal) => {
    const animalEnclosureId =
      typeof animal.enclosureId === "object"
        ? animal.enclosureId._id || animal.enclosureId.id
        : animal.enclosureId;
    return animalEnclosureId === enclosureId;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/enclosures"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enclosures
          </Link>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !enclosure) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/enclosures"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enclosures
          </Link>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || "Enclosure not found"}
          </h3>
          <div className="mt-6">
            <Link
              href="/dashboard/enclosures"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Enclosures
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentOccupancy = enclosure.currentOccupancy || 0;
  const occupancyPercentage = Math.round(
    (currentOccupancy / enclosure.capacity) * 100
  );

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 bg-red-50 border-red-200";
    if (percentage >= 75)
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (percentage >= 50)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/enclosures"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enclosures
          </Link>
        </div>

        {hasPermission(["admin", "caretaker"]) && (
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/enclosures/${enclosureId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>

            {hasPermission(["admin"]) && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enclosure Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {enclosure.name}
              </h1>
              <p className="text-lg text-gray-600">{enclosure.type}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {enclosure.location}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getOccupancyColor(
                occupancyPercentage
              )}`}
            >
              {occupancyPercentage}% Full
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {enclosure.capacity}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Current Occupancy
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {currentOccupancy}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Available Space
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {enclosure.capacity - currentOccupancy}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Occupancy Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {occupancyPercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Environmental Conditions
          </h3>
          <div className="space-y-4">
            {enclosure.temperature && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Thermometer className="h-5 w-5 mr-3 text-red-400" />
                  <span>Temperature</span>
                </div>
                <span className="font-medium text-gray-900">
                  {enclosure.temperature}°C
                </span>
              </div>
            )}

            {enclosure.humidity && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Droplets className="h-5 w-5 mr-3 text-blue-400" />
                  <span>Humidity</span>
                </div>
                <span className="font-medium text-gray-900">
                  {enclosure.humidity}%
                </span>
              </div>
            )}

            {enclosure.lastCleaned && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <span>Last Cleaned</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatDistanceToNow(new Date(enclosure.lastCleaned), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}

            {!enclosure.temperature &&
              !enclosure.humidity &&
              !enclosure.lastCleaned && (
                <p className="text-gray-500 text-center py-4">
                  No environmental data available
                </p>
              )}
          </div>
        </div>

        {/* Current Animals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Animals
          </h3>
          {enclosureAnimals.length > 0 ? (
            <div className="space-y-3">
              {enclosureAnimals.map((animal) => (
                <Link
                  key={animal._id || animal.id}
                  href={`/dashboard/animals/${animal._id || animal.id}`}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{animal.name}</p>
                    <p className="text-sm text-gray-500">
                      {typeof animal.speciesId === "object"
                        ? animal.speciesId?.commonName
                        : animal.species}{" "}
                      • {animal.sex}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        animal.status === "healthy"
                          ? "text-green-600 bg-green-50"
                          : animal.status === "sick" ||
                            animal.status === "injured"
                          ? "text-red-600 bg-red-50"
                          : "text-yellow-600 bg-yellow-50"
                      }`}
                    >
                      {animal.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No animals currently in this enclosure
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Capacity Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Capacity Overview
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Occupancy</span>
            <span className="font-medium">
              {currentOccupancy} / {enclosure.capacity} animals
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                occupancyPercentage >= 90
                  ? "bg-red-500"
                  : occupancyPercentage >= 75
                  ? "bg-orange-500"
                  : occupancyPercentage >= 50
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>{enclosure.capacity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
