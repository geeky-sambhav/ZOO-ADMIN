"use client";

import { useDataStore } from "@/store/dataStore";
import { AlertTriangle, Heart, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const HealthAlerts = () => {
  const { animals } = useDataStore();

  // Get animals that need attention
  const sickAnimals = animals.filter((animal) =>
    ["sick", "injured", "quarantine"].includes(animal.healthStatus)
  );

  const animalsNeedingCheckup = animals.filter((animal) => {
    if (!animal.lastCheckup) return true;
    const daysSinceCheckup =
      (new Date().getTime() - animal.lastCheckup.getTime()) /
      (1000 * 60 * 60 * 24);
    return daysSinceCheckup > 30; // More than 30 days since last checkup
  });

  const recoveringAnimals = animals.filter(
    (animal) => animal.healthStatus === "recovering"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sick":
      case "injured":
        return "text-red-600 bg-red-50";
      case "quarantine":
        return "text-orange-600 bg-orange-50";
      case "recovering":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const totalAlerts = sickAnimals.length + animalsNeedingCheckup.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Health Alerts</h2>
        </div>
        {totalAlerts > 0 && (
          <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full">
            {totalAlerts}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Sick/Injured Animals */}
        {sickAnimals.map((animal) => (
          <div
            key={animal.id}
            className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {animal.name}
                </p>
                <p className="text-xs text-gray-600">
                  {animal.species} - {animal.healthStatus}
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/animals/${animal.id}`}
              className="text-red-600 hover:text-red-500"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}

        {/* Animals needing checkup */}
        {animalsNeedingCheckup.slice(0, 3).map((animal) => (
          <div
            key={`checkup-${animal.id}`}
            className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {animal.name}
                </p>
                <p className="text-xs text-gray-600">
                  Checkup overdue (
                  {animal.lastCheckup
                    ? Math.floor(
                        (new Date().getTime() - animal.lastCheckup.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : "30+"}{" "}
                  days)
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/medical/new?animalId=${animal.id}`}
              className="text-yellow-600 hover:text-yellow-500"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}

        {/* Recovering Animals */}
        {recoveringAnimals.map((animal) => (
          <div
            key={`recovery-${animal.id}`}
            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="flex items-center space-x-3">
              <Heart className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {animal.name}
                </p>
                <p className="text-xs text-gray-600">
                  {animal.species} - Recovering well
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/animals/${animal.id}`}
              className="text-blue-600 hover:text-blue-500"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      {totalAlerts === 0 && (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500">All animals healthy!</p>
          <p className="text-sm text-gray-400">No health alerts at this time</p>
        </div>
      )}

      {totalAlerts > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/health"
            className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-500"
          >
            View Health Dashboard
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default HealthAlerts;
