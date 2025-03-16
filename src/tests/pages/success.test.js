import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

import SuccessPage from "@/app/success/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

// Mock SweetAlert2
vi.mock("sweetalert2", () => ({
  fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, orderDetails: {} }),
  }));

describe("SuccessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    useSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<SuccessPage />);

    // Check if loading spinner is displayed
    expect(screen.getByText("Loading your order details...")).toBeInTheDocument();
  });

  it("renders success message when sessionId is missing", () => {
    useSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<SuccessPage />);

    // Check if success message is displayed
    expect(screen.getByText("Thank You for Your Order!")).toBeInTheDocument();
    expect(screen.getByText("Return to Home")).toBeInTheDocument();
  });

  it("renders order details when sessionId is present", async () => {
    useSearchParams.mockReturnValue(new URLSearchParams("session_id=123"));

    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        orderDetails: {
          servicePlan: "Monthly Service",
          name: "John Doe",
          address: "123 Main St, Parma, OH",
          dayOfPickup: "Monday",
          timeOfPickup: "Morning",
          amount: 30,
        },
      }),
    });

    render(<SuccessPage />);

    // Wait for order details to load
    await waitFor(() => {
      expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();
      expect(screen.getByText("Monthly Service")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("123 Main St, Parma, OH")).toBeInTheDocument();
      expect(screen.getByText("Monday, Morning")).toBeInTheDocument();
      expect(screen.getByText("$30")).toBeInTheDocument();
    });
  });

  it("handles order cancellation", async () => {
    useSearchParams.mockReturnValue(new URLSearchParams("session_id=123"));

    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        orderDetails: {
          servicePlan: "Monthly Service",
          name: "John Doe",
          address: "123 Main St, Parma, OH",
          dayOfPickup: "Monday",
          timeOfPickup: "Morning",
          amount: 30,
        },
      }),
    });

    render(<SuccessPage />);

    // Wait for order details to load
    await waitFor(() => {
      expect(screen.getByText("Cancel Order")).toBeInTheDocument();
    });

    // Click the cancel button
    fireEvent.click(screen.getByText("Cancel Order"));

    // Check if SweetAlert2 confirmation dialog is shown
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: "Cancel your order?",
        text: "Your payment will be refunded but this cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ed1c24",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, cancel my order",
        cancelButtonText: "No, keep my order",
      });
    });
  });
});