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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity provided",
        },
        { status: 400 }
      );
    }

    const itemIndex = inventoryItems.findIndex(
      (item) => item.id === id || item._id === id
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Inventory item not found",
        },
        { status: 404 }
      );
    }

    // Add to existing quantity
    inventoryItems[itemIndex] = {
      ...inventoryItems[itemIndex],
      quantity: inventoryItems[itemIndex].quantity + parseInt(quantity),
      lastRestocked: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Successfully restocked ${quantity} ${inventoryItems[itemIndex].unit}`,
      inventoryItem: inventoryItems[itemIndex],
    });
  } catch (error) {
    console.error("Error restocking inventory item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to restock inventory item",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
