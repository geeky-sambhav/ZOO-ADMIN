"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import MedicalRecordForm from "@/components/medical/MedicalRecordForm";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const { addMedicalRecord, medicalRecordsLoading } = useDataStore();
  const { hasPermission } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  if (!hasPermission(["admin", "doctor"])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 mb-6">
            You don't have permission to create medical records.
          </p>
          <Link
            href="/dashboard/medical"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Medical Records
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await addMedicalRecord(data);
      router.push("/dashboard/medical");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create medical record"
      );
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/medical");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard/medical"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Medical Records
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              New Medical Record
            </h1>
            <p className="text-gray-600 mt-1">
              Create a new medical record for an animal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <MedicalRecordForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={medicalRecordsLoading}
          />
        </div>
      </div>
    </div>
  );
}
