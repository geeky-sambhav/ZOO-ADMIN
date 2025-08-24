"use client";

import { InventoryItem } from "@/types";
import {
  Package,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface InventoryCardProps {
  item: InventoryItem;
}

const InventoryCard = ({ item }: InventoryCardProps) => {
  const getCategoryColor = (category: InventoryItem["category"]) => {
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
    item.expiryDate.getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days

  const itemId = item._id || item.id;

  return (
    <Link href={`/dashboard/inventory/${itemId}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
              {item.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(
                  item.category
                )}`}
              >
                {item.category}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}
              >
                {stockStatus.label}
              </span>
            </div>
          </div>
          <Package className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>

        {/* Stock Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Stock Level
            </span>
            <span className="text-sm text-gray-600">
              {item.quantity} / {item.maxThreshold} {item.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                stockStatus.status === "low"
                  ? "bg-red-500"
                  : stockStatus.status === "overstocked"
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.max(stockPercentage, 5)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
            <span>Min: {item.minThreshold}</span>
            <span>Max: {item.maxThreshold}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {/* Cost */}
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              ${item.cost.toFixed(2)} per {item.unit}
            </span>
          </div>

          {/* Last Restocked */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              Restocked{" "}
              {formatDistanceToNow(item.lastRestocked, { addSuffix: true })}
            </span>
          </div>

          {/* Supplier */}
          {item.supplier && (
            <div className="flex items-center text-sm text-gray-600">
              <Package className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{item.supplier}</span>
            </div>
          )}

          {/* Expiry Date */}
          {item.expiryDate && (
            <div
              className={`flex items-center text-sm ${
                isExpiringSoon ? "text-red-600" : "text-gray-600"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 mr-2 flex-shrink-0 ${
                  isExpiringSoon ? "text-red-500" : "text-gray-400"
                }`}
              />
              <span>
                Expires{" "}
                {formatDistanceToNow(item.expiryDate, { addSuffix: true })}
                {isExpiringSoon && " (Soon!)"}
              </span>
            </div>
          )}
        </div>

        {/* Alerts */}
        {(stockStatus.status === "low" || isExpiringSoon) && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium">
                {stockStatus.status === "low" && "Low stock alert"}
                {stockStatus.status === "low" && isExpiringSoon && " • "}
                {isExpiringSoon && "Expiring soon"}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Current: {item.quantity} {item.unit}
            </span>
            <div className="flex items-center space-x-1">
              <stockStatus.icon
                className={`h-4 w-4 ${
                  stockStatus.status === "low"
                    ? "text-red-500"
                    : stockStatus.status === "overstocked"
                    ? "text-orange-500"
                    : "text-green-500"
                }`}
              />
              <span className="text-xs text-gray-500">
                {Math.round(stockPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default InventoryCard;
