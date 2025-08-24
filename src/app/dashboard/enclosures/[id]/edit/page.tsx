"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { Enclosure } from "@/types";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import EnclosureForm from "@/components/enclosures/EnclosureForm";

export default function EditEnclosurePage() {
  const [enclosure, setEnclosure] = useState<Enclosure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const { fetchEnclosure, updateEnclosure } = useDataStore();
  const { hasPermission } = useAuthStore();

  const enclosureId = params.id as string;

  // Redirect if user doesn't have permission
  if (!hasPermission(["admin", "caretaker"])) {
    router.push("/dashboard/enclosures");
    return null;
  }

  useEffect(() => {
    const loadEnclosure = async () => {
      if (!enclosureId) return;

      setIsLoading(true);
      setError(null);

      try {
        const enclosureData = await fetchEnclosure(enclosureId);
        if (enclosureData) {
          setEnclosure(enclosureData);
        } else {
          setError("Enclosure not found");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load enclosure"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEnclosure();
  }, [enclosureId, fetchEnclosure]);

  const handleSubmit = async (
    data: Omit<
      Enclosure,
      "_id" | "id" | "createdAt" | "updatedAt" | "currentOccupancy"
    >
  ) => {
    if (!enclosure) return;

    setIsSaving(true);
    try {
      await updateEnclosure(enclosureId, data);
      router.push(`/dashboard/enclosures/${enclosureId}`);
    } catch (error) {
      console.error("Failed to update enclosure:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update enclosure. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/enclosures/${enclosureId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/enclosures/${enclosureId}`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enclosure
          </Link>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !enclosure) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/enclosures"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enclosures
          </Link>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || "Enclosure not found"}
          </h3>
          <div className="mt-6">
            <Link
              href="/dashboard/enclosures"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Enclosures
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/dashboard/enclosures/${enclosureId}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {enclosure.name}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Enclosure</h1>
        <p className="text-gray-600">Update the details for {enclosure.name}</p>
      </div>

      {/* Form */}
      <EnclosureForm
        enclosure={enclosure}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
}
