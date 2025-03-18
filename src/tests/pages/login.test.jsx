import { render, screen, fireEvent } from "@testing-library/react";

import LoginPage from "@/app/admin/login/page";
import { useAuth } from "@/contexts/AuthContext";

// Mock useAuth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    useAuth.mockReturnValue({ user: null });

    render(<LoginPage />);

    // Check if the login form is rendered
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("handles login form submission", async () => {
    const mockSignIn = vi.fn(() => Promise.resolve());
    useAuth.mockReturnValue({ user: null, signIn: mockSignIn });

    render(<LoginPage />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });

    // Submit the form
    fireEvent.click(screen.getByText("Sign In"));

    // Check if signIn was called with the correct arguments
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password");
    });
  });
});