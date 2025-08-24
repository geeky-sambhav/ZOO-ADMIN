"use client";

import { useDataStore } from "@/store/dataStore";
import { Package, AlertTriangle, ArrowRight, TrendingDown } from "lucide-react";
import Link from "next/link";

const InventoryAlerts = () => {
  const { getLowStockItems } = useDataStore();

  const lowStockItems = getLowStockItems();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "food":
        return "text-green-600 bg-green-50";
      case "medicine":
        return "text-red-600 bg-red-50";
      case "supplies":
        return "text-blue-600 bg-blue-50";
      case "equipment":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 20) return { level: "critical", color: "bg-red-500" };
    if (percentage <= 40) return { level: "low", color: "bg-orange-500" };
    if (percentage <= 60) return { level: "medium", color: "bg-yellow-500" };
    return { level: "good", color: "bg-green-500" };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Inventory Alerts
          </h2>
        </div>
        {lowStockItems.length > 0 && (
          <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded-full">
            {lowStockItems.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item) => {
          const stockLevel = getStockLevel(
            item.quantity,
            item.minThreshold,
            item.maxThreshold
          );
          const stockPercentage = (item.quantity / item.maxThreshold) * 100;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                stockLevel.level === "critical"
                  ? "border-red-200 bg-red-50"
                  : stockLevel.level === "low"
                  ? "border-orange-200 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-1">
                      {stockLevel.level === "critical" && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          stockLevel.level === "critical"
                            ? "text-red-600"
                            : stockLevel.level === "low"
                            ? "text-orange-600"
                            : "text-gray-600"
                        }`}
                      >
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Min: {item.minThreshold} {item.unit}
                    </span>
                  </div>

                  {/* Stock level bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${stockLevel.color}`}
                      style={{ width: `${Math.max(stockPercentage, 5)}%` }}
                    />
                  </div>

                  {/* Additional info */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {stockLevel.level === "critical"
                        ? "Critical Level"
                        : stockLevel.level === "low"
                        ? "Low Stock"
                        : "Running Low"}
                    </span>
                    {item.expiryDate && (
                      <span className="text-xs text-gray-500">
                        Expires: {item.expiryDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/dashboard/inventory/${item.id}`}
                  className="ml-3 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {lowStockItems.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500">All stocked up!</p>
          <p className="text-sm text-gray-400">No low inventory alerts</p>
        </div>
      )}

      {lowStockItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/inventory"
            className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-500"
          >
            Manage Inventory
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
