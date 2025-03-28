import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

const PRICE_IDS = {
  monthly: "price_1QyejmQAAGErMriwUFBAzEE0",
  quarterly: "price_1QyepkQAAGErMriwysZvBPkf",
  oneTime: "price_1QyeyIQAAGErMriw3nc43sbo",
  buckeyeSummerPackage: "price_1Qyf73QAAGErMriwVB4LSNuG",
};

export async function POST(request) {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping route execution during build phase');
    return NextResponse.json({ success: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { db } = initFirebaseAdmin();
  
  if (!db) {
    console.log('Firebase DB not available');
    return NextResponse.json({ success: true });
  }

  try {
    const {
      servicePlan,
      name,
      email,
      phone,
      address,
      dayOfPickup,
      timeOfPickup,
      message,
    } = await request.json();

    // Validate the service plan exists
    if (!PRICE_IDS[servicePlan]) {
      return NextResponse.json(
        { success: false, message: "Invalid service plan" },
        { status: 400 },
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_IDS[servicePlan],
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.DOMAIN_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN_URL}/cancel`,
      customer_email: email,
      metadata: {
        name,
        phone,
        address,
        dayOfPickup,
        timeOfPickup,
        message: message || "No message provided",
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error: ", error);
    return NextResponse.json(
      { success: false, message: "Error creating checkout session" },
      { status: 500 },
    );
  }
}
