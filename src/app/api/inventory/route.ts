import { NextRequest, NextResponse } from "next/server";
import { InventoryItem } from "@/types";

// Mock data for demonstration - in a real app, this would be a database
let inventoryItems: InventoryItem[] = [
  {
    id: "inv1",
    _id: "inv1",
    name: "Premium Fish Food",
    category: "food",
    quantity: 15,
    unit: "kg",
    cost: 25.99,
    supplier: "Aquatic Nutrition Co.",
    minThreshold: 10,
    maxThreshold: 100,
    lastRestocked: "2024-01-15T10:00:00Z",
    expiryDate: "2024-12-31T23:59:59Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "inv2",
    _id: "inv2",
    name: "Antibiotics",
    category: "medicine",
    quantity: 5,
    unit: "bottles",
    cost: 45.5,
    supplier: "VetMed Solutions",
    minThreshold: 5,
    maxThreshold: 20,
    lastRestocked: "2024-01-10T14:30:00Z",
    expiryDate: "2025-06-30T23:59:59Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "inv3",
    _id: "inv3",
    name: "Cleaning Supplies",
    category: "supplies",
    quantity: 30,
    unit: "units",
    cost: 12.75,
    supplier: "CleanTech Industries",
    minThreshold: 15,
    maxThreshold: 50,
    lastRestocked: "2024-01-20T09:15:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const lowStock = searchParams.get("lowStock");
    const expired = searchParams.get("expired");

    let filteredItems = [...inventoryItems];

    // Apply filters
    if (category) {
      filteredItems = filteredItems.filter(
        (item) => item.category === category
      );
    }

    if (lowStock === "true") {
      filteredItems = filteredItems.filter(
        (item) => item.quantity <= (item.minThreshold || 10)
      );
    }

    if (expired === "true") {
      const now = new Date();
      filteredItems = filteredItems.filter(
        (item) => item.expiryDate && new Date(item.expiryDate) < now
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inventory items retrieved successfully",
      inventoryItems: filteredItems,
      count: filteredItems.length,
    });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inventory items",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newItem: InventoryItem = {
      ...body,
      id: `inv${Date.now()}`,
      _id: `inv${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRestocked: new Date().toISOString(),
    };

    inventoryItems.push(newItem);

    return NextResponse.json({
      success: true,
      message: "Inventory item created successfully",
      inventoryItem: newItem,
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create inventory item",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
