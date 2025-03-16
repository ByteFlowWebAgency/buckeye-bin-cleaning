import { NextResponse } from "next/server";

import { POST } from "@/app/api/validate-location/route";

// Mock fetch
global.fetch = vi.fn();

describe("POST /api/validate-location", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate an address within the service area", async () => {
    // Mock fetch response for Google Maps Geocoding API
    fetch.mockResolvedValueOnce({
      json: vi.fn(() => ({
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 41.4048,
                lng: -81.7229,
              },
            },
            formatted_address: "123 Main St, Parma, OH 44129, USA",
          },
        ],
      })),
    });

    const request = {
      json: vi.fn(() => ({ address: "123 Main St, Parma, OH" })),
    };

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      isWithinServiceArea: true,
      distance: expect.any(Number),
      formattedAddress: "123 Main St, Parma, OH 44129, USA",
      serviceCenter: "Parma City Hall",
    });

    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://maps.googleapis.com/maps/api/geocode/json")
    );
  });

  it("should validate an address outside the service area", async () => {
    // Mock fetch response for Google Maps Geocoding API
    fetch.mockResolvedValueOnce({
      json: vi.fn(() => ({
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 40.7128,
                lng: -74.006,
              },
            },
            formatted_address: "123 Main St, New York, NY 10001, USA",
          },
        ],
      })),
    });

    // Mock request
    const request = {
      json: vi.fn(() => ({ address: "123 Main St, New York, NY" })),
    };

    // Call the POST function
    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      isWithinServiceArea: false,
      distance: expect.any(Number),
      formattedAddress: "123 Main St, New York, NY 10001, USA",
      serviceCenter: "Parma City Hall",
    });
  });

  it("should handle an invalid address", async () => {
    // Mock fetch response for Google Maps Geocoding API
    fetch.mockResolvedValueOnce({
      json: vi.fn(() => ({
        status: "ZERO_RESULTS",
        results: [],
      })),
    });

    // Mock request
    const request = {
      json: vi.fn(() => ({ address: "Invalid Address" })),
    };

    // Call the POST function
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      message: "Invalid address. Please include street, city, and state.",
      debug: { status: "ZERO_RESULTS", error_message: undefined },
    });
  });

  it("should handle a geocoding API error", async () => {
    fetch.mockRejectedValueOnce(new Error("Geocoding API error"));

    const request = {
      json: vi.fn(() => ({ address: "123 Main St, Parma, OH" })),
    };

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      message: "Error validating location. Please try again.",
      debug: "Geocoding API error",
    });
  });
});