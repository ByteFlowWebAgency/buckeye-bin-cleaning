import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

import { db, auth, analytics } from "@/data/firebase";

// Mock Firebase modules
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(),
  getApp: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(),
}));

describe("firebase.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes Firebase app if no app exists", () => {
    // Mock getApps to return an empty array
    getApps.mockReturnValue([]);

    // Call the module to initialize Firebase
    require("../../data/firebase");

    // Check if initializeApp was called with the correct config
    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  });

  it("uses existing Firebase app if one exists", () => {
    // Mock getApps to return an existing app
    const mockApp = {};
    getApps.mockReturnValue([mockApp]);
    getApp.mockReturnValue(mockApp);

    // Call the module to initialize Firebase
    require("../../data/firebase");

    // Check if getApp was called instead of initializeApp
    expect(getApp).toHaveBeenCalled();
    expect(initializeApp).not.toHaveBeenCalled();
  });

  it("exports Firestore, Auth, and Analytics instances", () => {
    // Mock Firebase app and methods
    const mockApp = {};
    getApps.mockReturnValue([mockApp]);
    getApp.mockReturnValue(mockApp);
    getFirestore.mockReturnValue("mockFirestore");
    getAuth.mockReturnValue("mockAuth");
    getAnalytics.mockReturnValue("mockAnalytics");

    // Call the module to initialize Firebase
    require("../../data/firebase");

    // Check if the exported instances are correct
    expect(db).toBe("mockFirestore");
    expect(auth).toBe("mockAuth");
    expect(analytics).toBe("mockAnalytics");
  });

  it("does not initialize Analytics on the server side", () => {
    // Mock getApps to return an empty array
    getApps.mockReturnValue([]);

    // Mock window to simulate server-side environment
    const originalWindow = global.window;
    delete global.window;

    // Call the module to initialize Firebase
    require("../../data/firebase");

    // Check if getAnalytics was not called
    expect(getAnalytics).not.toHaveBeenCalled();

    // Restore the original window object
    global.window = originalWindow;
  });
});