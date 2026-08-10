# Scope of Work (SOW) & System Requirement Specification (SRS)
## Project: Tax Filing CRM Platform ("TaxCRM Engine")

---

## 1. Executive Summary & Domain Scope

The **Tax Filing CRM Platform** is a specialized, multi-tiered Enterprise Customer Relationship Management and Workflow Automation System custom-built for **Tax Filing Operations** (Individual & Corporate Tax Processing).

Unlike general IT consulting or healthcare CRMs, this platform is specifically designed around the lifecycle of a Taxpayer: from initial lead acquisition via bulk CSV import, through document collection and tax computation, quote negotiation, electronic filing (e-filing) execution, and long-term Year-over-Year (YoY) customer retention.

---

## 2. Role Hierarchy & Access Control Matrix

The system follows a strict **Role-Based Access Control (RBAC)** architecture with hierarchical team boundaries:

```
                               ┌─────────────────────────┐
                               │       ADMINISTRATOR     │
                               └────────────┬────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         │                                  │                                  │
┌────────┴────────┐                ┌────────┴────────┐                ┌────────┴────────┐
│DOCUMENTER DEPT  │                │   SALES DEPT    │                │  FILE OPERATOR  │
├─────────────────┤                ├─────────────────┤                ├─────────────────┤
│Manager          │                │Manager          │                │Manager          │
│Team Leader (Opt)│                │Team Leader (Opt)│                │Team Leader (Opt)│
│Documenter Agent │                │Sales Agent      │                │File Operator    │
└─────────────────┘                └─────────────────┘                └─────────────────┘
         │                                  │                                  │
         └──────────────────────────────────┼──────────────────────────────────┘
                                            │
                               ┌────────────┴────────────┐
                               │   USER / TAXPAYER PORTAL│
                               └─────────────────────────┘
```

### 2.1 Staff & Client Roles Definition
1. **System Administrator (Super Admin)**
   - Unrestricted global access.
   - Responsible for Bulk CSV Lead Ingestion, Global System Settings, User & Staff Provisioning, Department Alignment, and Audit Monitoring.
2. **Documenter Segment (Call Center & Tax Computation Prep)**
   - **Documenter Manager**: Oversees documenter teams, views department workload, reassigns leads/tasks.
   - **Documenter Team Leader (Optional)**: Manages team agents, monitors daily call counts & document prep SLAs.
   - **Documenter Agent**: Calls assigned prospects/leads, updates outreach status (e.g., Connected, Follow-up, Interested), triggers User Account Creation upon consent, reviews uploaded tax files, and prepares tax calculation/draft.
3. **Sales Segment (Quotation & Pitching)**
   - **Sales Manager**: Receives tax-prepared leads from Documenter Dept, assigns leads to Sales Agents.
   - **Sales Team Leader (Optional)**: Oversees sales pipelines and closing rates.
   - **Sales Agent**: Communicates with the User regarding tax drafts/quotes sent by the Documenter Dept. Negotiates fees and closes deals.
     - *If User requests correction*: Routes lead back to assigned Documenter Agent.
     - *If User approves*: Converts lead to "Qualified Lead / Ready for Filing".
4. **File Operator Segment (Filing & CPA Execution)**
   - **File Operator Manager**: Receives approved sales leads, assigns to File Operators.
   - **File Operator Team Leader (Optional)**: Manages filing queues and rejection handling.
   - **File Operator (Filing Specialist / CPA)**: Performs official tax filing with tax authorities (e.g., IRS / ITD).
     - *If Filing Fails*: Routes back to Sales/Documenter with failure diagnostic notes.
     - *If Filing Succeeds*: Converts record into permanent "Customer".
5. **User / Taxpayer (Client Role)**
   - Client portal access created automatically via email upon initial Documenter qualification.
   - Uploads tax documents (W-2, 1099, 1040, Form 16, Bank Statements, etc.).
   - Reviews tax computation drafts and fee quotes.
   - Approves filing or submits correction requests.
   - Tracks real-time tax filing status and downloads final filed acknowledgments.

---

## 3. End-to-End Core Lifecycle & Workflow State Machine

```
[Bulk CSV Import (Admin)]
        │
        ▼
 [Raw Prospect] ──(Deduplication Engine check)──► [Skip if Existing Customer]
        │
        ▼
 [Assigned to Documenter Dept]
        │
        ▼ (Call Center Outreach)
 [Outreach Status: Connected / Followup / Interested]
        │
        ▼ (User Agrees)
 [Convert to Prospect Lead] + [Auto Create User Account & Send Email Credentials]
        │
        ▼
 [User Uploads Tax Files in Portal]
        │
        ▼
 [Documenter Prepares Tax Calculation Draft & Est. Quote]
        │
        ▼
 [Moved to Sales Manager Queue]
        │
        ▼ (Assigned to Sales Agent)
 [Sales Agent Pitches Draft/Quote to User]
        │
        ├──────────────────────┐
        ▼ (User Requests Edit) ▼ (User Approves)
 [Route Back to Documenter]   [Convert to Qualified Sales Lead]
                               │
                               ▼
                    [Moved to File Operator Manager Queue]
                               │
                               ▼ (Assigned to File Operator)
                    [File Operator Performs Tax Filing / E-File]
                               │
                               ├──────────────────────┐
                               ▼ (Filing Failed)      ▼ (Filing Successful)
                        [Route to Sales/Doc]     [CONVERT TO PERMANENT CUSTOMER]
                                                      │
                                                      ▼
                                       [Available for Next Tax Year Filing]
```

---

## 4. Optimized Database Architecture (3-Tier Master Schema)

To solve the complex requirement where **a Taxpayer client moves across multiple departments and holds multi-year tax filings** (with potential drop-offs in one year and re-engagement in future years), the database is designed with a **3-Tier Master Entity Model**:

1. **`users` (Identity & Auth Layer)**: Universal authentication table for both Staff (Admins, Documenters, Sales, File Operators) and Taxpayer Clients.
2. **`customer_profiles` (Master Taxpayer Profile)**: Single permanent profile per individual/corporate client (stores SSN/PAN, phone, primary email, permanent customer badge).
3. **`tax_applications` (Yearly Filing Pipeline Entity)**: One row per Tax Year per Customer. This is the entity that moves through the stage pipeline (Documenter ➔ Sales ➔ File Operator ➔ Completed).

```
┌───────────────────────┐        ┌─────────────────────────┐
│        USERS          │        │    CUSTOMER_PROFILES    │
├───────────────────────┤        ├─────────────────────────┤
│ id (PK)               │ 1    1 │ id (PK)                 │
│ email (Unique)        ├───────►│ user_id (FK, Unique)    │
│ password_hash         │        │ ssn_tin / pan           │
│ role (ADMIN, DOC,     │        │ phone, first_name, etc. │
│   SALES, FILE_OP, USER│        │ is_converted_customer   │
└───────────────────────┘        └────────────┬────────────┘
                                              │ 1
                                              │
                                              │ *
                                 ┌────────────┴────────────┐
                                 │    TAX_APPLICATIONS     │
                                 ├─────────────────────────┤
                                 │ id (PK)                 │
                                 │ customer_id (FK)        │
                                 │ tax_year (2024, 2025)   │
                                 │ current_stage           │
                                 │ doc_agent_id (FK)       │
                                 │ sales_agent_id (FK)     │
                                 │ file_op_id (FK)         │
                                 └────────────┬────────────┘
                                              │
                  ┌───────────────────────────┼───────────────────────────┐
                  │ 1                         │ 1                         │ 1
                  │ *                         │ *                         │ *
         ┌────────┴────────┐         ┌────────┴────────┐         ┌────────┴────────┐
         │  STAGE_HISTORY  │         │  TAX_DOCUMENTS  │         │  SALES_QUOTES   │
         ├─────────────────┤         ├─────────────────┤         ├─────────────────┤
         │ id (PK)         │         │ id (PK)         │         │ id (PK)         │
         │ application_id  │         │ application_id  │         │ application_id  │
         │ from_stage      │         │ file_name, path │         │ quote_amount    │
         │ to_stage        │         │ category        │         │ status (PITCHED,│
         │ moved_by_user_id│         │ uploaded_by     │         │  APPROVED, EDIT)│
         └─────────────────┘         └─────────────────┘         └─────────────────┘
```

### 4.1 Complete SQL DDL Schema Definition

```sql
-- 1. USERS TABLE (Authentication & Universal Identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'ADMIN',
        'DOC_MANAGER', 'DOC_TEAM_LEAD', 'DOC_AGENT',
        'SALES_MANAGER', 'SALES_TEAM_LEAD', 'SALES_AGENT',
        'FILE_OP_MANAGER', 'FILE_OP_TEAM_LEAD', 'FILE_OP_AGENT',
        'TAXPAYER_USER'
    )),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMER PROFILES (Permanent Taxpayer Record - Unified across years)
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    ssn_tin VARCHAR(50) UNIQUE, -- Used for Bulk Ingestion Deduplication
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    is_converted_customer BOOLEAN DEFAULT FALSE, -- Flips TRUE once 1st filing succeeds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TAX APPLICATIONS (Yearly Filing Case Entity that moves through stages)
CREATE TABLE tax_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    tax_year INT NOT NULL, -- e.g., 2024, 2025, 2026
    filing_type VARCHAR(50) DEFAULT 'INDIVIDUAL', -- 'INDIVIDUAL', 'CORPORATE'
    current_stage VARCHAR(50) NOT NULL CHECK (current_stage IN (
        'RAW_PROSPECT',          -- Just uploaded via Admin CSV
        'DOC_OUTREACH',          -- Documenter calling
        'DOC_PREP',              -- User account created, docs uploading, tax prep
        'SALES_PITCH_QUEUE',     -- Sent to Sales Manager
        'SALES_PITCHING',        -- Sales Agent communicating quote to User
        'CORRECTION_NEEDED',     -- User requested correction -> sent back to Documenter
        'FILING_QUEUE',          -- User approved -> sent to File Operator Manager
        'FILING_IN_PROGRESS',    -- File Operator filing with tax authority
        'FILING_FAILED',         -- Filing rejected -> sent back to Sales/Doc
        'FILING_SUCCESS',        -- Completed -> Converted Customer
        'DROPPED_CANCELLED'      -- Lead dropped for this tax year
    )),
    
    -- Assigned Personnel per Stage
    assigned_doc_agent_id UUID REFERENCES users(id),
    assigned_sales_agent_id UUID REFERENCES users(id),
    assigned_file_op_agent_id UUID REFERENCES users(id),
    
    tax_draft_summary JSONB, -- Tax calculation estimates generated by Documenter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, tax_year) -- Only 1 active filing application per Customer per Tax Year
);

-- 4. STAGE WORKFLOW HISTORY (Immutable Audit Log of Stage Transitions)
CREATE TABLE application_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES tax_applications(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    moved_by_user_id UUID NOT NULL REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CALL LOGS (Documenter & Sales Outreach History)
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES tax_applications(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES users(id),
    disposition VARCHAR(50) NOT NULL, -- 'CONNECTED', 'NO_ANSWER', 'FOLLOW_UP', 'INTERESTED', 'NOT_INTERESTED'
    call_summary TEXT,
    callback_scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TAX DOCUMENTS VAULT
CREATE TABLE tax_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES tax_applications(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    document_category VARCHAR(100) NOT NULL, -- 'W2', '1099', 'ID_PROOF', 'CALCULATION_DRAFT', 'ACK_RECEIPT'
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SALES QUOTES
CREATE TABLE sales_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES tax_applications(id) ON DELETE CASCADE,
    sales_agent_id UUID NOT NULL REFERENCES users(id),
    quote_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'PITCHED', -- 'PITCHED', 'APPROVED_BY_USER', 'REJECTED_BY_USER'
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Key Functional Features Enabled by this Architecture

1. **Seamless Stage Movement**:
   - The taxpayer record (`customer_profiles`) never gets duplicated.
   - When a stage changes, only `tax_applications.current_stage` updates.
   - Documenters query `WHERE current_stage IN ('DOC_OUTREACH', 'DOC_PREP', 'CORRECTION_NEEDED')`.
   - Sales Agents query `WHERE current_stage IN ('SALES_PITCH_QUEUE', 'SALES_PITCHING')`.
   - File Operators query `WHERE current_stage IN ('FILING_QUEUE', 'FILING_IN_PROGRESS')`.
2. **Correction Loop Resolution**:
   - If User requests correction during Sales stage, Sales Agent sets `current_stage = 'CORRECTION_NEEDED'`.
   - Documenter instantly sees this in their queue, makes edits to tax draft, and updates `current_stage = 'SALES_PITCH_QUEUE'`.
3. **Multi-Year Filing & Drop-off Resilience**:
   - If a prospect drops off in 2024 (`current_stage = 'DROPPED_CANCELLED'`), their master record in `customer_profiles` remains intact.
   - When Admin uploads 2025 CSV or client returns, a new row in `tax_applications` for `tax_year = 2025` is created, allowing re-engagement without losing 2024 history!
4. **Deduplication Engine**:
   - Admin CSV upload matches `ssn_tin` or `email` against `customer_profiles` and `users`.
   - If matched, it automatically skips creating a new profile and links/creates a `tax_applications` row for the new tax year!

---

## 6. Approval & Document Reference

*Document Reference*: `file:///c:/code/reusables/TAX_CRM_SOW.md`  
*Workspace Copy*: `file:///c:/code/reusables/reusable-code/TAX_CRM_SOW.md`  
*Updated Date*: August 9, 2026  
