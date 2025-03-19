import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";

import { POST } from "../../app/api/webhook/route";

import { adminDb } from "@/data/firebase-admin";

// Mock Stripe
vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        listLineItems: vi.fn(),
      },
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
      add: vi.fn(() => Promise.resolve()),
    })),
  },
}));

describe("POST /api/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle a successful checkout.session.completed event", async () => {
    // Mock Stripe event
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: {
            servicePlan: "monthly",
            name: "John Doe",
            phone: "123-456-7890",
            address: "123 Main St",
            dayOfPickup: "monday",
            timeOfPickup: "morning",
            message: "Please call before arrival",
          },
          customer_email: "john.doe@example.com",
          amount_total: 3000, // $30.00
          payment_intent: "pi_123",
        },
      },
    };

    // Mock Stripe webhook signature verification
    Stripe.prototype.webhooks.constructEvent.mockReturnValue(mockEvent);

    // Mock request
    const request = {
      text: vi.fn(() => JSON.stringify(mockEvent)),
      headers: {
        get: vi.fn(() => "mock-signature"),
      },
    };

    // Call the POST function
    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });

    // Verify Firestore was called
    expect(adminDb.collection).toHaveBeenCalledWith("orders");
    expect(adminDb.collection("orders").add).toHaveBeenCalledWith({
      stripeSessionId: "cs_test_123",
      paymentIntentId: "pi_123",
      customerName: "John Doe",
      customerEmail: "john.doe@example.com",
      customerPhone: "123-456-7890",
      address: "123 Main St",
      servicePlan: "monthly",
      servicePlanDisplay: "Monthly Service ($30)",
      dayOfPickup: "monday",
      dayOfPickupDisplay: "Monday",
      timeOfPickup: "morning",
      timeOfPickupDisplay: "Morning (7am - 11am)",
      message: "Please call before arrival",
      amount: 30,
      status: "active",
      createdAt: expect.any(Date),
    });

    // Verify emails were sent
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(2);
  });

  it("should handle a webhook signature verification failure", async () => {
    // Mock Stripe webhook signature verification failure
    Stripe.prototype.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    // Mock request
    const request = {
      text: vi.fn(() => "{}"),
      headers: {
        get: vi.fn(() => "mock-signature"),
      },
    };

    // Call the POST function
    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Webhook Error: Invalid signature",
    });
  });

  it("should handle a Firestore database error", async () => {
    // Mock Stripe event
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: {
            servicePlan: "monthly",
            name: "John Doe",
            phone: "123-456-7890",
            address: "123 Main St",
            dayOfPickup: "monday",
            timeOfPickup: "morning",
            message: "Please call before arrival",
          },
          customer_email: "john.doe@example.com",
          amount_total: 3000, // $30.00
          payment_intent: "pi_123",
        },
      },
    };

    // Mock Stripe webhook signature verification
    Stripe.prototype.webhooks.constructEvent.mockReturnValue(mockEvent);

    // Mock Firestore error
    adminDb.collection("orders").add.mockImplementation(() => {
      throw new Error("Firestore error");
    });

    // Mock request
    const request = {
      text: vi.fn(() => JSON.stringify(mockEvent)),
      headers: {
        get: vi.fn(() => "mock-signature"),
      },
    };

    // Call the POST function
    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });

    // Verify Firestore was called
    expect(adminDb.collection).toHaveBeenCalledWith("orders");
    expect(adminDb.collection("orders").add).toHaveBeenCalled();
  });

  it("should handle an email sending error", async () => {
    // Mock Stripe event
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: {
            servicePlan: "monthly",
            name: "John Doe",
            phone: "123-456-7890",
            address: "123 Main St",
            dayOfPickup: "monday",
            timeOfPickup: "morning",
            message: "Please call before arrival",
          },
          customer_email: "john.doe@example.com",
          amount_total: 3000, // $30.00
          payment_intent: "pi_123",
        },
      },
    };

    // Mock Stripe webhook signature verification
    Stripe.prototype.webhooks.constructEvent.mockReturnValue(mockEvent);

    // Mock Nodemailer error
    nodemailer.createTransport().sendMail.mockImplementation(() => {
      throw new Error("Email error");
    });

    // Mock request
    const request = {
      text: vi.fn(() => JSON.stringify(mockEvent)),
      headers: {
        get: vi.fn(() => "mock-signature"),
      },
    };

    // Call the POST function
    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });

    // Verify emails were attempted
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
  });
});
