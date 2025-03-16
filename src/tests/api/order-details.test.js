import { NextResponse } from "next/server";

import { POST } from "@/app/api/order-details/route";
import { adminDb } from "@/data/firebase-admin";

// Mock Firebase Firestore
vi.mock("@/data/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        get: vi.fn(),
      })),
    })),
  },
}));

describe("POST /api/order-details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch order details successfully", async () => {
    // Mock Firestore response
    const mockOrder = {
      id: "order123",
      data: () => ({
        stripeSessionId: "cs_test_123",
        customerName: "John Doe",
        customerEmail: "john.doe@example.com",
        servicePlan: "monthly",
        amount: 30,
        status: "active",
      }),
    };

    adminDb.collection("orders").where().get.mockResolvedValueOnce({
      docs: [mockOrder],
    });

    const request = {
      json: vi.fn(() => ({ orderId: "order123" })),
    };

    // Call the POST function
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      order: {
        id: "order123",
        stripeSessionId: "cs_test_123",
        customerName: "John Doe",
        customerEmail: "john.doe@example.com",
        servicePlan: "monthly",
        amount: 30,
        status: "active",
      },
    });

    // Verify Firestore was called
    expect(adminDb.collection).toHaveBeenCalledWith("orders");
    expect(adminDb.collection("orders").where).toHaveBeenCalledWith("stripeSessionId", "==", "order123");
  });

  it("should handle order not found", async () => {
    // Mock Firestore response with no documents
    adminDb.collection("orders").where().get.mockResolvedValueOnce({
      docs: [],
    });

    const request = {
      json: vi.fn(() => ({ orderId: "order123" })),
    };

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      success: false,
      message: "Order not found.",
    });
  });

  it("should handle Firestore error", async () => {
    adminDb.collection("orders").where().get.mockRejectedValueOnce(new Error("Firestore error"));

    const request = {
      json: vi.fn(() => ({ orderId: "order123" })),
    };

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      message: "Error fetching order details.",
      debug: "Firestore error",
    });
  });
});