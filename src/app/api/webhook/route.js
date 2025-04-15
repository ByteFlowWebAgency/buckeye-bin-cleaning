import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

// Create reusable transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Service plan mapping for display
const SERVICE_PLANS = {
  monthly: "Monthly Service ($30)",
  quarterly: "Quarterly Service ($45)",
  oneTime: "One-Time Service ($60)",
  buckeyeSummerPackage: "Buckeye Summer Package ($100)",
};

// Map price IDs to service plans
const PRICE_ID_TO_PLAN = {
  price_1R8ELrGMbVFwRLXqhUtIBohJ: {
    id: "monthly",
    display: "Monthly Service ($30)",
  },
  price_1R8ES4GMbVFwRLXq0Kwc7QZO: {
    id: "quarterly",
    display: "Quarterly Service ($45)",
  },
  price_1R8EV4GMbVFwRLXqGIsSuhEB: {
    id: "oneTime",
    display: "One-Time Service ($60)",
  },
  price_1R8EZFGMbVFwRLXqAtRwjnuK: {
    id: "buckeyeSummerPackage",
    display: "Buckeye Summer Package ($100)",
  },
};

// Time slot mapping for display
const TIME_SLOTS = {
  morning: "Morning (7am - 11am)",
  afternoon: "Afternoon (11am - 2pm)",
  evening: "Evening (2pm - 5pm)",
};

// Day of week mapping for display
const DAYS_OF_WEEK = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
};

// Helper function to implement exponential backoff
async function retry(operation, retryCount = 0) {
  try {
    return await operation();
  } catch (error) {
    if (retryCount >= RETRY_CONFIG.maxRetries) {
      console.error(`Failed after ${retryCount} retries:`, error);
      throw error;
    }

    const delay = Math.min(
      RETRY_CONFIG.initialDelay * Math.pow(2, retryCount),
      RETRY_CONFIG.maxDelay
    );

    console.log(`Retry attempt ${retryCount + 1}, waiting ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(operation, retryCount + 1);
  }
}

// Separate database operations for better error handling
async function saveOrderToFirestore(db, orderData) {
  return retry(async () => {
    try {
      const docRef = await db.collection("orders").add({
        ...orderData,
        retryCount: 0,
        lastRetryAt: null,
      });
      console.log("✅ Order saved to Firestore:", docRef.id);
      return docRef;
    } catch (error) {
      console.error("❌ Firestore save error:", error);
      throw error;
    }
  });
}

// email sending with retry logic
async function sendEmailWithRetry(transporter, mailOptions) {
  return retry(async () => {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Email send error:", error);
      throw error;
    }
  });
}

export async function POST(request) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ received: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { db } = initFirebaseAdmin();
  
  if (!db) {
    console.error('Firebase DB not initialized');
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  let event;
  try {
    event = await retry(async () => {
      const payload = await request.text();
      const sig = request.headers.get("stripe-signature");
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        throw new Error('Missing stripe signature or endpoint secret');
      }

      return stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    });
  } catch (err) {
    console.error(`Webhook Error:`, err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Add idempotency check
      const existingOrder = await db.collection('orders')
        .where('stripeSessionId', '==', session.id)
        .get();

      if (!existingOrder.empty) {
        console.log(`Order for session ${session.id} already exists, skipping processing`);
        return NextResponse.json({ received: true });
      }

      console.log('Processing completed checkout session:', session.id);

      // Add payment intent verification
      if (session.payment_intent) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          if (paymentIntent.status !== 'succeeded') {
            console.error(`Payment intent ${session.payment_intent} status is ${paymentIntent.status}`);
            throw new Error('Payment intent not succeeded');
          }
          console.log(`✅ Verified payment intent ${session.payment_intent} status: succeeded`);
        } catch (error) {
          console.error('Failed to verify payment intent:', error);
          throw error;
        }
      }

      // Prepare order data
      const orderData = {
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent || null,
        customerName: session.metadata?.name || "Customer",
        customerEmail: session.customer_email || "No email provided",
        customerPhone: session.metadata?.phone || "No phone provided",
        address: session.metadata?.address || "No address provided",
        servicePlan: session.metadata.servicePlan,
        servicePlanDisplay: SERVICE_PLANS[session.metadata.servicePlan],
        dayOfPickup: session.metadata?.dayOfPickup || "unknown",
        dayOfPickupDisplay: DAYS_OF_WEEK[session.metadata?.dayOfPickup] || "Not specified",
        timeOfPickup: session.metadata?.timeOfPickup || "unknown",
        timeOfPickupDisplay: TIME_SLOTS[session.metadata?.timeOfPickup] || "Not specified",
        message: session.metadata?.message || "No special instructions",
        amount: session.amount_total / 100,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        processedAt: new Date().toISOString(),
      };

      // Add monthly commitment details if applicable
      if (session.metadata.servicePlan === 'monthly') {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);

        orderData.startDate = startDate.toISOString();
        orderData.endDate = endDate.toISOString();
        orderData.monthlyAmount = session.amount_total / 3 / 100;
        orderData.totalAmount = session.amount_total / 100;
        orderData.isMonthlyCommitment = true;
        orderData.commitmentMonths = 3;
      }

      // Save to Firestore with retry logic
      let docRef;
      try {
        docRef = await saveOrderToFirestore(db, orderData);
      } catch (dbError) {
        // Log failed webhook for manual review
        await retry(async () => {
          await db.collection("failed_webhooks").add({
            eventId: event.id,
            type: event.type,
            error: dbError.message,
            orderData: orderData,
            failedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        throw dbError;
      }

      // Send emails with retry logic
      if (docRef) {
        try {
          const customerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ed1c24;">Thank You for Your Order!</h2>
              <p>Hello ${orderData.customerName},</p>
              <p>Your bin cleaning service has been scheduled successfully. Here are your order details:</p>

              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${docRef.id}</p>
                <p><strong>Service Plan:</strong> ${orderData.servicePlanDisplay}</p>
                <p><strong>Service Address:</strong> ${orderData.address}</p>
                <p><strong>Pickup Schedule:</strong> ${orderData.dayOfPickupDisplay}, ${orderData.timeOfPickupDisplay}</p>
                <p><strong>Total Paid:</strong> $${orderData.amount}</p>
              </div>

              <p>Thank you for choosing Buckeye Bin Cleaning! Our team will reach out within 1-3 business days to confirm your service details and schedule.</p>
              <p>If you need to make any changes or have questions, please contact us at ${process.env.EMAIL_USER} or call (440) 230-6165.</p>

              <p>Thank you for choosing Buckeye Bin Cleaning!</p>
            </div>
          `;

          const businessEmailHtml = `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #ed1c24;">New Order Received!</h2>
              <p>A new bin cleaning order has been placed:</p>

              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${docRef.id}</p>
                <p><strong>Customer:</strong> ${orderData.customerName}</p>
                <p><strong>Email:</strong> ${orderData.customerEmail}</p>
                <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
                <p><strong>Service Plan:</strong> ${orderData.servicePlanDisplay}</p>
                <p><strong>Service Address:</strong> ${orderData.address}</p>
                <p><strong>Pickup Schedule:</strong> ${orderData.dayOfPickupDisplay}, ${orderData.timeOfPickupDisplay}</p>
                <p><strong>Special Instructions:</strong> ${orderData.message}</p>
                <p><strong>Total Paid:</strong> $${orderData.amount}</p>
                ${orderData.isMonthlyCommitment ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <p><strong>Monthly Commitment Details:</strong></p>
                  <p>Start Date: ${new Date(orderData.startDate).toLocaleDateString()}</p>
                  <p>End Date: ${new Date(orderData.endDate).toLocaleDateString()}</p>
                  <p>Monthly Amount: $${orderData.monthlyAmount}</p>
                  <p>Total Commitment: $${orderData.totalAmount}</p>
                </div>
                ` : ''}
              </div>
            </div>
          `;

          const customerMailOptions = {
            from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
            to: orderData.customerEmail,
            subject: "Your Buckeye Bin Cleaning Order Confirmation",
            html: customerEmailHtml
          };

          const businessMailOptions = {
            from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
            to: process.env.OWNER_EMAIL,
            subject: "New Bin Cleaning Order",
            html: businessEmailHtml
          };

          // Send both emails with retry logic
          await Promise.all([
            sendEmailWithRetry(transporter, customerMailOptions),
            sendEmailWithRetry(transporter, businessMailOptions)
          ]);

          // Log successful email sending
          await db.collection("email_logs").add({
            orderId: docRef.id,
            customerEmail: orderData.customerEmail,
            businessEmail: process.env.OWNER_EMAIL,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            success: true
          });

        } catch (emailError) {
          console.error("Failed to send emails:", emailError);
          
          // Log email failure but don't throw error to prevent webhook retry
          await db.collection("failed_emails").add({
            orderId: docRef.id,
            error: emailError.message,
            customerEmail: orderData.customerEmail,
            businessEmail: process.env.OWNER_EMAIL,
            failedAt: admin.firestore.FieldValue.serverTimestamp(),
            orderData: orderData // Store order data for manual resend if needed
          });

          // Attempt to notify admin of email failure through alternative means
          try {
            await db.collection("notifications").add({
              type: "email_failure",
              orderId: docRef.id,
              message: "Failed to send order confirmation emails",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              requiresAction: true
            });
          } catch (notificationError) {
            console.error("Failed to create email failure notification:", notificationError);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Error processing webhook:`, err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
