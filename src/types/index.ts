// User and Authentication Types
export type UserRole = "admin" | "doctor" | "caretaker";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Animal Types
export type AnimalCategory =
  | "mammals"
  | "reptiles"
  | "birds"
  | "amphibians"
  | "fish"
  | "insects";
export type HealthStatus =
  | "healthy"
  | "sick"
  | "injured"
  | "recovering"
  | "quarantine";

export interface Animal {
  id: string;
  name: string;
  species: string;
  category: AnimalCategory;
  age: number;
  weight: number;
  gender: "male" | "female";
  healthStatus: HealthStatus;
  enclosureId: string;
  images: string[];
  description?: string;
  arrivalDate: Date;
  lastCheckup?: Date;
  caretakerId?: string;
  doctorId?: string;
}

// Medical Records
export interface MedicalRecord {
  id: string;
  animalId: string;
  doctorId: string;
  date: Date;
  type: "checkup" | "vaccination" | "treatment" | "surgery" | "emergency";
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  notes?: string;
  nextCheckup?: Date;
}

// Inventory Types
export type InventoryCategory = "food" | "medicine" | "supplies" | "equipment";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  cost: number;
  supplier?: string;
  expiryDate?: Date;
  lastRestocked: Date;
}

// Enclosure Types
export interface Enclosure {
  id: string;
  name: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  location: string;
  temperature?: number;
  humidity?: number;
  lastCleaned?: Date;
  caretakerId?: string;
}

// Feeding Schedule
export interface FeedingSchedule {
  id: string;
  animalId: string;
  foodType: string;
  quantity: number;
  frequency: string;
  time: string;
  caretakerId: string;
  lastFed?: Date;
  notes?: string;
}

// Notifications
export interface Notification {
  id: string;
  type:
    | "low_inventory"
    | "medical_checkup"
    | "feeding_due"
    | "system"
    | "alert";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  read: boolean;
  createdAt: Date;
  userId?: string;
  relatedId?: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldData?: any;
  newData?: any;
  timestamp: Date;
  ipAddress?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  lowInventoryItems: number;
  upcomingCheckups: number;
  feedingsDue: number;
  categoryCounts: Record<AnimalCategory, number>;
  inventoryByCategory: Record<InventoryCategory, number>;
}
