import "dotenv/config";
import { prisma } from "./src/config/db.js";
import { Role } from "@prisma/client";

async function main() {
  const count = await prisma.emailTemplate.count();
  if (count > 0) {
    console.log(`Email templates already seeded (${count} templates found).`);
    return;
  }

  const sampleTemplates = [
    {
      name: "Taxpayer Intake Welcome & Document Checklist",
      roles: [Role.TAXPAYER_USER, Role.DOC_AGENT, Role.DOC_MANAGER],
      subject: "Welcome to ATH Tax Advisory - Please upload your {{tax_year}} tax documents",
      body: `<h3>Dear {{taxpayer_name}},</h3>
<p>Thank you for choosing <strong>{{company_name}}</strong> for your <strong>{{tax_year}} US Tax Return</strong> filing (Status: <em>{{visa_type}}</em>).</p>
<p>Your dedicated Tax Intake Specialist is <strong>{{assigned_agent}}</strong> (Email: <em>{{assigned_agent_email}}</em>).</p>
<p>To ensure maximum deductions and swift processing, please complete the following steps:</p>
<ul>
  <li>Complete your 9-Module Intake Organizer</li>
  <li>Upload all W-2 wage slips from your employers</li>
  <li>Upload 1099-INT, 1099-B, and Form 1098-T (if applicable)</li>
  <li>Provide a clear copy of your Passport and US Visa stamp</li>
</ul>
<p>Access your personal taxpayer portal securely here: {{portal_link}}</p>
<p>Best regards,<br/><strong>ATH Tax Filing Operations Team</strong></p>`,
      isActive: true,
    },
    {
      name: "Form 1040 QA Review Approved - e-Signature Request",
      roles: [Role.TAXPAYER_USER, Role.SALES_AGENT, Role.TAX_REVIEWER],
      subject: "Action Required: Review your {{tax_year}} Form 1040 Tax Calculation & e-Sign",
      body: `<h3>Hello {{taxpayer_name}},</h3>
<p>Great news! Our Senior CPA Quality Assurance team has completed and certified your <strong>{{tax_year}} Form 1040 Tax Computation</strong>.</p>
<p><strong>Certified Refund Summary:</strong></p>
<ul>
  <li><strong>Federal Refund:</strong> {{fed_refund}}</li>
  <li><strong>State Refund:</strong> {{state_refund}}</li>
  <li><strong>Total Anticipated Refund:</strong> <span style="color: #16A34A; font-weight: bold;">{{total_refund}}</span></li>
</ul>
<p>Please log in to your portal to review your certified draft summary and authorize electronic transmission by signing IRS Form 8879: {{portal_link}}</p>
<p>If you have any questions, feel free to reach out to {{assigned_agent}}.</p>`,
      isActive: true,
    },
    {
      name: "IRS MeF Electronic Filing Acceptance Notice",
      roles: [Role.TAXPAYER_USER, Role.FILE_OP_AGENT, Role.ADMIN],
      subject: "Official Confirmation: Your {{tax_year}} Tax Return is Accepted by the IRS",
      body: `<h3>Congratulations {{taxpayer_name}}!</h3>
<p>We are pleased to inform you that your <strong>{{tax_year}} US Form 1040 Individual Income Tax Return</strong> has been successfully transmitted and officially <strong>ACCEPTED</strong> by the Internal Revenue Service (IRS).</p>
<p><strong>Filing Details:</strong></p>
<ul>
  <li><strong>Tax Year:</strong> {{tax_year}}</li>
  <li><strong>Filing Status:</strong> {{filing_status}}</li>
  <li><strong>Net Refund Expected:</strong> {{total_refund}}</li>
  <li><strong>E-Filing Provider:</strong> ATH Tax Advisory (EFIN: 582910)</li>
</ul>
<p>Your IRS acceptance acknowledgment receipt and certified final return copies are now archived in your Document Vault: {{portal_link}}</p>
<p>Thank you for filing with us!</p>`,
      isActive: true,
    },
  ];

  for (const t of sampleTemplates) {
    await prisma.emailTemplate.create({
      data: t,
    });
  }

  console.log(`Successfully seeded ${sampleTemplates.length} sample email templates.`);
}

main()
  .catch((e) => {
    console.error("Error seeding email templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
