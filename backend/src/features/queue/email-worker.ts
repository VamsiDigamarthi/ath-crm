import { Worker, Job } from "bullmq";
import { bullMqConnectionOptions } from "../../config/redis.js";
import { OtpEmailJobData, StaffEmailJobData } from "./email-queue.js";
import { prisma } from "../../config/db.js";
import nodemailer from "nodemailer";
import { Role, AuditActorType, AuditActionType } from "@prisma/client";

// System transporter for OTP emails
const systemTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "vaddalanarasimha@gmail.com",
    pass: (process.env.EMAIL_PASS || "bowj joeq ughc keqk").replace(/\s+/g, ""),
  },
});

// 1. Worker for OTP Verification Emails
export const otpEmailWorker = new Worker<OtpEmailJobData, any, string>(
  "otp-email-queue",
  async (job: Job<OtpEmailJobData, any, string>) => {
    const { email, otp, fullName } = job.data;
    console.log(`[BULLMQ OTP WORKER] Processing OTP email job ${job.id} for ${email}...`);

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #16a34a; margin: 0; font-size: 24px;">TaxCRM Security Portal</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">One-Time Authentication Code</p>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello ${fullName || "User"},</p>
        <p style="font-size: 14px; color: #334155;">Your one-time verification code for TaxCRM access is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #16a34a; background-color: #f0fdf4; padding: 12px 24px; border-radius: 8px; border: 1px dashed #86efac; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #64748b;">This code expires in 10 minutes. If you did not request this login code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">TaxCRM Professional Tax Operations • Automated Security System</p>
      </div>
    `;

    await systemTransporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Tax CRM Engine"}" <${process.env.EMAIL_USER || "vaddalanarasimha@gmail.com"}>`,
      to: email,
      subject: `Your TaxCRM Verification Code: ${otp}`,
      html: htmlBody,
    });

    console.log(`[BULLMQ OTP SUCCESS] Dispatched OTP code to ${email} (Job ${job.id})`);
    return { success: true, email };
  },
  {
    connection: bullMqConnectionOptions,
    concurrency: 5,
  }
);

otpEmailWorker.on("failed", (job, err) => {
  console.error(`[BULLMQ OTP WORKER ERROR] Job ${job?.id} failed:`, err.message);
});

// 2. Worker for Staff Custom & Template Emails
export const staffEmailWorker = new Worker<StaffEmailJobData, any, string>(
  "staff-email-queue",
  async (job: Job<StaffEmailJobData, any, string>) => {
    const { sentEmailId, userId, applicationId, recipientEmail, subject, body, templateId } = job.data;

    console.log(
      `[BULLMQ STAFF WORKER] Processing staff email job ${job.id} (SentEmail ID: ${sentEmailId}) for ${recipientEmail}...`
    );

    // Transition status to PROCESSING in DB
    await prisma.sentEmail.update({
      where: { id: sentEmailId },
      data: {
        status: "PROCESSING",
        jobId: job.id,
      },
    });

    const sender = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!sender) {
      const err = new Error(`Sender user ${userId} not found in database`);
      await prisma.sentEmail.update({
        where: { id: sentEmailId },
        data: {
          status: "FAILED",
          errorMessage: err.message,
        },
      });
      throw err;
    }

    const cleanSmtpPassword = sender.smtpAppPassword
      ? sender.smtpAppPassword.replace(/\s+/g, "")
      : (process.env.EMAIL_PASS || "bowj joeq ughc keqk").replace(/\s+/g, "");
    const smtpEmail = sender.smtpEmail || sender.email || process.env.EMAIL_USER || "vaddalanarasimha@gmail.com";

    const senderDisplayName =
      `${sender.firstName || ""} ${sender.lastName || ""}`.trim() ||
      sender.email ||
      "Tax Specialist";

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpEmail,
          pass: cleanSmtpPassword,
        },
      });

      await transporter.sendMail({
        from: `"${senderDisplayName}" <${smtpEmail}>`,
        to: recipientEmail.trim().toLowerCase(),
        subject: subject.trim(),
        html: body,
      });

      // Update SentEmail status to SENT
      const updated = await prisma.sentEmail.update({
        where: { id: sentEmailId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          errorMessage: null,
        },
      });

      // Record in TaxApplication AuditLog if application is linked
      if (applicationId) {
        try {
          await prisma.auditLog.create({
            data: {
              applicationId,
              actorId: sender.id,
              actorType:
                sender.role === Role.ADMIN
                  ? AuditActorType.ADMIN
                  : AuditActorType.AGENT,
              actorName: senderDisplayName,
              actorRole: sender.role,
              action: AuditActionType.DISPOSITION_LOG,
              moduleKey: "EMAIL_DISPATCH",
              details: {
                recipient: recipientEmail,
                subject,
                templateId,
                sentEmailId,
                jobId: job.id,
                status: "SENT",
              },
            },
          });
        } catch (auditErr) {
          console.warn("[AUDIT LOG WARNING] Could not record email audit log:", auditErr);
        }
      }

      console.log(
        `[BULLMQ STAFF SUCCESS] Dispatched email from ${smtpEmail} to ${recipientEmail} (Job ${job.id})`
      );

      return { success: true, sentEmailId, status: "SENT" };
    } catch (err: any) {
      console.error(`[BULLMQ STAFF WORKER ERROR] Attempt ${job.attemptsMade} failed for Job ${job.id}:`, err.message);

      // Check if this was the last attempt
      const maxAttempts = job.opts.attempts || 3;
      if (job.attemptsMade >= maxAttempts - 1) {
        await prisma.sentEmail.update({
          where: { id: sentEmailId },
          data: {
            status: "FAILED",
            errorMessage: err.message || "Email dispatch failed after maximum retry attempts",
          },
        });

        if (applicationId) {
          try {
            await prisma.auditLog.create({
              data: {
                applicationId,
                actorId: sender.id,
                actorType:
                  sender.role === Role.ADMIN
                    ? AuditActorType.ADMIN
                    : AuditActorType.AGENT,
                actorName: senderDisplayName,
                actorRole: sender.role,
                action: AuditActionType.DISPOSITION_LOG,
                moduleKey: "EMAIL_DISPATCH",
                details: {
                  recipient: recipientEmail,
                  subject,
                  templateId,
                  sentEmailId,
                  jobId: job.id,
                  status: "FAILED",
                  error: err.message,
                },
              },
            });
          } catch (auditErr) {
            console.warn("[AUDIT LOG WARNING] Could not record failed email audit log:", auditErr);
          }
        }
      }

      throw err; // Re-throw to trigger BullMQ retry logic
    }
  },
  {
    connection: bullMqConnectionOptions,
    concurrency: 5,
  }
);

staffEmailWorker.on("failed", (job, err) => {
  console.error(`[BULLMQ STAFF WORKER FINAL FAILURE] Job ${job?.id} permanently failed:`, err.message);
});

console.log("[WORKERS] BullMQ Workers initialized: otpEmailWorker, staffEmailWorker");
