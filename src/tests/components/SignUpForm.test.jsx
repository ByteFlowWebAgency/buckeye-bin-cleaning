import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Swal from "sweetalert2";

import SignUpForm from "@/components/ui/SignUpForm";

// Mock SweetAlert2
vi.mock("sweetalert2", () => ({
  fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

// Mock fetch for address validation
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, isWithinServiceArea: true, distance: 10 }),
  }));

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(<SignUpForm />);

    // Check if all form fields are rendered
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Full Address (e.g., 123 Main St, Parma, OH 44129)")).toBeInTheDocument();
    expect(screen.getByText("Service Plan")).toBeInTheDocument();
    expect(screen.getByText("Day of Trash Pickup")).toBeInTheDocument();
    expect(screen.getByText("Time of Day for Trash Pickup")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Special Instructions or Notes (Optional)")).toBeInTheDocument();
    expect(screen.getByText("I agree to the Terms of Service and Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Sign Up & Proceed to Payment")).toBeInTheDocument();
  });

  it("validates form fields and shows errors", async () => {
    render(<SignUpForm />);

    // Submit the form without filling any fields
    fireEvent.click(screen.getByText("Sign Up & Proceed to Payment"));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText("Name must be at least 2 characters")).toBeInTheDocument();
      expect(screen.getByText("Please enter a valid 10-digit phone number")).toBeInTheDocument();
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      expect(screen.getByText("Address must be at least 5 characters")).toBeInTheDocument();
      expect(screen.getByText("Please select a service plan")).toBeInTheDocument();
      expect(screen.getByText("Please select a day for pickup")).toBeInTheDocument();
      expect(screen.getByText("Please select a time for pickup")).toBeInTheDocument();
      expect(screen.getByText("You must accept the Terms and Privacy Policy")).toBeInTheDocument();
    });
  });

  it("submits the form successfully", async () => {
    render(<SignUpForm />);

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Phone Number"), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Full Address (e.g., 123 Main St, Parma, OH 44129)"), {
      target: { value: "123 Main St, Parma, OH 44129" },
    });
    fireEvent.change(screen.getByText("Service Plan"), { target: { value: "monthly" } });
    fireEvent.change(screen.getByText("Day of Trash Pickup"), { target: { value: "monday" } });
    fireEvent.change(screen.getByText("Time of Day for Trash Pickup"), { target: { value: "morning" } });
    fireEvent.click(screen.getByLabelText("I agree to the Terms of Service and Privacy Policy"));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up & Proceed to Payment"));

    // Wait for the form to be submitted
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: "Address Validated!",
        text: "Your address is within our service area. Proceeding to payment...",
        icon: "success",
        confirmButtonText: "Continue to Payment",
        confirmButtonColor: "#ed1c24",
      });
    });
  });

  it("handles address validation failure", async () => {
    // Mock fetch to return an invalid address
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, isWithinServiceArea: false, distance: 20 }),
    });

    render(<SignUpForm />);

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Phone Number"), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Full Address (e.g., 123 Main St, Parma, OH 44129)"), {
      target: { value: "123 Main St, New York, NY 10001" },
    });
    fireEvent.change(screen.getByText("Service Plan"), { target: { value: "monthly" } });
    fireEvent.change(screen.getByText("Day of Trash Pickup"), { target: { value: "monday" } });
    fireEvent.change(screen.getByText("Time of Day for Trash Pickup"), { target: { value: "morning" } });
    fireEvent.click(screen.getByLabelText("I agree to the Terms of Service and Privacy Policy"));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up & Proceed to Payment"));

    // Wait for the address validation error
    await waitFor(() => {
      expect(screen.getByText("We're sorry, but your location is outside our service area (20 miles from Parma).")).toBeInTheDocument();
    });
  });

  it("handles form submission error", async () => {
    // Mock fetch to throw an error
    global.fetch.mockRejectedValueOnce(new Error("API error"));

    render(<SignUpForm />);

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Phone Number"), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Full Address (e.g., 123 Main St, Parma, OH 44129)"), {
      target: { value: "123 Main St, Parma, OH 44129" },
    });
    fireEvent.change(screen.getByText("Service Plan"), { target: { value: "monthly" } });
    fireEvent.change(screen.getByText("Day of Trash Pickup"), { target: { value: "monday" } });
    fireEvent.change(screen.getByText("Time of Day for Trash Pickup"), { target: { value: "morning" } });
    fireEvent.click(screen.getByLabelText("I agree to the Terms of Service and Privacy Policy"));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up & Proceed to Payment"));

    // Wait for the error message
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: "Error",
        text: "An unexpected error occurred.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ed1c24",
      });
    });
  });
});