"use client";

import { UserRole } from "@/types";
import { Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { formatDistanceToNow, addDays, addHours } from "date-fns";

interface UpcomingTasksProps {
  userRole: UserRole;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "critical";
  type: "feeding" | "checkup" | "cleaning" | "medication" | "report";
  assignedTo?: string;
  completed: boolean;
}

const UpcomingTasks = ({ userRole }: UpcomingTasksProps) => {
  // Mock data - in real app this would come from the store
  const allTasks: Task[] = [
    {
      id: "1",
      title: "Feed Lions",
      description: "Morning feeding for lion pride",
      dueDate: addHours(new Date(), 2),
      priority: "high",
      type: "feeding",
      assignedTo: "Mike Caretaker",
      completed: false,
    },
    {
      id: "2",
      title: "Leo Health Checkup",
      description: "Routine monthly health examination",
      dueDate: addDays(new Date(), 1),
      priority: "medium",
      type: "checkup",
      assignedTo: "Dr. Sarah Wilson",
      completed: false,
    },
    {
      id: "3",
      title: "Clean Reptile House",
      description: "Weekly deep cleaning of reptile enclosures",
      dueDate: addHours(new Date(), 6),
      priority: "medium",
      type: "cleaning",
      assignedTo: "Mike Caretaker",
      completed: false,
    },
    {
      id: "4",
      title: "Administer Medication",
      description: "Give antibiotics to Charlie (Iguana)",
      dueDate: addHours(new Date(), 4),
      priority: "critical",
      type: "medication",
      assignedTo: "Dr. Sarah Wilson",
      completed: false,
    },
    {
      id: "5",
      title: "Weekly Report",
      description: "Generate weekly animal care report",
      dueDate: addDays(new Date(), 2),
      priority: "low",
      type: "report",
      assignedTo: "John Admin",
      completed: false,
    },
  ];

  const getTasksForRole = () => {
    const currentUser =
      userRole === "admin"
        ? "John Admin"
        : userRole === "doctor"
        ? "Dr. Sarah Wilson"
        : "Mike Caretaker";

    if (userRole === "admin") {
      return allTasks; // Admin sees all tasks
    }

    // Filter tasks by role and assignment
    return allTasks.filter((task) => {
      if (userRole === "doctor") {
        return (
          ["checkup", "medication"].includes(task.type) ||
          task.assignedTo === currentUser
        );
      }
      if (userRole === "caretaker") {
        return (
          ["feeding", "cleaning"].includes(task.type) ||
          task.assignedTo === currentUser
        );
      }
      return false;
    });
  };

  const tasks = getTasksForRole()
    .filter((task) => !task.completed)
    .slice(0, 6);

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const isDueSoon = (dueDate: Date) => {
    const now = new Date();
    const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
              isOverdue(task.dueDate)
                ? "border-red-200 bg-red-50"
                : isDueSoon(task.dueDate)
                ? "border-orange-200 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {task.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span
                    className={
                      isOverdue(task.dueDate) ? "text-red-600 font-medium" : ""
                    }
                  >
                    {isOverdue(task.dueDate) ? "Overdue" : "Due"}{" "}
                    {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                  </span>
                </div>
                {userRole === "admin" && task.assignedTo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Assigned to: {task.assignedTo}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {isOverdue(task.dueDate) && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <button className="text-gray-400 hover:text-green-600 transition-colors">
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500">All caught up!</p>
          <p className="text-sm text-gray-400">No upcoming tasks</p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500">
            View All Tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;
