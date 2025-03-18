import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";

import { initFirebaseAdmin } from '@/utils/firebase-admin-init';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
  price_1QyejmQAAGErMriwUFBAzEE0: {
    id: "monthly",
    display: "Monthly Service ($30)",
  },
  price_1QyepkQAAGErMriwysZvBPkf: {
    id: "quarterly",
    display: "Quarterly Service ($45)",
  },
  price_1QyeyIQAAGErMriw3nc43sbo: {
    id: "oneTime",
    display: "One-Time Service ($60)",
  },
  price_1Qyf73QAAGErMriwVB4LSNuG: {
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
  const { db } = initFirebaseAdmin();
  
  // Skip Firebase operations during build
  if (!db) {
    console.log('Skipping Firebase operations during build');
    return NextResponse.json({ received: true });
  }

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
        
        // Determine service plan using multiple methods in order of reliability
        let servicePlan = "";
        let servicePlanDisplay = "";

        // Method 1: Check metadata first
        if (
          session.metadata?.servicePlan &&
          SERVICE_PLANS[session.metadata.servicePlan]
        ) {
          servicePlan = session.metadata.servicePlan;
          servicePlanDisplay = SERVICE_PLANS[servicePlan];
          console.log("Service plan determined from metadata:", servicePlan);
        }
        // Method 2: Check line items if available
        else if (
          session.line_items &&
          session.line_items.data &&
          session.line_items.data.length > 0
        ) {
          const priceId = session.line_items.data[0].price.id;
          if (PRICE_ID_TO_PLAN[priceId]) {
            servicePlan = PRICE_ID_TO_PLAN[priceId].id;
            servicePlanDisplay = PRICE_ID_TO_PLAN[priceId].display;
            console.log("Service plan determined from line items:", servicePlan);
          }
        }
        // Method 3: If line items aren't expanded, fetch them separately
        else {
          try {
            console.log("Fetching line items for session:", session.id);
            const lineItems = await stripe.checkout.sessions.listLineItems(
              session.id,
            );

            if (lineItems.data && lineItems.data.length > 0) {
              const priceId = lineItems.data[0].price.id;

              if (PRICE_ID_TO_PLAN[priceId]) {
                servicePlan = PRICE_ID_TO_PLAN[priceId].id;
                servicePlanDisplay = PRICE_ID_TO_PLAN[priceId].display;
                console.log(
                  "Service plan determined from fetched line items:",
                  servicePlan,
                );
              }
            }
          } catch (error) {
            console.error("Error fetching line items:", error);
          }
        }

        // Method 4: Finally, fallback to amount-based determination if still unknown
        if (!servicePlan) {
          const amount = session.amount_total / 100;

          if (amount === 30) {
            servicePlan = "monthly";
            servicePlanDisplay = "Monthly Service ($30)";
          } else if (amount === 45) {
            servicePlan = "quarterly";
            servicePlanDisplay = "Quarterly Service ($45)";
          } else if (amount === 60) {
            servicePlan = "oneTime";
            servicePlanDisplay = "One-Time Service ($60)";
          } else if (amount === 100) {
            servicePlan = "buckeyeSummerPackage";
            servicePlanDisplay = "Buckeye Summer Package ($100)";
          } else {
            servicePlan = "custom";
            servicePlanDisplay = `Custom Service ($${amount.toFixed(2)})`;
          }
          console.log("Service plan determined from amount:", servicePlan);
        }

        // Format order details for emails and database with fallbacks for missing data
        const orderDetails = {
          orderId: session.id.slice(-8),
          name: session.metadata?.name || "Customer",
          email: session.customer_email || "No email provided",
          phone: session.metadata?.phone || "No phone provided",
          address: session.metadata?.address || "No address provided",
          servicePlan: servicePlanDisplay,
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
            servicePlanDisplay: servicePlanDisplay,

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
                
                <p>Our team will service your bins on your next trash pickup day.</p>
                <p>If you need to make any changes or have questions, please contact us at ${process.env.EMAIL_USER} or call (440) 781-5527.</p>
                
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
