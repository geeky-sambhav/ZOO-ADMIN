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
  _id?: string;
  id?: string;
  name: string;
  species?: string;
  speciesId?: string | Species;
  category?: AnimalCategory;
  dob: Date;
  sex: "male" | "female";
  status: HealthStatus;
  enclosureId: string | Enclosure;
  imgUrl?: string;
  images?: string[];
  info?: string;
  description?: string;
  arrivalDate: Date;
  lastCheckup?: Date;
  caretakerId?: string | User;
  doctorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Species {
  _id: string;
  commonName: string;
  scientificName: string;
  classification?: string;
  origin?: string;
  averageLifeSpan?: number;
  dietType?: string;
  about?: string;
}

export interface AnimalResponse {
  message: string;
  success?: boolean;
  animals?: Animal[];
  animal?: Animal;
  count?: number;
  error?: string;
}

// Medical Records
export type MedicalRecordType =
  | "checkup"
  | "vaccination"
  | "treatment"
  | "surgery"
  | "emergency";

export interface MedicalRecord {
  _id?: string;
  id?: string;
  animalId: string | Animal;
  doctorId: string | User;
  date: Date;
  type: MedicalRecordType;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  notes?: string;
  nextCheckup?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicalRecordResponse {
  success: boolean;
  message: string;
  medicalRecord?: MedicalRecord;
  medicalRecords?: MedicalRecord[];
  medicalHistory?: MedicalRecord[];
  animal?: {
    id: string;
    name: string;
    status: string;
  };
  totalRecords?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}

// Inventory Types
export type InventoryCategory = "food" | "medicine" | "supplies" | "equipment";

export interface InventoryItem {
  _id?: string;
  id?: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minThreshold?: number;
  maxThreshold?: number;
  cost: number;
  supplier?: string;
  expiryDate?: Date;
  lastRestocked: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isExpired?: boolean;
}

// Enclosure Types
export interface Enclosure {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  capacity: number;
  currentOccupancy?: number;
  location: string;
  temperature?: number;
  humidity?: number;
  lastCleaned?: Date;
  caretakerId?: string | User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnclosureResponse {
  success: boolean;
  message: string;
  enclosure?: Enclosure;
  enclosures?: Enclosure[];
  count?: number;
  error?: string;
}

// Feeding Schedule
export interface FeedingSchedule {
  _id?: string;
  id?: string;
  item: string | InventoryItem;
  animalId: string | Animal;
  foodType: string;
  quantity: number;
  frequency: string;
  time: string;
  caretakerId: string | User;
  lastFed?: Date;
  notes?: string;
  isActive?: boolean;
  isOverdue?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeedingScheduleResponse {
  success: boolean;
  message: string;
  feedingSchedule?: FeedingSchedule;
  feedingSchedules?: FeedingSchedule[];
  count?: number;
  animal?: {
    id: string;
    name: string;
    status: string;
  };
  error?: string;
}

// Notifications
export type NotificationType =
  | "low_inventory"
  | "medical_checkup"
  | "feeding_due"
  | "system"
  | "alert"
  | "health_alert"
  | "maintenance"
  | "general";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface Notification {
  _id?: string;
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string | User;
  relatedId?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  typeBreakdown: Record<NotificationType, number>;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
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
  overdueFeedings: number;
  activeFeedingSchedules: number;
  categoryCounts: Record<AnimalCategory, number>;
  inventoryByCategory: Record<InventoryCategory, number>;
}
