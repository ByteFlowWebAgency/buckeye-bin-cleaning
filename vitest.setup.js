import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockFirebase, mockStripe, mockNodemailer, mockFirebaseAdmin } from './src/tests/test-utils/mocks';

// Set up global mocks
vi.mock('firebase/app', () => mockFirebase);
vi.mock('firebase/firestore', () => ({ getFirestore: mockFirebase.getFirestore }));
vi.mock('firebase/auth', () => ({ getAuth: mockFirebase.getAuth }));
vi.mock('firebase/analytics', () => ({ getAnalytics: mockFirebase.getAnalytics }));
vi.mock('stripe', () => ({ default: vi.fn(() => mockStripe) }));
vi.mock('nodemailer', () => ({ default: mockNodemailer, ...mockNodemailer }));
vi.mock('firebase-admin', () => mockFirebaseAdmin);

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', { value: vi.fn() });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Set environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'test@example.com';
process.env.FIREBASE_ADMIN_PRIVATE_KEY = 'test-private-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_APP_PASSWORD = 'test-password';
process.env.OWNER_EMAIL = 'owner@example.com';
process.env.DOMAIN_URL = 'http://localhost:3000'; 