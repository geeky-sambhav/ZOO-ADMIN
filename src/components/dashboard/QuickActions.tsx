"use client";

import { UserRole } from "@/types";
import {
  Plus,
  Stethoscope,
  Package,
  Calendar,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  userRole: UserRole;
}

const QuickActions = ({ userRole }: QuickActionsProps) => {
  const getActionsForRole = () => {
    const baseActions = [
      {
        name: "Add New Animal",
        description: "Register a new animal in the system",
        icon: Plus,
        href: "/dashboard/animals/new",
        color: "text-blue-600",
        bgColor: "bg-blue-50 hover:bg-blue-100",
        roles: ["admin", "caretaker"],
      },
      {
        name: "View All Animals",
        description: "Browse and manage animal records",
        icon: Users,
        href: "/dashboard/animals",
        color: "text-green-600",
        bgColor: "bg-green-50 hover:bg-green-100",
        roles: ["admin", "doctor", "caretaker"],
      },
    ];

    const roleSpecificActions = {
      admin: [
        {
          name: "Medical Record",
          description: "Add new medical examination",
          icon: Stethoscope,
          href: "/dashboard/medical/new",
          color: "text-red-600",
          bgColor: "bg-red-50 hover:bg-red-100",
        },
        {
          name: "Update Inventory",
          description: "Manage food and supplies",
          icon: Package,
          href: "/dashboard/inventory",
          color: "text-orange-600",
          bgColor: "bg-orange-50 hover:bg-orange-100",
        },
       
        {
          name: "Schedule Feeding",
          description: "Plan feeding schedules",
          icon: Calendar,
          href: "/dashboard/feeding/new",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 hover:bg-yellow-100",
        },
      ],
      doctor: [
        {
          name: "Medical Record",
          description: "Add new medical examination",
          icon: Stethoscope,
          href: "/dashboard/medical/new",
          color: "text-red-600",
          bgColor: "bg-red-50 hover:bg-red-100",
        },
        {
          name: "Health Checkup",
          description: "Schedule routine checkups",
          icon: Calendar,
          href: "/dashboard/health/schedule",
          color: "text-blue-600",
          bgColor: "bg-blue-50 hover:bg-blue-100",
        },
        {
          name: "Medicine Inventory",
          description: "Check medicine supplies",
          icon: Package,
          href: "/dashboard/inventory?category=medicine",
          color: "text-orange-600",
          bgColor: "bg-orange-50 hover:bg-orange-100",
        },
      ],
      caretaker: [
        {
          name: "Schedule Feeding",
          description: "Plan feeding schedules",
          icon: Calendar,
          href: "/dashboard/feeding/new",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 hover:bg-yellow-100",
        },
        {
          name: "Food Inventory",
          description: "Check food supplies",
          icon: Package,
          href: "/dashboard/inventory?category=food",
          color: "text-orange-600",
          bgColor: "bg-orange-50 hover:bg-orange-100",
        },
      ],
    };

    const filteredBaseActions = baseActions.filter((action) =>
      action.roles.includes(userRole)
    );

    return [...filteredBaseActions, ...(roleSpecificActions[userRole] || [])];
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              href={action.href}
              className={`p-4 rounded-lg border border-gray-200 transition-all hover:shadow-md ${action.bgColor}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
