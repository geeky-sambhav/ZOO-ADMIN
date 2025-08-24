"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { AuditLog } from "@/types";
import {
  Shield,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { auditLogs } = useDataStore();
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
            Only administrators can view audit logs.
          </p>
        </div>
      </div>
    );
  }

  // Mock audit logs since we don't have real ones yet
  const mockAuditLogs: AuditLog[] = [
    {
      id: "1",
      userId: "1",
      action: "CREATE",
      resource: "Animal",
      resourceId: "1",
      newData: { name: "Leo", species: "African Lion" },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      userId: "2",
      action: "UPDATE",
      resource: "Animal",
      resourceId: "1",
      oldData: { healthStatus: "healthy" },
      newData: { healthStatus: "sick" },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      ipAddress: "192.168.1.101",
    },
    {
      id: "3",
      userId: "1",
      action: "CREATE",
      resource: "InventoryItem",
      resourceId: "1",
      newData: { name: "Premium Cat Food", quantity: 50 },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      ipAddress: "192.168.1.100",
    },
    {
      id: "4",
      userId: "3",
      action: "UPDATE",
      resource: "InventoryItem",
      resourceId: "1",
      oldData: { quantity: 50 },
      newData: { quantity: 45 },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      ipAddress: "192.168.1.102",
    },
    {
      id: "5",
      userId: "1",
      action: "DELETE",
      resource: "Animal",
      resourceId: "5",
      oldData: { name: "Old Animal", species: "Unknown" },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      ipAddress: "192.168.1.100",
    },
  ];

  const allLogs = [...auditLogs, ...mockAuditLogs];

  // Filter audit logs
  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.includes(searchTerm);
    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actions = ["all", "CREATE", "UPDATE", "DELETE"];

  const getUserName = (userId: string) => {
    switch (userId) {
      case "1":
        return "John Admin";
      case "2":
        return "Dr. Sarah Wilson";
      case "3":
        return "Mike Caretaker";
      default:
        return "Unknown User";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "text-green-600 bg-green-50 border-green-200";
      case "UPDATE":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "DELETE":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const statsCards = [
    {
      title: "Total Actions",
      value: allLogs.length,
      icon: Shield,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Today",
      value: allLogs.filter(
        (log) =>
          new Date(log.timestamp).toDateString() === new Date().toDateString()
      ).length,
      icon: Calendar,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Creates",
      value: allLogs.filter((log) => log.action === "CREATE").length,
      icon: Eye,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Deletes",
      value: allLogs.filter((log) => log.action === "DELETE").length,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        </div>
        <p className="text-gray-600">
          Track all system changes and user activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by resource, action, or user..."
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? "bg-blue-50 text-blue-700 border-blue-300"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="block w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action === "all" ? "All Actions" : action}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-500">
              {searchTerm || actionFilter !== "all"
                ? "Try adjusting your search or filters"
                : "System activities will appear here"}
            </p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{filteredLogs.length}</span> of{" "}
                  <span className="font-medium">{allLogs.length}</span> log
                  entries
                </p>
                {(searchTerm || actionFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActionFilter("all");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Logs List */}
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(
                        log.action
                      )}`}
                    >
                      <Shield className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {log.action} {log.resource}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            By {getUserName(log.userId)} • Resource ID:{" "}
                            {log.resourceId}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDistanceToNow(log.timestamp, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {log.oldData && (
                            <div className="bg-red-50 p-3 rounded-lg">
                              <h4 className="text-sm font-medium text-red-800 mb-1">
                                Previous Data
                              </h4>
                              <pre className="text-xs text-red-700 whitespace-pre-wrap">
                                {JSON.stringify(log.oldData, null, 2)}
                              </pre>
                            </div>
                          )}

                          {log.newData && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h4 className="text-sm font-medium text-green-800 mb-1">
                                New Data
                              </h4>
                              <pre className="text-xs text-green-700 whitespace-pre-wrap">
                                {JSON.stringify(log.newData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 pt-2 border-t border-gray-200">
                          <span>
                            Timestamp: {log.timestamp.toLocaleString()}
                          </span>
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
