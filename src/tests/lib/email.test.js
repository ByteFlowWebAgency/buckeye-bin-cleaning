import nodemailer from "nodemailer";

import { sendEmail } from "@/lib/email";

// Mock nodemailer
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn(() => Promise.resolve({ messageId: "mockMessageId" })),
  })),
}));

describe("email.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends an email successfully", async () => {
    const emailData = {
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML Content</p>",
    };

    const result = await sendEmail(emailData);

    // Check if nodemailer.createTransport was called with the correct config
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Check if sendMail was called with the correct email data
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: `"Buckeye Bin Cleaning" <${ process.env.EMAIL_USER }>`,
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML Content</p>",
    });

    // Check if the function returns the correct result
    expect(result).toEqual({ messageId: "mockMessageId" });
  });

  it("handles email sending errors", async () => {
    // Mock sendMail to throw an error
    nodemailer.createTransport().sendMail.mockRejectedValueOnce(new Error("Email sending failed"));

    const emailData = {
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML Content</p>",
    };

    // Check if the function throws an error
    await expect(sendEmail(emailData)).rejects.toThrow("Email sending failed");
  });
});