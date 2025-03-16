import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import { db, auth } from "@/data/firebase-admin";

// Mock Firebase Admin modules
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(),
}));

describe("firebase-admin.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports Firestore and Auth instances", () => {
    // Mock Firebase Admin methods
    getFirestore.mockReturnValue("mockFirestore");
    getAuth.mockReturnValue("mockAuth");

    // Call the module to initialize Firebase Admin
    require("../../data/firebase-admin");

    // Check if the exported instances are correct
    expect(db).toBe("mockFirestore");
    expect(auth).toBe("mockAuth");
  });
});