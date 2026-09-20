import "dotenv/config";
import { prisma } from "../config/db.js";
import { Role, ApplicationStage, NotificationCategory, NotificationPriority, AuditActorType, AuditActionType } from "@prisma/client";

async function main() {
  console.log("--- Starting Clean & Seed for Johnny Sins & Staff ---");

  // 1. Unlink references and clear previous test applications
  console.log("Cleaning old test applications, quotes, call logs, and documents...");
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

  // 4. Create Single Target Client: Johnny Sins
  console.log("Creating Client: Johnny Sins with all formalities completed up to QA Approval...");

  const user = await prisma.user.create({
    data: {
      firstName: "Johnny",
      lastName: "Sins",
      email: "johnnysins@taxcrm.com",
      mobile: "9876543299",
      role: Role.TAXPAYER_USER,
      isActive: true,
    },
  });

  const profile = await prisma.customerProfile.create({
    data: {
      userId: user.id,
      firstName: "Johnny",
      lastName: "Sins",
      email: "johnnysins@taxcrm.com",
      phone: "+1 (702) 555-6969",
      ssnTin: "6969",
      dob: "1978-12-31",
      occupation: "Senior Astronaut & Physician",
      visaType: "US_CITIZEN",
      maritalStatus: "Single",
      addressLine1: "100 Hustle Boulevard",
      city: "Las Vegas",
      state: "NV",
      zipCode: "89109",
      isConvertedCustomer: true,
    },
  });

  // Comprehensive taxDraftSummary with 9 modules, Form 1040 figures, and QA Approval
  const taxDraftSummary = {
    w2Income: 185000,
    wages: 185000,
    interestIncome: 2400,
    dividendIncome: 1800,
    totalGrossIncome: 189200,
    agi: 189200,
    standardDeduction: 15000,
    taxableIncome: 174200,
    federalTax: 24250,
    federalWithholding: 29500,
    federalRefund: 5250,
    balanceDue: 0,
    stateWithholding: 4800,
    stateTax: 3600,
    stateRefund: 1200,
    stateBalanceDue: 0,
    totalRefund: 6450,
    status: "QA_APPROVED",
    qaApprovedAt: new Date().toISOString(),
    qaApprovedByUserId: vikramId,
    qaRemarks: "All Form 1040 calculations, W-2 wages, and interest 1099 statements 100% verified against uploaded source documents. Return is compliant, optimized, and ready for fee pitch by Sales Agent Kabir Das.",
    drakeTaxSummary: {
      calcSource: "Drake Tax Software 2025 v24.1",
      form1040Line1: 185000,
      form1040Line11_AGI: 189200,
      form1040Line24_TotalTax: 24250,
      form1040Line25d_Withholding: 29500,
      form1040Line34_Overpayment: 5250,
      stateCode: "CA",
      stateOverpayment: 1200,
    },
    organizer: {
      submittedModules: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"],
      m1_demographics: {
        firstName: "Johnny",
        lastName: "Sins",
        fullName: "Johnny Sins",
        ssnMasked: "•••-••-6969",
        dob: "12/31/1978",
        occupation: "Senior Astronaut & Physician",
        phone: "+1 (702) 555-6969",
        email: "johnnysins@taxcrm.com",
        visaType: "US_CITIZEN",
        visaStatusChanged2025: "NO",
        previousVisaType: "",
        newVisaType: "",
        visaChangeDate: "",
        visaStatusChangeReason: "",
        maritalStatus: "Single",
        residentialAddress: "100 Hustle Boulevard",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89109",
        firstPortOfEntryDate: "01/01/1978",
        stayMoreThan6Months2026: "YES",
        monthsStayedInUs2025: 12,
      },
      m2_dependents: { hasDependents: false, childCount: 0, hasSpouse: false },
      m3_presence: { days2025: 365, days2024: 366, days2023: 365, visaType: "US_CITIZEN" },
      m4_wages: {
        hasW2: true,
        employerName: "Sins Global Enterprises LLC",
        estimatedWages: 185000,
        federalTaxWithheld: 29500,
        w2List: [
          {
            employerName: "Sins Global Enterprises LLC",
            ein: "88-9912345",
            box1Wages: 185000,
            box2FederalTax: 29500,
            state: "CA",
            stateTaxWithheld: 4800,
          },
        ],
      },
      m5_interest: {
        hasInterestDividends: true,
        bankName: "Chase Private Client",
        interestAmount: 2400,
        dividendAmount: 1800,
      },
      m6_stocks: { tradedStocks: false, totalCapitalGain: 0 },
      m7_foreign: { hasFbar: false },
      m8_deductions: { hsaContribution: 4150, charitableDonations: 2500 },
      m9_directDeposit: {
        bankName: "Chase Bank N.A.",
        accountType: "CHECKING",
        routingNumber: "122000496",
        accountNumber: "987654321098",
        accountOwnerName: "Johnny Sins",
        notesToPreparer: "Please optimize federal refund and ensure direct deposit to Chase checking account.",
      },
    },
  };

  const app = await prisma.taxApplication.create({
    data: {
      customerId: profile.id,
      taxYear: 2025,
      filingType: "INDIVIDUAL",
      currentStage: ApplicationStage.SALES_PITCH_QUEUE,
      assignedDocAgentId: arjunId,
      assignedPrepAgentId: ananyaId,
      assignedReviewAgentId: vikramId,
      assignedSalesAgentId: kabirId,
      assignedFileOpId: siddharthId,
      taxDraftSummary,
    },
  });

  // Sample verified tax documents
  await prisma.taxDocument.createMany({
    data: [
      {
        applicationId: app.id,
        uploadedByUserId: user.id,
        fileName: "Form_W2_Johnny_Sins_2025.pdf",
        filePath: "/uploads/w2_johnny_sins.pdf",
        documentCategory: "W2_WAGES",
        verificationStatus: "VERIFIED",
      },
      {
        applicationId: app.id,
        uploadedByUserId: user.id,
        fileName: "Passport_Copy_Johnny_Sins.pdf",
        filePath: "/uploads/passport_johnny_sins.pdf",
        documentCategory: "PASSPORT_VISA",
        verificationStatus: "VERIFIED",
      },
      {
        applicationId: app.id,
        uploadedByUserId: user.id,
        fileName: "1099_DIV_Chase_Johnny_Sins.pdf",
        filePath: "/uploads/1099_chase_johnny_sins.pdf",
        documentCategory: "FORM_1099",
        verificationStatus: "VERIFIED",
      },
    ],
  });

  // Stage History Records showing progression through Documenter -> Preparer -> QA Review -> Sales Queue
  await prisma.stageHistory.createMany({
    data: [
      {
        applicationId: app.id,
        fromStage: ApplicationStage.DOC_OUTREACH,
        toStage: ApplicationStage.DOC_PREP,
        movedByUserId: arjunId,
        remarks: "Document intake completed and verified by Document Agent Arjun Varma.",
        createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
      {
        applicationId: app.id,
        fromStage: ApplicationStage.DOC_PREP,
        toStage: ApplicationStage.DOC_PREP,
        movedByUserId: ananyaId,
        remarks: "Form 1040 calculation completed with $5,250 Federal Refund + $1,200 State Refund by Tax Preparer Ananya Iyer. Submitted to QA.",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        applicationId: app.id,
        fromStage: ApplicationStage.DOC_PREP,
        toStage: ApplicationStage.SALES_PITCH_QUEUE,
        movedByUserId: vikramId,
        remarks: "QA Compliance 4-Eyes audit approved by Senior Reviewer Vikram Malhotra. Transferred to Sales Pitch Queue for Kabir Das.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  });

  // In-App Notification for Kabir Das
  await prisma.notification.create({
    data: {
      recipientUserId: kabirId,
      applicationId: app.id,
      category: NotificationCategory.SALES,
      priority: NotificationPriority.HIGH,
      title: "New QA-Approved Lead: Johnny Sins",
      message: "Johnny Sins return (TY 2025, +$6,450 Total Refund) is QA Approved & ready for Fee Quotation & Pitch.",
      actionUrl: `/sales/pitch/${app.id}`,
      actionLabel: "Start Sales Pitch",
      relatedLeadName: "Johnny Sins",
    },
  });

  // 5. Seed Email Templates configured for specific roles
  console.log("Seeding configured role-based email templates...");
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });

  const templatesToSeed = [
    {
      name: "Document Request & Intake Checklist",
      roles: [Role.DOC_AGENT, Role.DOC_TEAM_LEAD, Role.DOC_MANAGER, Role.ADMIN],
      subject: "Action Required: Tax Year 2025 Documents Needed for Filing",
      body: `<p>Dear {{taxpayer_name}},</p><p>Thank you for choosing TaxCRM for your upcoming tax filing season. To ensure we calculate the maximum refund and prepare your tax draft accurately, please review and upload the following required documentation to your secure portal:</p><ul><li>Form W-2 from all employers for TY2025</li><li>1099-INT / 1099-DIV statements from your financial institutions</li><li>Form 1098 (Mortgage Interest Statement), if applicable</li><li>Valid government-issued Photo ID or Passport copy</li></ul><p>Please log in to your portal and upload these documents at your earliest convenience.</p><p>Warm regards,<br/><strong>Tax Operations Team</strong><br/>TaxCRM Engine</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
    {
      name: "Tax Draft Ready for Taxpayer Review",
      roles: [Role.TAX_PREPARER, Role.TAX_REVIEWER, Role.PREP_MANAGER, Role.ADMIN],
      subject: "Your TY2025 Form 1040 Draft is Ready for Review",
      body: `<p>Dear {{taxpayer_name}},</p><p>Great news! Your 2025 federal and state tax calculations have been drafted and audited by our tax specialists. We have optimized your deductions and finalized your provisional figures.</p><p>Please review your Tax Draft Worksheet in the portal.</p><p>Sincerely,<br/><strong>Tax Preparer Team</strong><br/>TaxCRM Specialists</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
    {
      name: "Sales Fee Quote & Filing Agreement",
      roles: [Role.SALES_AGENT, Role.SALES_TEAM_LEAD, Role.SALES_MANAGER, Role.ADMIN],
      subject: "Your TY2025 Tax Return Quote & Filing Fee Details",
      body: `<p>Dear {{taxpayer_name}},</p><p>Our CPA and enrolled agent team has finalized your TY2025 Form 1040 return draft with an estimated refund of <strong>\${{refund_amount}}</strong>.</p><p>Your customized transparent fee quote is <strong>\${{quote_amount}}</strong>. Please click below to review your filing summary and confirm your payment link.</p><p>Best regards,<br/><strong>Kabir Das</strong><br/>Senior Sales Specialist | TaxCRM</p>`,
      isActive: true,
      createdById: adminUser?.id || null,
    },
  ];

  for (const t of templatesToSeed) {
    await prisma.emailTemplate.create({ data: t });
    console.log(`+ Seeded Template: "${t.name}" (Roles: ${t.roles.join(", ")})`);
  }

  console.log("\n=======================================================");
  console.log(" SUCCESS: Clean database ready for Kabir Das!");
  console.log(`- Sales Agent: Kabir Das (kabir@taxcrm.com, OTP: 123456)`);
  console.log(`- Client: Johnny Sins (johnnysins@taxcrm.com)`);
  console.log(`- Status: QA_APPROVED in SALES_PITCH_QUEUE`);
  console.log(`- Application ID: ${app.id}`);
  console.log(`- Federal Refund: $5,250 | State Refund: $1,200 | Total: $6,450`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Error seeding real data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
