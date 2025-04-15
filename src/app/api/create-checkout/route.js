import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

const PRICE_IDS = {
  monthly: "price_1R8ELrGMbVFwRLXqhUtIBohJ",
  quarterly: "price_1R8ES4GMbVFwRLXq0Kwc7QZO",
  oneTime: "price_1R8EV4GMbVFwRLXqGIsSuhEB",
  buckeyeSummerPackage: "price_1R8EZFGMbVFwRLXqAtRwjnuK",
};

export async function POST(req) {
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
    const data = await req.json();
    const { servicePlan, email } = data;

    // Get the base URL from environment or construct it from the request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`;

    // Define the pricing logic
    let amount;
    let description;
    
    switch (servicePlan) {
      case 'monthly':
        amount = 30 * 3; // $90 for 3 months
        description = 'Monthly Service Plan (3-month minimum commitment)';
        break;
      case 'quarterly':
        amount = 45;
        description = 'Quarterly Service Plan';
        break;
      case 'oneTime':
        amount = 60;
        description = 'One Time Service';
        break;
      case 'buckeyeSummerPackage':
        amount = 100;
        description = 'Buckeye Summer Package';
        break;
      default:
        throw new Error('Invalid service plan selected');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Bin Cleaning Service',
              description: description,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        ...data,
        email: email,
        amount: amount,
        description: description,
      },
      mode: 'payment',
      success_url: new URL('/success?session_id={CHECKOUT_SESSION_ID}', baseUrl).toString(),
      cancel_url: new URL('/cancel', baseUrl).toString(),
    });

    // Log session creation for debugging
    console.log('Created checkout session:', {
      sessionId: session.id,
      customerEmail: email,
      metadata: session.metadata,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
