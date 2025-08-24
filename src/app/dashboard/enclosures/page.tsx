"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Building,
  Users,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import EnclosureCard from "@/components/enclosures/EnclosureCard";
import EnclosureTable from "@/components/enclosures/EnclosureTable";

export default function EnclosuresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [occupancyFilter, setOccupancyFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { enclosures, enclosuresLoading, enclosuresError, fetchEnclosures } =
    useDataStore();
  const { hasPermission } = useAuthStore();

  // Fetch enclosures on component mount
  useEffect(() => {
    fetchEnclosures();
  }, [fetchEnclosures]);

  // Filter enclosures based on search and filters
  const filteredEnclosures = enclosures.filter((enclosure) => {
    const matchesSearch =
      enclosure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enclosure.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enclosure.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || enclosure.type === typeFilter;

    let matchesOccupancy = true;
    if (occupancyFilter !== "all") {
      const occupancyPercentage = enclosure.currentOccupancy
        ? (enclosure.currentOccupancy / enclosure.capacity) * 100
        : 0;

      switch (occupancyFilter) {
        case "empty":
          matchesOccupancy = occupancyPercentage === 0;
          break;
        case "low":
          matchesOccupancy =
            occupancyPercentage > 0 && occupancyPercentage < 50;
          break;
        case "medium":
          matchesOccupancy =
            occupancyPercentage >= 50 && occupancyPercentage < 80;
          break;
        case "high":
          matchesOccupancy =
            occupancyPercentage >= 80 && occupancyPercentage < 100;
          break;
        case "full":
          matchesOccupancy = occupancyPercentage >= 100;
          break;
      }
    }

    return matchesSearch && matchesType && matchesOccupancy;
  });

  // Get unique enclosure types for filter
  const enclosureTypes = Array.from(
    new Set(enclosures.map((e) => e.type))
  ).sort();

  const occupancyOptions = [
    { value: "all", label: "All Occupancy" },
    { value: "empty", label: "Empty (0%)" },
    { value: "low", label: "Low (1-49%)" },
    { value: "medium", label: "Medium (50-79%)" },
    { value: "high", label: "High (80-99%)" },
    { value: "full", label: "Full (100%+)" },
  ];

  const statsCards = [
    {
      title: "Total Enclosures",
      value: enclosures.length,
      icon: Building,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Available Space",
      value: enclosures.reduce(
        (sum, e) => sum + (e.capacity - (e.currentOccupancy || 0)),
        0
      ),
      icon: Users,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Near Capacity",
      value: enclosures.filter((e) => {
        const occupancy = e.currentOccupancy || 0;
        return occupancy / e.capacity >= 0.9;
      }).length,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
  ];

  // Show loading state
  if (enclosuresLoading && enclosures.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Enclosures</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (enclosuresError && enclosures.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Enclosures</h1>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Error loading enclosures
          </h3>
          <p className="mt-1 text-sm text-gray-500">{enclosuresError}</p>
          <div className="mt-6">
            <button
              onClick={() => fetchEnclosures()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enclosures</h1>
          <p className="text-gray-600">
            Manage zoo enclosures and their occupancy
          </p>
        </div>
        {hasPermission(["admin", "caretaker"]) && (
          <Link
            href="/dashboard/enclosures/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Enclosure
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search enclosures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                showFilters
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === "grid"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm font-medium border-l ${
                  viewMode === "table"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "text-gray-700 hover:text-gray-900 border-gray-300"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {enclosureTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupancy
                </label>
                <select
                  value={occupancyFilter}
                  onChange={(e) => setOccupancyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {occupancyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {filteredEnclosures.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No enclosures found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== "all" || occupancyFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding a new enclosure"}
            </p>
            {hasPermission(["admin", "caretaker"]) && (
              <div className="mt-6">
                <Link
                  href="/dashboard/enclosures/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Enclosure
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-700">
                Showing {filteredEnclosures.length} of {enclosures.length}{" "}
                enclosures
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnclosures.map((enclosure) => (
                  <EnclosureCard
                    key={enclosure._id || enclosure.id}
                    enclosure={enclosure}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <EnclosureTable enclosures={filteredEnclosures} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
