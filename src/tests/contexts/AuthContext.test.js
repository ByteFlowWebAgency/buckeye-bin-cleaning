import { render, screen, act } from "@testing-library/react";
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";

import { AuthProvider, useAuth } from "../../contexts/AuthContext";

import { auth } from "@/data/firebase";

// Mock Firebase auth functions
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock Firebase auth instance
vi.mock("@/data/firebase", () => ({
  auth: {},
}));

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides initial context values", () => {
    const TestComponent = () => {
      const { user, loading } = useAuth();
      return (
        <div>
          <span>{ user ? "User exists" : "No user" }</span>
          <span>{ loading ? "Loading" : "Not loading" }</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check initial context values
    expect(screen.getByText("No user")).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("updates user state on auth state change", async () => {
    const mockUser = { uid: "123", email: "test@example.com" };
    let authStateCallback;

    // Mock onAuthStateChanged to call the callback with a user
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return () => {};
    });

    const TestComponent = () => {
      const { user, loading } = useAuth();
      return (
        <div>
          <span>{ user ? `User: ${ user.email }` : "No user" }</span>
          <span>{ loading ? "Loading" : "Not loading" }</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate auth state change
    act(() => {
      authStateCallback(mockUser);
    });

    // Check if the user state is updated
    expect(screen.getByText("User: test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Not loading")).toBeInTheDocument();
  });

  it("signs in a user", async () => {
    const mockUser = { uid: "123", email: "test@example.com" };
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

    const TestComponent = () => {
      const { signIn } = useAuth();
      const handleSignIn = async () => {
        await signIn("test@example.com", "password");
      };

      return (
        <button onClick={ handleSignIn }>Sign In</button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate sign-in
    await act(async () => {
      fireEvent.click(screen.getByText("Sign In"));
    });

    // Check if signInWithEmailAndPassword was called
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "test@example.com", "password");
  });

  it("signs out a user", async () => {
    firebaseSignOut.mockResolvedValueOnce();

    const TestComponent = () => {
      const { signOut } = useAuth();
      const handleSignOut = async () => {
        await signOut();
      };

      return (
        <button onClick={ handleSignOut }>Sign Out</button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate sign-out
    await act(async () => {
      fireEvent.click(screen.getByText("Sign Out"));
    });

    // Check if signOut was called
    expect(firebaseSignOut).toHaveBeenCalledWith(auth);
  });
});