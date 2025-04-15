import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';
import { SERVICE_PLANS, TIME_SLOTS, DAYS_OF_WEEK, RETRY_CONFIG } from '@/utils/constants';
import { retry, maskString } from '@/utils/helpers';
import { transporter } from '@/utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

// Helper function for safe logging
function safeLog(message) {
  console.log(message);
}

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
