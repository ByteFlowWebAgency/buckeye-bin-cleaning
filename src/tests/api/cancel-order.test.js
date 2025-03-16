import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";

import { POST } from "@/app/api/cancel-order/route";
import { adminDb } from "@/data/firebase-admin";

// Mock Stripe
vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
    refunds: {
      create: vi.fn(),
    },
  })),
}));

// Mock Nodemailer
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn(() => Promise.resolve()),
  })),
}));

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

describe("POST /api/cancel-order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel an order and issue a refund successfully", async () => {
    // Mock Stripe session retrieval
    const mockSession = {
      id: "cs_test_123",
      payment_intent: { id: "pi_123" },
      metadata: {
        name: "John Doe",
        phone: "123-456-7890",
        address: "123 Main St, Parma, OH",
        servicePlan: "monthly",
        dayOfPickup: "monday",
        timeOfPickup: "morning",
        message: "Please call before arrival",
      },
      customer_email: "john.doe@example.com",
      amount_total: 3000, // $30.00
    };
    Stripe.prototype.checkout.sessions.retrieve.mockResolvedValueOnce(mockSession);

    // Mock Stripe refund creation
    const mockRefund = { id: "re_123" };
    Stripe.prototype.refunds.create.mockResolvedValueOnce(mockRefund);

    // Mock Firestore query
    const mockOrderDoc = {
      ref: {
        update: vi.fn(() => Promise.resolve()),
      },
    };
    adminDb.collection("orders").where().get.mockResolvedValueOnce({
      docs: [mockOrderDoc],
    });

    // Mock request
    const request = {
      json: vi.fn(() => ({ sessionId: "cs_test_123" })),
    };

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      refundId: "re_123",
    });

    expect(Stripe.prototype.checkout.sessions.retrieve).toHaveBeenCalledWith("cs_test_123", {
      expand: ["payment_intent", "line_items"],
    });
    expect(Stripe.prototype.refunds.create).toHaveBeenCalledWith({
      payment_intent: "pi_123",
      reason: "requested_by_customer",
    });

    expect(adminDb.collection).toHaveBeenCalledWith("orders");
    expect(adminDb.collection("orders").where).toHaveBeenCalledWith("stripeSessionId", "==", "cs_test_123");
    expect(mockOrderDoc.ref.update).toHaveBeenCalledWith({
      status: "cancelled",
      refundId: "re_123",
      cancelledAt: expect.any(Date),
    });

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(2);
  });

  it("should handle missing session ID", async () => {
    const request = {
      json: vi.fn(() => ({})),
    };

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      message: "Session ID is required",
    });
  });

  it("should handle invalid session or no payment", async () => {
    Stripe.prototype.checkout.sessions.retrieve.mockResolvedValueOnce({
      id: "cs_test_123",
      payment_intent: null,
    });

    const request = {
      json: vi.fn(() => ({ sessionId: "cs_test_123" })),
    };

    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      success: false,
      message: "Invalid session or no payment found",
    });
  });

  it("should handle Stripe API error", async () => {
    Stripe.prototype.checkout.sessions.retrieve.mockRejectedValueOnce(new Error("Stripe API error"));

    const request = {
      json: vi.fn(() => ({ sessionId: "cs_test_123" })),
    };

    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      message: "Stripe API error",
    });
  });

  it("should handle Firestore error", async () => {
    const mockSession = {
      id: "cs_test_123",
      payment_intent: { id: "pi_123" },
      metadata: {
        name: "John Doe",
        phone: "123-456-7890",
        address: "123 Main St, Parma, OH",
        servicePlan: "monthly",
        dayOfPickup: "monday",
        timeOfPickup: "morning",
        message: "Please call before arrival",
      },
      customer_email: "john.doe@example.com",
      amount_total: 3000, // $30.00
    };
    Stripe.prototype.checkout.sessions.retrieve.mockResolvedValueOnce(mockSession);

    const mockRefund = { id: "re_123" };
    Stripe.prototype.refunds.create.mockResolvedValueOnce(mockRefund);

    adminDb.collection("orders").where().get.mockRejectedValueOnce(new Error("Firestore error"));

    const request = {
      json: vi.fn(() => ({ sessionId: "cs_test_123" })),
    };

    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      refundId: "re_123",
    });
  });
});