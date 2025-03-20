import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";

import CancelPage from "@/app/cancel/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

describe("CancelPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders refund confirmation message when refunded is true", () => {
    useSearchParams.mockReturnValue(new URLSearchParams("refunded=true"));

    render(<CancelPage />);

    // Check if refund confirmation message is displayed
    expect(screen.getByText("Order Cancelled Successfully")).toBeInTheDocument();
    expect(screen.getByText("Need Help?")).toBeInTheDocument();
    expect(screen.getByText("Return to Home")).toBeInTheDocument();
  });

  it("renders payment cancellation message when refunded is false", () => {
    useSearchParams.mockReturnValue(new URLSearchParams("refunded=false"));

    render(<CancelPage />);

    // Check if payment cancellation message is displayed
    expect(screen.getByText("Payment Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Return to Home")).toBeInTheDocument();
  });
});