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

export async function POST(request) {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping route execution during build phase');
    return NextResponse.json({ received: true });
  }

  // Initialize services
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { db } = initFirebaseAdmin();
  
  if (!db) {
    console.log('Firebase DB not available');
    return NextResponse.json({ received: true });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    // Verify Stripe signature
    if (!sig || !endpointSecret) {
      console.error('Missing stripe signature or endpoint secret');
      return NextResponse.json(
        { error: 'Missing stripe signature or endpoint secret' },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    console.log('Webhook event type:', event.type);
    
  } catch (err) {
    console.error(`⚠️ Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle specific event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Processing checkout.session.completed for session:', session.id);
        
        // Extract the service plan details
        const servicePlan = session.metadata.servicePlan;
        const description = session.metadata.description;
        
        // When saving to database, include the commitment information
        if (servicePlan === 'monthly') {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 3);

          await admin.firestore()
            .collection('orders')
            .doc(session.id)
            .update({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              monthlyAmount: session.amount_total / 3 / 100,
              totalAmount: session.amount_total / 100,
              isMonthlyCommitment: true,
              commitmentMonths: 3
            });
        }

        // Format order details for emails and database with fallbacks for missing data
        const orderDetails = {
          orderId: session.id.slice(-8),
          name: session.metadata?.name || "Customer",
          email: session.customer_email || "No email provided",
          phone: session.metadata?.phone || "No phone provided",
          address: session.metadata?.address || "No address provided",
          servicePlan: SERVICE_PLANS[servicePlan],
          dayOfPickup: session.metadata?.dayOfPickup
            ? DAYS_OF_WEEK[session.metadata.dayOfPickup] ||
              session.metadata.dayOfPickup
            : "Not specified",
          timeOfPickup: session.metadata?.timeOfPickup
            ? TIME_SLOTS[session.metadata.timeOfPickup] ||
              session.metadata.timeOfPickup
            : "Not specified",
          message: session.metadata?.message || "No special instructions",
          amount: (session.amount_total / 100).toFixed(2),
        };

        // Store order in Firestore with null checks
        try {
          const orderData = {
            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent || null,
            customerName: session.metadata?.name || "Customer",
            customerEmail: session.customer_email || "No email provided",
            customerPhone: session.metadata?.phone || "No phone provided",
            address: session.metadata?.address || "No address provided",

            // Service plan information (now properly determined)
            servicePlan: servicePlan,
            servicePlanDisplay: SERVICE_PLANS[servicePlan],

            dayOfPickup: session.metadata?.dayOfPickup || "unknown",
            dayOfPickupDisplay: session.metadata?.dayOfPickup
              ? DAYS_OF_WEEK[session.metadata.dayOfPickup] ||
                session.metadata.dayOfPickup
              : "Not specified",

            timeOfPickup: session.metadata?.timeOfPickup || "unknown",
            timeOfPickupDisplay: session.metadata?.timeOfPickup
              ? TIME_SLOTS[session.metadata.timeOfPickup] ||
                session.metadata.timeOfPickup
              : "Not specified",

            message: session.metadata?.message || "No special instructions",
            amount: session.amount_total / 100,
            status: "active",
            createdAt: new Date(),
          };

          console.log('Attempting to save order to Firestore:', orderData);
          const docRef = await db.collection("orders").add(orderData);
          console.log("✅ Order saved to Firestore with ID:", docRef.id);
        } catch (dbError) {
          console.error("❌ Firestore Error:", dbError);
          console.error("Error details:", {
            code: dbError.code,
            message: dbError.message,
            stack: dbError.stack
          });
          // Continue with emails even if DB fails
        }

        // Send emails
        try {
          // Send confirmation to customer
          await transporter.sendMail({
            from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
            to: session.customer_email,
            subject: "Your Buckeye Bin Cleaning Order Confirmation",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ed1c24;">Thank You for Your Order!</h2>
                <p>Hello ${orderDetails.name},</p>
                <p>Your bin cleaning service has been scheduled successfully. Here are your order details:</p>
                
                <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                  <p><strong>Service Plan:</strong> ${orderDetails.servicePlan}</p>
                  <p><strong>Service Address:</strong> ${orderDetails.address}</p>
                  <p><strong>Pickup Schedule:</strong> ${orderDetails.dayOfPickup}, ${orderDetails.timeOfPickup}</p>
                  <p><strong>Total Paid:</strong> $${orderDetails.amount}</p>
                </div>
                
                <p>Thank you for choosing Buckeye Bin Cleaning! Our team will reach out within 1-3 business days to confirm your service details and schedule.</p>
                <p>If you need to make any changes or have questions, please contact us at ${process.env.EMAIL_USER} or call (440) 230-6165.</p>
                
                <p>Thank you for choosing Buckeye Bin Cleaning!</p>
              </div>
            `,
          });

          // Send notification to business owner
          await transporter.sendMail({
            from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
            to: process.env.OWNER_EMAIL,
            subject: "New Bin Cleaning Order",
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #ed1c24;">New Order Received!</h2>
                <p>A new bin cleaning order has been placed:</p>
                
                <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                  <p><strong>Customer:</strong> ${orderDetails.name}</p>
                  <p><strong>Email:</strong> ${orderDetails.email}</p>
                  <p><strong>Phone:</strong> ${orderDetails.phone}</p>
                  <p><strong>Service Plan:</strong> ${orderDetails.servicePlan}</p>
                  <p><strong>Service Address:</strong> ${orderDetails.address}</p>
                  <p><strong>Pickup Schedule:</strong> ${orderDetails.dayOfPickup}, ${orderDetails.timeOfPickup}</p>
                  <p><strong>Special Instructions:</strong> ${orderDetails.message}</p>
                  <p><strong>Total Paid:</strong> $${orderDetails.amount}</p>
                </div>
                
                <p>This order has been added to the schedule.</p>
              </div>
            `,
          });

          console.log("📧 Emails sent successfully");
        } catch (emailError) {
          console.error("❌ Email Error:", emailError);
        }
        break;

      // Handle other event types if needed
      case 'payment_intent.succeeded':
        console.log('PaymentIntent succeeded:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, type: event.type });
    
  } catch (error) {
    console.error(`❌ Error processing webhook:`, error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
