"use client";

import { DashboardStats as StatsType, UserRole } from "@/types";
import {
  Users,
  Heart,
  Package,
  AlertTriangle,
  Calendar,
  Utensils,
} from "lucide-react";

interface DashboardStatsProps {
  stats: StatsType;
  userRole: UserRole;
}

const DashboardStats = ({ stats, userRole }: DashboardStatsProps) => {
  const getStatsForRole = () => {
    const baseStats = [
      {
        name: "Total Animals",
        value: stats.totalAnimals,
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        change: "+2.5%",
        changeType: "positive" as const,
      },
      {
        name: "Healthy Animals",
        value: stats.healthyAnimals,
        icon: Heart,
        color: "text-green-600",
        bgColor: "bg-green-50",
        change: "+1.2%",
        changeType: "positive" as const,
      },
    ];

    if (userRole === "admin") {
      return [
        ...baseStats,
        {
          name: "Low Stock Items",
          value: stats.lowInventoryItems,
          icon: Package,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          change: "+3",
          changeType: "negative" as const,
        },
        {
          name: "Sick Animals",
          value: stats.sickAnimals,
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          change: "-1",
          changeType: "positive" as const,
        },
      ];
    }

    if (userRole === "doctor") {
      return [
        ...baseStats,
        {
          name: "Sick Animals",
          value: stats.sickAnimals,
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          change: "-1",
          changeType: "positive" as const,
        },
        {
          name: "Upcoming Checkups",
          value: stats.upcomingCheckups,
          icon: Calendar,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          change: "+2",
          changeType: "neutral" as const,
        },
      ];
    }

    // Caretaker
    return [
      ...baseStats,
      {
        name: "Feedings Due",
        value: stats.feedingsDue,
        icon: Utensils,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        change: "+3",
        changeType: "neutral" as const,
      },
      {
        name: "Low Stock Items",
        value: stats.lowInventoryItems,
        icon: Package,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        change: "+1",
        changeType: "negative" as const,
      },
    ];
  };

  const statsToShow = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsToShow.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last week
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
