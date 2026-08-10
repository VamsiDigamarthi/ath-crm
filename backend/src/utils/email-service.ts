import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  static async sendEmail(options: EmailOptions) {
    // In development/test, if credentials aren't set, we just log to console
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("------------------------------------------");
      console.log(`[EMAIL SIMULATION] To: ${options.to}`);
      console.log(`[SUBJECT] ${options.subject}`);
      console.log(`[CONTENT] ${options.text || options.html}`);
      console.log("------------------------------------------");
      return { messageId: "simulated-id" };
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'App Service'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      ...options,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Sent successfully to ${options.to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error("[EMAIL SERVICE ERROR]", error);
      return null;
    }
  }

  static async sendOTP(to: string, otp: string) {
    return this.sendEmail({
      to,
      subject: "Your Verification Code",
      text: `Your OTP for login is: ${otp}. It will expire in 10 minutes.`,
      html: `<h3>Login Verification</h3><p>Your OTP is: <b>${otp}</b></p><p>Valid for 10 minutes.</p>`,
    });
  }
}
