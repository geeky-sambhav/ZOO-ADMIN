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
} from "@/types";

interface DataState {
  // Animals
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, "id">) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  deleteAnimal: (id: string) => void;
  getAnimalsByCategory: (category: AnimalCategory) => Animal[];

  // Medical Records
  medicalRecords: MedicalRecord[];
  addMedicalRecord: (record: Omit<MedicalRecord, "id">) => void;
  updateMedicalRecord: (id: string, updates: Partial<MedicalRecord>) => void;
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
  addFeedingSchedule: (schedule: Omit<FeedingSchedule, "id">) => void;
  updateFeedingSchedule: (
    id: string,
    updates: Partial<FeedingSchedule>
  ) => void;
  getFeedingSchedulesByAnimal: (animalId: string) => FeedingSchedule[];

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  markNotificationRead: (id: string) => void;
  getUnreadNotifications: () => Notification[];

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id">) => void;

  // Dashboard Stats
  getDashboardStats: () => DashboardStats;
}

// Mock data
const mockAnimals: Animal[] = [
  {
    id: "1",
    name: "Leo",
    species: "African Lion",
    category: "mammals",
    age: 5,
    weight: 180,
    gender: "male",
    healthStatus: "healthy",
    enclosureId: "1",
    images: ["/animals/lion1.jpg"],
    description: "Majestic male lion, pride leader",
    arrivalDate: new Date("2020-03-15"),
    lastCheckup: new Date("2024-01-10"),
    caretakerId: "3",
    doctorId: "2",
  },
  {
    id: "2",
    name: "Bella",
    species: "Bengal Tiger",
    category: "mammals",
    age: 4,
    weight: 140,
    gender: "female",
    healthStatus: "healthy",
    enclosureId: "2",
    images: ["/animals/tiger1.jpg"],
    description: "Beautiful female Bengal tiger",
    arrivalDate: new Date("2021-06-20"),
    lastCheckup: new Date("2024-01-08"),
    caretakerId: "3",
    doctorId: "2",
  },
  {
    id: "3",
    name: "Charlie",
    species: "Green Iguana",
    category: "reptiles",
    age: 3,
    weight: 4.5,
    gender: "male",
    healthStatus: "recovering",
    enclosureId: "3",
    images: ["/animals/iguana1.jpg"],
    description: "Large green iguana recovering from minor injury",
    arrivalDate: new Date("2022-01-10"),
    lastCheckup: new Date("2024-01-12"),
    caretakerId: "3",
    doctorId: "2",
  },
];

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
  animals: mockAnimals,
  addAnimal: (animal) => {
    const newAnimal = { ...animal, id: Date.now().toString() };
    set((state) => ({ animals: [...state.animals, newAnimal] }));
  },
  updateAnimal: (id, updates) => {
    set((state) => ({
      animals: state.animals.map((animal) =>
        animal.id === id ? { ...animal, ...updates } : animal
      ),
    }));
  },
  deleteAnimal: (id) => {
    set((state) => ({
      animals: state.animals.filter((animal) => animal.id !== id),
    }));
  },
  getAnimalsByCategory: (category) => {
    return get().animals.filter((animal) => animal.category === category);
  },

  // Medical Records
  medicalRecords: [],
  addMedicalRecord: (record) => {
    const newRecord = { ...record, id: Date.now().toString() };
    set((state) => ({ medicalRecords: [...state.medicalRecords, newRecord] }));
  },
  updateMedicalRecord: (id, updates) => {
    set((state) => ({
      medicalRecords: state.medicalRecords.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      ),
    }));
  },
  getMedicalRecordsByAnimal: (animalId) => {
    return get().medicalRecords.filter(
      (record) => record.animalId === animalId
    );
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
  addFeedingSchedule: (schedule) => {
    const newSchedule = { ...schedule, id: Date.now().toString() };
    set((state) => ({
      feedingSchedules: [...state.feedingSchedules, newSchedule],
    }));
  },
  updateFeedingSchedule: (id, updates) => {
    set((state) => ({
      feedingSchedules: state.feedingSchedules.map((schedule) =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
    }));
  },
  getFeedingSchedulesByAnimal: (animalId) => {
    return get().feedingSchedules.filter(
      (schedule) => schedule.animalId === animalId
    );
  },

  // Notifications
  notifications: [
    {
      id: "1",
      type: "low_inventory",
      title: "Low Stock Alert",
      message: "Cleaning Supplies are running low (8 sets remaining)",
      priority: "medium",
      read: false,
      createdAt: new Date(),
      relatedId: "3",
    },
    {
      id: "2",
      type: "medical_checkup",
      title: "Checkup Due",
      message: "Leo the Lion is due for routine checkup",
      priority: "high",
      read: false,
      createdAt: new Date(),
      relatedId: "1",
    },
  ],
  addNotification: (notification) => {
    const newNotification = { ...notification, id: Date.now().toString() };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
  },
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    }));
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
    const { animals, inventory } = get();

    const totalAnimals = animals.length;
    const healthyAnimals = animals.filter(
      (a) => a.healthStatus === "healthy"
    ).length;
    const sickAnimals = animals.filter(
      (a) => a.healthStatus === "sick" || a.healthStatus === "injured"
    ).length;
    const lowInventoryItems = inventory.filter(
      (item) => item.quantity <= item.minThreshold
    ).length;

    const categoryCounts = animals.reduce((acc, animal) => {
      acc[animal.category] = (acc[animal.category] || 0) + 1;
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
      upcomingCheckups: 2, // Mock data
      feedingsDue: 5, // Mock data
      categoryCounts,
      inventoryByCategory,
    };
  },
}));
