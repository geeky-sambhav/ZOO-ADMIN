"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Home,
  Users,
  Heart,
  Package,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Menu,
  X,
  Stethoscope,
  Calendar,
  Shield,
  Building,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, hasPermission } = useAuthStore();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["admin", "doctor", "caretaker"],
    },
    {
      name: "Animals",
      href: "/dashboard/animals",
      icon: Users,
      roles: ["admin", "doctor", "caretaker"],
    },
    {
      name: "Enclosures",
      href: "/dashboard/enclosures",
      icon: Building,
      roles: ["admin", "caretaker"],
    },
    {
      name: "Medical Records",
      href: "/dashboard/medical",
      icon: Stethoscope,
      roles: ["admin", "doctor"],
    },
    {
      name: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
      roles: ["admin", "doctor", "caretaker"],
    },
    {
      name: "Feeding Schedule",
      href: "/dashboard/feeding",
      icon: Calendar,
      roles: ["admin", "caretaker"],
    },
    
    
    
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      roles: ["admin", "doctor", "caretaker"],
    },
    
   
  ];

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.roles as any)
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md hover:bg-gray-50 transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0
          transition-transform duration-300 ease-in-out
          w-64 bg-white shadow-lg border-r border-gray-200
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Zoo Admin</h1>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role} Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    active ? "text-blue-700" : "text-gray-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
