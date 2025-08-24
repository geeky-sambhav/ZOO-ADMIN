"use client";

import { create } from "zustand";
import {
  Animal,
  MedicalRecord,
  InventoryItem,
  Enclosure,
  FeedingSchedule,
  Notification,
  AuditLog,
  DashboardStats,
  AnimalCategory,
  InventoryCategory,
  User,
} from "@/types";
import animalService from "@/services/animalService";
import medicalRecordService, {
  MedicalRecordFilters,
} from "@/services/medicalRecordService";
import notificationService, {
  NotificationFilters,
} from "@/services/notificationService";

interface DataState {
  // Animals
  animals: Animal[];
  loading: boolean;
  error: string | null;
  fetchAnimals: () => Promise<void>;
  addAnimal: (
    animal: Omit<Animal, "_id" | "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;
  getAnimalsByCategory: (category: AnimalCategory) => Animal[];

  // Medical Records
  medicalRecords: MedicalRecord[];
  medicalRecordsLoading: boolean;
  medicalRecordsError: string | null;
  fetchMedicalRecords: (filters?: MedicalRecordFilters) => Promise<void>;
  fetchMedicalRecord: (id: string) => Promise<MedicalRecord | null>;
  addMedicalRecord: (
    record: Omit<MedicalRecord, "_id" | "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateMedicalRecord: (
    id: string,
    updates: Partial<MedicalRecord>
  ) => Promise<void>;
  deleteMedicalRecord: (id: string) => Promise<void>;
  fetchAnimalMedicalHistory: (animalId: string) => Promise<MedicalRecord[]>;
  getMedicalRecordsByAnimal: (animalId: string) => MedicalRecord[];

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  getLowStockItems: () => InventoryItem[];

  // Enclosures
  enclosures: Enclosure[];
  addEnclosure: (enclosure: Omit<Enclosure, "id">) => void;
  updateEnclosure: (id: string, updates: Partial<Enclosure>) => void;

  // Feeding Schedules
  feedingSchedules: FeedingSchedule[];
  feedingSchedulesLoading: boolean;
  feedingSchedulesError: string | null;
  fetchFeedingSchedules: (filters?: {
    animalId?: string;
    caretakerId?: string;
    isActive?: boolean;
    isOverdue?: boolean;
  }) => Promise<void>;
  addFeedingSchedule: (
    schedule: Omit<
      FeedingSchedule,
      "_id" | "id" | "createdAt" | "updatedAt" | "isOverdue"
    >
  ) => Promise<void>;
  updateFeedingSchedule: (
    id: string,
    updates: Partial<FeedingSchedule>
  ) => Promise<void>;
  deleteFeedingSchedule: (id: string) => Promise<void>;
  markFeedingCompleted: (id: string, notes?: string) => Promise<void>;
  getFeedingSchedulesByAnimal: (animalId: string) => FeedingSchedule[];
  getOverdueFeedingSchedules: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  unreadCount: number;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (
    notification: Omit<Notification, "_id" | "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  getUnreadNotifications: () => Notification[];

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id">) => void;

  // Dashboard Stats
  getDashboardStats: () => DashboardStats;
}

// Mock data - removed as we'll use API data

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Premium Cat Food",
    category: "food",
    quantity: 50,
    unit: "kg",
    minThreshold: 20,
    maxThreshold: 100,
    cost: 45.99,
    supplier: "Zoo Supplies Inc",
    expiryDate: new Date("2024-06-15"),
    lastRestocked: new Date("2024-01-05"),
  },
  {
    id: "2",
    name: "Antibiotics",
    category: "medicine",
    quantity: 15,
    unit: "bottles",
    minThreshold: 10,
    maxThreshold: 50,
    cost: 120.0,
    supplier: "VetMed Solutions",
    expiryDate: new Date("2025-03-20"),
    lastRestocked: new Date("2024-01-03"),
  },
  {
    id: "3",
    name: "Cleaning Supplies",
    category: "supplies",
    quantity: 8,
    unit: "sets",
    minThreshold: 15,
    maxThreshold: 30,
    cost: 25.5,
    supplier: "CleanPro",
    lastRestocked: new Date("2024-01-01"),
  },
];

const mockEnclosures: Enclosure[] = [
  {
    id: "1",
    name: "Lion Pride Habitat",
    type: "Large Mammal",
    capacity: 6,
    currentOccupancy: 1,
    location: "Section A",
    temperature: 24,
    humidity: 65,
    lastCleaned: new Date("2024-01-13"),
    caretakerId: "3",
  },
  {
    id: "2",
    name: "Tiger Territory",
    type: "Large Mammal",
    capacity: 2,
    currentOccupancy: 1,
    location: "Section B",
    temperature: 22,
    humidity: 70,
    lastCleaned: new Date("2024-01-13"),
    caretakerId: "3",
  },
  {
    id: "3",
    name: "Reptile House",
    type: "Reptile",
    capacity: 20,
    currentOccupancy: 1,
    location: "Section C",
    temperature: 28,
    humidity: 80,
    lastCleaned: new Date("2024-01-12"),
    caretakerId: "3",
  },
];

export const useDataStore = create<DataState>((set, get) => ({
  // Animals
  animals: [],
  loading: false,
  error: null,

  fetchAnimals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await animalService.getAllAnimals();
      const animals = response.animals || [];
      set({ animals, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch animals",
        loading: false,
      });
    }
  },

  addAnimal: async (animal) => {
    set({ loading: true, error: null });
    try {
      const response = await animalService.addAnimal(animal);
      if (response.success && response.animal) {
        set((state) => ({
          animals: [...state.animals, response.animal!],
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add animal",
        loading: false,
      });
      throw error;
    }
  },

  updateAnimal: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await animalService.updateAnimal(id, updates);
      if (response.animal) {
        set((state) => ({
          animals: state.animals.map((animal) =>
            animal._id === id || animal.id === id ? response.animal! : animal
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update animal",
        loading: false,
      });
      throw error;
    }
  },

  deleteAnimal: async (id) => {
    set({ loading: true, error: null });
    try {
      await animalService.deleteAnimal(id);
      set((state) => ({
        animals: state.animals.filter(
          (animal) => animal._id !== id && animal.id !== id
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete animal",
        loading: false,
      });
      throw error;
    }
  },

  getAnimalsByCategory: (category) => {
    return get().animals.filter((animal) => animal.category === category);
  },

  // Medical Records
  medicalRecords: [],
  medicalRecordsLoading: false,
  medicalRecordsError: null,

  fetchMedicalRecords: async (filters) => {
    set({ medicalRecordsLoading: true, medicalRecordsError: null });
    try {
      const response = await medicalRecordService.getAllMedicalRecords(filters);
      const medicalRecords = response.medicalRecords || [];
      set({ medicalRecords, medicalRecordsLoading: false });
    } catch (error) {
      set({
        medicalRecordsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch medical records",
        medicalRecordsLoading: false,
      });
    }
  },

  fetchMedicalRecord: async (id) => {
    set({ medicalRecordsLoading: true, medicalRecordsError: null });
    try {
      const response = await medicalRecordService.getMedicalRecord(id);
      set({ medicalRecordsLoading: false });
      return response.medicalRecord || null;
    } catch (error) {
      set({
        medicalRecordsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch medical record",
        medicalRecordsLoading: false,
      });
      return null;
    }
  },

  addMedicalRecord: async (record) => {
    set({ medicalRecordsLoading: true, medicalRecordsError: null });
    try {
      const response = await medicalRecordService.addMedicalRecord(record);
      if (response.success && response.medicalRecord) {
        set((state) => ({
          medicalRecords: [...state.medicalRecords, response.medicalRecord!],
          medicalRecordsLoading: false,
        }));
      }
    } catch (error) {
      set({
        medicalRecordsError:
          error instanceof Error
            ? error.message
            : "Failed to add medical record",
        medicalRecordsLoading: false,
      });
      throw error;
    }
  },

  updateMedicalRecord: async (id, updates) => {
    set({ medicalRecordsLoading: true, medicalRecordsError: null });
    try {
      const response = await medicalRecordService.updateMedicalRecord(
        id,
        updates
      );
      if (response.medicalRecord) {
        set((state) => ({
          medicalRecords: state.medicalRecords.map((record) =>
            record._id === id || record.id === id
              ? response.medicalRecord!
              : record
          ),
          medicalRecordsLoading: false,
        }));
      }
    } catch (error) {
      set({
        medicalRecordsError:
          error instanceof Error
            ? error.message
            : "Failed to update medical record",
        medicalRecordsLoading: false,
      });
      throw error;
    }
  },

  deleteMedicalRecord: async (id) => {
    set({ medicalRecordsLoading: true, medicalRecordsError: null });
    try {
      await medicalRecordService.deleteMedicalRecord(id);
      set((state) => ({
        medicalRecords: state.medicalRecords.filter(
          (record) => record._id !== id && record.id !== id
        ),
        medicalRecordsLoading: false,
      }));
    } catch (error) {
      set({
        medicalRecordsError:
          error instanceof Error
            ? error.message
            : "Failed to delete medical record",
        medicalRecordsLoading: false,
      });
      throw error;
    }
  },

  fetchAnimalMedicalHistory: async (animalId) => {
    set({ medicalRecordsLoading: true, medicalRecordsError: null });
    try {
      const response = await medicalRecordService.getAnimalMedicalHistory(
        animalId
      );
      set({ medicalRecordsLoading: false });
      return response.medicalHistory || [];
    } catch (error) {
      set({
        medicalRecordsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch medical history",
        medicalRecordsLoading: false,
      });
      return [];
    }
  },

  getMedicalRecordsByAnimal: (animalId) => {
    return get().medicalRecords.filter((record) => {
      const recordAnimalId =
        typeof record.animalId === "string"
          ? record.animalId
          : record.animalId._id || record.animalId.id;
      return recordAnimalId === animalId;
    });
  },

  // Inventory
  inventory: mockInventory,
  addInventoryItem: (item) => {
    const newItem = { ...item, id: Date.now().toString() };
    set((state) => ({ inventory: [...state.inventory, newItem] }));
  },
  updateInventoryItem: (id, updates) => {
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },
  deleteInventoryItem: (id) => {
    set((state) => ({
      inventory: state.inventory.filter((item) => item.id !== id),
    }));
  },
  getLowStockItems: () => {
    return get().inventory.filter((item) => item.quantity <= item.minThreshold);
  },

  // Enclosures
  enclosures: mockEnclosures,
  addEnclosure: (enclosure) => {
    const newEnclosure = { ...enclosure, id: Date.now().toString() };
    set((state) => ({ enclosures: [...state.enclosures, newEnclosure] }));
  },
  updateEnclosure: (id, updates) => {
    set((state) => ({
      enclosures: state.enclosures.map((enclosure) =>
        enclosure.id === id ? { ...enclosure, ...updates } : enclosure
      ),
    }));
  },

  // Feeding Schedules
  feedingSchedules: [],
  feedingSchedulesLoading: false,
  feedingSchedulesError: null,

  fetchFeedingSchedules: async (filters) => {
    set({ feedingSchedulesLoading: true, feedingSchedulesError: null });
    try {
      const feedingService = (await import("@/services/feedingService"))
        .default;
      const response = await feedingService.getAllFeedingSchedules(filters);
      if (response.feedingSchedules) {
        set({
          feedingSchedules: response.feedingSchedules,
          feedingSchedulesLoading: false,
        });
      }
    } catch (error) {
      set({
        feedingSchedulesError:
          error instanceof Error
            ? error.message
            : "Failed to fetch feeding schedules",
        feedingSchedulesLoading: false,
      });
    }
  },

  addFeedingSchedule: async (schedule) => {
    set({ feedingSchedulesLoading: true, feedingSchedulesError: null });
    try {
      const feedingService = (await import("@/services/feedingService"))
        .default;
      const response = await feedingService.addFeedingSchedule(schedule);
      if (response.feedingSchedule) {
        set((state) => ({
          feedingSchedules: [
            ...state.feedingSchedules,
            response.feedingSchedule!,
          ],
          feedingSchedulesLoading: false,
        }));
      }
    } catch (error) {
      set({
        feedingSchedulesError:
          error instanceof Error
            ? error.message
            : "Failed to add feeding schedule",
        feedingSchedulesLoading: false,
      });
      throw error;
    }
  },

  updateFeedingSchedule: async (id, updates) => {
    set({ feedingSchedulesLoading: true, feedingSchedulesError: null });
    try {
      const feedingService = (await import("@/services/feedingService"))
        .default;
      const response = await feedingService.updateFeedingSchedule(id, updates);
      if (response.feedingSchedule) {
        set((state) => ({
          feedingSchedules: state.feedingSchedules.map((schedule) =>
            (schedule._id || schedule.id) === id
              ? response.feedingSchedule!
              : schedule
          ),
          feedingSchedulesLoading: false,
        }));
      }
    } catch (error) {
      set({
        feedingSchedulesError:
          error instanceof Error
            ? error.message
            : "Failed to update feeding schedule",
        feedingSchedulesLoading: false,
      });
      throw error;
    }
  },

  deleteFeedingSchedule: async (id) => {
    set({ feedingSchedulesLoading: true, feedingSchedulesError: null });
    try {
      const feedingService = (await import("@/services/feedingService"))
        .default;
      await feedingService.deleteFeedingSchedule(id);
      set((state) => ({
        feedingSchedules: state.feedingSchedules.filter(
          (schedule) => (schedule._id || schedule.id) !== id
        ),
        feedingSchedulesLoading: false,
      }));
    } catch (error) {
      set({
        feedingSchedulesError:
          error instanceof Error
            ? error.message
            : "Failed to delete feeding schedule",
        feedingSchedulesLoading: false,
      });
      throw error;
    }
  },

  markFeedingCompleted: async (id, notes) => {
    set({ feedingSchedulesLoading: true, feedingSchedulesError: null });
    try {
      const feedingService = (await import("@/services/feedingService"))
        .default;
      const response = await feedingService.markFeedingCompleted(id, notes);
      if (response.feedingSchedule) {
        set((state) => ({
          feedingSchedules: state.feedingSchedules.map((schedule) =>
            (schedule._id || schedule.id) === id
              ? response.feedingSchedule!
              : schedule
          ),
          feedingSchedulesLoading: false,
        }));
      }
    } catch (error) {
      set({
        feedingSchedulesError:
          error instanceof Error
            ? error.message
            : "Failed to mark feeding as completed",
        feedingSchedulesLoading: false,
      });
      throw error;
    }
  },

  getOverdueFeedingSchedules: async () => {
    set({ feedingSchedulesLoading: true, feedingSchedulesError: null });
    try {
      const feedingService = (await import("@/services/feedingService"))
        .default;
      const response = await feedingService.getOverdueFeedings();
      if (response.feedingSchedules) {
        set({
          feedingSchedules: response.feedingSchedules,
          feedingSchedulesLoading: false,
        });
      }
    } catch (error) {
      set({
        feedingSchedulesError:
          error instanceof Error
            ? error.message
            : "Failed to fetch overdue feeding schedules",
        feedingSchedulesLoading: false,
      });
    }
  },

  getFeedingSchedulesByAnimal: (animalId) => {
    return get().feedingSchedules.filter((schedule) => {
      const scheduleAnimalId =
        typeof schedule.animalId === "string"
          ? schedule.animalId
          : schedule.animalId._id || schedule.animalId.id;
      return scheduleAnimalId === animalId;
    });
  },

  // Notifications
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,
  unreadCount: 0,

  fetchNotifications: async (filters) => {
    set({ notificationsLoading: true, notificationsError: null });
    try {
      const response = await notificationService.getNotifications(filters);
      if (response.success && response.data) {
        set({
          notifications: response.data,
          notificationsLoading: false,
        });
      }
    } catch (error) {
      set({
        notificationsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
        notificationsLoading: false,
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        set({ unreadCount: response.data.unreadCount });
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  addNotification: async (notification) => {
    set({ notificationsLoading: true, notificationsError: null });
    try {
      // Convert User object to string if needed
      const notificationData = {
        ...notification,
        userId:
          typeof notification.userId === "object"
            ? (notification.userId as User)?.id
            : notification.userId,
      };

      const response = await notificationService.createNotification(
        notificationData
      );
      if (response.success && response.data) {
        set((state) => ({
          notifications: [response.data, ...state.notifications],
          notificationsLoading: false,
          unreadCount: state.unreadCount + 1,
        }));
      }
    } catch (error) {
      set({
        notificationsError:
          error instanceof Error
            ? error.message
            : "Failed to create notification",
        notificationsLoading: false,
      });
      throw error;
    }
  },

  markNotificationRead: async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification._id === id || notification.id === id
              ? { ...notification, read: true }
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
        }));
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        set((state) => {
          const notificationToDelete = state.notifications.find(
            (n) => n._id === id || n.id === id
          );
          const wasUnread = notificationToDelete && !notificationToDelete.read;

          return {
            notifications: state.notifications.filter(
              (notification) =>
                notification._id !== id && notification.id !== id
            ),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((notification) => !notification.read);
  },

  // Audit Logs
  auditLogs: [],
  addAuditLog: (log) => {
    const newLog = { ...log, id: Date.now().toString() };
    set((state) => ({ auditLogs: [...state.auditLogs, newLog] }));
  },

  // Dashboard Stats
  getDashboardStats: () => {
    const { animals, inventory, feedingSchedules } = get();

    const totalAnimals = animals.length;
    const healthyAnimals = animals.filter((a) => a.status === "healthy").length;
    const sickAnimals = animals.filter(
      (a) => a.status === "sick" || a.status === "injured"
    ).length;
    const lowInventoryItems = inventory.filter(
      (item) => item.quantity <= item.minThreshold
    ).length;

    // Feeding schedule statistics
    const activeFeedingSchedules = feedingSchedules.filter(
      (s) => s.isActive
    ).length;
    const overdueFeedings = feedingSchedules.filter((s) => s.isOverdue).length;
    const feedingsDue = overdueFeedings; // For backward compatibility

    const categoryCounts = animals.reduce((acc, animal) => {
      if (animal.category) {
        acc[animal.category] = (acc[animal.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<AnimalCategory, number>);

    const inventoryByCategory = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<InventoryCategory, number>);

    return {
      totalAnimals,
      healthyAnimals,
      sickAnimals,
      lowInventoryItems,
      upcomingCheckups: 2, // Mock data - TODO: integrate with medical records
      feedingsDue,
      overdueFeedings,
      activeFeedingSchedules,
      categoryCounts,
      inventoryByCategory,
    };
  },
}));
