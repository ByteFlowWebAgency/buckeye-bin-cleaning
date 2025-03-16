import { NextResponse } from "next/server";
import Stripe from "stripe";

import { POST } from "@/app/api/create-checkout/route";

// Mock Stripe
vi.mock("stripe", () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe("POST /api/create-checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a checkout session successfully", async () => {
    const mockSession = { url: "https://checkout.stripe.com/session_123" };
    Stripe.prototype.checkout.sessions.create.mockResolvedValueOnce(
      mockSession,
    );

    // Mock request
    const request = {
      json: vi.fn(() => ({
        servicePlan: "monthly",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        address: "123 Main St, Parma, OH",
        dayOfPickup: "monday",
        timeOfPickup: "morning",
        message: "Please call before arrival",
      })),
    };

    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      url: "https://checkout.stripe.com/session_123",
    });

    // Verify Stripe was called with the correct arguments
    expect(Stripe.prototype.checkout.sessions.create).toHaveBeenCalledWith({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1QyejmQAAGErMriwUFBAzEE0",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.DOMAIN_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN_URL}/cancel`,
      customer_email: "john.doe@example.com",
      metadata: {
        name: "John Doe",
        phone: "123-456-7890",
        address: "123 Main St, Parma, OH",
        dayOfPickup: "monday",
        timeOfPickup: "morning",
        message: "Please call before arrival",
      },
    });
  });

  it("should handle an invalid service plan", async () => {
    // Mock request with invalid service plan
    const request = {
      json: vi.fn(() => ({
        servicePlan: "invalidPlan",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        address: "123 Main St, Parma, OH",
        dayOfPickup: "monday",
        timeOfPickup: "morning",
        message: "Please call before arrival",
      })),
    };

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      message: "Invalid service plan",
    });
  });

  it("should handle Stripe API error", async () => {
    Stripe.prototype.checkout.sessions.create.mockRejectedValueOnce(
      new Error("Stripe API error"),
    );

    // Mock request
    const request = {
      json: vi.fn(() => ({
        servicePlan: "monthly",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        address: "123 Main St, Parma, OH",
        dayOfPickup: "monday",
        timeOfPickup: "morning",
        message: "Please call before arrival",
      })),
    };

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      message: "Error creating checkout session",
    });
  });
});
