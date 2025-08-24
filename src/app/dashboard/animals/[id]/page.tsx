"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Animal } from "@/types";
import animalService from "@/services/animalService";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  MapPin,
  Calendar,
  User,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Info,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const animalId = params.id as string;

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await animalService.getAnimal(animalId);
        setAnimal(response.animal || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch animal");
      } finally {
        setLoading(false);
      }
    };

    if (animalId) {
      fetchAnimal();
    }
  }, [animalId]);

  const handleDelete = async () => {
    if (!animal) return;

    try {
      setDeleteLoading(true);
      await animalService.deleteAnimal(animal._id || animal.id || "");
      router.push("/dashboard/animals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete animal");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getHealthStatusColor = (status: Animal["status"]) => {
    switch (status?.toLowerCase()) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "sick":
        return "text-red-600 bg-red-50 border-red-200";
      case "injured":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "recovering":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "quarantine":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "deceased":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getHealthStatusIcon = (status: Animal["status"]) => {
    switch (status?.toLowerCase()) {
      case "healthy":
        return <CheckCircle className="h-5 w-5" />;
      case "sick":
      case "injured":
        return <AlertTriangle className="h-5 w-5" />;
      case "recovering":
        return <Clock className="h-5 w-5" />;
      case "quarantine":
        return <Shield className="h-5 w-5" />;
      case "deceased":
        return <Heart className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/animals"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Animals
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/animals"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Animals
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading animal
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || "Animal not found"}</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/animals"
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                >
                  Go back to Animals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const species =
    typeof animal.speciesId === "object"
      ? animal.speciesId?.commonName
      : animal.species;
  const imageUrl = animal.imgUrl || (animal.images && animal.images[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/animals"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Animals
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission(["admin", "caretaker"]) && (
            <>
              <Link
                href={`/dashboard/animals/${animalId}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Animal
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-w-1 aspect-h-1 bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={animal.name}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 flex items-center justify-center bg-gray-100">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Health Status Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Health Status
            </h3>
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${getHealthStatusColor(
                  animal.status
                )}`}
              >
                {getHealthStatusIcon(animal.status)}
              </div>
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {animal.status}
                </p>
                {animal.lastCheckup && (
                  <p className="text-sm text-gray-600">
                    Last checkup{" "}
                    {formatDistanceToNow(new Date(animal.lastCheckup), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {animal.name}
                </h1>
                <p className="text-lg text-gray-600">{species}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getHealthStatusColor(
                  animal.status
                )}`}
              >
                {animal.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sex</p>
                    <p className="text-sm">{animal.sex}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Age</p>
                    <p className="text-sm">
                      {animal.dob
                        ? `${
                            new Date().getFullYear() -
                            new Date(animal.dob).getFullYear()
                          } years old`
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Enclosure
                    </p>
                    <p className="text-sm">
                      {typeof animal.enclosureId === "object"
                        ? animal.enclosureId.name
                        : `Enclosure ${animal.enclosureId}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Date of Birth
                    </p>
                    <p className="text-sm">
                      {animal.dob
                        ? format(new Date(animal.dob), "MMM dd, yyyy")
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Arrival Date
                    </p>
                    <p className="text-sm">
                      {format(new Date(animal.arrivalDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                {animal.caretakerId && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Caretaker
                      </p>
                      <p className="text-sm">
                        {typeof animal.caretakerId === "object"
                          ? animal.caretakerId.name
                          : "Assigned"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {(animal.info || animal.description) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About {animal.name}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {animal.info || animal.description}
              </p>
            </div>
          )}

          {/* Species Information */}
          {typeof animal.speciesId === "object" && animal.speciesId && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Species Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Scientific Name
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    {animal.speciesId.scientificName}
                  </p>
                </div>
                {animal.speciesId.classification && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Classification
                    </p>
                    <p className="text-sm text-gray-600">
                      {animal.speciesId.classification}
                    </p>
                  </div>
                )}
                {animal.speciesId.origin && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Origin</p>
                    <p className="text-sm text-gray-600">
                      {animal.speciesId.origin}
                    </p>
                  </div>
                )}
                {animal.speciesId.about && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">About</p>
                    <p className="text-sm text-gray-600">
                      {animal.speciesId.about}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Animal
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">{animal.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
