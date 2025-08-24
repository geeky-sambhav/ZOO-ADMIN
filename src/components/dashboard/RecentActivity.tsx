"use client";

import { UserRole } from "@/types";
import {
  Clock,
  Users,
  Stethoscope,
  Package,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  userRole: UserRole;
}

interface Activity {
  id: string;
  type:
    | "animal_added"
    | "medical_record"
    | "inventory_update"
    | "feeding_scheduled"
    | "report_generated";
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  icon: any;
  color: string;
}

const RecentActivity = ({ userRole }: RecentActivityProps) => {
  // Mock data - in real app this would come from the store
  const activities: Activity[] = [
    {
      id: "1",
      type: "animal_added",
      title: "New Animal Added",
      description: "Charlie the Green Iguana was added to the system",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: "Mike Caretaker",
      icon: Users,
      color: "text-blue-600",
    },
    {
      id: "2",
      type: "medical_record",
      title: "Medical Checkup",
      description: "Leo the Lion received routine health examination",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: "Dr. Sarah Wilson",
      icon: Stethoscope,
      color: "text-red-600",
    },
    {
      id: "3",
      type: "inventory_update",
      title: "Inventory Restocked",
      description: "Premium Cat Food inventory was updated (+50 kg)",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      user: "John Admin",
      icon: Package,
      color: "text-orange-600",
    },
    {
      id: "4",
      type: "feeding_scheduled",
      title: "Feeding Scheduled",
      description: "Morning feeding schedule updated for all mammals",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      user: "Mike Caretaker",
      icon: Calendar,
      color: "text-yellow-600",
    },
    {
      id: "5",
      type: "report_generated",
      title: "Monthly Report",
      description: "Animal health and inventory report generated",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      user: "John Admin",
      icon: FileText,
      color: "text-purple-600",
    },
  ];

  const getFilteredActivities = () => {
    if (userRole === "doctor") {
      return activities.filter((activity) =>
        ["medical_record", "animal_added", "inventory_update"].includes(
          activity.type
        )
      );
    }
    if (userRole === "caretaker") {
      return activities.filter((activity) =>
        ["animal_added", "feeding_scheduled", "inventory_update"].includes(
          activity.type
        )
      );
    }
    return activities; // Admin sees all
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <button className="text-sm text-blue-600 hover:text-blue-500">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {filteredActivities.slice(0, 5).map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}
              >
                <Icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
