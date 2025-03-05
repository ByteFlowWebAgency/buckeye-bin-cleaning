import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const payload = await request.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature");
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
  
  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Here you could save the order to your database
    console.log("Payment successful for session: ", session.id);
  }
  
  return NextResponse.json({ received: true });
}