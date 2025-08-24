"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { MedicalRecord, MedicalRecordType } from "@/types";
import MedicalRecordCard from "@/components/medical/MedicalRecordCard";
import {
  Plus,
  Search,
  Filter,
  Stethoscope,
  Calendar,
  FileText,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<MedicalRecordType | "all">(
    "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  const {
    medicalRecords,
    animals,
    fetchMedicalRecords,
    fetchAnimals,
    medicalRecordsLoading,
    medicalRecordsError,
    deleteMedicalRecord,
  } = useDataStore();
  const { hasPermission } = useAuthStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchMedicalRecords();
    if (animals.length === 0) {
      fetchAnimals();
    }
  }, [fetchMedicalRecords, fetchAnimals, animals.length]);

  // Redirect if user doesn't have permission
  if (!hasPermission(["admin", "doctor"])) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to view medical records.
          </p>
        </div>
      </div>
    );
  }

  // Filter medical records
  const filteredRecords = medicalRecords.filter((record) => {
    const animalId =
      typeof record.animalId === "string"
        ? record.animalId
        : record.animalId._id || record.animalId.id;
    const animal =
      animals.find((a) => (a._id || a.id) === animalId) ||
      (typeof record.animalId === "object" ? record.animalId : null);

    const animalName =
      animal?.name ||
      (typeof record.animalId === "object" ? record.animalId.name : "");

    const matchesSearch =
      animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const recordTypes: (MedicalRecordType | "all")[] = [
    "all",
    "checkup",
    "vaccination",
    "treatment",
    "surgery",
    "emergency",
  ];

  const handleRefresh = () => {
    fetchMedicalRecords();
  };

  const handleDeleteRecord = async (record: MedicalRecord) => {
    if (
      window.confirm("Are you sure you want to delete this medical record?")
    ) {
      try {
        await deleteMedicalRecord(record._id || record.id || "");
      } catch (error) {
        console.error("Failed to delete medical record:", error);
      }
    }
  };

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

  const statsCards = [
    {
      title: "Total Records",
      value: medicalRecords.length,
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "This Month",
      value: medicalRecords.filter(
        (r) => new Date(r.date).getMonth() === new Date().getMonth()
      ).length,
      icon: Calendar,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Emergency Cases",
      value: medicalRecords.filter((r) => r.type === "emergency").length,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
    {
      title: "Animals Treated",
      value: new Set(medicalRecords.map((r) => r.animalId)).size,
      icon: Stethoscope,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600">
            Track health history, treatments, and veterinary care
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={medicalRecordsLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                medicalRecordsLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
          {hasPermission(["admin", "doctor"]) && (
            <Link
              href="/dashboard/medical/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Record
            </Link>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {medicalRecordsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{medicalRecordsError}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    {medicalRecordsLoading ? "..." : stat.value}
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
              placeholder="Search by animal name, diagnosis, or treatment..."
            />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as MedicalRecordType | "all")
                }
                className="block w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all"
                      ? "All Types"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Medical Records List */}
      <div className="space-y-4">
        {medicalRecordsLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading medical records...
            </h3>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No medical records found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding the first medical record"}
            </p>
            {hasPermission(["admin", "doctor"]) && (
              <Link
                href="/dashboard/medical/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Record
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{filteredRecords.length}</span>{" "}
                  of{" "}
                  <span className="font-medium">{medicalRecords.length}</span>{" "}
                  records
                </p>
                {(searchTerm || typeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setTypeFilter("all");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Records Grid */}
            <div className="grid gap-4">
              {filteredRecords.map((record) => {
                const animalId =
                  typeof record.animalId === "string"
                    ? record.animalId
                    : record.animalId._id || record.animalId.id;
                const animal =
                  animals.find((a) => (a._id || a.id) === animalId) ||
                  (typeof record.animalId === "object"
                    ? record.animalId
                    : null);

                return (
                  <MedicalRecordCard
                    key={record._id || record.id}
                    record={record}
                    animal={animal}
                    onDelete={handleDeleteRecord}
                    showActions={hasPermission(["admin", "doctor"])}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
