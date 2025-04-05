# Technical Account Setup

## Firebase Configuration

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project "buckeye-bin-cleaning"
3. Enable Authentication with Email/Password
4. Create Firestore Database
5. Set up Firebase Admin SDK

### 2. Firebase Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check admin status
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.token.email == resource.data.email || isAdmin());
      allow write: if request.auth != null;
    }
    
    // Admins collection
    match /admins/{email} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }
  }
}
```

### 3. Firebase Admin Setup
Located in `src/lib/firebaseAdmin.js`:
```javascript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
```

## Stripe Integration

### 1. Stripe Account Setup
1. Create account at [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys (Publishable and Secret)
3. Configure webhook endpoints
4. Set up products/prices

### 2. Webhook Configuration
- Endpoint: `https://[your-domain]/api/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

### 3. Product Configuration
```javascript
// Example price configuration
const price = await stripe.prices.create({
  unit_amount: 9000, // $90.00
  currency: 'usd',
  recurring: {
    interval: 'month',
    interval_count: 1,
  },
  product_data: {
    name: 'Monthly Bin Cleaning Service',
    description: '3-month minimum commitment',
  },
});
```

## Google Cloud Console Setup

### 1. Project Creation
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable required APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API

### 2. API Key Configuration
1. Create API key
2. Set restrictions:
   - HTTP referrers
   - IP addresses
   - API usage limits

### 3. Key Security
- Set up application restrictions
- Enable billing alerts
- Monitor usage quotas

## Nodemailer Email Service

### 1. Gmail App Password Setup
1. Enable 2-Step Verification in Google Account
2. Generate App Password:
   - Go to Google Account Security
   - Select "App Passwords"
   - Create new app password for "Mail"

### 2. Email Configuration
Located in `src/lib/email.js`:
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});
```

### 3. Email Templates
Available templates in the system:
- Order confirmation
- Payment success
- Service reminder
- Monthly commitment details
- Admin notifications