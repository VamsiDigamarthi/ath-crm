# ATH-CRM: End-to-End Business Flow & Operations Guide (Step-by-Step)

---

## 1. Platform Overview & Business Objective

**ATH-CRM** is an enterprise-grade US Tax Filing and Customer Relationship Management (CRM) platform designed specifically for cross-border tax consultancies. It primarily serves international students, scholars, and foreign professionals working in the United States (e.g., holders of **F-1, OPT, H-1B, L-1, J-1** visas and US resident filers).

### The Primary Business Objective:
To take a prospective taxpayer from a **raw, uncontacted lead**, guide them through **document intake**, compute their **maximum legal tax refund (Form 1040)**, pitch and **collect our tax preparation service fee**, secure their **IRS Form 8879 authorization**, and successfully **e-file their return to the IRS**—ultimately converting them into a **permanent, recurring yearly customer**.

---

## 2. The 5 Operational Departments & User Roles

Every customer passes through 4 operational departments in strict sequence, governed by an Administrative management layer:

```
[ Lead Acquisition ]
        │
        ▼
1. DOCUMENTER DEPT      ──▶ Client Intake, Phone Outreach & 9-Module Organizer
        │
        ▼
2. TAX PREP & REVIEW    ──▶ Form 1040 Computation, Deductions & Senior QA Sign-Off
        │
        ▼
3. SALES DEPT           ──▶ Fee Pricing, Phone Closing, Payment & IRS 8879 E-Sign
        │
        ▼
4. FILING OPERATIONS    ──▶ IRS Modernized e-File (MeF) Transmission & Acceptance
        │
        ▼
[ Converted Customer ]  ──▶ Lifetime Retained Client for Future Tax Years
```

### 👥 Department Roles Breakdown:
1. **Documenter Department (`DOC_MANAGER`, `DOC_TEAM_LEAD`, `DOC_AGENT`)**:
   - Responsible for calling prospective clients, obtaining consent, onboarding them to the portal, and gathering all tax documents.
2. **Tax Prep & Review Department (`PREP_MANAGER`, `TAX_PREPARER`, `TAX_REVIEWER`)**:
   - Certified tax preparers and senior CPAs who draft the Form 1040, calculate itemized/standard deductions, run substantial presence tests, and perform 4-eyes quality audits.
3. **Sales Department (`SALES_MANAGER`, `SALES_TEAM_LEAD`, `SALES_AGENT`)**:
   - The "closers". Once the tax draft and refund amount are finalized, they pitch our service fee, collect payment via Stripe/card, and secure the legally mandated IRS Form 8879 e-signature.
4. **Filing Operations Department (`FILE_OP_MANAGER`, `FILE_OP_TEAM_LEAD`, `FILE_OP_AGENT`)**:
   - Licensed CPAs and file operators who validate attachments, package returns into XML, transmit to IRS MeF, and log official IRS Acceptance confirmations.
5. **Super Administration (`ADMIN`)**:
   - Full platform oversight, employee hiring/management, CSV bulk lead imports, master logs, and global analytics.
6. **Client Portal (`TAXPAYER_USER`)**:
   - The end-client view: uploads documents, fills the 9-module organizer, tracks live progress, reviews fee quotes, and downloads finalized returns.

---

## 3. Step-by-Step Business Workflow

---

### Step 1: Lead Ingestion & Distribution (`RAW_PROSPECT`)

```
[ Admin / Marketing ] ──▶ Bulk CSV / Excel Import ──▶ Deduplication ──▶ Stage: RAW_PROSPECT
```

1. **How Leads Enter**:
   - Leads are acquired via university partnerships, webinars, corporate immigration desks, or bulk lists.
   - Admin imports leads via **Bulk Lead Import** (`/admin/prospects`) with columns: First Name, Last Name, Email, Phone, Visa Type, State, Tax Year, and Priority (`Urgent`, `Important`, `High`, `Medium`, `Low`).
2. **Deduplication Engine**:
   - The system checks `ssnTin` and `email` against the database.
   - If the taxpayer already exists, their profile is reused and a new `TaxApplication` for the current tax year (e.g., 2025) is created.
3. **Lead Allocation**:
   - Sales/Documenter Managers use **1-Click Auto Round-Robin** or manual assignment to distribute incoming leads evenly across active Documenter agents.

---

### Step 2: Documenter Calling & Outreach (`DOC_OUTREACH`)

```
[ Documenter Queue ] ──▶ Call Taxpayer ──▶ Agrees to File? ──┬─▶ YES: Create Portal Account & Move to DOC_PREP
                                                             └─▶ NO: Mark DROPPED_CANCELLED
```

1. **Agent Call Screen (`/documenter/agent/queue`)**:
   - Documenter agent opens their assigned calling queue.
   - Clicks the **Call Button** to initiate contact with the lead.
2. **Call Logging**:
   - Agent logs the call outcome: `CONNECTED`, `BUSY`, `CALLBACK_SCHEDULED`, or `WRONG_NUMBER`.
3. **Onboarding the Client**:
   - If the client agrees to file their US taxes with us:
     - The system auto-generates a secure `TAXPAYER_USER` portal account.
     - Sends a welcome email with a one-time login OTP.
     - Application stage automatically advances to **`DOC_PREP`**.

---

### Step 3: Document Intake & 9-Module Tax Organizer (`DOC_PREP`)

```
[ Client / Agent Portal ] ──▶ Fill 9 Modules + Upload W-2s/1099s ──▶ Document Verification
```

Either the client (via Client Portal) or the Documenter Agent (on the phone via `/documenter/agent/lead/:id`) completes the **9-Module Tax Organizer**:

| Module # | Module Name | Business Purpose & Key Data Collected |
| :--- | :--- | :--- |
| **01** | **Personal Info** | Full Name, SSN / ITIN, DOB, Visa Type (F-1/H-1B), Current US Physical Address. |
| **02** | **Spouse & Dependents** | Marital status, spouse details (ITIN/SSN), child tax credit qualifications. |
| **03** | **Substantial Presence** | Days physically present in the US over the last 3 years to determine **Non-Resident Alien (1040-NR)** vs **Resident Alien (1040)** status. |
| **04** | **W-2 Wages & Schedule E** | Primary employer name, Box 1 gross wages, federal/state tax withheld.<br/>**Schedule E Rental Properties**: Property type, address, months rented, **Property Purchase Date**, **Property Rented Date**, cost basis, rental income, and expenses. |
| **05** | **1099-INT / DIV / OID** | Bank interest (Chase, BoA, etc.), dividend distributions, and tax withholdings. |
| **06** | **1099-B Stocks & Crypto** | Capital gains/losses from Robinhood, Fidelity, E*TRADE, ESPP/RSU sales. |
| **07** | **Foreign Assets & FBAR** | Peak balances in Indian / foreign bank accounts exceeding $10,000 (FinCEN Form 114 / FATCA 8938 compliance). |
| **08** | **Deductions & HSA** | Form 1098 mortgage interest, HSA contributions, student loan interest, charitable donations. |
| **09** | **Direct Deposit** | Bank Name, Routing Number, and Checking Account Number for IRS direct refund deposit. |

#### Document Vault & Verification:
- Taxpayer uploads PDFs/images of W-2, 1099, Passport, and Visa.
- Supports external **Google Drive / Dropbox links** for large bundles.
- Documenter reviews and marks each document as **`VERIFIED`** or **`REJECTED`**.

---

### Step 4: Tax Calculation & Dual-Review QA (`DOC_PREP` ──▶ `QA_IN_REVIEW` ──▶ `QA_APPROVED`)

```
[ Tax Preparer ] ──▶ Computes Form 1040 ──▶ [ Senior QA Reviewer ] ──▶ Signs Off ──▶ SALES_PITCH_QUEUE
```

1. **Tax Preparation**:
   - Assigned Tax Preparer opens the case in the Tax Prep Workspace.
   - Synthesizes all 9 modules and verified tax documents into a Form 1040 draft:
     - Gross Income: $105,000
     - Standard Deduction: $15,000
     - Taxable Income: $90,000
     - Federal Tax Liability: $14,500
     - Federal Taxes Already Withheld: $18,500
     - **Estimated Federal Refund: +$4,000**
     - **Estimated State Refund: +$500**
     - **Combined Refund: +$4,500**
2. **Senior Reviewer QA Audit**:
   - A Senior Tax Reviewer inspects the return using a 4-eyes compliance checklist:
     - Verified SSN/ITIN validity.
     - Confirmed W-2 Box 1 and Box 2 withholdings match official scans.
     - Certified Schedule E rental depreciation and expenses.
3. **Sign-Off to Sales**:
   - Reviewer signs off on return accuracy.
   - System transitions stage to **`SALES_PITCH_QUEUE`** and notifies the Sales Department.

---

### Step 5: Sales Department Closing (`SALES_PITCH_QUEUE` ──▶ `SALES_PITCHING`)

```
[ Sales Closer ] ──▶ Pitches Service Fee & Refund ──▶ Collects Payment ──▶ Obtains Form 8879 E-Sign
```

This is the core commercial step of the firm:

1. **Lead Allocation**:
   - Sales Manager distributes incoming leads to Sales Closers via `/sales/manager/queue`.
2. **Reviewing the Value Proposition**:
   - Closer opens `/sales/agent/pitch/:id`.
   - Sees the taxpayer's certified refund: **+$4,500**. This gives maximum leverage to pitch our fee.
3. **Pricing & Fee Quotation Engine**:
   - System calculates the firm's preparation fee based on filing complexity:
     - *Base Individual Form 1040*: $150
     - *Schedule E Rental Property*: $75
     - *State Tax Return (TX/CA)*: $50
     - *Total Standard Fee*: $275
   - Closer applies promotional discount (-$25) &rarr; **Final Fee: $250**.
4. **Client Call & Pitch**:
   - Closer calls the client using integrated talking points:
     - *"Great news, Ravi! We completed your Form 1040 audit and secured you a $4,500 combined refund."*
     - *"Our total filing fee is $250. Let's process that now so we can submit your return to the IRS today."*
5. **Fee Payment Collection**:
   - Closer processes payment through Stripe (Card), PayPal, or Wire Transfer.
   - Payment status updates to **`PAID`**.
6. **IRS Form 8879 E-Signature & PIN Authorization**:
   - Under US IRS regulations, a tax preparer **cannot e-file** without a signed **IRS Form 8879** and a **5-digit Self-Select PIN**.
   - Closer collects the client's signature and PIN.
   - E-Sign status updates to **`SIGNED`**.
7. **Dispatching to Filing**:
   - With both **`PAID`** and **`SIGNED`** satisfied, the closer clicks:
     **"Dispatch to IRS E-Filing Queue 🚀"**
   - Application stage updates to **`FILING_QUEUE`**.

> **Note on Client Revisions (Send-Back)**:
> If during the pitch the client notices an error (e.g., *"Wait, you missed my medical expenses"*), the sales closer clicks **"Send Back to Department"**, returning the case to Documenter or Preparer with clear revision notes.

---

### Step 6: Filing Operations & IRS Transmission (`FILING_QUEUE` ──▶ `FILING_IN_PROGRESS`)

```
[ Filing Specialist / CPA ] ──▶ Validates 8879 & XML ──▶ Transmits to IRS MeF ──▶ Awaits Acceptance
```

1. **Queue Pickup (`/filing/specialist/queue`)**:
   - Filing Specialist / CPA selects the case from the Filing Queue.
2. **Pre-Transmission Audit**:
   - Confirms that Form 8879 is signed and matches the Form 1040 figures exactly.
   - Checks that taxpayer PIN and IP address are recorded.
3. **IRS Transmission**:
   - Specialist transmits the electronic return to the IRS Modernized e-File (MeF) system and State Department of Revenue.
   - Stage moves to **`FILING_IN_PROGRESS`**.

---

### Step 7: Acceptance & Lifetime Customer Conversion (`FILING_SUCCESS`)

```
[ IRS MeF Gateway ] ──┬─▶ ACCEPTED: Stage FILING_SUCCESS ──▶ isConvertedCustomer = TRUE!
                      └─▶ REJECTED: Stage FILING_FAILED  ──▶ Error Report & Fix
```

1. **IRS Acceptance (`FILING_SUCCESS`)**:
   - When the IRS accepts the return, an electronic acknowledgment (ACK) is received.
   - The stage updates to **`FILING_SUCCESS`**.
   - **Customer Profile is marked `isConvertedCustomer = TRUE`**.
   - Client receives a congratulatory email with their official IRS Acceptance Notice and copy of their filed Form 1040.
2. **IRS Rejection Handling (`FILING_FAILED`)**:
   - If the IRS rejects the return (e.g., prior year AGI mismatch or dependent already claimed):
     - Stage updates to **`FILING_FAILED`**.
     - An error log with IRS Reject Codes is generated.
     - Routed back to the assigned CPA to correct and retransmit.

---

## 4. The Golden Platform Rule: Non-Disappearing Records

> ### 🚨 The Universal Visibility Standard
> **Leads NEVER disappear from previous departments or staff dashboards.**
> 
> - When a lead moves from **Documenter** &rarr; **Tax Prep** &rarr; **Sales** &rarr; **Filing**:
>   - The Documenter agent can still view it under their *"Completed / Sent to Sales"* tab.
>   - The Tax Preparer can still inspect the return under *"Passed QA / Dispatched"*.
>   - The Sales Closer can track their closed deal under *"Paid & Dispatched to Filing"*.
> - All departments maintain a **unified, live timestamped audit trail** showing who took what action, when, and in which department.

---

## 5. Summary Cheat Sheet: Stages & Owners

| Stage Code | Stage Label in UI | Primary Owner | Goal to Exit Stage |
| :--- | :--- | :--- | :--- |
| **`RAW_PROSPECT`** | Raw Prospect | Admin / Lead Ingestion | Assigned to Documenter Agent. |
| **`DOC_OUTREACH`** | Outreach Prospect | Documenter Agent | Phone contact made; client consents to file. |
| **`DOC_PREP`** | Tax Prep Lead | Documenter / Client | 9-module organizer filled & tax docs verified. |
| **`SALES_PITCH_QUEUE`** | Qualified Sales Lead | Sales Manager | Lead assigned to Sales Closer. |
| **`SALES_PITCHING`** | Active Pitch Lead | Sales Closer | Service fee quoted to client. |
| **`CORRECTION_NEEDED`** | Revision Lead | Documenter / Preparer | Requested correction resolved and returned. |
| **`FILING_QUEUE`** | Ready for IRS Filing | File Operator / CPA | Verified by CPA; queued for transmission. |
| **`FILING_IN_PROGRESS`** | Transmitting to IRS | File Operator / CPA | Sent to IRS MeF servers; waiting for ACK. |
| **`FILING_FAILED`** | IRS Rejected | File Operator / Sales | Error resolved and re-submitted. |
| **`FILING_SUCCESS`** | **Converted Customer** | Completed (All) | **IRS Accepted! Customer retained for future years.** |
| **`DROPPED_CANCELLED`**| Dropped Lead | Admin / Audit | Client uninterested or filed elsewhere. |
