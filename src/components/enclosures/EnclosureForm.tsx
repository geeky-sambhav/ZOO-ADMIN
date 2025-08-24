"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { Enclosure, User } from "@/types";
import {
  Building,
  Save,
  X,
  MapPin,
  Users,
  Thermometer,
  Droplets,
} from "lucide-react";

interface EnclosureFormProps {
  enclosure?: Enclosure;
  onSubmit: (
    data: Omit<
      Enclosure,
      "_id" | "id" | "createdAt" | "updatedAt" | "currentOccupancy"
    >
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EnclosureForm({
  enclosure,
  onSubmit,
  onCancel,
  isLoading = false,
}: EnclosureFormProps) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: enclosure?.name || "",
    type: enclosure?.type || "",
    capacity: enclosure?.capacity || 1,
    location: enclosure?.location || "",
    temperature: enclosure?.temperature || "",
    humidity: enclosure?.humidity || "",
    lastCleaned: enclosure?.lastCleaned
      ? new Date(enclosure.lastCleaned).toISOString().split("T")[0]
      : "",
    caretakerId: enclosure?.caretakerId || user?.id || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const enclosureTypes = ["Cage", "Aquarium", "Open Habitat", "Other"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Enclosure name is required";
    }

    if (!formData.type.trim()) {
      newErrors.type = "Enclosure type is required";
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (
      formData.temperature &&
      (isNaN(Number(formData.temperature)) ||
        Number(formData.temperature) < -50 ||
        Number(formData.temperature) > 60)
    ) {
      newErrors.temperature = "Temperature must be between -50°C and 60°C";
    }

    if (
      formData.humidity &&
      (isNaN(Number(formData.humidity)) ||
        Number(formData.humidity) < 0 ||
        Number(formData.humidity) > 100)
    ) {
      newErrors.humidity = "Humidity must be between 0% and 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        capacity: Number(formData.capacity),
        location: formData.location.trim(),
        temperature: formData.temperature
          ? Number(formData.temperature)
          : undefined,
        humidity: formData.humidity ? Number(formData.humidity) : undefined,
        lastCleaned: formData.lastCleaned
          ? new Date(formData.lastCleaned)
          : undefined,
        caretakerId: formData.caretakerId || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {enclosure ? "Edit Enclosure" : "Add New Enclosure"}
          </h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enclosure Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter enclosure name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select enclosure type</option>
              {enclosureTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>
        </div>

        {/* Capacity and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Capacity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.capacity ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Maximum number of animals"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Section A, North Wing"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Environmental Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Thermometer className="inline h-4 w-4 mr-1 text-red-400" />
              Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => handleInputChange("temperature", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.temperature ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Optional"
            />
            {errors.temperature && (
              <p className="mt-1 text-sm text-red-600">{errors.temperature}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplets className="inline h-4 w-4 mr-1 text-blue-400" />
              Humidity (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={formData.humidity}
              onChange={(e) => handleInputChange("humidity", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.humidity ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Optional"
            />
            {errors.humidity && (
              <p className="mt-1 text-sm text-red-600">{errors.humidity}</p>
            )}
          </div>
        </div>

        {/* Last Cleaned */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Cleaned
          </label>
          <input
            type="date"
            value={formData.lastCleaned}
            onChange={(e) => handleInputChange("lastCleaned", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2 inline" />
            {isLoading
              ? "Saving..."
              : enclosure
              ? "Update Enclosure"
              : "Create Enclosure"}
          </button>
        </div>
      </form>
    </div>
  );
}
