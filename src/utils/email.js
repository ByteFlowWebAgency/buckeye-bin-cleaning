import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
}); 