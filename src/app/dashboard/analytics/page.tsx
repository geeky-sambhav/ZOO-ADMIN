"use client";

import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Users, Heart, Package, AlertTriangle } from "lucide-react";

export default function AnalyticsPage() {
  const { animals, inventory, getDashboardStats } = useDataStore();
  const { hasPermission } = useAuthStore();

  // Redirect if user doesn't have permission
  if (!hasPermission(["admin"])) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  const stats = getDashboardStats();

  // Prepare data for charts
  const categoryData = Object.entries(stats.categoryCounts).map(
    ([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      animals: count,
    })
  );

  const inventoryData = Object.entries(stats.inventoryByCategory).map(
    ([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      items: count,
      value: inventory
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + item.quantity * item.cost, 0),
    })
  );

  const healthData = [
    { name: "Healthy", value: stats.healthyAnimals, color: "#10B981" },
    { name: "Sick", value: stats.sickAnimals, color: "#EF4444" },
    {
      name: "Recovering",
      value: animals.filter((a) => a.healthStatus === "recovering").length,
      color: "#F59E0B",
    },
    {
      name: "Quarantine",
      value: animals.filter((a) => a.healthStatus === "quarantine").length,
      color: "#8B5CF6",
    },
  ].filter((item) => item.value > 0);

  // Mock monthly data for trends
  const monthlyData = [
    { month: "Jan", animals: 45, healthy: 42, sick: 3 },
    { month: "Feb", animals: 48, healthy: 44, sick: 4 },
    { month: "Mar", animals: 52, healthy: 48, sick: 4 },
    { month: "Apr", animals: 55, healthy: 51, sick: 4 },
    { month: "May", animals: 58, healthy: 54, sick: 4 },
    { month: "Jun", animals: 60, healthy: 56, sick: 4 },
  ];

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  const keyMetrics = [
    {
      title: "Total Animals",
      value: stats.totalAnimals,
      change: "+8.2%",
      changeType: "positive" as const,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Health Rate",
      value: `${Math.round(
        (stats.healthyAnimals / stats.totalAnimals) * 100
      )}%`,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: Heart,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Inventory Items",
      value: inventory.length,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Package,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Monthly Cost",
      value: `$${inventory
        .reduce((sum, item) => sum + item.quantity * item.cost, 0)
        .toFixed(0)}`,
      change: "-3.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive insights and trends for zoo operations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        metric.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      from last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Animal Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Animals by Category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="animals" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Health Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory by Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory Value by Category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [`$${value.toFixed(2)}`, "Value"]}
                />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Animal Trends
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="animals"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Total Animals"
                />
                <Line
                  type="monotone"
                  dataKey="healthy"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Healthy Animals"
                />
                <Line
                  type="monotone"
                  dataKey="sick"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Sick Animals"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Animal Statistics */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Animal Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Age:</span>
                <span className="font-medium">
                  {(
                    animals.reduce((sum, a) => sum + a.age, 0) / animals.length
                  ).toFixed(1)}{" "}
                  years
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Weight:</span>
                <span className="font-medium">
                  {(
                    animals.reduce((sum, a) => sum + a.weight, 0) /
                    animals.length
                  ).toFixed(1)}{" "}
                  kg
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Male/Female Ratio:</span>
                <span className="font-medium">
                  {animals.filter((a) => a.gender === "male").length}:
                  {animals.filter((a) => a.gender === "female").length}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Statistics */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Inventory Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-medium">
                  $
                  {inventory
                    .reduce((sum, item) => sum + item.quantity * item.cost, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Low Stock Items:</span>
                <span className="font-medium text-red-600">
                  {
                    inventory.filter(
                      (item) => item.quantity <= item.minThreshold
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expiring Soon:</span>
                <span className="font-medium text-orange-600">
                  {
                    inventory.filter(
                      (item) =>
                        item.expiryDate &&
                        item.expiryDate.getTime() - new Date().getTime() <
                          30 * 24 * 60 * 60 * 1000
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Health Statistics */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Health Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Health Rate:</span>
                <span className="font-medium text-green-600">
                  {Math.round(
                    (stats.healthyAnimals / stats.totalAnimals) * 100
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Animals Needing Checkup:</span>
                <span className="font-medium text-yellow-600">
                  {
                    animals.filter(
                      (a) =>
                        !a.lastCheckup ||
                        new Date().getTime() - a.lastCheckup.getTime() >
                          30 * 24 * 60 * 60 * 1000
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recovery Rate:</span>
                <span className="font-medium text-blue-600">
                  {animals.filter((a) => a.healthStatus === "recovering")
                    .length > 0
                    ? "85%"
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
