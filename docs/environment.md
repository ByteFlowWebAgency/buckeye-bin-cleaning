# Environment Variables

## Required Variables

### Firebase Configuration
```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### Stripe Configuration
```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Google Maps
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### Email Service
```env
EMAIL_USER=buckeyebincleaning@gmail.com
EMAIL_APP_PASSWORD=
```

### Application URL
```env
NEXT_PUBLIC_BASE_URL=
```

## Environment Setup

### Local Development
1. Create `.env.local` file in project root
2. Copy all variables from above
3. Fill in values from respective service providers
4. Never commit `.env.local` to version control

### Vercel Deployment
1. Go to Project Settings in Vercel
2. Navigate to Environment Variables section
3. Add each variable individually
4. Ensure proper encryption for sensitive values

## Security Considerations

### Client-Side Variables
- Must be prefixed with `NEXT_PUBLIC_`
- Only use for public API keys
- Avoid storing sensitive data

### Server-Side Variables
- Never expose in client-side code
- Use in API routes only
- Properly encrypted in deployment

## Troubleshooting

### Common Issues
1. Missing environment variables
   - Check `.env.local` file
   - Verify Vercel settings
   - Rebuild application

2. Invalid variable format
   - Check for proper quoting
   - Verify no trailing spaces
   - Ensure correct line endings

3. Environment mismatch
   - Compare local vs production
   - Check for typos
   - Verify proper encryption