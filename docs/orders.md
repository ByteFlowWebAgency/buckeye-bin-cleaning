# Order Processing Documentation

## Order Flow

### 1. Customer Journey
```mermaid
graph LR
    A[Select Service] --> B[Validate Address]
    B --> C[Choose Plan]
    C --> D[Stripe Checkout]
    D --> E[Order Confirmation]
    E --> F[Email Notification]
```

### 2. Webhook Processing
Located in `src/app/api/webhook/route.js`:
```javascript
// Webhook handling structure
{
  // Payment success
  'checkout.session.completed': async (event) => {
    // Create order record
    // Send confirmation email
    // Update admin dashboard
  },
  
  // Payment failure
  'payment_intent.payment_failed': async (event) => {
    // Handle failed payment
    // Notify customer
    // Log incident
  }
}
```

## Database Structure

### 1. Orders Collection
```javascript
{
  orderId: string,
  customer: {
    name: string,
    email: string,
    phone: string,
    address: string
  },
  service: {
    plan: string,
    date: timestamp,
    status: string
  },
  payment: {
    amount: number,
    status: string,
    stripeId: string
  },
  monthlyPlan: {
    startDate: timestamp,
    endDate: timestamp,
    monthlyAmount: number,
    totalAmount: number,
    commitmentMonths: number
  }
}
```

### 2. Email Templates
Located in `src/lib/email.js`:
- Order confirmation
- Payment receipt
- Service reminder
- Monthly plan details

## API Endpoints

### 1. Create Checkout Session
```javascript
POST /api/create-checkout
Body: {
  serviceType: string,
  date: string,
  address: string
}
```

### 2. Order Details
```javascript
GET /api/order-details
Query: {
  orderId: string
}
```

### 3. Webhook Handler
```javascript
POST /api/webhook
Headers: {
  'stripe-signature': string
}
```

## Error Handling

### 1. Payment Failures
- Retry logic
- Customer notification
- Admin alerts
- Error logging

### 2. Address Validation
- Geocoding errors
- Service area checks
- Invalid addresses
- Format validation

### 3. Email Failures
- Retry mechanism
- Backup notifications
- Error reporting
- Manual intervention

## Monitoring

### 1. Order Status
- Payment status
- Service completion
- Customer feedback
- Email delivery

### 2. Performance Metrics
- Processing time
- Success rates
- Error frequency
- Response times