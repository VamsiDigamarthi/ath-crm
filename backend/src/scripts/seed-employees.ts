import "dotenv/config";
import { prisma } from "../config/db.js";
import { Role, ApplicationStage } from "@prisma/client";

async function main() {
  console.log("--- Starting Comprehensive Real Database Clean & Seed ---");

  // 1. Unlink references and clear previous test applications
  console.log("Cleaning old test applications and dependencies...");
  await prisma.taxApplication.updateMany({
    data: {
      assignedDocAgentId: null,
      assignedPrepAgentId: null,
      assignedReviewAgentId: null,
      assignedSalesAgentId: null,
      assignedFileOpId: null,
    },
  });

  await prisma.sentEmail.deleteMany({});
  await prisma.emailTemplate.deleteMany({});
  await prisma.stageHistory.deleteMany({});
  await prisma.callLog.deleteMany({});
  await prisma.taxDocument.deleteMany({});
  await prisma.salesQuote.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.taxApplication.deleteMany({});
  await prisma.customerProfile.deleteMany({});

  // 2. Clear all non-admin users, and ensure Admin is clean
  await prisma.user.deleteMany({
    where: { role: { not: Role.ADMIN } },
  });

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  const defaultSmtpEmail = "vaddalanarasimha@gmail.com";
  const defaultSmtpAppPassword = "bowj joeq ughc keqk";

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        firstName: "System",
        lastName: "Admin",
        email: "admin@taxcrm.com",
        mobile: "9876543200",
        isActive: true,
        smtpEmail: defaultSmtpEmail,
        smtpAppPassword: defaultSmtpAppPassword,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: "admin@taxcrm.com",
        mobile: "9876543200",
        role: Role.ADMIN,
        isActive: true,
        smtpEmail: defaultSmtpEmail,
        smtpAppPassword: defaultSmtpAppPassword,
      },
    });
  }

  // 3. Define Seed Users for all staff roles
  const staffToSeed = [
    // Documenter Dept
    {
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul@taxcrm.com",
      mobile: "9876543201",
      role: Role.DOC_MANAGER,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Priya",
      lastName: "Patel",
      email: "priya@taxcrm.com",
      mobile: "9876543202",
      role: Role.DOC_TEAM_LEAD,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Arjun",
      lastName: "Varma",
      email: "arjun@taxcrm.com",
      mobile: "9876543203",
      role: Role.DOC_AGENT,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Kavita",
      lastName: "Deshmukh",
      email: "kavita@taxcrm.com",
      mobile: "9876543204",
      role: Role.DOC_AGENT,
      isActive: false,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },

    // Tax Prep & Review Dept
    {
      firstName: "Sneha",
      lastName: "Reddy",
      email: "sneha@taxcrm.com",
      mobile: "9876543205",
      role: Role.PREP_MANAGER,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Vikram",
      lastName: "Malhotra",
      email: "vikram@taxcrm.com",
      mobile: "9876543206",
      role: Role.TAX_REVIEWER,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Ananya",
      lastName: "Iyer",
      email: "ananya@taxcrm.com",
      mobile: "9876543207",
      role: Role.TAX_PREPARER,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },

    // Sales Dept
    {
      firstName: "Rohan",
      lastName: "Mehta",
      email: "rohan@taxcrm.com",
      mobile: "9876543208",
      role: Role.SALES_MANAGER,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Neha",
      lastName: "Gupta",
      email: "neha@taxcrm.com",
      mobile: "9876543209",
      role: Role.SALES_TEAM_LEAD,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Kabir",
      lastName: "Das",
      email: "kabir@taxcrm.com",
      mobile: "9876543210",
      role: Role.SALES_AGENT,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Divya",
      lastName: "Kapoor",
      email: "divya@taxcrm.com",
      mobile: "9876543211",
      role: Role.SALES_AGENT,
      isActive: false,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },

    // File Operator Dept
    {
      firstName: "Amit",
      lastName: "Kulkarni",
      email: "amit@taxcrm.com",
      mobile: "9876543212",
      role: Role.FILE_OP_MANAGER,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Pooja",
      lastName: "Nair",
      email: "pooja@taxcrm.com",
      mobile: "9876543213",
      role: Role.FILE_OP_TEAM_LEAD,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
    {
      firstName: "Siddharth",
      lastName: "Rao",
      email: "siddharth@taxcrm.com",
      mobile: "9876543214",
      role: Role.FILE_OP_AGENT,
      isActive: true,
      smtpEmail: defaultSmtpEmail,
      smtpAppPassword: defaultSmtpAppPassword,
    },
  ];

  console.log(`Seeding ${staffToSeed.length} staff members...`);
  const staffByEmail: Record<string, string> = {};

  for (const staff of staffToSeed) {
    const created = await prisma.user.create({ data: staff });
    staffByEmail[staff.email] = created.id;
  }

  const arjunId = staffByEmail["arjun@taxcrm.com"];
  const ananyaId = staffByEmail["ananya@taxcrm.com"];
  const vikramId = staffByEmail["vikram@taxcrm.com"];
  const kabirId = staffByEmail["kabir@taxcrm.com"];
  const siddharthId = staffByEmail["siddharth@taxcrm.com"];

  // 4. Seed Rich Real Taxpayer Clients across all stages
  console.log("Seeding real taxpayer clients with applications, documents, quotes, and call logs...");

  const clients = [
    {
      firstName: "Suresh",
      lastName: "Narayanan",
      email: "suresh@taxcrm.com",
      mobile: "9876543215",
      ssnTin: "4819",
      dob: "1988-04-12",
      occupation: "Lead Software Architect",
      visaType: "H1B",
      maritalStatus: "MARRIED_JOINT",
      addressLine1: "742 Evergreen Terrace",
      city: "San Jose",
      state: "CA",
      zipCode: "95112",
      isConvertedCustomer: true,
      applications: [
        {
          taxYear: 2025,
          filingType: "MARRIED_JOINT",
          currentStage: ApplicationStage.DOC_PREP,
          assignedDocAgentId: arjunId,
          assignedPrepAgentId: ananyaId,
          assignedReviewAgentId: vikramId,
          assignedSalesAgentId: kabirId,
          assignedFileOpId: siddharthId,
          taxDraftSummary: {
            w2Income: 165000,
            wages: 165000,
            federalWithholding: 26500,
            stateWithholding: 9200,
            federalRefund: 4250,
            stateRefund: 1350,
            balanceDue: 0,
            stateBalanceDue: 0,
            paidAmount: 227,
            status: "DOC_PREP",
          },
          callLog: {
            agentId: arjunId,
            disposition: "CONNECTED",
            callSummary: "Taxpayer provided Form W-2 and confirmed married filing jointly with 1 dependent.",
          },
        },
      ],
    },
    {
      firstName: "Deepika",
      lastName: "Choudhury",
      email: "deepika@taxcrm.com",
      mobile: "9876543216",
      ssnTin: "9321",
      dob: "1993-08-25",
      occupation: "Principal Data Scientist",
      visaType: "L1",
      maritalStatus: "SINGLE",
      addressLine1: "1200 West Lake Ave Apt 4B",
      city: "Seattle",
      state: "WA",
      zipCode: "98109",
      isConvertedCustomer: true,
      applications: [
        {
          taxYear: 2025,
          filingType: "INDIVIDUAL",
          currentStage: ApplicationStage.DOC_PREP,
          assignedDocAgentId: arjunId,
          assignedPrepAgentId: ananyaId,
          assignedReviewAgentId: vikramId,
          assignedSalesAgentId: kabirId,
          assignedFileOpId: siddharthId,
          taxDraftSummary: {
            w2Income: 148000,
            wages: 148000,
            federalWithholding: 22800,
            stateWithholding: 0,
            federalRefund: 3820,
            stateRefund: 0,
            balanceDue: 0,
            stateBalanceDue: 0,
            paidAmount: 227,
            status: "PREP_IN_PROGRESS",
          },
          callLog: {
            agentId: arjunId,
            disposition: "INTERESTED",
            callSummary: "Intake completed. Single filer with stock ESPP sales and W-2.",
          },
        },
      ],
    },
    {
      firstName: "Manish",
      lastName: "Bhatt",
      email: "manish@taxcrm.com",
      mobile: "9876543217",
      ssnTin: "1205",
      dob: "1982-11-03",
      occupation: "Director of Product",
      visaType: "GREEN_CARD",
      maritalStatus: "MARRIED_JOINT",
      addressLine1: "350 5th Ave",
      city: "New York",
      state: "NY",
      zipCode: "10118",
      isConvertedCustomer: true,
      applications: [
        {
          taxYear: 2025,
          filingType: "MARRIED_JOINT",
          currentStage: ApplicationStage.FILING_QUEUE,
          assignedDocAgentId: arjunId,
          assignedPrepAgentId: ananyaId,
          assignedReviewAgentId: vikramId,
          assignedSalesAgentId: kabirId,
          assignedFileOpId: siddharthId,
          taxDraftSummary: {
            w2Income: 195000,
            wages: 195000,
            federalWithholding: 34200,
            stateWithholding: 13800,
            federalRefund: 5800,
            stateRefund: 2100,
            balanceDue: 0,
            stateBalanceDue: 0,
            paidAmount: 227,
            paymentStatus: "PAID",
            esignStatus: "SIGNED",
            esignCompletedAt: new Date().toISOString(),
            status: "FILING_READY",
          },
          callLog: {
            agentId: arjunId,
            disposition: "CALL_COMPLETED",
            callSummary: "Client verified 8879 signature and paid filing service invoice.",
          },
        },
      ],
    },
    {
      firstName: "Ravi",
      lastName: "Teja",
      email: "ravi@taxcrm.com",
      mobile: "9876543218",
      ssnTin: "7721",
      dob: "1990-06-18",
      occupation: "DevOps Engineer",
      visaType: "H1B",
      maritalStatus: "SINGLE",
      addressLine1: "100 North Austin Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      isConvertedCustomer: true,
      applications: [
        {
          taxYear: 2025,
          filingType: "INDIVIDUAL",
          currentStage: ApplicationStage.DOC_OUTREACH,
          assignedDocAgentId: arjunId,
          assignedPrepAgentId: ananyaId,
          assignedReviewAgentId: vikramId,
          assignedSalesAgentId: kabirId,
          assignedFileOpId: siddharthId,
          taxDraftSummary: {
            w2Income: 125000,
            wages: 125000,
            federalWithholding: 19000,
            federalRefund: 2900,
            status: "DOC_OUTREACH",
          },
          callLog: {
            agentId: arjunId,
            disposition: "CALLBACK_REQUESTED",
            callSummary: "Left message. Callback scheduled for tomorrow morning.",
          },
        },
      ],
    },
    {
      firstName: "Anjali",
      lastName: "Menon",
      email: "anjali@taxcrm.com",
      mobile: "9876543219",
      ssnTin: "3312",
      dob: "1991-02-14",
      occupation: "UX Designer",
      visaType: "F1_OPT",
      maritalStatus: "SINGLE",
      addressLine1: "500 Michigan Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60611",
      isConvertedCustomer: true,
      applications: [
        {
          taxYear: 2025,
          filingType: "INDIVIDUAL",
          currentStage: ApplicationStage.FILING_SUCCESS,
          assignedDocAgentId: arjunId,
          assignedPrepAgentId: ananyaId,
          assignedReviewAgentId: vikramId,
          assignedSalesAgentId: kabirId,
          assignedFileOpId: siddharthId,
          taxDraftSummary: {
            w2Income: 110000,
            wages: 110000,
            federalWithholding: 16500,
            stateWithholding: 4800,
            federalRefund: 3100,
            stateRefund: 850,
            balanceDue: 0,
            stateBalanceDue: 0,
            paidAmount: 227,
            paymentStatus: "PAID",
            esignStatus: "SIGNED",
            status: "ACCEPTED",
            transmissionInfo: {
              status: "ACCEPTED",
              irsAckCode: "0000_ACCEPTED",
              irsMessage: "Electronic return accepted by IRS Modernized e-File Gateway.",
              acceptedAt: new Date().toISOString(),
            },
          },
          callLog: {
            agentId: arjunId,
            disposition: "FILING_CONFIRMED",
            callSummary: "IRS acknowledgment received and shared with client.",
          },
        },
      ],
    },
  ];

  for (const c of clients) {
    const user = await prisma.user.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        mobile: c.mobile,
        role: Role.TAXPAYER_USER,
        isActive: true,
      },
    });

    const profile = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.mobile,
        ssnTin: c.ssnTin,
        dob: c.dob,
        occupation: c.occupation,
        visaType: c.visaType,
        maritalStatus: c.maritalStatus,
        addressLine1: c.addressLine1,
        city: c.city,
        state: c.state,
        zipCode: c.zipCode,
        isConvertedCustomer: c.isConvertedCustomer,
      },
    });

    for (const appData of c.applications) {
      const app = await prisma.taxApplication.create({
        data: {
          customerId: profile.id,
          taxYear: appData.taxYear,
          filingType: appData.filingType,
          currentStage: appData.currentStage,
          assignedDocAgentId: appData.assignedDocAgentId,
          assignedPrepAgentId: appData.assignedPrepAgentId,
          assignedReviewAgentId: appData.assignedReviewAgentId,
          assignedSalesAgentId: appData.assignedSalesAgentId,
          assignedFileOpId: appData.assignedFileOpId,
          taxDraftSummary: appData.taxDraftSummary,
        },
      });

      // Sample verified tax documents
      await prisma.taxDocument.createMany({
        data: [
          {
            applicationId: app.id,
            uploadedByUserId: user.id,
            fileName: `W2_${c.lastName}_2025.pdf`,
            filePath: "/uploads/w2_sample.pdf",
            documentCategory: "W2",
            verificationStatus: "VERIFIED",
          },
          {
            applicationId: app.id,
            uploadedByUserId: user.id,
            fileName: `Passport_Copy_${c.lastName}.pdf`,
            filePath: "/uploads/passport_sample.pdf",
            documentCategory: "IDENTITY",
            verificationStatus: "VERIFIED",
          },
        ],
      });

      // Call log
      if (appData.callLog) {
        await prisma.callLog.create({
          data: {
            applicationId: app.id,
            agentId: appData.callLog.agentId,
            disposition: appData.callLog.disposition,
            callSummary: appData.callLog.callSummary,
          },
        });
      }

      // Sales quote
      await prisma.salesQuote.create({
        data: {
          applicationId: app.id,
          salesAgentId: kabirId,
          quoteAmount: 227.0,
          discountAmount: 0.0,
          status: "ACCEPTED",
          userFeedback: "Standard tax filing service selected.",
        },
      });

      console.log(`+ Seeded Lead: [${app.currentStage}] ${c.firstName} ${c.lastName} -> App ID: ${app.id}`);
    }
  }

  // 5. Seed Email Templates configured for specific roles
  console.log("Seeding configured role-based email templates...");
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });

  const templatesToSeed = [
    {
      name: "Document Request & Intake Checklist",
      roles: [Role.DOC_AGENT, Role.DOC_TEAM_LEAD, Role.DOC_MANAGER, Role.ADMIN],
      subject: "Action Required: Tax Year 2025 Documents Needed for Filing",
      body: `<p>Dear {{taxpayer_name}},</p><p>Thank you for choosing TaxCRM for your upcoming tax filing season. To ensure we calculate the maximum refund and prepare your tax draft accurately, please review and upload the following required documentation to your secure portal:</p><ul><li>Form W-2 from all employers for TY2025</li><li>1099-INT / 1099-DIV statements from your financial institutions</li><li>Form 1098 (Mortgage Interest Statement), if applicable</li><li>Valid government-issued Photo ID or Passport copy</li></ul><p>Please log in to your portal and upload these documents at your earliest convenience. If you have any questions, feel free to reply to this email or call our document intake desk directly.</p><p>Warm regards,<br/><strong>Tax Operations Team</strong><br/>TaxCRM Engine</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
    {
      name: "Missing W-2 / 1099 Follow Up",
      roles: [Role.DOC_AGENT, Role.DOC_TEAM_LEAD, Role.DOC_MANAGER, Role.ADMIN],
      subject: "Follow Up: Missing Income Documents for Tax Draft",
      body: `<p>Hello {{taxpayer_name}},</p><p>Our documentation team noticed that we are still awaiting your Form W-2 / 1099 statements to finalize your initial document intake. We cannot proceed with drafting your Form 1040 until these files are verified.</p><p>Please upload the missing documents today so we can keep your filing on track without IRS deadline delays.</p><p>Best regards,<br/><strong>Document Verification Specialist</strong><br/>TaxCRM</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
    {
      name: "Tax Draft Ready for Taxpayer Review",
      roles: [Role.TAX_PREPARER, Role.TAX_REVIEWER, Role.PREP_MANAGER, Role.ADMIN],
      subject: "Your TY2025 Form 1040 Draft is Ready for Review",
      body: `<p>Dear {{taxpayer_name}},</p><p>Great news! Your 2025 federal and state tax calculations have been drafted and audited by our tax specialists. We have optimized your deductions and finalized your provisional figures.</p><p><strong>Summary of Your Draft:</strong></p><ul><li>Filing Status: Verified</li><li>Federal Refund / Balance Due: Calculated &amp; Optimized</li><li>State Return: Formulated</li></ul><p>Please review your Tax Draft Worksheet in the portal. Once reviewed, confirm your approval so we can route your return for final four-eyes QA sign-off.</p><p>Sincerely,<br/><strong>Tax Preparer Team</strong><br/>TaxCRM Specialists</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
    {
      name: "Tax Computation & Deductions Clarification",
      roles: [Role.TAX_PREPARER, Role.TAX_REVIEWER, Role.PREP_MANAGER, Role.ADMIN],
      subject: "Clarification Needed Regarding Deductions on Form 1040",
      body: `<p>Dear {{taxpayer_name}},</p><p>While preparing your Form 1040 schedule, we noticed an item that requires your clarification regarding your eligible deductions/credits for Tax Year 2025.</p><p>Could you please provide additional details or supporting receipts for the queried item? You can reply directly to this email or update your notes in the portal.</p><p>Best regards,<br/><strong>Tax Preparer Specialist</strong><br/>TaxCRM</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
    {
      name: "IRS Form 8879 E-Signature & PIN Authorization",
      roles: [Role.FILE_OP_AGENT, Role.FILE_OP_TEAM_LEAD, Role.FILE_OP_MANAGER, Role.ADMIN],
      subject: "Action Required: Sign Form 8879 (IRS e-File Signature Authorization)",
      body: `<p>Dear {{taxpayer_name}},</p><p>Your tax return has successfully passed QA Compliance review and is ready for electronic transmission to the IRS Modernized e-File (MeF) Gateway.</p><p>Before we can transmit your return, federal law requires your signed authorization on <strong>IRS Form 8879</strong>.</p><p>Please log in to your portal to digitally sign Form 8879 and verify your 5-digit self-selected PIN. As soon as your signature is recorded, our CPA team will transmit your return directly to the IRS.</p><p>Best regards,<br/><strong>Filing Operations &amp; ERO Desk</strong><br/>TaxCRM</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
    {
      name: "IRS Transmission Accepted Confirmation",
      roles: [Role.FILE_OP_AGENT, Role.FILE_OP_TEAM_LEAD, Role.FILE_OP_MANAGER, Role.ADMIN],
      subject: "Confirmed: Your 2025 Tax Return Has Been Accepted by the IRS!",
      body: `<p>Dear {{taxpayer_name}},</p><p>We are delighted to inform you that your Tax Year 2025 return has been successfully transmitted and officially <strong>ACCEPTED</strong> by the IRS Modernized e-File (MeF) Gateway!</p><p><strong>Transmission Details:</strong></p><ul><li>Status: ACCEPTED (0000_ACCEPTED)</li><li>Submission Gateway: IRS MeF Direct Transmission</li><li>Official e-File Acknowledgment: Generated</li></ul><p>A copy of your certified transmission receipt and finalized Form 1040 is available for download in your portal vault.</p><p>Thank you for filing with us this tax season!</p><p>Warm regards,<br/><strong>Electronic Return Originator (ERO)</strong><br/>TaxCRM Transmission Operations</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
  ];

  for (const t of templatesToSeed) {
    await prisma.emailTemplate.create({ data: t });
    console.log(`+ Seeded Template: "${t.name}" (Roles: ${t.roles.join(", ")})`);
  }

  console.log("\n--- Real Database Seed Finished Successfully! ---");
}

main()
  .catch((e) => {
    console.error("Error seeding real data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
