"use client";

import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import HealthAlerts from "@/components/dashboard/HealthAlerts";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getDashboardStats } = useDataStore();

  const stats = getDashboardStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome to your {user?.role} dashboard. Here&apos;s what&apos;s happening at
              the zoo today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right text-sm text-gray-500">
              <p>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="font-medium text-gray-900">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats stats={stats} userRole={user?.role || "caretaker"} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <QuickActions userRole={user?.role || "caretaker"} />
         
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
         
          <InventoryAlerts />
        </div>
      </div>
    </div>
  );
}
