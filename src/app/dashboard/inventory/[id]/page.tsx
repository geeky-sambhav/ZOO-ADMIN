"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { InventoryItem } from "@/types";
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default function InventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [useQuantity, setUseQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    fetchInventoryItem,
    restockInventoryItem,
    useInventoryItem: consumeInventoryItem,
    deleteInventoryItem,
    inventoryLoading,
    inventoryError,
  } = useDataStore();
  const { hasPermission } = useAuthStore();

  useEffect(() => {
    if (id) {
      loadInventoryItem();
    }
  }, [id]);

  const loadInventoryItem = async () => {
    try {
      const fetchedItem = await fetchInventoryItem(id);
      setItem(fetchedItem);
    } catch (error) {
      console.error("Failed to load inventory item:", error);
    }
  };

  const handleRestock = async () => {
    if (!restockQuantity || !item) return;

    setIsLoading(true);
    try {
      await restockInventoryItem(
        item._id || item.id!,
        parseInt(restockQuantity)
      );
      setShowRestockModal(false);
      setRestockQuantity("");
      await loadInventoryItem(); // Refresh item data
    } catch (error) {
      console.error("Failed to restock item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleDelete = async () => {
    if (!item) return;

    setIsLoading(true);
    try {
      await deleteInventoryItem(item._id || item.id!);
      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (inventoryLoading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (inventoryError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Item
          </h3>
          <p className="text-gray-500 mb-4">{inventoryError}</p>
          <button
            onClick={loadInventoryItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "food":
        return "text-green-600 bg-green-50 border-green-200";
      case "medicine":
        return "text-red-600 bg-red-50 border-red-200";
      case "supplies":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "equipment":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStockStatus = () => {
    const minThreshold = item.minThreshold || 10;
    const maxThreshold = item.maxThreshold || 100;

    if (item.quantity <= minThreshold) {
      return {
        status: "low",
        color: "text-red-600 bg-red-50 border-red-200",
        icon: AlertTriangle,
        label: "Low Stock",
      };
    }
    if (item.quantity > maxThreshold) {
      return {
        status: "overstocked",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: TrendingDown,
        label: "Overstocked",
      };
    }
    return {
      status: "normal",
      color: "text-green-600 bg-green-50 border-green-200",
      icon: TrendingUp,
      label: "Normal",
    };
  };

  const stockStatus = getStockStatus();
  const stockPercentage = Math.min(
    (item.quantity / (item.maxThreshold || 100)) * 100,
    100
  );
  const isExpiringSoon =
    item.expiryDate &&
    new Date(item.expiryDate).getTime() - new Date().getTime() <
      30 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/inventory"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600">Inventory Item Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasPermission(["admin"]) && (
            <>
            
              
              <Link
                href={`/dashboard/inventory/${item._id || item.id}/edit`}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{item.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}
                >
                  {stockStatus.label}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost
                </label>
                <p className="text-gray-900">${item.cost.toFixed(2)}</p>
              </div>
              {item.supplier && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <p className="text-gray-900">{item.supplier}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Levels */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Stock Levels
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Current Stock
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(stockPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stockStatus.status === "low"
                        ? "bg-red-500"
                        : stockStatus.status === "overstocked"
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Min Threshold:</span>
                  <span className="ml-2 font-medium">
                    {item.minThreshold || 10} {item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Current:</span>
                  <span className="ml-2 font-medium">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Max Threshold:</span>
                  <span className="ml-2 font-medium">
                    {item.maxThreshold || 100} {item.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Important Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Last Restocked
                  </p>
                  <p className="text-gray-900">
                    {format(new Date(item.lastRestocked), "MMM dd, yyyy")}
                    <span className="text-gray-500 text-sm ml-2">
                      ({formatDistanceToNow(new Date(item.lastRestocked))} ago)
                    </span>
                  </p>
                </div>
              </div>
              {item.expiryDate && (
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isExpiringSoon ? "bg-red-50" : "bg-gray-50"
                    }`}
                  >
                    <Calendar
                      className={`h-5 w-5 ${
                        isExpiringSoon ? "text-red-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Expiry Date
                    </p>
                    <p
                      className={`${
                        isExpiringSoon
                          ? "text-red-600 font-medium"
                          : "text-gray-900"
                      }`}
                    >
                      {format(new Date(item.expiryDate), "MMM dd, yyyy")}
                      {isExpiringSoon && (
                        <span className="text-red-500 text-sm ml-2">
                          (Expiring soon!)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {hasPermission(["admin"]) && (
                <>
                  
                  <Link
                    href={`/dashboard/inventory/${item._id || item.id}/edit`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Item
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Alerts */}
          {(stockStatus.status === "low" || isExpiringSoon) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Alerts
              </h3>
              <div className="space-y-3">
                {stockStatus.status === "low" && (
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Low Stock Alert
                      </p>
                      <p className="text-sm text-red-600">
                        Stock is below minimum threshold
                      </p>
                    </div>
                  </div>
                )}
                {isExpiringSoon && (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Expiring Soon
                      </p>
                      <p className="text-sm text-yellow-600">
                        Item expires within 30 days
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


   

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Item
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {item.name}? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
