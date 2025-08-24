"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { AnimalCategory, HealthStatus } from "@/types";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Users,
  Heart,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import AnimalCard from "@/components/animals/AnimalCard";
import AnimalTable from "@/components/animals/AnimalTable";

export default function AnimalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AnimalCategory | "all">(
    "all"
  );
  const [healthFilter, setHealthFilter] = useState<HealthStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { animals, loading, error, fetchAnimals } = useDataStore();
  const { hasPermission } = useAuthStore();

  // Fetch animals on component mount
  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  // Filter animals based on search and filters
  const filteredAnimals = animals.filter((animal) => {
    const species =
      typeof animal.speciesId === "object"
        ? animal.speciesId?.commonName
        : animal.species;
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (species && species.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || animal.category === categoryFilter;
    const matchesHealth =
      healthFilter === "all" || animal.status === healthFilter;

    return matchesSearch && matchesCategory && matchesHealth;
  });

  const categories: (AnimalCategory | "all")[] = [
    "all",
    "mammals",
    "reptiles",
    "birds",
    "amphibians",
    "fish",
    "insects",
  ];
  const healthStatuses: (HealthStatus | "all")[] = [
    "all",
    "healthy",
    "sick",
    "injured",
    "recovering",
    "quarantine",
  ];

  const statsCards = [
    {
      title: "Total Animals",
      value: animals.length,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Healthy",
      value: animals.filter((a) => a.status === "healthy").length,
      icon: Heart,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Need Attention",
      value: animals.filter((a) =>
        ["sick", "injured", "quarantine"].includes(a.status)
      ).length,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
  ];

  // Show loading state
  if (loading && animals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Animal Management
            </h1>
            <p className="text-gray-600">Loading animals...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading animals
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fetchAnimals()}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Animal Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor all animals in your care
          </p>
        </div>
        {hasPermission(["admin", "caretaker"]) && (
          <Link
            href="/dashboard/animals/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Animal
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search animals by name or species..."
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? "bg-blue-50 text-blue-700 border-blue-300"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as AnimalCategory | "all")
                  }
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all"
                        ? "All Categories"
                        : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Health Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Status
                </label>
                <select
                  value={healthFilter}
                  onChange={(e) =>
                    setHealthFilter(e.target.value as HealthStatus | "all")
                  }
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {healthStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No animals found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || categoryFilter !== "all" || healthFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first animal"}
            </p>
            {hasPermission(["admin", "caretaker"]) && (
              <Link
                href="/dashboard/animals/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Animal
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{filteredAnimals.length}</span>{" "}
                  of <span className="font-medium">{animals.length}</span>{" "}
                  animals
                </p>
                {(searchTerm ||
                  categoryFilter !== "all" ||
                  healthFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setHealthFilter("all");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Animals List */}
            {viewMode === "grid" ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>
              </div>
            ) : (
              <AnimalTable animals={filteredAnimals} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
