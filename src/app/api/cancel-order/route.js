import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

// Constants
const SERVICE_PLANS = {
  monthly: "Monthly Service ($30)",
  quarterly: "Quarterly Service ($45)",
  oneTime: "One-Time Service ($60)",
  buckeyeSummerPackage: "Buckeye Summer Package ($100)",
};

const TIME_SLOTS = {
  morning: "Morning (7am - 11am)",
  afternoon: "Afternoon (11am - 2pm)",
  evening: "Evening (2pm - 5pm)",
};

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

// Helper function to find all orders for a session
async function findOrdersForSession(db, sessionId) {
  const ordersRef = db.collection("orders");
  const snapshot = await ordersRef.where("stripeSessionId", "==", sessionId).get();
  return snapshot.docs;
}

// Helper function to check if refund already exists
async function checkExistingRefund(db, sessionId) {
  const refundsRef = db.collection("refunds");
  const snapshot = await refundsRef.where("sessionId", "==", sessionId).get();
  return !snapshot.empty;
}

export async function POST(request) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { db } = initFirebaseAdmin();
  
  if (!db) {
    return NextResponse.json(
      { success: false, message: "Database not available" },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check for existing refund first
    const refundExists = await checkExistingRefund(db, sessionId);
    if (refundExists) {
      return NextResponse.json(
        { success: false, message: "Order has already been refunded" },
        { status: 400 }
      );
    }

    // Get session with retry logic
    const session = await retry(async () => {
      const sess = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "line_items"],
      });
      
      if (!sess || !sess.payment_intent) {
        throw new Error("Invalid session or no payment found");
      }
      
      return sess;
    });

    // Find all orders for this session
    const orderDocs = await findOrdersForSession(db, sessionId);
    if (orderDocs.length === 0) {
      return NextResponse.json(
        { success: false, message: "No orders found for this session" },
        { status: 404 }
      );
    }

    // Process refund with retry logic
    const refund = await retry(async () => {
      return stripe.refunds.create({
        payment_intent: session.payment_intent.id,
        reason: "requested_by_customer",
      });
    });

    // Get customer email with fallbacks
    const customerEmail = session.customer_email || 
                        session.metadata?.email || 
                        orderDocs[0].data().customerEmail;

    // Format order details
    const orderDetails = {
      orderId: session.id.slice(-8),
      name: session.metadata?.name || orderDocs[0].data().customerName || "Customer",
      email: customerEmail,
      phone: session.metadata?.phone || orderDocs[0].data().customerPhone || "No phone provided",
      address: session.metadata?.address || orderDocs[0].data().address || "No address provided",
      servicePlan: SERVICE_PLANS[session.metadata?.servicePlan] || orderDocs[0].data().servicePlanDisplay,
      amount: (session.amount_total / 100).toFixed(2),
    };

    // Send emails with retry logic
    await Promise.all([
      retry(async () => {
        await transporter.sendMail({
          from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
          to: customerEmail,
          subject: "Your Order Cancellation and Refund",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ed1c24;">Order Cancelled</h2>
              <p>Hello ${orderDetails.name},</p>
              <p>Your bin cleaning service has been cancelled as requested.</p>
              
              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                <p><strong>Refund Amount:</strong> $${orderDetails.amount}</p>
                <p><strong>Refund ID:</strong> ${refund.id}</p>
              </div>
              
              <p>Your refund has been processed and should appear in your account within 5-10 business days, depending on your bank or card issuer.</p>
              
              <p>If you have any questions about this refund, please contact us at ${process.env.EMAIL_USER} or call (440) 230-6165.</p>
              
              <p>Thank you for considering Buckeye Bin Cleaning. We hope to serve you in the future!</p>
            </div>
          `,
        });
      }),
      retry(async () => {
        await transporter.sendMail({
          from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
          to: process.env.OWNER_EMAIL,
          subject: "Order Cancelled and Refunded",
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #ed1c24;">Order Cancelled and Refunded</h2>
              <p>A customer has cancelled their order:</p>
              
              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                <p><strong>Customer:</strong> ${orderDetails.name}</p>
                <p><strong>Email:</strong> ${orderDetails.email}</p>
                <p><strong>Phone:</strong> ${orderDetails.phone}</p>
                <p><strong>Service Plan:</strong> ${orderDetails.servicePlan}</p>
                <p><strong>Service Address:</strong> ${orderDetails.address}</p>
                <p><strong>Refund Amount:</strong> $${orderDetails.amount}</p>
                <p><strong>Refund ID:</strong> ${refund.id}</p>
              </div>
              
              <p>This order has been removed from the schedule and the customer has been refunded.</p>
            </div>
          `,
        });
      })
    ]).catch(async (emailError) => {
      console.error("Error sending cancellation emails:", emailError);
      // Log email failure
      await db.collection("failed_emails").add({
        type: "cancellation",
        sessionId: sessionId,
        error: emailError.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // Update all orders for this session
    await Promise.all(orderDocs.map(doc => 
      retry(async () => {
        await doc.ref.update({
          status: "cancelled",
          refundId: refund.id,
          cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      })
    ));

    // Record the refund
    await db.collection("refunds").add({
      sessionId: sessionId,
      refundId: refund.id,
      amount: session.amount_total / 100,
      customerEmail: customerEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log the cancellation
    await db.collection("cancellation_logs").add({
      sessionId: sessionId,
      refundId: refund.id,
      orderIds: orderDocs.map(doc => doc.id),
      amount: session.amount_total / 100,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      success: true,
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      message: "Order cancelled and refunded successfully",
    });

  } catch (error) {
    console.error("Error processing refund:", error);
    
    // Log the error
    await db.collection("error_logs").add({
      type: "cancellation_error",
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      sessionId: request.json().sessionId,
    });

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Error processing refund",
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: error.status || 500 }
    );
  }
}
