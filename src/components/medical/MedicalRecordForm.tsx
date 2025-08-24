"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { MedicalRecord, MedicalRecordType, Animal, User } from "@/types";
import { Calendar, Save, X, Plus, Minus } from "lucide-react";

interface MedicalRecordFormProps {
  record?: MedicalRecord;
  onSubmit: (
    data: Omit<MedicalRecord, "_id" | "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MedicalRecordForm({
  record,
  onSubmit,
  onCancel,
  isLoading = false,
}: MedicalRecordFormProps) {
  const { animals, fetchAnimals } = useDataStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    animalId: record?.animalId || "",
    doctorId: record?.doctorId || user?.id || "",
    date: record?.date
      ? new Date(record.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    type: record?.type || ("checkup" as MedicalRecordType),
    diagnosis: record?.diagnosis || "",
    treatment: record?.treatment || "",
    medications: record?.medications || [],
    notes: record?.notes || "",
    nextCheckup: record?.nextCheckup
      ? new Date(record.nextCheckup).toISOString().split("T")[0]
      : "",
  });

  const [newMedication, setNewMedication] = useState("");

  useEffect(() => {
    if (animals.length === 0) {
      fetchAnimals();
    }
  }, [animals.length, fetchAnimals]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setFormData((prev) => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()],
      }));
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      animalId: formData.animalId,
      doctorId: formData.doctorId,
      date: new Date(formData.date),
      type: formData.type,
      diagnosis: formData.diagnosis || undefined,
      treatment: formData.treatment || undefined,
      medications:
        formData.medications.length > 0 ? formData.medications : undefined,
      notes: formData.notes || undefined,
      nextCheckup: formData.nextCheckup
        ? new Date(formData.nextCheckup)
        : undefined,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Failed to submit medical record:", error);
    }
  };

  const recordTypes: MedicalRecordType[] = [
    "checkup",
    "vaccination",
    "treatment",
    "surgery",
    "emergency",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Animal Selection */}
        <div>
          <label
            htmlFor="animalId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Animal *
          </label>
          <select
            id="animalId"
            value={formData.animalId}
            onChange={(e) => handleInputChange("animalId", e.target.value)}
            required
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an animal</option>
            {animals.map((animal) => (
              <option
                key={animal._id || animal.id}
                value={animal._id || animal.id}
              >
                {animal.name} - {animal.species}
              </option>
            ))}
          </select>
        </div>

        {/* Record Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Record Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              handleInputChange("type", e.target.value as MedicalRecordType)
            }
            required
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {recordTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date *
          </label>
          <div className="relative">
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Next Checkup (optional) */}
        <div>
          <label
            htmlFor="nextCheckup"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Next Checkup
          </label>
          <div className="relative">
            <input
              type="date"
              id="nextCheckup"
              value={formData.nextCheckup}
              onChange={(e) => handleInputChange("nextCheckup", e.target.value)}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <label
          htmlFor="diagnosis"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Diagnosis
        </label>
        <textarea
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleInputChange("diagnosis", e.target.value)}
          rows={3}
          className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter diagnosis details..."
        />
      </div>

      {/* Treatment */}
      <div>
        <label
          htmlFor="treatment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Treatment
        </label>
        <textarea
          id="treatment"
          value={formData.treatment}
          onChange={(e) => handleInputChange("treatment", e.target.value)}
          rows={3}
          className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter treatment details..."
        />
      </div>

      {/* Medications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medications
        </label>

        {/* Add new medication */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addMedication())
            }
            placeholder="Add medication..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addMedication}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Medications list */}
        {formData.medications.length > 0 && (
          <div className="space-y-2">
            {formData.medications.map((medication, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
              >
                <span className="text-sm text-gray-700">{medication}</span>
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={4}
          className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Additional notes and observations..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <X className="h-4 w-4 mr-2 inline" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.animalId}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2 inline" />
          {isLoading ? "Saving..." : record ? "Update Record" : "Create Record"}
        </button>
      </div>
    </form>
  );
}
