import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";

import AdminDashboard from "@/app/admin/page";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/data/firebase";

// Mock Firebase Firestore
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
}));

// Mock useAuth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    useAuth.mockReturnValue({ user: { uid: "123" } });
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<AdminDashboard />);

    // Check if loading spinner is displayed
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders orders when data is fetched", async () => {
    const mockOrders = [
      {
        id: "order1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        servicePlan: "Monthly Service",
        address: "123 Main St",
        amount: 30,
        status: "active",
        createdAt: { seconds: 1633072800 },
      },
    ];

    useAuth.mockReturnValue({ user: { uid: "123" } });
    getDocs.mockResolvedValueOnce({
      docs: mockOrders.map(order => ({
        id: order.id,
        data: () => order,
      })),
    });

    render(<AdminDashboard />);

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Monthly Service")).toBeInTheDocument();
      expect(screen.getByText("123 Main St")).toBeInTheDocument();
      expect(screen.getByText("$30")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });
  });

  it("updates order status when action is clicked", async () => {
    const mockOrders = [
      {
        id: "order1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        servicePlan: "Monthly Service",
        address: "123 Main St",
        amount: 30,
        status: "active",
        createdAt: { seconds: 1633072800 },
      },
    ];

    useAuth.mockReturnValue({ user: { uid: "123" } });
    getDocs.mockResolvedValueOnce({
      docs: mockOrders.map(order => ({
        id: order.id,
        data: () => order,
      })),
    });

    render(<AdminDashboard />);

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click the "Schedule" button
    fireEvent.click(screen.getByText("Schedule"));

    // Check if updateDoc was called
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(doc(db, "orders", "order1"), {
        status: "scheduled",
        scheduledDate: expect.any(Date),
      });
    });
  });

  it("exports orders to CSV", async () => {
    const mockOrders = [
      {
        id: "order1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        servicePlan: "Monthly Service",
        address: "123 Main St",
        amount: 30,
        status: "active",
        createdAt: { seconds: 1633072800 },
      },
    ];

    useAuth.mockReturnValue({ user: { uid: "123" } });
    getDocs.mockResolvedValueOnce({
      docs: mockOrders.map(order => ({
        id: order.id,
        data: () => order,
      })),
    });

    render(<AdminDashboard />);

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click the "Export to Spreadsheet" button
    fireEvent.click(screen.getByText("Export to Spreadsheet"));

    // Check if the CSV download was triggered
    await waitFor(() => {
      expect(document.createElement).toHaveBeenCalledWith("a");
    });
  });
});