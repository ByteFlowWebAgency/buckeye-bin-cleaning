import { RETRY_CONFIG } from './constants';
import nodemailer from 'nodemailer';

// Helper function to implement exponential backoff
export async function retry(operation, retryCount = 0) {
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

// Helper function to mask sensitive data
export function maskString(str, showLast = 4) {
  if (!str) return '';
  if (str.length <= showLast) return str;
  return '*'.repeat(str.length - showLast) + str.slice(-showLast);
}

// Separate database operations for better error handling
export async function saveOrderToFirestore(db, orderData) {
  return retry(async () => {
    try {
      const docRef = await db.collection("orders").add({
        ...orderData,
        retryCount: 0,
        lastRetryAt: null,
      });
      console.log("✅ Order saved to Firestore:", docRef.id);
      return docRef;
    } catch (error) {
      console.error("❌ Firestore save error:", error);
      throw error;
    }
  });
}

// email sending with retry logic
export async function sendEmailWithRetry(transporter, mailOptions) {
  return retry(async () => {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Email send error:", error);
      throw error;
    }
  });
} 