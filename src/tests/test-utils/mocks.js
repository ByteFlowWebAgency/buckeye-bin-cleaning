import { vi } from 'vitest';

// Mock Firebase
export const mockFirebase = {
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(),
  getApp: vi.fn(),
  getFirestore: vi.fn(),
  getAuth: vi.fn(),
  getAnalytics: vi.fn(),
};

// Mock Stripe
export const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  refunds: {
    create: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

// Mock Nodemailer
export const mockNodemailer = {
  createTransport: vi.fn(() => ({
    sendMail: vi.fn(() => Promise.resolve({ messageId: 'test-id' })),
  })),
};

// Mock Firebase Admin
export const mockFirebaseAdmin = {
  apps: [],
  initializeApp: vi.fn(),
  credential: {
    cert: vi.fn(),
  },
  firestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      add: vi.fn(),
      where: vi.fn(),
    })),
  })),
  auth: vi.fn(),
}; 