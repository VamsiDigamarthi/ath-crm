# ATH-CRM (US Tax Filing & Operations Platform) - Comprehensive System Documentation

---

## 1. Executive Summary & Technology Stack

**ATH-CRM** is an enterprise-grade US Tax Filing Customer Relationship Management (CRM) and Operations Workflow platform. It is engineered specifically for cross-border tax consultancies handling international student and professional tax returns (e.g., F-1, OPT, H-1B, L-1, J-1, and resident filers).

The platform coordinates the entire lifecycle of a tax client across multiple internal departments:
1. **Lead Acquisition & Document Intake (Documenter Department)**
2. **Tax Computation & Dual-Review QA (Tax Prep & Review Department)**
3. **Fee Estimation, Payment & e-Sign Closing (Sales Department)**
4. **IRS Modernized e-File MeF Transmission & Acceptance (Filing Department)**
5. **Self-Service Taxpayer Experience (Customer Lifetime Portal)**
6. **Executive Governance & Staff Operations (Admin Portal)**

### Technology Architecture

```
+-------------------------------------------------------------------------------+
|                                FRONTEND (SPA)                                 |
|  React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Router DOM v6  |
|  Recharts + React Hot Toast + Lucide Icons + Axios (apiClient with cookies)   |
+-------------------------------------------------------------------------------+
                                      |  RESTful JSON API (Credentials & Cookies)
                                      v
+-------------------------------------------------------------------------------+
|                                BACKEND (API)                                  |
|  Node.js (ESM) + Express 5 + TypeScript + Prisma ORM (Multi-File Schemas)     |
|  JWT Authentication + Cookie-Parser + Multer Uploads + Rate-Limiting + Helmet |
+-------------------------------------------------------------------------------+
                                      |  SQL Queries / Migrations
                                      v
+-------------------------------------------------------------------------------+
|                              DATABASE (PostgreSQL)                            |
|  User Accounts, Profiles, Tax Applications, Stage History, Document Vault,   |
|  Call Logs, Sales Quotes, Immutable Audit Trails, In-App Notifications        |
+-------------------------------------------------------------------------------+
```

- **Frontend Tech Stack**:
  - **Framework**: React 18 with TypeScript and Vite.
  - **Styling**: TailwindCSS with CSS variables and custom slate/emerald/amber color accents.
  - **Routing**: `react-router-dom` v6 browser router with nested layouts and role guards (`ProtectedRoute`, `PublicRoute`).
  - **State Management**: Zustand store (`useAuthStore` for session persistence).
  - **HTTP Client**: Axios instance configured with `withCredentials: true` and interceptors in `@/lib/api-client`.
  - **Visualizations**: `recharts` for workload distributions, funnel dropouts, and SLA tracking.

- **Backend Tech Stack**:
  - **Runtime & Language**: Node.js (ES Module standard `type: module`), TypeScript executed with `tsx`.
  - **Server Framework**: Express 5.
  - **Database ORM**: Prisma ORM v7 with `@prisma/adapter-pg` and multi-file schema architecture located in `backend/prisma/schema/`.
  - **Authentication**: Passwordless OTP login (email via `nodemailer`, mobile SMS mock, or static dev OTP `123456`) issuing HTTP-only JWT cookies.
  - **File Storage**: Local file system upload directory with sanitized MIME type validation (`backend/uploads/`).

---

## 2. Database Schema & Data Models

The Prisma multi-schema setup is divided into modular files in `backend/prisma/schema/`:

### 2.1 User & Role Management (`user.prisma`)
- **`Role` Enum**:
  - `ADMIN`: Full administrative control across all departments and configuration.
  - `DOC_MANAGER`, `DOC_TEAM_LEAD`, `DOC_AGENT`: Documenter intake and lead calling operations.
  - `PREP_MANAGER`, `TAX_REVIEWER`, `TAX_PREPARER`: Tax computation and 4-eyes audit sign-offs.
  - `SALES_MANAGER`, `SALES_TEAM_LEAD`, `SALES_AGENT`: Pitching, pricing, payment collection, and closing.
  - `FILE_OP_MANAGER`, `FILE_OP_TEAM_LEAD`, `FILE_OP_AGENT`: IRS MeF transmission and compliance.
  - `TAXPAYER_USER`: End-client portal access.
- **`User` Model**: Holds credentials, phone/email, OTP expiry, active status flag (`isActive`), and relations to all department assignments and audit logs.

### 2.2 Customer & Demographics (`customer.prisma`)
- **`CustomerProfile` Model**:
  - Personal details: `firstName`, `middleName`, `lastName`, `dob`, `ssnTin`, `occupation`, `visaType` (F-1, H-1B, etc.), `maritalStatus`.
  - Contact: `email`, `phone`, `addressLine1`, `city`, `state`, `zipCode`.
  - Flag: `isConvertedCustomer` (switches from `false` to `true` once IRS filing succeeds).
  - One-to-one link to `User` (if customer creates an account).
  - One-to-many link to `TaxApplication` (allows the same taxpayer to file multiple tax years: 2023, 2024, 2025).

### 2.3 Tax Return Application Lifecycle (`tax_application.prisma`)
- **`ApplicationStage` Enum**:
  - `RAW_PROSPECT`: Freshly imported lead, not yet contacted.
  - `DOC_OUTREACH`: In phone/email outreach by Documenter agent.
  - `DOC_PREP`: Intake completed, documents collected; passed to Tax Prep.
  - `SALES_PITCH_QUEUE`: Tax calculation reviewed and passed to Sales queue.
  - `SALES_PITCHING`: Sales closer actively on call with client.
  - `CORRECTION_NEEDED`: Flagged for corrections or revisions.
  - `FILING_QUEUE`: Paid & e-signed, waiting for IRS transmission.
  - `FILING_IN_PROGRESS`: Queued for IRS MeF batch submission.
  - `FILING_FAILED`: Rejected by IRS; requires error correction.
  - `FILING_SUCCESS`: Form 1040 certified and accepted by IRS.
  - `DROPPED_CANCELLED`: Lead abandoned, unqualified, or competitor won.

- **`TaxApplication` Model**:
  - Relational links to assigned specialists across all five functional slots:
    - `assignedDocAgentId` -> `User`
    - `assignedPrepAgentId` -> `User`
    - `assignedReviewAgentId` -> `User`
    - `assignedSalesAgentId` -> `User`
    - `assignedFileOpId` -> `User`
  - Financial payload: `taxDraftSummary` (JSON storage containing Form 1040 lines, wages, interest, deductions, federal refund/balance due, state refund/balance due, and revert history).
  - Unique Constraint: `[customerId, taxYear]` prevents duplicate returns for the same year.

- **Sub-Models**:
  - `StageHistory`: Immutable audit log tracking `fromStage`, `toStage`, `movedByUserId`, timestamp, and remarks.
  - `CallLog`: Records outbound calls, disposition (`CONNECTED_INTERESTED`, `NOT_REACHABLE`, `CALL_BACK_REQUESTED`, etc.), summary notes, and scheduled callbacks.
  - `TaxDocument`: File metadata, category (`W2`, `1099_INT`, `1098_T`, `PASSPORT`, etc.), and `verificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`).
  - `SalesQuote`: Pricing pitch tracking quote amount, discount, agreement status, and client feedback.
  - `AuditLog`: Granular action trail recording actor ID, role, action enum (`ORGANIZER_UPDATE`, `DOCUMENT_UPLOAD`, `STAGE_CHANGE`, `TAX_DRAFT_SAVE`), module key, and JSON diff.

### 2.4 In-App Notifications (`notification.prisma`)
- **`Notification` Model**:
  - Targets individual `recipientUserId` or entire `targetRole`.
  - Categorized by department: `DOCUMENTER`, `PREP_REVIEW`, `SALES`, `FILING`, `SYSTEM`, `REJECTION_ALERT`.
  - Includes `actionUrl` and `actionLabel` enabling 1-click navigation to the target workspace or audit file.

---

## 3. End-to-End Business Flow & Lifecycle

The platform coordinates a 6-stage operational pipeline:

```
[1. Lead Ingestion]
   Admin bulk-imports CSV/XLSX or manual lead creation
   Status: RAW_PROSPECT
         │
         ▼
[2. Documenter Outreach]
   Round-robin or manual assignment to DOC_AGENT
   Agent calls lead, records CallLog, verifies 9-Module Organizer & Document Vault
   Status: DOC_OUTREACH -> DOC_PREP
         │
         ▼
[3. Tax Preparation & QA Audit]
   PREP_MANAGER assigns to TAX_PREPARER + TAX_REVIEWER pair
   Preparer fills Form 1040 lines (W-2, deductions, credits) -> Submits to QA
   Reviewer audits calculations against uploaded documents
   (If error -> Revert to Preparer; If pass -> Sign-off)
   Status: QA_IN_REVIEW -> QA_APPROVED -> SALES_PITCH_QUEUE
         │
         ▼
[4. Sales Pitch & Closing]
   SALES_MANAGER assigns to SALES_AGENT
   Closer reviews refund calculation, generates fee quote, pitches to client
   Records client payment (ACH/Stripe/Wire) and e-Signature consent (Form 8879)
   Status: SALES_PITCHING -> FILING_QUEUE
         │
         ▼
[5. IRS MeF Filing Operations]
   FILE_OP_MANAGER/AGENT checks EFIN compliance gate & Form 1040 XML schema
   Specialist transmits return to IRS MeF system
   Status: FILING_IN_PROGRESS -> FILING_SUCCESS (or FILING_FAILED)
         │
         ▼
[6. Conversion to Lifetime Client]
   CustomerProfile.isConvertedCustomer marked TRUE
   Client accesses certified return, tax transcripts, and future tax year filings
```

### Bi-Directional Send-Back (Revert) Workflow
Any stage has built-in reversibility via the `Workflow Revert Service`:
- **Filing -> Sales**: Payment/e-sign discrepancy.
- **Filing -> Prep**: Form 1040 calculation error detected before IRS transmission.
- **Filing -> Documenter**: Missing or unreadable identity document.
- **Sales -> Prep**: Client requests re-calculation with newly discovered deductions.
- **Prep Reviewer -> Preparer**: QA audit failure with specific line-item instructions.
- **Prep -> Documenter**: Missing W-2 or visa document prevents tax computation.

Every send-back creates a timestamped record in `AuditLog` and updates `taxDraftSummary.lastRevert`.

---

## 4. User Roles & Permission Hierarchy

| Role Code | Department | Core Responsibilities & Scope |
|:---|:---|:---|
| **ADMIN** | Executive | Superuser. Can view, edit, reassign, import leads, manage staff, toggle accounts, and access every department screen. |
| **DOC_MANAGER** | Documenter | Department overview, team performance scorecards, round-robin auto-assignment, queue rebalancing, callback escalations. |
| **DOC_TEAM_LEAD** | Documenter | Queue oversight, manual lead allocation, assist calling agents. |
| **DOC_AGENT** | Documenter | Calling queue, taxpayer 360 view, call logging, document upload & verification, 9-module organizer completion, handoff to Tax Prep. |
| **PREP_MANAGER** | Tax Prep & Review | Operations dashboard, pipeline SLA monitoring, preparer/reviewer pairing, auto-distribution, queue oversight. |
| **TAX_PREPARER** | Tax Prep & Review | Assigned returns queue, Form 1040 workspace, deduction engine, tax draft computation, submit to QA. |
| **TAX_REVIEWER** | Tax Prep & Review | QA review queue, 4-eyes compliance audit, discrepancy flagging, rejection to preparer or sign-off to Sales. |
| **SALES_MANAGER** | Sales | Revenue dashboard, quote approvals, team scorecards, round-robin closer allocation. |
| **SALES_AGENT / CLOSER** | Sales | Pitching queue, pitch workspace, fee calculator, objection handling scripts, payment collection, e-sign capture, dispatch to filing. |
| **FILE_OP_MANAGER** | Filing Operations | MeF transmission queue, IRS ack monitoring, rejection handling, staff throughput tracking. |
| **FILE_OP_AGENT** | Filing Operations | XML schema validation, EFIN credential verification, IRS e-file submission, acceptance confirmation. |
| **TAXPAYER_USER** | Customer | Self-service portal: refund tracking, document vault, 9-module organizer filling, billing history. |

---

## 5. Detailed Page-by-Page & Operation Breakdown

Every frontend screen is organized under `frontend/src/features/` with matching routes defined in `frontend/src/routes/index.tsx`.

### 5.1 Public & Authentication Pages

#### 1. Login Page (`/login`)
- **Screen**: `LoginScreen.tsx` (`src/features/auth/screens/LoginScreen.tsx`)
- **Access**: Public only (redirects authenticated users to their home dashboard).
- **Key Operations**:
  - **Step 1 - Request OTP**: User enters registered email or mobile phone. Triggers `POST /api/auth/request-otp`. Backend verifies active user and dispatches 6-digit OTP (or logs static OTP `123456` in dev mode).
  - **Step 2 - Verify OTP**: User inputs the 6-digit OTP. Triggers `POST /api/auth/verify-otp`. Upon success, sets an HTTP-only cookie, updates Zustand `useAuthStore`, and navigates user to their role-specific landing portal.
  - **Auto-Fill Fast Login**: Development shortcuts for instant 1-click test login as Admin, Manager, Preparer, Closer, or Taxpayer.

---

### 5.2 Admin Department Portal (`/admin/*`)
*Protected by `ProtectedRoute allowedRoles={['ADMIN']}` and wrapped in `AdminLayout`.*

#### 2. Admin Executive Overview (`/admin/dashboard`)
- **Screen**: `AdminOverviewScreen.tsx`
- **Operations**:
  - **KPI Metrics**: Displays live count cards for Total Prospects, Documenter Queue, Tax Prep Queue, Sales Queue, Filing Queue, Completed Returns, and Total Revenue collected. Triggers `GET /api/admin/dashboard-stats`.
  - **Pipeline Funnel Chart**: Visualizes lead throughput across all stages.
  - **Visa Type Distribution**: Pie chart breaking down clients by visa category (F-1, H-1B, L-1, etc.).
  - **Live Audit Activity Feed**: Real-time log of recent stage changes, employee logins, and payment recordings.
  - **Sync Database**: Manual refresh button to poll live database stats with toast notification.

#### 3. Bulk Lead Ingestion (`/admin/prospects`)
- **Screen**: `BulkLeadImportScreen.tsx`
- **Operations**:
  - **Drag-and-Drop Dropzone**: Accepts CSV and XLSX files containing raw taxpayer contact information.
  - **Tax Year Selector**: Selects target filing year (e.g., 2024, 2025).
  - **Client-Side Parser & Validator**: Parses spreadsheet headers (First Name, Last Name, Email, Phone, Visa, SSN/ITIN status), checks for duplicate emails/phones, and displays preview table.
  - **Demo Data Loader**: 1-click loader inserting 10-20 sample international student leads for quick end-to-end testing.
  - **Download Template**: Generates compliant CSV template for import formatting.
  - **Commit Ingestion**: Triggers `POST /api/admin/leads/bulk-import`. Creates `CustomerProfile` records and initializes `TaxApplication` with stage `RAW_PROSPECT`.

#### 4. Converted Customer & Client Directory (`/admin/customers`)
- **Screen**: `AdminCustomerDirectoryScreen.tsx`
- **Operations**:
  - **Filterable Directory**: Search by taxpayer name, email, phone, SSN, visa type, or tax year. Triggers `GET /api/admin/customers`.
  - **Customer 360 Modal**: View lifetime client profile, historic filings across multiple years, total refund secured, and fee payments. Triggers `GET /api/admin/customers/:id`.
  - **Start Next Tax Year**: 1-click modal to create a new `TaxApplication` for an existing client for the subsequent tax year without re-entering demographic details. Triggers `POST /api/admin/customers/:id/new-application`.

#### 5. Employee & Staff Management (`/admin/employees`)
- **Screen**: `EmployeeManagementScreen.tsx`
- **Operations**:
  - **Staff Roster Table**: View all team members, assigned roles, contact details, and account status. Triggers `GET /api/admin/employees`.
  - **Create Employee**: Modal to onboard new staff member with assigned system role. Triggers `POST /api/admin/employees`.
  - **Edit Employee**: Update employee name, role, email, or mobile. Triggers `PUT /api/admin/employees/:id`.
  - **Toggle Active/Inactive**: Instantly deactivate an employee account, revoking access without deleting historical audit relations. Triggers `PATCH /api/admin/employees/:id/toggle-status`.
  - **Bulk Staff Onboarding**: Ingest multiple employee profiles via CSV. Triggers `POST /api/admin/employees/bulk-onboard`.

#### 6. Cross-Department Monitoring Screens (`/admin/documenter`, `/admin/prep-review`, `/admin/sales`, `/admin/filing`)
- **Screens**: `DocumenterDepartmentScreen`, `PrepDepartmentScreen`, `SalesDepartmentScreen`, `FilingDepartmentScreen`.
- **Operations**: Provides Admin with read/write access to each department's manager dashboard and live pipeline without needing to switch accounts.

#### 7. System Settings (`/admin/settings`)
- **Screen**: `AdminSettingsScreen.tsx`
- **Operations**: Configures CRM operational parameters, IRS EFIN credentials, business contact info, and email dispatch preferences.

---

### 5.3 Documenter & Intake Department (`/documenter/*`)
*Protected for roles: `ADMIN`, `DOC_MANAGER`, `DOC_TEAM_LEAD`, `DOC_AGENT`.*

#### 8. Documenter Manager Dashboard (`/documenter/manager`)
- **Screen**: `DocumenterManagerDashboardScreen.tsx`
- **Operations**:
  - **Intake Funnel KPIs**: Shows total raw prospects, leads in active outreach, completed document sets, and dropped leads.
  - **Workload Distribution Chart**: Bar chart displaying current open leads per calling agent.
  - **1-Click Round-Robin Distribute**: Modal allowing manager to evenly auto-assign unassigned leads to all active `DOC_AGENT` staff. Triggers `POST /api/documenter/assign-round-robin`.
  - **Bulk Lead Assignment**: Select specific agents and bulk transfer selected leads. Triggers `POST /api/documenter/assign-bulk`.

#### 9. Manager Queue (`/documenter/manager/queue`)
- **Screen**: `ManagerQueueScreen.tsx`
- **Operations**: Filterable, paginated table of all department leads with multi-select checkboxes for batch reassignments and stage overrides.

#### 10. Documenter Staff Scorecards (`/documenter/manager/scorecards`)
- **Screen**: `ManagerScorecardsScreen.tsx`
- **Operations**: Metrics per agent: total calls logged, connected calls percentage, average time to document collection, and total returns transferred to Tax Prep.

#### 11. Documenter Agent Dashboard (`/documenter/agent`)
- **Screen**: `DocumenterAgentDashboardScreen.tsx`
- **Operations**: Personal workstation view showing the calling agent's personal caseload, pending callbacks scheduled for today, and recent documents uploaded by clients.

#### 12. Documenter Agent Queue (`/documenter/agent/queue`)
- **Screen**: `DocumenterAgentQueueScreen.tsx`
- **Operations**:
  - Filter tabs: `All My Leads`, `Pending Call`, `Awaiting Docs`, `Ready for Prep`.
  - Quick action buttons: Open Phone Dialer, View Documents, Open Taxpayer 360 Workspace.

#### 13. Scheduled Callbacks Screen (`/documenter/agent/callbacks`)
- **Screen**: `DocumenterAgentCallbacksScreen.tsx`
- **Operations**: Calendar and timeline view of scheduled appointments with prospective clients. Provides reminder alerts and 1-click call initiation.

#### 14. Documenter Agent Prep Screen (`/documenter/agent/prep`)
- **Screen**: `DocumenterAgentPrepScreen.tsx`
- **Operations**: Dedicated review screen showing all leads where documents are uploaded, allowing agent to double-check intake completeness before passing to Tax Prep.

#### 15. Taxpayer 360 Detail Workspace (`/documenter/agent/lead/:id` and `/documenter/lead/:id`)
- **Screen**: `Taxpayer360DetailScreen.tsx`
- **Operations**:
  - **Taxpayer Header**: Displays client name, visa badge, contact details, assigned specialist, and current stage badge.
  - **Tab 1 - Call History Timeline**: Chronological log of previous outreach attempts. Includes "Log New Call" button triggering `CallOutreachModal.tsx` to record call outcome (disposition), notes, and schedule callbacks (`POST /api/documenter/dispositions`).
  - **Tab 2 - Document Vault**: View, preview, and download uploaded W-2s, 1042-S, and Passports (`GET /api/documenter/documents/:id/download`). Agent can upload files on behalf of client (`POST /api/documenter/leads/:id/documents`), verify documents (`PATCH /api/documenter/documents/:id/verify`), or remove invalid files (`DELETE /api/documenter/documents/:id`).
  - **Tab 3 - Draft Tax Calculator**: Preliminary estimator calculating gross income, standard deduction, and anticipated federal/state refund (`POST /api/documenter/tax-draft`).
  - **Tab 4 - 9-Module Intake Organizer**: In-depth review of taxpayer's residency status, residency history, marital status, dependent info, income sources, and treaty benefits (`PUT /api/documenter/leads/:id/organizer`).
  - **Transfer to Tax Prep**: Button opening confirmation modal to move lead to stage `DOC_PREP`, transferring custody to the Tax Preparation Department (`POST /api/documenter/leads/:id/move-to-prep`).
  - **Send to Sales**: Fast-track button to push directly to sales if return does not require complex CPA review (`POST /api/documenter/send-to-sales`).
  - **Audit Trail Section**: Complete history of every edit made to this taxpayer file (`LeadAuditTrailSection.tsx`).

---

### 5.4 Tax Preparation & Review Department (`/prep-review/*`)
*Protected for roles: `ADMIN`, `PREP_MANAGER`, `TAX_REVIEWER`, `TAX_PREPARER`.*

#### 16. Prep Manager Operations Command Center (`/prep-review/manager`)
- **Screen**: `PrepManagerDashboardScreen.tsx`
- **Operations**:
  - **Analytics Cards**: Returns in Preparation, Awaiting QA Audit, Revision Required, and Approved for Sales.
  - **Caseload Capacity Heatmap**: Monitors active workload per preparer and reviewer.
  - **Auto-Distribution Modal**: 1-click button to distribute incoming unassigned `DOC_PREP` returns to available preparers based on capacity (`POST /api/prep-review/assign`).

#### 17. Prep Manager Queue (`/prep-review/manager/queue`)
- **Screen**: `PrepManagerQueueScreen.tsx`
- **Operations**: Pipeline table with controls to manually assign or reassign any return to specific preparer and reviewer pairs.

#### 18. Prep Staff Scorecards (`/prep-review/manager/staff`)
- **Screen**: `PrepStaffScorecardsScreen.tsx`
- **Operations**: Evaluates team efficiency: returns prepared per day, QA first-pass approval rate, average audit turnaround time, and revision counts.

#### 19. Tax Preparer Queue (`/prep-review/preparer`)
- **Screen**: `TaxPreparerQueueScreen.tsx`
- **Operations**: Filterable queue of returns assigned to the logged-in preparer. Shows stage tags: `In Progress`, `Revision Requested`, `Reverted from Sales/Filing`.

#### 20. Tax Preparer Form 1040 Workspace (`/prep-review/preparer/workspace/:id`)
- **Screen**: `TaxPreparerWorkspaceScreen.tsx`
- **Operations**:
  - **Taxpayer Profile Side Panel**: Displays demographic details, visa type, marital status, and quick links to client documents.
  - **Document Split-Screen Preview**: Embedded viewer allowing preparer to inspect original W-2 / 1099 PDF documents while entering tax figures.
  - **Form 1040 Tax Calculation Engine**:
    - Income Fields: Line 1a W-2 Wages, Line 2b Taxable Interest, Line 7 Capital Gains, Line 8 Other Income.
    - Deductions: Standard Deduction vs. Itemized Deductions (Schedule A).
    - Credits & Payments: Child Tax Credit, Education Credits, Line 25d Federal Withholding, State Tax Withholding.
    - Automated Math: Live calculation of Total Income, Adjusted Gross Income (AGI), Taxable Income, Total Tax, Federal Refund Due / Balance Owed, and State Refund / Balance Owed.
  - **Save Draft**: Persists line items to `TaxApplication.taxDraftSummary` (`POST /api/prep-review/workspace/:id/save-draft`).
  - **Submit to QA Review**: Validates input integrity and moves return to `QA_IN_REVIEW`, alerting assigned reviewer (`POST /api/prep-review/workspace/:id/submit-qa`).
  - **Send Back / Revert Modal**: Reverts return back to Documenter Department if critical documentation is missing (`POST /api/workflow/revert`).

#### 21. Tax Reviewer Queue (`/prep-review/reviewer`)
- **Screen**: `TaxReviewerQueueScreen.tsx`
- **Operations**: Listing of completed returns awaiting secondary 4-eyes compliance review.

#### 22. Tax Reviewer QA Audit Workspace (`/prep-review/reviewer/audit/:id`)
- **Screen**: `TaxReviewerAuditScreen.tsx`
- **Operations**:
  - **Side-by-Side Comparison**: Verifies figures entered by the preparer against the client's original uploaded tax slips.
  - **Compliance Checklist**: Reviewer checks off SSN verification, W-2 Box 1 vs Box 2 reconciliation, treaty exemption validity, and state residency rules.
  - **Request Revision**: Opens revision dialog to send return back to preparer with required line-item corrections (`POST /api/prep-review/reviewer/audit/:id/request-revision`).
  - **QA Sign-Off**: Senior reviewer certifies return accuracy. Moves application to stage `SALES_PITCH_QUEUE` and notifies Sales department (`POST /api/prep-review/reviewer/audit/:id/sign-off`).

#### 23. Tax Specialist Unified Dashboard (`/prep-review/dashboard`)
- **Screen**: `TaxSpecialistDashboardScreen.tsx`
- **Operations**: Unified home screen for preparers and reviewers showing pending drafting tasks, revision queues, and personal completion stats.

---

### 5.5 Sales & Closing Department (`/sales/*`)
*Protected for roles: `ADMIN`, `SALES_MANAGER`, `SALES_TEAM_LEAD`, `SALES_AGENT`, `SALES_CLOSER`.*

#### 24. Sales Manager Dashboard (`/sales/manager`)
- **Screen**: `SalesManagerDashboardScreen.tsx`
- **Operations**:
  - **Revenue & Pipeline KPIs**: Gross pipeline value, closed revenue, active pitches, conversion percentage, and average deal size.
  - **Closer Allocation & Round-Robin**: Distributes incoming `SALES_PITCH_QUEUE` returns to available closers (`POST /api/sales/auto-round-robin`).

#### 25. Sales Manager Queue (`/sales/manager/queue`)
- **Screen**: `SalesManagerQueueScreen.tsx`
- **Operations**: Pipeline view with re-assignment controls, high-value deal flags, and pitch aging indicators.

#### 26. Sales Team Scorecards (`/sales/manager/team`)
- **Screen**: `SalesTeamScorecardsScreen.tsx`
- **Operations**: Tracks closer leaderboard: call volume, conversion rate, discount percentages given, and revenue generated.

#### 27. Sales Agent Dashboard (`/sales/agent`)
- **Screen**: `SalesAgentDashboardScreen.tsx`
- **Operations**: Daily closer view showing scheduled pitch calls, pending payments, and closed deals for the month.

#### 28. Sales Agent Queue (`/sales/agent/queue`)
- **Screen**: `SalesAgentQueueScreen.tsx`
- **Operations**: Filterable queue of returns assigned to the closer. Shows status tags: `New to Pitch`, `Pitching in Progress`, `Payment Pending`, `e-Sign Pending`.

#### 29. Sales Pitch & Closing Workspace (`/sales/agent/pitch/:id` and `/sales/pitch/:id`)
- **Screen**: `SalesPitchWorkspaceScreen.tsx`
- **Operations**:
  - **Taxpayer Header**: Client contact information, filing status, and preferred call times.
  - **Tax Draft Summary Card**: Highlights certified Federal Refund and State Refund amounts to use as value-anchors during the pitch call.
  - **Interactive Fee Calculator (`PitchFeeCalculator.tsx`)**:
    - Configures Base Preparation Fee, State Return Add-on, Complex Schedule Fees.
    - Applies authorized discounts. Computes Final Net Service Fee.
  - **Pitch Call Assistant (`PitchCallAssistant.tsx`)**:
    - Dynamic pitch script tailored to client's visa type and refund status.
    - Objection handling cards (e.g., "Competitor is cheaper", "Why do you charge for state filings?").
  - **Record Payment Modal**: Records receipt of client payment (Payment Method: Card, Zelle, Wire; Transaction Reference ID; Amount Paid) (`POST /api/sales/leads/:id/record-payment`).
  - **Record e-Signature Modal**: Confirms taxpayer signed Form 8879 (IRS e-file Signature Authorization) (`POST /api/sales/leads/:id/record-esign`).
  - **Dispatch to Filing**: Once payment and e-signature are verified, closer clicks "Dispatch to Filing Queue". Advances return to `FILING_QUEUE` (`POST /api/sales/leads/:id/dispatch-filing`).
  - **Send Back Workflow Modal**: Allows closer to send return back to Tax Prep (e.g., client provided new deduction details during the pitch) (`POST /api/workflow/revert`).

---

### 5.6 IRS Modernized e-File (MeF) Filing Department (`/filing/*`)
*Protected for roles: `ADMIN`, `FILE_OP_MANAGER`, `FILE_OP_TEAM_LEAD`, `FILE_OP_AGENT`.*

#### 30. Filing Operations Manager Dashboard (`/filing/manager`)
- **Screen**: `FilingManagerDashboardScreen.tsx`
- **Operations**:
  - **IRS Transmission Analytics**: Returns in Queue, Transmitted to IRS, IRS Accepted (`FILING_SUCCESS`), IRS Rejected (`FILING_FAILED`).
  - **EFIN Compliance Health**: Monitors IRS Electronic Filing Identification Number (EFIN 582910) operational status.
  - **Auto-Balance Filing Queue**: Distributes pending returns evenly across filing staff (`POST /api/filing/auto-balance`).

#### 31. Filing Manager Queue (`/filing/manager/queue`)
- **Screen**: `FilingManagerQueueScreen.tsx`
- **Operations**: Full queue management with filtering by tax year, transmission batch ID, and rejection status codes.

#### 32. Filing Staff Scorecards (`/filing/manager/staff`)
- **Screen**: `FilingStaffScorecardsScreen.tsx`
- **Operations**: Tracks specialist metrics: returns transmitted per hour, average acceptance turnaround time, and rejection resolution rate.

#### 33. Filing Specialist Dashboard (`/filing/agent`)
- **Screen**: `FilingSpecialistDashboardScreen.tsx`
- **Operations**: Specialist home screen displaying assigned transmissions, pending IRS acknowledgments, and urgent error resolution tickets.

#### 34. Filing Specialist Queue (`/filing/agent/queue` and `/filing/queue`)
- **Screen**: `FilingSpecialistQueueScreen.tsx`
- **Operations**: Working table of returns ready for IRS e-file submission.

#### 35. Filing Transmission Workspace (`/filing/workspace/:id`)
- **Screen**: `FilingTransmissionWorkspaceScreen.tsx`
- **Operations**:
  - **View Mode Switcher**: Toggle between `Full Inspection`, `IRS Audit File`, and `MeF XML Schema`.
  - **Filing Compliance Gate (`FilingComplianceGate.tsx`)**:
    - Automated 6-point verification: SSN/ITIN formatting check, EFIN active status, Form 8879 e-signature confirmation, Payment receipt verification, State return schema compatibility, and Bank routing number checksum.
  - **IRS Form 1040 XML Viewer (`MeFXMLViewer.tsx`)**:
    - Displays raw IRS-compliant Modernized e-File XML document (`GET /api/filing/leads/:id/mef-xml`) with syntax highlighting and copy capabilities.
  - **Execute Transmission (`POST /api/filing/leads/:id/transmit`)**:
    - Simulates secure handshake with IRS MeF gateway.
    - Generates IRS Submission ID and records IRS timestamp.
    - Transitions stage to `FILING_SUCCESS` (or `FILING_FAILED` with IRS error codes).
    - Automatically marks `CustomerProfile.isConvertedCustomer = true` upon acceptance.
  - **Send-Back Modal**: Enables specialist to reject return back to Sales or Tax Prep if discrepancies are discovered prior to transmission.

---

### 5.7 Customer / Taxpayer Lifetime Portal (`/customer/*`)
*Protected for roles: `TAXPAYER_USER`, `ADMIN`.*

#### 36. Customer Return Dashboard (`/customer`)
- **Screen**: `CustomerDashboardScreen.tsx`
- **Operations**:
  - **Tax Year Switcher**: Allows multi-year clients to toggle between returns (e.g., 2024 vs. 2025).
  - **Return Lifecycle Stepper (`CustomerStageStepper.tsx`)**: Real-time progress bar showing client exactly where their return is in the process (Intake -> Preparation -> Review -> Payment -> Filed with IRS).
  - **Refund Hero Card (`CustomerRefundHeroCard.tsx`)**: Prominently displays Federal Refund, State Refund, and Direct Deposit bank account mask.
  - **Assigned Team Card**: Displays name and direct email of the dedicated tax specialist assigned to their file.
  - **Quick Action Cards**: Direct links to upload missing documents or complete the tax organizer.

#### 37. 9-Module Intake Tax Organizer (`/customer/organizer`)
- **Screen**: `CustomerOrganizerScreen.tsx`
- **Operations**:
  - Step-by-step interview wizard capturing:
    1. Basic Demographics & SSN/ITIN
    2. Visa History & Substantial Presence Test details
    3. Marital Status & Dependents
    4. Wage Income (W-2 details)
    5. Self-Employment & 1099-NEC Income
    6. Bank Interest & Stock Trading (1099-INT, 1099-B)
    7. Education & Tuition Expenses (1098-T)
    8. Moving & Health Savings Accounts (HSA)
    9. State-Specific Tax Questions & Bank Account for Direct Deposit
  - Saves progress with `PUT /api/customer/organizer`.

#### 38. Client Document Vault (`/customer/documents`)
- **Screen**: `CustomerDocumentsScreen.tsx`
- **Operations**:
  - **Secure Upload Zone**: Client drags and drops tax slips (W-2, 1099, Passport, Visa, Form 1042-S). Triggers `POST /api/customer/documents/upload`.
  - **Document Listing**: View uploaded files, category tags, upload date, and verification status (`PENDING`, `VERIFIED`, `REJECTED`).
  - **Download & Delete**: Client can download copies (`GET /api/customer/documents/:id/download`) or delete unverified drafts (`DELETE /api/customer/documents/:id`).

#### 39. Billing & Invoices (`/customer/billing`)
- **Screen**: `CustomerBillingScreen.tsx`
- **Operations**: Shows service fee breakdown, payment history, transaction receipt IDs, and balance due status.

#### 40. Ask a CPA / Expert Connect (`/customer/expert`)
- **Screen**: `CustomerExpertScreen.tsx`
- **Operations**: Direct messaging and callback booking channel connecting the taxpayer with their assigned tax consultant.

---

### 5.8 Cross-Cutting Features

#### 41. Notification Center (`/notifications`, `/admin/notifications`, etc.)
- **Screen**: `NotificationCenterScreen.tsx`
- **Operations**:
  - Centralized notification inbox accessible from the top navbar across all department layouts.
  - Categorized by department alert type (e.g., "New Lead Assigned", "QA Review Approved", "Payment Received", "IRS Rejection Alert").
  - Triggers:
    - `GET /api/notifications`: Fetches user's notifications.
    - `PATCH /api/notifications/:id/read`: Marks item as read.
    - `PATCH /api/notifications/mark-all-read`: Marks all items as read.
  - Clickable action buttons deep-link directly into the relevant workspace.

#### 42. Smart Role-Based Redirector (`/notifications`)
- **Component**: `NotificationRedirect` in `routes/index.tsx`
- **Operations**: Inspects authenticated user's role and automatically routes to the notification center wrapped inside their correct department layout (e.g., an Admin goes to `/admin/notifications`, a Closer goes to `/sales/notifications`).

---

## 6. Complete REST API Endpoint Directory

All endpoints are prefixed with `/api` and defined in `backend/src/routes/index.ts`:

### Auth Module (`/api/auth`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/request-otp` | Public | Dispatches 6-digit OTP to user's email or mobile. |
| `POST` | `/api/auth/verify-otp` | Public | Validates OTP and issues HTTP-only session JWT. |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookie. |
| `GET` | `/api/auth/current-user` | Authenticated | Returns current authenticated user and role profile. |

### Admin Module (`/api/admin`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/admin/register` | Public | Initial admin account setup. |
| `POST` | `/api/admin/leads/bulk-import` | Admin | Ingests spreadsheet rows into `CustomerProfile` and `TaxApplication`. |
| `GET` | `/api/admin/employees` | Admin | Fetches list of all staff members. |
| `POST` | `/api/admin/employees` | Admin | Creates a new employee user account. |
| `PUT` | `/api/admin/employees/:id` | Admin | Updates employee profile. |
| `PATCH` | `/api/admin/employees/:id/toggle-status` | Admin | Toggles employee active/inactive state. |
| `POST` | `/api/admin/employees/bulk-onboard` | Admin | Ingests multiple employee records via CSV. |
| `GET` | `/api/admin/customers` | Admin | Fetches paginated customer directory with search filters. |
| `GET` | `/api/admin/customers/:id` | Admin | Fetches single customer profile and all historical filings. |
| `POST` | `/api/admin/customers/:id/new-application` | Admin | Creates new tax application for an existing customer. |
| `GET` | `/api/admin/dashboard-stats` | Admin | Returns aggregate system KPIs, funnel stats, and recent activity. |

### Documenter Module (`/api/documenter`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/documenter/leads` | Documenter Roles | Returns paginated intake leads with status counters. |
| `GET` | `/api/documenter/leads/:id` | Documenter Roles | Returns full 360 profile, call logs, organizer, and documents. |
| `GET` | `/api/documenter/agents` | Documenter Roles | Returns active calling agents and their current caseloads. |
| `POST` | `/api/documenter/assign-bulk` | Manager / Admin | Reassigns selected leads to a specific agent. |
| `POST` | `/api/documenter/assign-round-robin` | Manager / Admin | 1-click auto-distribution of unassigned leads. |
| `POST` | `/api/documenter/dispositions` | Documenter Staff | Logs call outcome, notes, and callback timestamp. |
| `POST` | `/api/documenter/tax-draft` | Documenter Staff | Saves preliminary draft tax calculation. |
| `POST` | `/api/documenter/leads/:id/move-to-prep`| Documenter Staff | Transitions lead stage to `DOC_PREP`. |
| `POST` | `/api/documenter/send-to-sales` | Documenter Staff | Transitions lead stage directly to `SALES_PITCH_QUEUE`. |
| `GET` | `/api/documenter/documents/:id/download` | Documenter Staff | Downloads or streams client tax document. |
| `PATCH` | `/api/documenter/documents/:id/verify` | Documenter Staff | Updates document verification status. |
| `POST` | `/api/documenter/leads/:id/documents` | Documenter Staff | Agent uploads document on behalf of client. |
| `DELETE`| `/api/documenter/documents/:id` | Documenter Staff | Deletes a document from the vault. |
| `PUT` | `/api/documenter/leads/:id/organizer` | Documenter Staff | Updates 9-module intake organizer responses. |

### Tax Prep & Review Module (`/api/prep-review`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/prep-review/staff` | Prep Roles | Returns preparers and reviewers with active capacities. |
| `GET` | `/api/prep-review/leads` | Prep Roles | Returns returns currently in preparation or QA review. |
| `GET` | `/api/prep-review/dashboard-stats` | Prep Roles | Returns operational KPIs and SLA throughput. |
| `POST` | `/api/prep-review/assign` | Prep Manager | Assigns returns to specific preparer and reviewer. |
| `GET` | `/api/prep-review/workspace/:id` | Prep Roles | Fetches Form 1040 draft lines, profile, and documents. |
| `POST` | `/api/prep-review/workspace/:id/save-draft` | Prep Roles | Saves Form 1040 line item inputs. |
| `POST` | `/api/prep-review/workspace/:id/submit-qa` | Prep Roles | Submits draft return to QA reviewer queue. |
| `POST` | `/api/prep-review/reviewer/audit/:id/sign-off` | Reviewer | Approves return; advances to `SALES_PITCH_QUEUE`. |
| `POST` | `/api/prep-review/reviewer/audit/:id/request-revision` | Reviewer | Rejects return back to preparer with notes. |
| `GET` | `/api/prep-review/documents/:id/view` | Prep Roles | Streams document for split-screen inspection. |
| `GET` | `/api/prep-review/documents/:id/download`| Prep Roles | Downloads document file. |

### Sales Module (`/api/sales`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/sales/leads` | Sales Roles | Fetches pipeline leads in sales stages. |
| `GET` | `/api/sales/leads/:id` | Sales Roles | Fetches single sales pitch workspace data. |
| `GET` | `/api/sales/staff` | Sales Roles | Fetches closers list and closing conversion stats. |
| `GET` | `/api/sales/manager-stats` | Sales Roles | Returns pipeline revenue, win rate, and deal volume. |
| `GET` | `/api/sales/agent-stats` | Sales Roles | Returns individual agent revenue and target achievement. |
| `POST` | `/api/sales/assign` | Sales Manager | Assigns lead to specific closer. |
| `POST` | `/api/sales/auto-round-robin` | Sales Manager | Auto-distributes unassigned sales leads. |
| `POST` | `/api/sales/leads/:id/record-payment` | Sales Staff | Records client payment details. |
| `POST` | `/api/sales/leads/:id/record-esign` | Sales Staff | Records Form 8879 e-signature confirmation. |
| `POST` | `/api/sales/leads/:id/dispatch-filing` | Sales Staff | Advances paid/signed lead to `FILING_QUEUE`. |

### Filing Operations Module (`/api/filing`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/filing/queue` | Filing Roles | Fetches returns awaiting IRS transmission. |
| `GET` | `/api/filing/leads/:id` | Filing Roles | Returns transmission workspace details for single return. |
| `GET` | `/api/filing/staff` | Filing Roles | Returns filing specialist roster and throughput. |
| `GET` | `/api/filing/manager-stats` | Filing Roles | Returns IRS acceptance rate and rejection stats. |
| `GET` | `/api/filing/leads/:id/mef-xml` | Filing Roles | Generates and returns Form 1040 IRS MeF XML string. |
| `POST` | `/api/filing/leads/:id/transmit` | Filing Staff | Transmits return to IRS; sets `FILING_SUCCESS`. |
| `POST` | `/api/filing/assign` | Filing Manager | Reassigns filing return to specific specialist. |
| `POST` | `/api/filing/auto-balance` | Filing Manager | Rebalances queue evenly across active staff. |

### Workflow Reversion Module (`/api/workflow`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/workflow/revert` | Staff Roles | Reverts return stage back to prior department with mandatory reason notes. |

### Customer Portal Module (`/api/customer`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/customer/dashboard` | Taxpayer / Admin | Returns live return stage, refund, and assigned staff. |
| `GET` | `/api/customer/documents` | Taxpayer / Admin | Lists all documents in customer vault. |
| `POST` | `/api/customer/documents/upload` | Taxpayer / Admin | Uploads tax document file. |
| `DELETE`| `/api/customer/documents/:id` | Taxpayer / Admin | Deletes document from vault. |
| `GET` | `/api/customer/documents/:id/download` | Taxpayer / Admin | Downloads document from vault. |
| `GET` | `/api/customer/organizer` | Taxpayer / Admin | Fetches 9-module organizer responses. |
| `PUT` | `/api/customer/organizer` | Taxpayer / Admin | Saves updated 9-module organizer answers. |

### In-App Notifications Module (`/api/notifications`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/api/notifications` | Authenticated | Fetches user's unread and recent notifications. |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Marks specific notification as read. |
| `PATCH` | `/api/notifications/mark-all-read` | Authenticated | Marks all user notifications as read. |

---

## 7. Developer Onboarding & Local Setup

### 7.1 Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Package Manager**: npm
- **Database**: PostgreSQL v14+ (Local instance or Docker container)

### 7.2 Environment Configuration

#### Backend Environment (`backend/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ath_crm?schema=public"
JWT_SECRET="your_secure_jwt_secret_key_change_in_production"
JWT_EXPIRES_IN="7d"
COOKIE_DOMAIN="localhost"
CLIENT_URL="http://localhost:5173"
STATIC_OTP="true"  # Set to 'true' in development to allow '123456' OTP login
```

#### Frontend Environment (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

### 7.3 Database Setup & Migrations
In `backend/`:
```bash
# Install dependencies
npm install

# Generate Prisma Client from multi-file schemas
npx prisma generate

# Apply migrations / push schema to PostgreSQL
npx prisma db push
```

### 7.4 Running the Application Locally
Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 - Frontend Client:**
```bash
cd frontend
npm run dev
# Vite dev server will start on http://localhost:5173
```

### 7.5 Testing End-to-End Workflow with Dev Shortcuts
1. Open `http://localhost:5173/login`.
2. Click **"Login as Admin"** (uses static OTP `123456`).
3. Navigate to **Bulk Lead Ingestion** (`/admin/prospects`).
4. Click **"Load 20 Sample Leads"** and confirm ingestion.
5. Navigate to **Documenter Department** (`/admin/documenter` or log in as a `DOC_AGENT`).
6. Open any lead in the **Taxpayer 360 Detail Workspace**, log a call disposition, verify uploaded documents, and click **"Move to Tax Prep"**.
7. Switch to **Tax Prep Workspace** (`/prep-review/preparer`), fill Form 1040 numbers, and click **"Submit to QA"**.
8. Open **QA Audit Screen** (`/prep-review/reviewer`), verify the audit checklist, and click **"Sign-Off & Approve"**.
9. Switch to **Sales Pitch Workspace** (`/sales`), review the refund calculation, click **"Record Payment"**, then **"Record e-Signature"**, and click **"Dispatch to Filing"**.
10. Open **Filing Transmission Workspace** (`/filing`), review the Form 1040 XML, and click **"Transmit to IRS"**.
11. View client's status update to **FILING_SUCCESS** and verify that their profile is now flagged as a certified converted customer.
