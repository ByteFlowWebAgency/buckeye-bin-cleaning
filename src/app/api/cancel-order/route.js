import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { adminDb } from "@/data/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// reusable transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const SERVICE_PLANS = {
  monthly: "Monthly Service ($30)",
  quarterly: "Quarterly Service ($45)",
  oneTime: "One-Time Service ($60)",
  buckeyeSummerPackage: "Buckeye Summer Package ($100)"
};

const TIME_SLOTS = {
  morning: "Morning (7am - 11am)",
  afternoon: "Afternoon (11am - 2pm)",
  evening: "Evening (2pm - 5pm)"
};

const DAYS_OF_WEEK = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday"
};

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the session details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    });
    
    if (!session || !session.payment_intent) {
      return NextResponse.json(
        { success: false, message: 'Invalid session or no payment found' },
        { status: 404 }
      );
    }

    // Issue the refund
    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent.id,
      reason: 'requested_by_customer'
    });

    // Format order details for email templates
    const orderDetails = {
      orderId: session.id.slice(-8),
      name: session.metadata.name,
      email: session.customer_email,
      phone: session.metadata.phone,
      address: session.metadata.address,
      servicePlan: SERVICE_PLANS[session.metadata.servicePlan] || session.metadata.servicePlan,
      dayOfPickup: DAYS_OF_WEEK[session.metadata.dayOfPickup] || session.metadata.dayOfPickup,
      timeOfPickup: TIME_SLOTS[session.metadata.timeOfPickup] || session.metadata.timeOfPickup,
      message: session.metadata.message || 'No special instructions',
      amount: (session.amount_total / 100).toFixed(2)
    };

    // 4. Send customer cancellation email
    try {
      await transporter.sendMail({
        from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
        to: session.customer_email,
        subject: 'Your Order Cancellation and Refund',
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
            
            <p>If you have any questions about this refund, please contact us at ${process.env.EMAIL_USER} or call (440) 781-5527.</p>
            
            <p>Thank you for considering Buckeye Bin Cleaning. We hope to serve you in the future!</p>
          </div>
        `
      });
      
      // 5. Send business owner notification
      await transporter.sendMail({
        from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
        to: process.env.OWNER_EMAIL,
        subject: 'Order Cancelled and Refunded',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #ed1c24;">Order Cancelled and Refunded</h2>
            <p>A customer has cancelled their order:</p>
            
            <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
              <p><strong>Customer:</strong> ${orderDetails.name}</p>
              <p><strong>Email:</strong> ${session.customer_email}</p>
              <p><strong>Phone:</strong> ${orderDetails.phone}</p>
              <p><strong>Service Plan:</strong> ${orderDetails.servicePlan}</p>
              <p><strong>Service Address:</strong> ${orderDetails.address}</p>
              <p><strong>Refund Amount:</strong> $${orderDetails.amount}</p>
              <p><strong>Refund ID:</strong> ${refund.id}</p>
            </div>
            
            <p>This order has been removed from the schedule and the customer has been refunded.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending cancellation emails:', emailError);
      // Continue with the refund process even if emails fail
    }

    try {
        const ordersRef = adminDb.collection("orders");
        const q = ordersRef.where("stripeSessionId", "==", sessionId);
        const querySnapshot = await q.get();
        
        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          await orderDoc.ref.update({
            status: "cancelled",
            refundId: refund.id,
            cancelledAt: new Date()
          });
          console.log('Order status updated to cancelled in Firestore');
        } else {
          console.log('No matching order found in Firestore');
        }
      } catch (dbError) {
        console.error('Error updating order in database:', dbError);
      }
  
    return NextResponse.json({
      success: true,
      refundId: refund.id
    });
    
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing refund' },
      { status: 500 }
    );
  }
}