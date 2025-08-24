"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { Enclosure } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EnclosureForm from "@/components/enclosures/EnclosureForm";

export default function NewEnclosurePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addEnclosure } = useDataStore();
  const { hasPermission } = useAuthStore();

  // Redirect if user doesn't have permission
  if (!hasPermission(["admin", "caretaker"])) {
    router.push("/dashboard/enclosures");
    return null;
  }

  const handleSubmit = async (
    data: Omit<
      Enclosure,
      "_id" | "id" | "createdAt" | "updatedAt" | "currentOccupancy"
    >
  ) => {
    setIsLoading(true);
    try {
      await addEnclosure(data);
      router.push("/dashboard/enclosures");
    } catch (error) {
      console.error("Failed to create enclosure:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create enclosure. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/enclosures");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/enclosures"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Enclosures
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Enclosure</h1>
        <p className="text-gray-600">
          Create a new enclosure for housing animals in the zoo
        </p>
      </div>

      {/* Form */}
      <EnclosureForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
