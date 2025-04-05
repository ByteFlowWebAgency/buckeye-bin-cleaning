# Admin Dashboard Documentation

## Overview
The admin dashboard (`src/app/admin/page.js`) provides a comprehensive interface for managing orders, customers, and service schedules.

## Access Control

### Authentication
- Located in `src/app/admin/login`
- Firebase Authentication required
- Admin role verification through Firestore

### Security Rules
```javascript
// Firestore security rules for admin access
match /admins/{email} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && isAdmin();
}
```

## Dashboard Features

### 1. Order Management
```javascript
// Order display structure from src/app/admin/page.js
{
  customerName,
  email,
  phone,
  address,
  serviceDate,
  amount,
  status,
  // Monthly commitment details
  startDate,
  endDate,
  monthlyAmount,
  totalAmount,
  commitmentMonths
}
```

### 2. Customer Information
- Contact details
- Service history
- Address validation status
- Payment records

### 3. Monthly Commitment Tracking
- Start and end dates
- Payment schedule
- Service frequency
- Total commitment value

### 4. Service Schedule
- Daily view
- Weekly planning
- Route optimization
- Service area mapping

## Admin API Endpoints

### 1. Create Admin (`/api/create-admin`)
```javascript
// src/app/api/create-admin/route.js
POST /api/create-admin
Body: {
  email: string
}
```

### 2. Set Admin Status (`/api/set-admin`)
```javascript
// src/app/api/set-admin/route.js
POST /api/set-admin
Body: {
  email: string,
  isAdmin: boolean
}
```

### 3. Order Details (`/api/order-details`)
```javascript
// src/app/api/order-details/route.js
GET /api/order-details
Query: {
  orderId: string
}
```

## Styling
Custom styling defined in `src/app/admin/admin.css`:
- Responsive layout
- Dark mode support
- Custom components
- Data table styles

## Best Practices

### 1. Data Management
- Regular backups
- Data validation
- Error handling
- Audit logging

### 2. Security
- Session management
- Role-based access
- API rate limiting
- Input sanitization

### 3. Performance
- Pagination
- Lazy loading
- Caching
- Query optimization