# Overview & Technology Stack

## Project Architecture

Buckeye Bin Cleaning is a full-stack Next.js application designed to provide bin cleaning services in the Greater Cleveland area. The application follows a modern, component-based architecture with server-side rendering capabilities.

## Core Technologies

### Frontend
- **Next.js 14+**: React framework for production
- **Tailwind CSS**: Utility-first CSS framework
- **React Context**: State management for authentication and user data

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Firebase**: Authentication and database
- **Stripe**: Payment processing
- **Nodemailer**: Email notifications

### Infrastructure
- **Vercel**: Hosting and deployment
- **Firebase Firestore**: NoSQL database
- **Google Cloud Platform**: Maps and Geocoding services

## Project Structure

```text
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   │   ├── create-admin/  # Admin creation endpoint
│   │   ├── order-details/ # Order management
│   │   ├── set-admin/     # Admin privileges
│   │   └── webhook/       # Stripe webhook handler
│   ├── cancel/            # Cancel page
│   └── success/           # Success page
├── components/            # Reusable React components
│   ├── layout/           # Layout components
│   ├── nav/              # Navigation components
│   └── ui/               # UI components
├── contexts/             # React context providers
├── data/                 # Data layer (Firebase)
├── lib/                  # Utility libraries
│   ├── email.js         # Email service
│   ├── firebaseAdmin.js # Firebase admin SDK
│   └── utils.js         # Helper functions
├── styles/              # Global styles
└── utils/               # Utility functions
```

## Core Features

1. **Customer-Facing Features**
   - Service booking system
   - Address validation
   - Secure payment processing
   - Email notifications
   - Service area verification

2. **Admin Features**
   - Order management dashboard
   - Customer database
   - Service scheduling
   - Payment tracking
   - Monthly commitment management

3. **Integration Features**
   - Stripe payment processing
   - Google Maps integration
   - Email notifications
   - Firebase authentication
   - Real-time database updates

## Security Features

- Firebase Authentication
- Admin role verification
- Secure API endpoints
- Environment variable protection
- Webhook signature verification