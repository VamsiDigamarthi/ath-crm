import { Queue } from "bullmq";
import { bullMqConnectionOptions } from "../../config/redis.js";

export interface OtpEmailJobData {
  identifier: string;
  otp: string;
  email: string;
  fullName?: string;
}

export interface StaffEmailJobData {
  sentEmailId: string;
  userId: string;
  applicationId?: string;
  recipientEmail: string;
  subject: string;
  body: string;
  templateId?: string;
}

// 1. Queue for OTP Verification Emails
export const otpEmailQueue = new Queue<OtpEmailJobData, any, string>("otp-email-queue", {
  connection: bullMqConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // keep failed jobs for 24 hours
    },
  },
});

// 2. Queue for Staff Client Emails (with full DB tracking)
export const staffEmailQueue = new Queue<StaffEmailJobData, any, string>("staff-email-queue", {
  connection: bullMqConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // keep completed jobs for 24 hours
      count: 5000,
    },
    removeOnFail: {
      age: 604800, // keep failed jobs for 7 days
    },
  },
});

console.log("[QUEUES] BullMQ Queues initialized: otp-email-queue, staff-email-queue");
