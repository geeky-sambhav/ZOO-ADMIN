"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { Animal, Enclosure, Species, User } from "@/types";
import { ArrowLeft, Upload, X, Loader } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import enclosureService from "@/services/enclosureService";
import animalService from "@/services/animalService";
import imageService from "@/services/imageService";
import speciesService from "@/services/speciesService";
import userService from "@/services/userService";

export default function EditAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const { updateAnimal } = useDataStore();
  const { hasPermission } = useAuthStore();

  const animalId = params.id as string;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [enclosuresLoading, setEnclosuresLoading] = useState(true);
  const [species, setSpecies] = useState<Species[]>([]);
  const [speciesLoading, setSpeciesLoading] = useState(true);
  const [caretakers, setCaretakers] = useState<User[]>([]);
  const [caretakersLoading, setCaretakersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    speciesId: "",
    caretakerId: "",
    sex: "Unknown" as "Male" | "Female" | "Unknown",
    status: "Healthy" as "Healthy" | "Sick" | "Deceased",
    enclosureId: "",
    info: "",
    imgUrl: "",
    dob: "",
    arrivalDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Check permission
  const hasAccess = hasPermission(["admin", "caretaker"]);

  // Fetch animal, enclosures and species on component mount
  useEffect(() => {
    if (!hasAccess) {
      router.push("/dashboard/animals");
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch animal data
        const animalResponse = await animalService.getAnimal(animalId);
        if (animalResponse.success && animalResponse.animal) {
          const animalData = animalResponse.animal;
          setAnimal(animalData);

          // Populate form with animal data
          setFormData({
            name: animalData.name || "",
            speciesId:
              typeof animalData.speciesId === "object"
                ? animalData.speciesId._id
                : animalData.speciesId || "",
            caretakerId:
              typeof animalData.caretakerId === "object"
                ? animalData.caretakerId.id || ""
                : animalData.caretakerId || "",
            sex: animalData.sex || "Unknown",
            status: animalData.status || "Healthy",
            enclosureId:
              typeof animalData.enclosureId === "object"
                ? animalData.enclosureId._id || animalData.enclosureId.id || ""
                : animalData.enclosureId || "",
            info: animalData.info || animalData.description || "",
            imgUrl: animalData.imgUrl || "",
            dob: animalData.dob
              ? new Date(animalData.dob).toISOString().split("T")[0]
              : "",
            arrivalDate: animalData.arrivalDate
              ? new Date(animalData.arrivalDate).toISOString().split("T")[0]
              : "",
          });
        }
      } catch (error) {
        console.error("Error fetching animal:", error);
        setErrors((prev) => ({
          ...prev,
          animal: "Failed to load animal data",
        }));
      } finally {
        setLoading(false);
      }

      try {
        // Fetch enclosures
        setEnclosuresLoading(true);
        const enclosuresResponse = await enclosureService.getAllEnclosures();
        if (enclosuresResponse.success && enclosuresResponse.enclosures) {
          setEnclosures(enclosuresResponse.enclosures);
        }
      } catch (error) {
        console.error("Error fetching enclosures:", error);
        setErrors((prev) => ({
          ...prev,
          enclosures: "Failed to load enclosures",
        }));
      } finally {
        setEnclosuresLoading(false);
      }

      try {
        // Fetch species
        setSpeciesLoading(true);
        const speciesResponse = await speciesService.getAllSpecies();
        if (speciesResponse.success && speciesResponse.species) {
          setSpecies(speciesResponse.species);
        }
      } catch (error) {
        console.error("Error fetching species:", error);
        setErrors((prev) => ({
          ...prev,
          species: "Failed to load species",
        }));
      } finally {
        setSpeciesLoading(false);
      }

      try {
        // Fetch caretakers
        setCaretakersLoading(true);
        const caretakersResponse = await userService.getCaretakers();
        console.log("caretakersResponse", caretakersResponse);
        if (caretakersResponse.success && caretakersResponse.caretakers) {
          setCaretakers(caretakersResponse.caretakers);
        }
      } catch (error) {
        console.error("Error fetching caretakers:", error);
        setErrors((prev) => ({
          ...prev,
          caretakers: "Failed to load caretakers",
        }));
      } finally {
        setCaretakersLoading(false);
      }
    };

    if (animalId) {
      fetchData();
    }
  }, [animalId, hasAccess, router]);

  const sexOptions = ["Male", "Female", "Unknown"] as const;
  const statusOptions = ["Healthy", "Sick", "Deceased"] as const;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Animal name is required";
    }

    if (!formData.speciesId) {
      newErrors.speciesId = "Species is required";
    }

    if (!formData.caretakerId) {
      newErrors.caretakerId = "Caretaker is required";
    }

    if (!formData.enclosureId) {
      newErrors.enclosureId = "Enclosure is required";
    }

    if (!formData.imgUrl.trim()) {
      newErrors.imgUrl = "Image URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const response = await imageService.uploadImage(files[0]);
      if (response.success && response.data?.url) {
        setFormData((prev) => ({
          ...prev,
          imgUrl: response.data!.url,
        }));
        // Clear any existing image errors
        setErrors((prev) => ({
          ...prev,
          imgUrl: "",
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors((prev) => ({
        ...prev,
        imgUrl: "Failed to upload image",
      }));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API according to the edit animal API expectations
      const animalData = {
        name: formData.name,
        caretakerId: formData.caretakerId,
        speciesId: formData.speciesId,
        enclosureId: formData.enclosureId,
        dob: formData.dob ? new Date(formData.dob) : animal?.dob,
        sex: formData.sex,
        arrivalDate: formData.arrivalDate
          ? new Date(formData.arrivalDate)
          : animal?.arrivalDate || new Date(),
        status: formData.status,
        info: formData.info,
        imgUrl: formData.imgUrl,
      };

      const response = await animalService.updateAnimal(animalId, animalData);

      if (response.success && response.animal) {
        // Update the data store
        await updateAnimal(animalId, animalData);
        // Redirect to animal detail page
        router.push(`/dashboard/animals/${animalId}`);
      } else {
        setErrors({ submit: response.message || "Failed to update animal" });
      }
    } catch (error) {
      console.error("Error updating animal:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update animal. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/animals/${animalId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Animal
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/animals"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Animals
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Animal not found</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/animals/${animalId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Animal
        </Link>
        <div className="border-l border-gray-300 pl-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Animal</h1>
          <p className="text-gray-600">
            Update {animal.name}&apos;s information
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter animal name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Species */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species *
                </label>
                <select
                  name="speciesId"
                  value={formData.speciesId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.speciesId
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={speciesLoading}
                >
                  <option value="">
                    {speciesLoading ? "Loading species..." : "Select species"}
                  </option>
                  {species.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.commonName} ({spec.scientificName})
                    </option>
                  ))}
                </select>
                {errors.speciesId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.speciesId}
                  </p>
                )}
                {errors.species && (
                  <p className="mt-1 text-sm text-red-600">{errors.species}</p>
                )}
              </div>

              {/* Caretaker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caretaker *
                </label>
                <select
                  name="caretakerId"
                  value={formData.caretakerId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.caretakerId
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={caretakersLoading}
                >
                  <option value="">
                    {caretakersLoading
                      ? "Loading caretakers..."
                      : "Select caretaker"}
                  </option>
                  {caretakers.map((caretaker) => (
                    <option key={caretaker._id} value={caretaker._id}>
                      {caretaker.name}
                    </option>
                  ))}
                </select>
                {errors.caretakerId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.caretakerId}
                  </p>
                )}
                {errors.caretakers && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.caretakers}
                  </p>
                )}
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sexOptions.map((sex) => (
                    <option key={sex} value={sex}>
                      {sex}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Arrival Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Date
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Enclosure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enclosure *
                </label>
                <select
                  name="enclosureId"
                  value={formData.enclosureId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.enclosureId
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={enclosuresLoading}
                >
                  <option value="">
                    {enclosuresLoading
                      ? "Loading enclosures..."
                      : "Select enclosure"}
                  </option>
                  {enclosures.map((enclosure) => (
                    <option
                      key={enclosure._id || enclosure.id}
                      value={enclosure._id || enclosure.id}
                    >
                      {enclosure.name} ({enclosure.location})
                    </option>
                  ))}
                </select>
                {errors.enclosureId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.enclosureId}
                  </p>
                )}
                {errors.enclosures && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.enclosures}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="info"
                value={formData.info}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter animal description or notes"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Animal Image</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {/* Current Image */}
              {formData.imgUrl && (
                <div className="relative w-48 h-48 mx-auto">
                  <Image
                    src={formData.imgUrl}
                    alt="Animal preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, imgUrl: "" }))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Image URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="imgUrl"
                  value={formData.imgUrl}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.imgUrl
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter image URL or upload below"
                />
                {errors.imgUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.imgUrl}</p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Upload Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingImages ? (
                        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          {uploadingImages ? "Uploading..." : "Click to upload"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/dashboard/animals/${animalId}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Animal"}
          </button>
        </div>
      </form>
    </div>
  );
}
