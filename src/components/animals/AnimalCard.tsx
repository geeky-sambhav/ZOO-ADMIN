"use client";

import { Animal } from "@/types";
import { Heart, MapPin, Calendar, User, Camera } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard = ({ animal }: AnimalCardProps) => {
  const getHealthStatusColor = (status: Animal["status"]) => {
    switch (status) {
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
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getCategoryColor = (category: Animal["category"]) => {
    switch (category) {
      case "mammals":
        return "text-brown-600 bg-brown-50";
      case "reptiles":
        return "text-green-600 bg-green-50";
      case "birds":
        return "text-blue-600 bg-blue-50";
      case "amphibians":
        return "text-teal-600 bg-teal-50";
      case "fish":
        return "text-cyan-600 bg-cyan-50";
      case "insects":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const animalId = animal._id || animal.id;
  const species =
    typeof animal.speciesId === "object"
      ? animal.speciesId?.commonName
      : animal.species;
  const imageUrl = animal.imgUrl || (animal.images && animal.images[0]);

  return (
    <Link href={`/dashboard/animals/${animalId}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
        {/* Image */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={animal.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Health Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getHealthStatusColor(
                animal.status
              )}`}
            >
              {animal.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {animal.name}
              </h3>
              <p className="text-sm text-gray-600">{species}</p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                animal.category
              )}`}
            >
              {animal.category}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                {animal.sex} •{" "}
                {animal.dob
                  ? new Date().getFullYear() -
                    new Date(animal.dob).getFullYear()
                  : "Unknown"}{" "}
                years old
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Enclosure {animal.enclosureId}</span>
            </div>

            {animal.lastCheckup && (
              <div className="flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  Last checkup{" "}
                  {formatDistanceToNow(animal.lastCheckup, { addSuffix: true })}
                </span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                Arrived{" "}
                {formatDistanceToNow(animal.arrivalDate, { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Description */}
          {(animal.info || animal.description) && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {animal.info || animal.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {/* Weight not available in API, could be added later */}
                {animal.sex}
              </span>
              <div className="flex items-center space-x-1">
                <Heart
                  className={`h-4 w-4 ${
                    animal.status === "healthy"
                      ? "text-green-500"
                      : animal.status === "sick" || animal.status === "injured"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                />
                <span className="text-xs text-gray-500 capitalize">
                  {animal.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimalCard;
