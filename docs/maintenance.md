# Maintenance & Support Documentation

## Regular Maintenance Tasks

### 1. Database Maintenance

#### Firestore Backups
- Schedule: Weekly
- Process:
  ```bash
  # Using Firebase CLI
  firebase firestore:export backup_folder
  ```
- Retention: Keep last 3 backups

#### Data Cleanup
```javascript
// Example cleanup script for completed orders
const cleanupOldOrders = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const snapshot = await db
    .collection('orders')
    .where('status', '==', 'completed')
    .where('date', '<', thirtyDaysAgo)
    .get();
    
  // Archive old orders
  snapshot.forEach(doc => {
    // Move to archive collection
    // Delete from active orders
  });
};
```

### 2. API Monitoring

#### Stripe Webhook Health
- Check webhook delivery success rate
- Monitor failed webhook attempts
- Verify endpoint availability
- Update webhook secrets if needed

#### Google Maps API
- Monitor usage quotas
- Check API response times
- Update API restrictions
- Review billing status

### 3. Email Service

#### Nodemailer Health Check
Located in `src/lib/email.js`:
```javascript
const checkEmailService = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};
```

#### Template Maintenance
- Update email templates
- Test all notification types
- Verify links and content
- Check spam scores

## Troubleshooting Guide

### 1. Common Issues

#### Authentication Problems
```javascript
// Check admin status
const checkAdminAccess = async (email) => {
  const adminDoc = await db
    .collection('admins')
    .doc(email)
    .get();
  
  return adminDoc.exists;
};
```

#### Payment Processing Issues
1. Check Stripe Dashboard
2. Verify webhook logs
3. Confirm API keys
4. Review error logs

#### Address Validation Errors
1. Check Google Maps API status
2. Verify API key restrictions
3. Test geocoding service
4. Review service area bounds

### 2. Error Monitoring

#### Application Logs
- Vercel deployment logs
- Firebase Console logs
- Custom error tracking
- Performance monitoring

#### Error Handling
```javascript
// Global error handler example
const errorHandler = (error, context) => {
  // Log error
  console.error(`Error in ${context}:`, error);
  
  // Notify admin if critical
  if (error.critical) {
    sendAdminNotification(error);
  }
  
  // Return user-friendly message
  return {
    message: 'An error occurred. Please try again later.',
    code: error.code || 'UNKNOWN_ERROR'
  };
};
```

## Security Maintenance

### 1. Regular Security Checks

#### Firebase Security Rules
- Review rules monthly
- Test access patterns
- Update as needed
- Document changes

#### API Security
- Update API keys
- Review rate limits
- Check access logs
- Monitor for abuse

### 2. Dependency Updates

#### NPM Packages
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Security audit
npm audit
```

#### Critical Updates
- Next.js version
- Firebase SDK
- Stripe SDK
- Security patches

## Performance Optimization

### 1. Database Optimization

#### Firestore Indexes
- Review query patterns
- Create composite indexes
- Remove unused indexes
- Monitor query performance

#### Caching Strategy
```javascript
// Example caching implementation
const cache = new Map();

const getCachedData = async (key, fetchFn) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchFn();
  cache.set(key, data);
  return data;
};
```

### 2. API Performance

#### Rate Limiting
- Implement rate limits
- Monitor API usage
- Optimize requests
- Cache responses

#### Response Times
- Track response times
- Identify bottlenecks
- Optimize queries
- Load testing

## Support Contacts

### Technical Support
- Primary Contact: [Your Contact Info]
- Emergency Contact: [Emergency Number]
- Support Hours: [Business Hours]
- Response Time: [SLA Details]

### Service Providers
- Firebase Support: [Firebase Support Link]
- Stripe Support: [Stripe Support Link]
- Google Cloud: [GCP Support Link]
- Vercel: [Vercel Support Link]

### Documentation Updates
**Last Updated:** 4/5/25
**Next Review:** 6/5/25