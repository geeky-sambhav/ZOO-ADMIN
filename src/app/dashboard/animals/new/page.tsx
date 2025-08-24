"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { AnimalCategory, Enclosure, Species } from "@/types";
import { ArrowLeft, Upload, X, Loader } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import enclosureService from "@/services/enclosureService";
import animalService from "@/services/animalService";
import imageService from "@/services/imageService";
import speciesService from "@/services/speciesService";

export default function NewAnimalPage() {
  const router = useRouter();
  const { addAnimal } = useDataStore();
  const { hasPermission } = useAuthStore();

  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [enclosuresLoading, setEnclosuresLoading] = useState(true);
  const [species, setSpecies] = useState<Species[]>([]);
  const [speciesLoading, setSpeciesLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    speciesId: "",
    category: "mammals" as AnimalCategory,
    age: 0,
    weight: 0,
    sex: "Unknown" as "Male" | "Female" | "Unknown",
    status: "Healthy" as "Healthy" | "Sick" | "Deceased",
    enclosureId: "",
    info: "",
    imgUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch enclosures and species on component mount
  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

  // Redirect if user doesn't have permission
  if (!hasPermission(["admin", "caretaker"])) {
    router.push("/dashboard/animals");
    return null;
  }

  const categories: AnimalCategory[] = [
    "mammals",
    "reptiles",
    "birds",
    "amphibians",
    "fish",
    "insects",
  ];
  const sexOptions = ["Male", "Female", "Unknown"] as const;
  const statusOptions = ["Healthy", "Sick", "Deceased"] as const;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.speciesId) newErrors.speciesId = "Species is required";
    if (formData.age < 0) newErrors.age = "Age must be positive";
    if (formData.weight <= 0) newErrors.weight = "Weight must be positive";
    if (!formData.enclosureId) newErrors.enclosureId = "Enclosure is required";
    if (!formData.imgUrl) newErrors.imgUrl = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare animal data for API
      const animalData = {
        name: formData.name,
        speciesId: formData.speciesId,
        dob: new Date(Date.now() - formData.age * 365.25 * 24 * 60 * 60 * 1000), // Calculate DOB from age
        sex: formData.sex,
        status: formData.status,
        enclosureId: formData.enclosureId,
        imgUrl: formData.imgUrl,
        info: formData.info,
        caretakerId: "67696a33a6eb1b89e0b862c0", // Placeholder - should be current user or selected caretaker
        arrivalDate: new Date(),
      };

      // Add animal via API
      const response = await animalService.addAnimal(animalData);

      if (response.success) {
        // Also update local store
        if (response.animal) {
          addAnimal(response.animal);
        }
        router.push("/dashboard/animals");
      } else {
        throw new Error(response.message || "Failed to add animal");
      }
    } catch (error) {
      console.error("Error adding animal:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : "Failed to add animal",
      }));
    } finally {
      setIsSubmitting(false);
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
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages(true);

    try {
      const result = await imageService.uploadImage(file);

      if (result.success && result.data) {
        setFormData((prev) => ({
          ...prev,
          imgUrl: result.data!.url,
        }));

        // Clear any previous image errors
        if (errors.images) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.images;
            return newErrors;
          });
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          images: result.message || "Failed to upload image",
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors((prev) => ({
        ...prev,
        images: "Failed to upload image. Please try again.",
      }));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      imgUrl: "",
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/animals"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Animal</h1>
          <p className="text-gray-600">
            Register a new animal in the zoo management system
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Animal Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter animal name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Species */}
              <div>
                <label
                  htmlFor="speciesId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Species *
                </label>
                <select
                  id="speciesId"
                  name="speciesId"
                  value={formData.speciesId}
                  onChange={handleInputChange}
                  disabled={speciesLoading}
                  className={`block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.speciesId ? "border-red-300" : "border-gray-300"
                  } ${speciesLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {speciesLoading ? "Loading species..." : "Select a species"}
                  </option>
                  {species.map((sp) => (
                    <option key={sp._id} value={sp._id}>
                      {sp.commonName} ({sp.scientificName})
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

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sex */}
              <div>
                <label
                  htmlFor="sex"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sex
                </label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sexOptions.map((sex) => (
                    <option key={sex} value={sex}>
                      {sex}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Age (years) *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className={`block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.age ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0.1"
                  step="0.1"
                  className={`block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.weight ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location & Health */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Location & Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enclosure */}
              <div>
                <label
                  htmlFor="enclosureId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enclosure *
                </label>
                <select
                  id="enclosureId"
                  name="enclosureId"
                  value={formData.enclosureId}
                  onChange={handleInputChange}
                  disabled={enclosuresLoading}
                  className={`block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.enclosureId ? "border-red-300" : "border-gray-300"
                  } ${
                    enclosuresLoading ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">
                    {enclosuresLoading
                      ? "Loading enclosures..."
                      : "Select an enclosure"}
                  </option>
                  {enclosures.map((enclosure) => (
                    <option
                      key={enclosure.id || enclosure._id}
                      value={enclosure.id || enclosure._id}
                    >
                      {enclosure.name} - {enclosure.location}
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

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <label
              htmlFor="info"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Additional Information
            </label>
            <textarea
              id="info"
              name="info"
              value={formData.info}
              onChange={handleInputChange}
              rows={3}
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about the animal (minimum 8 characters)..."
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div className="space-y-4">
              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg ${
                    uploadingImages
                      ? "cursor-not-allowed bg-gray-100"
                      : "cursor-pointer bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImages ? (
                      <Loader className="w-8 h-8 mb-4 text-gray-500 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      {uploadingImages ? (
                        "Uploading image..."
                      ) : (
                        <>
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or GIF (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload Error */}
              {errors.images && (
                <p className="text-sm text-red-600">{errors.images}</p>
              )}

              {/* Image Preview */}
              {formData.imgUrl && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Image
                      src={formData.imgUrl}
                      alt="Animal preview"
                      width={200}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage()}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {(errors.submit || errors.imgUrl) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              {errors.submit && (
                <p className="text-sm text-red-600">{errors.submit}</p>
              )}
              {errors.imgUrl && (
                <p className="text-sm text-red-600">{errors.imgUrl}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/dashboard/animals"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting || uploadingImages
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "Adding..."
                : uploadingImages
                ? "Uploading..."
                : "Add Animal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
