import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Service plan mapping for display
const SERVICE_PLANS = {
  monthly: "Monthly Service ($30)",
  quarterly: "Quarterly Service ($45)",
  oneTime: "One-Time Service ($60)",
  buckeyeSummerPackage: "Buckeye Summer Package ($100)"
};

// Time slot mapping for display
const TIME_SLOTS = {
  morning: "Morning (7am - 11am)",
  afternoon: "Afternoon (11am - 2pm)",
  evening: "Evening (2pm - 5pm)"
};

// Day of week mapping for display
const DAYS_OF_WEEK = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Format the order details
    const orderDetails = {
      name: session.metadata.name,
      email: session.customer_email,
      phone: session.metadata.phone,
      address: session.metadata.address,
      servicePlan: SERVICE_PLANS[session.metadata.servicePlan] || session.metadata.servicePlan,
      dayOfPickup: DAYS_OF_WEEK[session.metadata.dayOfPickup] || session.metadata.dayOfPickup,
      timeOfPickup: TIME_SLOTS[session.metadata.timeOfPickup] || session.metadata.timeOfPickup,
      message: session.metadata.message,
      amount: (session.amount_total / 100).toFixed(2), // Convert cents to dollars
      orderId: session.payment_intent?.id?.slice(-8) || sessionId.slice(-8)
    };

    return NextResponse.json({
      success: true,
      orderDetails
    });
  } catch (error) {
    console.error('Error retrieving order details:', error);
    return NextResponse.json(
      { success: false, message: 'Error retrieving order details' },
      { status: 500 }
    );
  }
}