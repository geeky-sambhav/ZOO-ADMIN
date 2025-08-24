"use client";

import { useState, useEffect } from "react";
import { FeedingSchedule, Animal, User, InventoryItem } from "@/types";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Package,
  AlertCircle,
} from "lucide-react";

interface FeedingScheduleFormProps {
  schedule?: FeedingSchedule;
  onSubmit: (data: Partial<FeedingSchedule>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function FeedingScheduleForm({
  schedule,
  onSubmit,
  onCancel,
  loading = false,
}: FeedingScheduleFormProps) {
  const { animals, inventory } = useDataStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    item: schedule?.item || "",
    animalId: schedule?.animalId || "",
    foodType: schedule?.foodType || "",
    quantity: schedule?.quantity || 1,
    frequency: schedule?.frequency || "daily",
    time: schedule?.time || "09:00",
    caretakerId: schedule?.caretakerId || user?.id || "",
    notes: schedule?.notes || "",
    isActive: schedule?.isActive !== undefined ? schedule.isActive : true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter inventory to only show food items
  const foodItems = inventory.filter(
    (item) =>
      item.category === "food" ||
      item.name.toLowerCase().includes("food") ||
      item.name.toLowerCase().includes("feed")
  );

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "twice-daily", label: "Twice Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.item) {
      newErrors.item = "Food item is required";
    }
    if (!formData.animalId) {
      newErrors.animalId = "Animal is required";
    }
    if (!formData.foodType.trim()) {
      newErrors.foodType = "Food type is required";
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.frequency) {
      newErrors.frequency = "Frequency is required";
    }
    if (!formData.time) {
      newErrors.time = "Time is required";
    }
    if (!formData.caretakerId) {
      newErrors.caretakerId = "Caretaker is required";
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
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const getAnimalName = (animal: Animal): string => {
    return `${animal.name} (${animal.species || "Unknown species"})`;
  };

  const getItemDetails = (item: InventoryItem): string => {
    return `${item.name} (${item.quantity} ${item.unit} available)`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {schedule ? "Edit Feeding Schedule" : "Create Feeding Schedule"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Animal Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="inline h-4 w-4 mr-1" />
            Animal *
          </label>
          <select
            name="animalId"
            value={
              typeof formData.animalId === "string"
                ? formData.animalId
                : formData.animalId
            }
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.animalId ? "border-red-300" : "border-gray-300"
            }`}
            disabled={loading}
          >
            <option value="">Select an animal</option>
            {animals.map((animal) => (
              <option
                key={animal._id || animal.id}
                value={animal._id || animal.id}
              >
                {getAnimalName(animal)}
              </option>
            ))}
          </select>
          {errors.animalId && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.animalId}
            </p>
          )}
        </div>

        {/* Food Item Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="inline h-4 w-4 mr-1" />
            Food Item *
          </label>
          <select
            name="item"
            value={
              typeof formData.item === "string" ? formData.item : formData.item
            }
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.item ? "border-red-300" : "border-gray-300"
            }`}
            disabled={loading}
          >
            <option value="">Select a food item</option>
            {foodItems.map((item) => (
              <option key={item.id} value={item.id}>
                {getItemDetails(item)}
              </option>
            ))}
          </select>
          {errors.item && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.item}
            </p>
          )}
        </div>

        {/* Food Type and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Type *
            </label>
            <input
              type="text"
              name="foodType"
              value={formData.foodType}
              onChange={handleInputChange}
              placeholder="e.g., Pellets, Hay, Meat"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.foodType ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.foodType && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.foodType}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="0.1"
              step="0.1"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.quantity ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.quantity}
              </p>
            )}
          </div>
        </div>

        {/* Frequency and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Frequency *
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.frequency ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.frequency && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.frequency}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Time *
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.time ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.time}
              </p>
            )}
          </div>
        </div>

        {/* Caretaker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="inline h-4 w-4 mr-1" />
            Caretaker *
          </label>
          <input
            type="text"
            name="caretakerId"
            value={
              typeof formData.caretakerId === "string"
                ? formData.caretakerId
                : formData.caretakerId
            }
            onChange={handleInputChange}
            placeholder="Caretaker ID or name"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.caretakerId ? "border-red-300" : "border-gray-300"
            }`}
            disabled={loading}
          />
          {errors.caretakerId && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.caretakerId}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="Additional notes about feeding requirements..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label className="ml-2 block text-sm text-gray-900">
            Active schedule
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "Saving..."
              : schedule
              ? "Update Schedule"
              : "Create Schedule"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
