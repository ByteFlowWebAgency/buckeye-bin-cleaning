import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';
import { SERVICE_PLANS, TIME_SLOTS, DAYS_OF_WEEK, RETRY_CONFIG, PRICE_ID_TO_PLAN } from '@/utils/constants';
import { retry, saveOrderToFirestore, sendEmailWithRetry } from '@/utils/helpers';
import { transporter } from '@/utils/email';

export async function POST(request) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ received: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { db } = initFirebaseAdmin();
  
  if (!db) {
    console.error('Firebase DB not initialized');
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  let event;
  try {
    event = await retry(async () => {
      const payload = await request.text();
      const sig = request.headers.get("stripe-signature");
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        console.error('Missing webhook signature or endpoint secret');
        return NextResponse.json(
          { error: 'Missing webhook signature or endpoint secret' },
          { status: 400 }
        );
      }

      try {
        return stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      } catch (err) {
        // Mask sensitive data in logs
        console.error('Webhook signature verification failed:', {
          error: err.message,
          signaturePresent: !!sig,
          endpointSecretPresent: !!endpointSecret
        });
        return NextResponse.json(
          { error: `Webhook Error: Signature verification failed` },
          { status: 400 }
        );
      }
    });
  } catch (err) {
    console.error('Error processing webhook:', {
      error: err.message,
      eventType: event?.type || 'unknown'
    });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Add idempotency check
        const existingOrder = await db.collection('orders')
          .where('stripeSessionId', '==', session.id)
          .get();

        if (!existingOrder.empty) {
          console.log(`Order for session ${session.id} already exists, skipping processing`);
          return NextResponse.json({ received: true });
        }

        console.log('Processing completed checkout session:', session.id);

        // Add payment intent verification
        if (session.payment_intent) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            if (paymentIntent.status !== 'succeeded') {
              console.error(`Payment intent ${session.payment_intent} status is ${paymentIntent.status}`);
              throw new Error('Payment intent not succeeded');
            }
            console.log(`✅ Verified payment intent ${session.payment_intent} status: succeeded`);
          } catch (error) {
            console.error('Failed to verify payment intent:', error);
            throw error;
          }
        }

        // Prepare order data
        let orderData = {
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent || null,
          customerName: session.metadata?.name || "Customer",
          customerEmail: session.customer_email || "No email provided",
          customerPhone: session.metadata?.phone || "No phone provided",
          address: session.metadata?.address || "No address provided",
          servicePlan: session.metadata.servicePlan,
          servicePlanDisplay: SERVICE_PLANS[session.metadata.servicePlan],
          dayOfPickup: session.metadata?.dayOfPickup || "unknown",
          dayOfPickupDisplay: DAYS_OF_WEEK[session.metadata?.dayOfPickup] || "Not specified",
          timeOfPickup: session.metadata?.timeOfPickup || "unknown",
          timeOfPickupDisplay: TIME_SLOTS[session.metadata?.timeOfPickup] || "Not specified",
          message: session.metadata?.message || "No special instructions",
          amount: session.amount_total / 100,
          status: "active",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          processedAt: new Date().toISOString(),
        };

        // Add monthly commitment details if applicable
        if (session.metadata.servicePlan === 'monthly') {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 3);

          orderData = {
            ...orderData,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            monthlyAmount: session.amount_total / 300,
            totalAmount: session.amount_total / 100,
            isMonthlyCommitment: true,
            commitmentMonths: 3
          };
        }

        let dbError = null;
        let docRef = null;

        // Try database operations
        try {
          // Check for existing order
          const existingOrder = await db.collection('orders')
            .where('stripeSessionId', '==', session.id)
            .get();

          if (!existingOrder.empty) {
            console.log(`Order for session ${session.id} already exists, skipping database save`);
          } else {
            // Save to Firestore
            docRef = await saveOrderToFirestore(db, orderData);
            console.log("✅ Order saved to database successfully");
          }
        } catch (error) {
          dbError = error;
          console.error("❌ Database operation failed:", error);
          
          // Log the failed operation for manual review
          try {
            await db.collection("failed_webhooks").add({
              eventId: event.id,
              type: event.type,
              error: error.message,
              orderData: orderData,
              failedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } catch (logError) {
            console.error("Failed to log webhook failure:", logError);
          }
        }

        // Proceed with email sending regardless of database success
        try {
          const customerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ed1c24;">Thank You for Your Order!</h2>
              <p>Hello ${orderData.customerName},</p>
              <p>Your bin cleaning service has been scheduled successfully. Here are your order details:</p>

              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Service Plan:</strong> ${orderData.servicePlanDisplay}</p>
                <p><strong>Service Address:</strong> ${orderData.address}</p>
                <p><strong>Pickup Schedule:</strong> ${orderData.dayOfPickupDisplay}, ${orderData.timeOfPickupDisplay}</p>
                <p><strong>Total Paid:</strong> $${orderData.amount}</p>
                ${orderData.isMonthlyCommitment ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <p><strong>Monthly Commitment Details:</strong></p>
                  <p>Start Date: ${new Date(orderData.startDate).toLocaleDateString()}</p>
                  <p>End Date: ${new Date(orderData.endDate).toLocaleDateString()}</p>
                  <p>Monthly Amount: $${orderData.monthlyAmount}</p>
                </div>
                ` : ''}
              </div>

              <p>Thank you for choosing Buckeye Bin Cleaning! Our team will reach out within 1-3 business days to confirm your service details and schedule.</p>
              <p>If you need to make any changes or have questions, please contact us at ${process.env.EMAIL_USER} or call (440) 230-6165.</p>
            </div>
          `;

          const businessEmailHtml = `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #ed1c24;">New Order Received!</h2>
              <p>A new bin cleaning order has been placed:</p>
              ${dbError ? `
              <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ef5350;">
                <p><strong>⚠️ Warning:</strong> This order failed to save to the database. Please save these details and investigate the issue.</p>
                <p><strong>Error:</strong> ${dbError.message}</p>
              </div>
              ` : ''}
              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Customer:</strong> ${orderData.customerName}</p>
                <p><strong>Email:</strong> ${orderData.customerEmail}</p>
                <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
                <p><strong>Service Plan:</strong> ${orderData.servicePlanDisplay}</p>
                <p><strong>Service Address:</strong> ${orderData.address}</p>
                <p><strong>Pickup Schedule:</strong> ${orderData.dayOfPickupDisplay}, ${orderData.timeOfPickupDisplay}</p>
                <p><strong>Special Instructions:</strong> ${orderData.message}</p>
                <p><strong>Total Paid:</strong> $${orderData.amount}</p>
                ${orderData.isMonthlyCommitment ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <p><strong>Monthly Commitment Details:</strong></p>
                  <p>Start Date: ${new Date(orderData.startDate).toLocaleDateString()}</p>
                  <p>End Date: ${new Date(orderData.endDate).toLocaleDateString()}</p>
                  <p>Monthly Amount: $${orderData.monthlyAmount}</p>
                  <p>Total Commitment: $${orderData.totalAmount}</p>
                </div>
                ` : ''}
                <p><strong>Stripe Session ID:</strong> ${session.id}</p>
              </div>
            </div>
          `;

          // Send both emails with retry logic
          await Promise.all([
            sendEmailWithRetry(transporter, {
              from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
              to: orderData.customerEmail,
              subject: "Your Buckeye Bin Cleaning Order Confirmation",
              html: customerEmailHtml
            }),
            sendEmailWithRetry(transporter, {
              from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
              to: process.env.OWNER_EMAIL,
              subject: dbError ? "New Order Received (DATABASE ERROR - Action Required)" : "New Order Received",
              html: businessEmailHtml
            })
          ]);

          console.log("✅ Confirmation emails sent successfully");

          // Try to log email success
          try {
            await db.collection("email_logs").add({
              type: 'order_confirmation',
              stripeSessionId: session.id,
              customerEmail: orderData.customerEmail,
              businessEmail: process.env.OWNER_EMAIL,
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              success: true,
              dbError: dbError ? true : false
            });
          } catch (logError) {
            console.error("Failed to log email success:", logError);
          }

        } catch (emailError) {
          console.error("Failed to send confirmation emails:", emailError);
          
          // Try to log email failure
          try {
            await db.collection("failed_emails").add({
              type: 'order_confirmation',
              stripeSessionId: session.id,
              error: emailError.message,
              customerEmail: orderData.customerEmail,
              businessEmail: process.env.OWNER_EMAIL,
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              orderData: orderData
            });
          } catch (logError) {
            console.error("Failed to log email failure:", logError);
          }
        }

        // If database operation failed, return 500 but after attempting emails
        if (dbError) {
          return NextResponse.json(
            { error: 'Order processed but database save failed' },
            { status: 500 }
          );
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        // Check if this is a subscription payment
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const customerId = invoice.customer;
          
          // Add idempotency check for recurring payments
          const existingPayment = await db.collection('recurring_payments')
            .where('invoiceId', '==', invoice.id)
            .get();

          if (!existingPayment.empty) {
            console.log(`Payment for invoice ${invoice.id} already processed`);
            return NextResponse.json({ received: true });
          }

          // Get the original order to copy service details
          const originalOrders = await db.collection('orders')
            .where('stripeCustomerId', '==', customerId)
            .where('servicePlan', 'in', ['monthly', 'quarterly'])
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

          if (!originalOrders.empty) {
            const originalOrder = originalOrders.docs[0].data();
            
            // Create a new payment record
            await db.collection('recurring_payments').add({
              invoiceId: invoice.id,
              subscriptionId: invoice.subscription,
              stripeCustomerId: customerId,
              customerName: originalOrder.customerName,
              customerEmail: originalOrder.customerEmail,
              customerPhone: originalOrder.customerPhone,
              address: originalOrder.address,
              servicePlan: originalOrder.servicePlan,
              servicePlanDisplay: originalOrder.servicePlanDisplay,
              dayOfPickup: originalOrder.dayOfPickup,
              dayOfPickupDisplay: originalOrder.dayOfPickupDisplay,
              timeOfPickup: originalOrder.timeOfPickup,
              timeOfPickupDisplay: originalOrder.timeOfPickupDisplay,
              amount: invoice.amount_paid / 100,
              status: 'paid',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              paymentDate: new Date(invoice.status_transitions.paid_at * 1000).toISOString()
            });

            // Send email notification for recurring payment
            const customerEmailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ed1c24;">Recurring Payment Processed</h2>
                <p>Hello ${originalOrder.customerName},</p>
                <p>We've processed your recurring payment for bin cleaning service:</p>
                
                <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Service Plan:</strong> ${originalOrder.servicePlanDisplay}</p>
                  <p><strong>Amount Paid:</strong> $${invoice.amount_paid / 100}</p>
                  <p><strong>Service Address:</strong> ${originalOrder.address}</p>
                  <p><strong>Pickup Schedule:</strong> ${originalOrder.dayOfPickupDisplay}, ${originalOrder.timeOfPickupDisplay}</p>
                </div>
                
                <p>Your next service is scheduled as per your regular pickup time.</p>
                <p>If you need to make any changes, please contact us at ${process.env.EMAIL_USER}</p>
              </div>
            `;

            await sendEmailWithRetry(transporter, {
              from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
              to: originalOrder.customerEmail,
              subject: "Recurring Payment Processed - Buckeye Bin Cleaning",
              html: customerEmailHtml
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        // Handle failed recurring payment
        if (invoice.subscription) {
          // Log the failure
          await db.collection('failed_payments').add({
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            stripeCustomerId: invoice.customer,
            amount: invoice.amount_due / 100,
            failureMessage: invoice.last_payment_error?.message || 'Unknown error',
            failedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Get customer details from original order
          const originalOrders = await db.collection('orders')
            .where('stripeCustomerId', '==', invoice.customer)
            .where('servicePlan', 'in', ['monthly', 'quarterly'])
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

          if (!originalOrders.empty) {
            const originalOrder = originalOrders.docs[0].data();

            // Send customer notification
            const customerEmailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ed1c24;">Payment Failed Notice</h2>
                <p>Hello ${originalOrder.customerName},</p>
                <p>We were unable to process your recurring payment for bin cleaning service:</p>
                
                <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Service Plan:</strong> ${originalOrder.servicePlanDisplay}</p>
                  <p><strong>Amount Due:</strong> $${invoice.amount_due / 100}</p>
                  <p><strong>Reason:</strong> ${invoice.last_payment_error?.message || 'Payment method declined'}</p>
                </div>
                
                <p>Please update your payment method in your account to ensure uninterrupted service. We will attempt to process the payment again in 24-48 hours.</p>
                <p>If you need assistance, please contact us at ${process.env.EMAIL_USER} or call (440) 230-6165.</p>
              </div>
            `;

            // Send business owner notification
            const businessEmailHtml = `
              <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #ed1c24;">Payment Failed Alert</h2>
                <p>A recurring payment has failed:</p>

                <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Customer:</strong> ${originalOrder.customerName}</p>
                  <p><strong>Email:</strong> ${originalOrder.customerEmail}</p>
                  <p><strong>Phone:</strong> ${originalOrder.customerPhone}</p>
                  <p><strong>Service Plan:</strong> ${originalOrder.servicePlanDisplay}</p>
                  <p><strong>Service Address:</strong> ${originalOrder.address}</p>
                  <p><strong>Amount Due:</strong> $${invoice.amount_due / 100}</p>
                  <p><strong>Error Message:</strong> ${invoice.last_payment_error?.message || 'Payment method declined'}</p>
                  <p><strong>Invoice ID:</strong> ${invoice.id}</p>
                  <p><strong>Subscription ID:</strong> ${invoice.subscription}</p>
                </div>

                <p>The system will automatically retry the payment. You may want to follow up with the customer if the issue persists.</p>
              </div>
            `;

            // Send both emails with retry logic
            try {
              await Promise.all([
                sendEmailWithRetry(transporter, {
                  from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
                  to: originalOrder.customerEmail,
                  subject: "Payment Failed - Action Required - Buckeye Bin Cleaning",
                  html: customerEmailHtml
                }),
                sendEmailWithRetry(transporter, {
                  from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
                  to: process.env.OWNER_EMAIL,
                  subject: "Payment Failed Alert - Customer Action Required",
                  html: businessEmailHtml
                })
              ]);

              // Log successful email sending
              await db.collection("email_logs").add({
                type: 'payment_failure_notification',
                orderId: originalOrders.docs[0].id,
                invoiceId: invoice.id,
                customerEmail: originalOrder.customerEmail,
                businessEmail: process.env.OWNER_EMAIL,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                success: true
              });

            } catch (emailError) {
              console.error("Failed to send payment failure notifications:", emailError);
              
              // Log email failure
              await db.collection("failed_emails").add({
                type: 'payment_failure_notification',
                invoiceId: invoice.id,
                error: emailError.message,
                customerEmail: originalOrder.customerEmail,
                businessEmail: process.env.OWNER_EMAIL,
                failedAt: admin.firestore.FieldValue.serverTimestamp(),
                orderData: originalOrder
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status in your database
        const orders = await db.collection('orders')
          .where('stripeCustomerId', '==', subscription.customer)
          .where('servicePlan', 'in', ['monthly', 'quarterly'])
          .get();

        for (const doc of orders.docs) {
          await doc.ref.update({
            subscriptionStatus: 'cancelled',
            cancelledAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Error processing webhook:`, err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
