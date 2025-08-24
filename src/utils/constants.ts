import {
  AnimalCategory,
  HealthStatus,
  InventoryCategory,
  UserRole,
} from "@/types";

export const ANIMAL_CATEGORIES: AnimalCategory[] = [
  "mammals",
  "reptiles",
  "birds",
  "amphibians",
  "fish",
  "insects",
];

export const HEALTH_STATUSES: HealthStatus[] = [
  "healthy",
  "sick",
  "injured",
  "recovering",
  "quarantine",
];

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  "food",
  "medicine",
  "supplies",
  "equipment",
];

export const USER_ROLES: UserRole[] = ["admin", "doctor", "caretaker"];

export const ROLE_PERMISSIONS = {
  admin: [
    "view_all",
    "create_animals",
    "edit_animals",
    "delete_animals",
    "manage_inventory",
    "view_medical_records",
    "create_medical_records",
    "view_analytics",
    "view_audit_logs",
    "manage_users",
  ],
  doctor: [
    "view_animals",
    "view_medical_records",
    "create_medical_records",
    "edit_medical_records",
    "view_inventory",
    "view_health_alerts",
  ],
  caretaker: [
    "view_animals",
    "create_animals",
    "edit_animals",
    "view_inventory",
    "manage_feeding",
    "view_notifications",
  ],
} as const;

export const NOTIFICATION_TYPES = {
  LOW_INVENTORY: "low_inventory",
  MEDICAL_CHECKUP: "medical_checkup",
  FEEDING_DUE: "feeding_due",
  SYSTEM: "system",
  ALERT: "alert",
} as const;

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;
