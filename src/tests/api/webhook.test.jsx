import { initFirebaseAdmin } from '../../utils/firebase-admin-init';

// Mock Nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
    })),
  },
  createTransport: vi.fn(() => ({
    sendMail: vi.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
  })),
}));

// Mock Firebase Admin initialization
vi.mock('../../utils/firebase-admin-init', () => ({
  initFirebaseAdmin: vi.fn(() => ({
    db: {
      collection: vi.fn(() => ({
        add: vi.fn(() => Promise.resolve({ id: 'test-doc-id' })),
      })),
    },
  })),
}));

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