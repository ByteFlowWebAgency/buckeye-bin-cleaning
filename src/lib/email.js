import nodemailer from "nodemailer";

// Reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Customer order confirmation email
export async function sendCustomerConfirmationEmail(orderDetails) {
  const mailOptions = {
    from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
    to: orderDetails.email,
    subject: "Your Buckeye Bin Cleaning Order Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ed1c24;">Thank You for Your Order!</h2>
        <p>Hello ${orderDetails.name},</p>
        <p>Your bin cleaning service has been scheduled successfully. Here are your order details:</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Service Plan:</strong> ${orderDetails.servicePlan}</p>
          <p><strong>Service Address:</strong> ${orderDetails.address}</p>
          <p><strong>Pickup Schedule:</strong> ${orderDetails.dayOfPickup}, ${orderDetails.timeOfPickup}</p>
          <p><strong>Total Paid:</strong> $${orderDetails.amount}</p>
        </div>
        
        <p>Say buckeye bin cleaning will reaching 1-3 days with scheduling details.</p>
        <p>If you need to make any changes or have questions, please contact us at ${process.env.EMAIL_USER} or call (216) 230-6165.</p>
        
        <p>Thank you for choosing Buckeye Bin Cleaning!</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// Business owner notification email
export async function sendOwnerNotificationEmail(orderDetails) {
  const mailOptions = {
    from: `"Buckeye Bin Cleaning System" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: "New Bin Cleaning Order",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #ed1c24;">New Order Received!</h2>
        <p>A new bin cleaning order has been placed:</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Customer:</strong> ${orderDetails.name}</p>
          <p><strong>Email:</strong> ${orderDetails.email}</p>
          <p><strong>Phone:</strong> ${orderDetails.phone}</p>
          <p><strong>Service Plan:</strong> ${orderDetails.servicePlan}</p>
          <p><strong>Service Address:</strong> ${orderDetails.address}</p>
          <p><strong>Pickup Schedule:</strong> ${orderDetails.dayOfPickup}, ${orderDetails.timeOfPickup}</p>
          <p><strong>Special Instructions:</strong> ${orderDetails.message}</p>
          <p><strong>Total Paid:</strong> $${orderDetails.amount}</p>
        </div>
        
        <p>This order has been added to the schedule.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// Customer cancellation email
export async function sendCustomerCancellationEmail(orderDetails, refundId) {
  const mailOptions = {
    from: `"Buckeye Bin Cleaning" <${process.env.EMAIL_USER}>`,
    to: orderDetails.email,
    subject: "Your Order Cancellation and Refund",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ed1c24;">Order Cancelled</h2>
        <p>Hello ${orderDetails.name},</p>
        <p>Your bin cleaning service has been cancelled as requested.</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Refund Amount:</strong> $${orderDetails.amount}</p>
          <p><strong>Refund ID:</strong> ${refundId}</p>
        </div>
        
        <p>Your refund has been processed and should appear in your account within 5-10 business days, depending on your bank or card issuer.</p>
        
        <p>If you have any questions about this refund, please contact us at ${process.env.EMAIL_USER} or call (216) 230-6165.</p>
        
        <p>Thank you for considering Buckeye Bin Cleaning. We hope to serve you in the future!</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// Owner cancellation notification
export async function sendOwnerCancellationEmail(orderDetails, refundId) {
  const mailOptions = {
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
          <p><strong>Refund ID:</strong> ${refundId}</p>
        </div>
        
        <p>This order has been removed from the schedule and the customer has been refunded.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
