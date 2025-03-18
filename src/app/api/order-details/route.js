import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';

const SERVICE_PLANS = {
  monthly: "Monthly Service ($30)",
  quarterly: "Quarterly Service ($45)",
  oneTime: "One-Time Service ($60)",
  buckeyeSummerPackage: "Buckeye Summer Package ($100)",
};

const PRICE_ID_TO_PLAN = {
  price_1QyejmQAAGErMriwUFBAzEE0: "Monthly Service ($30)",
  price_1QyepkQAAGErMriwysZvBPkf: "Quarterly Service ($45)",
  price_1QyeyIQAAGErMriw3nc43sbo: "One-Time Service ($60)",
  price_1Qyf73QAAGErMriwVB4LSNuG: "Buckeye Summer Package ($100)",
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

export async function GET(request) {
  // Move initialization inside the function
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "Session ID is required" },
      { status: 400 },
    );
  }

  try {
    // Skip Firebase operations during build
    const { db } = initFirebaseAdmin();
    if (!db) {
      console.log('Skipping Firebase operations during build');
      return NextResponse.json({ success: true });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 },
      );
    }

    // Determine service plan using multiple methods in order of reliability
    let servicePlanDisplay = "";

    // Method 1: Check metadata first
    if (
      session.metadata?.servicePlan &&
      SERVICE_PLANS[session.metadata.servicePlan]
    ) {
      servicePlanDisplay = SERVICE_PLANS[session.metadata.servicePlan];
      console.log("Service plan determined from metadata");
    }
    // Method 2: Check line items if available
    else if (
      session.line_items &&
      session.line_items.data &&
      session.line_items.data.length > 0
    ) {
      const priceId = session.line_items.data[0].price.id;
      if (PRICE_ID_TO_PLAN[priceId]) {
        servicePlanDisplay = PRICE_ID_TO_PLAN[priceId];
        console.log("Service plan determined from line items");
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
            servicePlanDisplay = PRICE_ID_TO_PLAN[priceId];
            console.log("Service plan determined from fetched line items");
          }
        }
      } catch (error) {
        console.error("Error fetching line items:", error);
      }
    }

    // Method 4: Finally, fallback to amount-based determination if still unknown
    if (!servicePlanDisplay) {
      const amount = session.amount_total / 100;

      if (amount === 30) {
        servicePlanDisplay = "Monthly Service ($30)";
      } else if (amount === 45) {
        servicePlanDisplay = "Quarterly Service ($45)";
      } else if (amount === 60) {
        servicePlanDisplay = "One-Time Service ($60)";
      } else if (amount === 100) {
        servicePlanDisplay = "Buckeye Summer Package ($100)";
      } else {
        servicePlanDisplay = `Custom Service ($${amount.toFixed(2)})`;
      }
      console.log("Service plan determined from amount");
    }

    const orderDetails = {
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
      message: session.metadata?.message || "",
      amount: (session.amount_total / 100).toFixed(2),
      orderId: session.payment_intent?.id?.slice(-8) || sessionId.slice(-8),
    };

    return NextResponse.json({
      success: true,
      orderDetails,
    });
  } catch (error) {
    console.error("Error retrieving order details:", error);
    return NextResponse.json(
      { success: false, message: "Error retrieving order details" },
      { status: 500 },
    );
  }
}
