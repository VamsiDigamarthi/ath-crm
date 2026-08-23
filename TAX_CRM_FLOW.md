# TaxCRM Engine — Application Architecture & Workflow Guide

## 1. Executive Workflow & Lifecycle State Machine

The **TaxCRM Engine** orchestrates the end-to-end lifecycle of taxpayer leads across departments, starting from Super Admin Bulk Lead Ingestion through Documenter intake, Tax Preparation & Review (Quality Assurance), Sales quotation, CPA e-filing execution, and long-term customer retention:

```mermaid
graph TD
    A[Super Admin CSV/Excel Upload] -->|Syntax Check & Preview| B[Parsed Preview Table]
    B -->|Ingest Dataset| C[Server Deduplication Engine]
    C -->|New Prospect Lead| D[Documenter Intake Queue]
    C -->|Matched Existing Customer| D1[Link Multi-Year Application]
    D -->|Outreach & Document Collection| E{Client Uploads All W-2/Docs?}
    E -->|No / Dropped| F[Dropped / Follow-Up Scheduled]
    E -->|Yes - Documents Verified| G[Tax Preparation Queue (Preparer)]
    
    G -->|Tax Calculation & Draft Prepared| H[Tax Review & QA Queue (Reviewer)]
    H -->|Review Failed / Discrepancy Found| G
    H -->|Review Approved & Signed Off| I[Sales Department Queue]
    
    I -->|Pitch Quotation & Fee Negotiation| J{Client Approval?}
    J -->|Tax Calculation Correction Requested| G
    J -->|Approved & Signed| K[File Operator / CPA Queue]
    
    K -->|IRS / State E-Filing Execution| L{Filing Status}
    L -->|Filing Rejected / Error| I
    L -->|Filing Accepted / Success| M[Permanent Converted Customer]
    M -->|Next Tax Year| A
```

---

## 2. Multi-Role Staffing & Tax Operations Model

### 2.1 Multi-Role Assignment Capability
Staff members in the Tax Operations department can be assigned **Multiple Roles** simultaneously:
* **`DOC_AGENT`**: Calling outreach, initial intake, and document verification.
* **`DOC_PREPARER`**: Form 1040/W-2 tax calculation, deduction itemization, and tax return draft preparation.
* **`DOC_REVIEWER`**: Senior Quality Assurance, compliance verification, and draft approval.
* **Flexibility Rule**: A user can act as a Preparer on some cases and a Reviewer on other cases (subject to the 4-eyes compliance rule: a staff member cannot review their own prepared return).

### 2.2 Strict Sequential Stage Progression
1. **Documenter Collection**: Documenter collects and validates client files (W-2s, 1099s, IDs). **Does NOT send directly to Sales.**
2. **Tax Preparer**: Prepares tax computation summary & estimated return.
3. **Tax Reviewer**: Thoroughly reviews computations and signs off.
4. **Sales Pitching**: Receives only **Reviewer-Approved** tax drafts to quote fees and close deals with taxpayers.

---

## 3. Frontend Feature Architecture & Clean Code Standards

To guarantee maximum readability, maintainability, and clean separation of concerns, all application features follow a strict **Hooks-First, Stateless Component & Modular Structure**:

```
frontend/src/features/
├── admin/                    # 🛡️ Super Admin Consoles, Ingestion, Employee Master
├── documenter/               # 📞 Documenter Intake & Client Calling Hub
├── preparation/              # 🧮 Tax Preparer Queue, Worksheets, Draft Preparation
├── review/                   # 🔍 Tax Reviewer Queue, QA Sign-offs, Discrepancy Audits
├── sales/                    # 💼 Sales Manager & Agent Pitching Pipelines
├── file-operator/            # 🏛️ CPA E-Filing Execution & IRS Acknowledgments
└── shared/                   # 🧱 Reusable UI Catalog (AppTable, AppModal, etc.)
```

---

## 4. Modular Hook Decomposition Pattern

Rather than a single monolithic hook with confusing return values, business logic is split into focused, single-responsibility sub-hooks composed cleanly:

### 1. `useCSVFileUpload`
- **Responsibility**: File drag-and-drop listeners, file validation, RFC 4180 parsing, 1-click sample demo data, CSV template download, file reset.
- **Location**: [`src/features/admin/hooks/useCSVFileUpload.ts`](file:///c:/coding/ath-crm/frontend/src/features/admin/hooks/useCSVFileUpload.ts)

### 2. `useLeadTableFilters`
- **Responsibility**: Real-time debounced search query, status filtering (`ALL`, `VALID`, `INVALID`), and multi-row selection.
- **Location**: [`src/features/admin/hooks/useLeadTableFilters.ts`](file:///c:/coding/ath-crm/frontend/src/features/admin/hooks/useLeadTableFilters.ts)

### 3. `useBulkImport` (Main Orchestrator)
- **Responsibility**: Composes `useCSVFileUpload` + `useLeadTableFilters`, manages dataset lifecycle (`rows`, `taxYear`, `stats`), and handles ingestion triggers.
- **Documented Return Categories**:
  - `📁 [File & Upload State]`: `file`, `fileName`, `fileSize`, `isDragOver`, `isParsing`
  - `🔍 [Search & Filter State]`: `searchQuery`, `statusFilter`, `selectedRows`
  - `📊 [Dataset & Stats]`: `taxYear`, `rows`, `filteredRows`, `stats`
  - `⚙️ [Modal & Ingestion State]`: `isIngesting`, `showConfirmModal`
  - `🚀 [Action Handlers]`: `handleDrop`, `handleLoadDemoData`, `handleDownloadTemplate`, `handleProceedIngestion`, `handleConfirmIngestion`
- **Location**: [`src/features/admin/hooks/useBulkImport.ts`](file:///c:/coding/ath-crm/frontend/src/features/admin/hooks/useBulkImport.ts)

---

## 5. 3-Tier Master Database Architecture (Backend)

The database schema solves multi-department lead transfers and multi-year filings through 3 tiers:

```
Tier 1: USERS (Universal identity, multi-role assignments & auth for Staff and Clients)
   │
   ▼ 1:1
Tier 2: CUSTOMER_PROFILES (Permanent master record; SSN/TIN & Email deduplication)
   │
   ▼ 1:N
Tier 3: TAX_APPLICATIONS (Yearly filing case moving through department stages)
   │
   ├── STAGE_HISTORY (Immutable transition audit trail)
   ├── CALL_LOGS (Documenter & Sales communication history)
   ├── TAX_DOCUMENTS (W-2, 1099, 1040 document vault)
   ├── PREPARATION_WORKSHEETS (Preparer computations & notes)
   ├── REVIEW_AUDIT_LOGS (Reviewer approvals & QA checklists)
   └── SALES_QUOTES (Fee negotiation and client approvals)
```

---

## 6. Color & UI Styling Standards
* **Primary Accent Color**: **Tax Emerald Green (`#16A34A` / `emerald-600`)**
* **Typography**: Strictly **Poppins** (`font-sans`), maximum font-weight `700 (font-bold)`.
* **Prohibited**: Raw ad-hoc table/modal primitives, forced ALL-CAPS uppercase transforms.
* **Mandatory Component Catalog**:
  * Tables: `AppTable` (with built-in pagination, sorting, search)
  * Modals: `AppModal`
  * Dialogs: `AppConfirmDialog`
  * Inputs: `AppSearchInput`, `AppCopyButton`, `AppSelect`, `AppDatePicker`, `AppImageUpload`
