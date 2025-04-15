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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create reusable transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Helper function to mask sensitive data
function maskString(str, showLast = 4) {
  if (!str) return '';
  if (str.length <= showLast) return str;
  return '*'.repeat(str.length - showLast) + str.slice(-showLast);
}

// Helper function for safe logging
function safe

export async function POST(request) {
  const { db } = initFirebaseAdmin();
  
  if (!db) {
    return NextResponse.json(
      { success: false, message: "Database not available" },
      { status: 500 }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check if payment intent exists and can be refunded
    if (!session.payment_intent) {
      return NextResponse.json(
        { success: false, message: "No payment found for this session" },
        { status: 400 }
      );
    }

    // Get order from database
    const orderSnapshot = await db.collection('orders')
      .where('stripeSessionId', '==', sessionId)
      .get();

    if (orderSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const orderDoc = orderSnapshot.docs[0];
    const orderData = orderDoc.data();

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent.id
    });

    // Update order status
    await orderDoc.ref.update({
      status: 'cancelled',
      refundId: refund.id,
      cancelledAt: new Date().toISOString()
    });

    // Send confirmation emails
    const customerEmail = {
      from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: "Order Cancellation Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Order Cancellation Confirmed</h2>
          <p>Hello ${orderData.customerName},</p>
          <p>Your order has been cancelled and a refund has been initiated.</p>
          <p>Refund amount: $${orderData.amount}</p>
          <p>The refund should appear in your account within 5-10 business days.</p>
          <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
        </div>
      `
    };

    const adminEmail = {
      from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: "Order Cancelled - Refund Issued",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Order Cancellation Notice</h2>
          <p>Order Details:</p>
          <ul>
            <li>Customer: ${orderData.customerName}</li>
            <li>Email: ${orderData.customerEmail}</li>
            <li>Amount Refunded: $${orderData.amount}</li>
            <li>Refund ID: ${refund.id}</li>
            <li>Original Order ID: ${orderDoc.id}</li>
          </ul>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(customerEmail),
      transporter.sendMail(adminEmail)
    ]);

    return NextResponse.json({
      success: true,
      message: "Order cancelled and refund initiated",
      refundId: refund.id
    });

  } catch (error) {
    console.error('Error processing cancellation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to process cancellation request",
        error: error.message
      },
      { status: 500 }
    );
  }
}
