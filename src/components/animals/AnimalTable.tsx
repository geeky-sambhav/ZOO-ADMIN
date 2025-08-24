"use client";

import { Animal } from "@/types";
import { Heart, MapPin, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

interface AnimalTableProps {
  animals: Animal[];
}

const AnimalTable = ({ animals }: AnimalTableProps) => {
  const { hasPermission } = useAuthStore();
  const { deleteAnimal } = useDataStore();

  const getHealthStatusColor = (status: Animal["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "sick":
        return "text-red-600 bg-red-50";
      case "injured":
        return "text-orange-600 bg-orange-50";
      case "recovering":
        return "text-blue-600 bg-blue-50";
      case "quarantine":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Animal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Species
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Health Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Checkup
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Caretaker
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {animals.map((animal) => {
            const animalId = animal._id || animal.id;
            const species =
              typeof animal.speciesId === "object"
                ? animal.speciesId?.commonName
                : animal.species;
            const imageUrl =
              animal.imgUrl || (animal.images && animal.images[0]);
            const age = animal.dob
              ? new Date().getFullYear() - new Date(animal.dob).getFullYear()
              : "Unknown";

            return (
              <tr key={animalId} className="hover:bg-gray-50">
                {/* Animal Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {imageUrl ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={imageUrl}
                          alt={animal.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {animal.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {animal.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {species} • {animal.sex} • {age}y
                      </div>
                    </div>
                  </div>
                </td>

                {/* Species */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {species || "Unknown Species"}
                  </span>
                </td>

                {/* Health Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Heart
                      className={`h-4 w-4 mr-2 ${
                        animal.status === "healthy"
                          ? "text-green-500"
                          : animal.status === "sick" ||
                            animal.status === "injured"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(
                        animal.status
                      )}`}
                    >
                      {animal.status}
                    </span>
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {typeof animal.enclosureId === "object"
                      ? animal.enclosureId.name
                      : `Enclosure ${animal.enclosureId}`}
                  </div>
                </td>

                {/* Last Checkup */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {animal.lastCheckup
                      ? formatDistanceToNow(animal.lastCheckup, {
                          addSuffix: true,
                        })
                      : "Never"}
                  </div>
                </td>

                {/* Caretaker */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof animal.caretakerId === "object"
                    ? animal.caretakerId.name
                    : "Unassigned"}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/dashboard/animals/${animalId}`}
                      className="text-blue-600 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    {hasPermission(["admin", "caretaker"]) && (
                      <>
                        <Link
                          href={`/dashboard/animals/${animalId}/edit`}
                          className="text-gray-600 hover:text-gray-500 p-1 rounded-md hover:bg-gray-50 transition-colors"
                          title="Edit Animal"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>

                        {hasPermission(["admin"]) && (
                          <button
                            className="text-red-600 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete Animal"
                            onClick={async () => {
                              if (
                                confirm(
                                  `Are you sure you want to delete ${animal.name}?`
                                )
                              ) {
                                try {
                                  await deleteAnimal(animalId);
                                } catch (error) {
                                  console.error(
                                    "Failed to delete animal:",
                                    error
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

export default AnimalTable;
