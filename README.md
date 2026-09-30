# HR Renewal, Probation & Letter Management System (HRFLOW360)

An enterprise-grade HR operations management platform designed for Malaysian corporate environments (Media Prima Berhad Group Human Capital) to streamline fixed-term contract renewals, probation appraisals, Head of Department (HOD) notifications, Manpower Requisition Form (MRF) workflows, official corporate letter generation, and real-time cloud synchronization with Firebase Firestore & Authentication.

---

## 🌟 Key Features

### 1. 🔐 Firebase Cloud Integration & Authentication (Login & Sign Up)
- **Firebase Firestore Database**: Real-time cloud persistence for employee records (`employees`), compliance audit trails (`activity_logs`), and user profiles (`users`).
- **Resilient Multi-Layer Storage**: Automatically synchronizes data with Firestore in real-time while maintaining local storage caching for lightning-fast offline resilience.
- **Enterprise Security Rules**: Deployed zero-trust `firestore.rules` with public directory read access to prevent cold-boot permission issues, while protecting records and audit logs.
- **Built-in Error Resiliency**: Safe Firestore error handling (`handleFirestoreError`) with structured operation logging and automated fallback to local cache.
- **HR Authentication System**:
  - **Google Sign-In**: Seamless one-click authentication via Google popup.
  - **Email & Password Login & Sign-Up**: Register new HR officers or sign in to authorized portal accounts.
  - **User Profile Management**: Synchronizes officer display names, emails, avatars, and roles directly to Firestore.

### 2. 📄 100% Exact Corporate HR Letter Templates, Direct PDF Export & Print A4
- **Exact Verbatim Corporate Templates (matching official Media Prima HR PDFs)**:
  1. **Renewal (`EXTENSION OF FIXED-TERM CONTRACT`)**:
     - Header with Date & bold `PRIVATE AND CONFIDENTIAL`.
     - Recipient block with Staff ID, Name, HOD reporting, and Department.
     - Official terms, tenure dates, Sylvia Singaraim GM sign-off.
     - **Acceptance Slip**: Official acknowledgement text with structured 3-row table (`SIGNATURE`, `NRIC`, `DATE`).
  2. **Confirmation (`CONFIRMATION OF WORK PERFORMANCE`)**:
     - Review of performance, formal confirmation, congratulations, and `cc : Database Management` / `aiz/.` initials.
  3. **Extension of Probationary Period**:
     - 3-month probation extension, Performance Improvement Plan (PIP) clause, review date, and `cc : Database Mgmnt` / `syl/aiz`.
- **Export & Print Options**:
  - **Download PDF (Direct)**: Instant high-resolution (300dpi) `.pdf` generation via `jsPDF` + `html2canvas`, featuring a built-in `oklch` color sanitizer that seamlessly resolves modern CSS Color Module 4 color function errors in Tailwind v4.
  - **Print A4 (Dedicated Print Engine)**: Direct browser print dialog tuned with pure `@media print` CSS for standard A4 portrait paper (15mm margins). Automatically hides all dark modal backdrops, UI controls, search filters, and application shells to output only the clean corporate letter on crisp white paper.
  - **Download Word (.doc)**: Formatted Microsoft Word document compatible with Microsoft Office and Google Docs.
  - **One-Click Quick Action**: **"Letter (PDF / Print)"** button directly on every row in the employee directory table.

### 3. 📧 Direct Department Email Dispatch & Digital MRF Link Attachment
- **Direct Department Addressing**:
  - `To:` and `Cc:` fields automatically pre-filled with the department HOD's email (`[department].hod@mediaprima.com.my`) and HR contract inboxes.
- **Embedded Digital MRF Access Links (Attachment)**:
  - Generates direct URL links for each expiring staff member: `?action=mrf&employeeId=[ID]`.
  - Enables HODs to click directly from their email inbox to open and complete the Manpower Requisition Form (MRF) digitally without manual paper forms.
  - **URL Deep-Linking**: When an HOD opens the link in their browser, the portal automatically loads and launches the MRF appraisal modal for that specific employee.
  - Department overview portal link: `?department=[DepartmentName]`.
- **Dual Send Mechanisms**:
  - **Send via Email Client (`mailto:`)**: Launches default email client (Outlook, Gmail, Apple Mail) with the formatted 8-column table, recipient, and MRF links pre-populated, simultaneously transitioning workflow status to `Pending Approval`.
  - **Direct Dispatch & Mark Sent**: Simulates instant in-portal dispatch and transitions all department staff to `Pending Approval` in Firestore.
  - **Copy Full Email (HTML & Table)**: One-click copy with preserved rich-text tables for pasting directly into webmail.

### 4. 📝 Manpower Requisition Form (MRF) Digital Appraisal
- Digital MRF supporting recommendations (Renewal, Confirmation, Extension, Cessation), proposed duration, justification, and remuneration adjustments.
- Complete breakdown across Sections A to I:
  - Section A: Position & Budget Requisition Details
  - Section B: Staff Information & Performance (PMS Rating)
  - Section C: Operational Justification & Workload Impact
  - Section D & E: Job Description & Special Qualifications
  - Section F: Requisitioner & HOD Recommendations
  - Section G: Human Resources Department Vetting
  - Section H: General Manager HR Approval (Executive & Below)
  - Section I: Group Managing Director / CEO Approval (Manager & Above)
- Word (.doc) download and dedicated A4 printable layout for physical sign-offs and filing.

### 5. 📥 Bulk Data Import (Excel, Google Sheets & PDF)
- **Universal File Upload**: Accepts Microsoft Excel (`.xlsx`, `.xls`), Google Sheets export (`.csv`, `.tsv`), and `.pdf` documents.
- **Direct Copy-Paste Table**: Copy rows directly from Google Sheets or Excel (Ctrl+C) and paste (Ctrl+V) for instant parsing.
- **Intelligent Header Normalizer**: Auto-maps varying column headers (Staff No, Full Name, NRIC, Department, Position, Expiry Date, Salary, HOD).
- **Interactive Pre-Import Preview**: View detected records, choose between *Append/Update* or *Replace Directory*, and verify before committing to Firestore.
- **Sample Template Downloads**: Built-in downloads for sample `.xlsx` and `.csv` templates.

### 6. 📊 Executive Dashboard & Real-Time KPIs
- **Dynamic KPI Tiles**: Quick breakdown of active records, overdue expiries, pending emails, pending approvals, MRF submissions, and completed renewals.
- **Urgency Classification**: Color-coded indicators based on contract/probation due dates (Overdue `< 0 days`, Urgent `≤ 30 days`, Warning `31–60 days`, Normal `> 60 days`).
- **One-Click Filtering**: Click any KPI card to instantly filter the employee directory.

### 7. 👥 High-Density Employee Directory
- **Comprehensive Search & Multi-Filters**: Filter across business units, departments, action types, workflow statuses, and urgency tiers.
- **Workflow State Management**: Seamless progression through stages:
  1. `Pending Email`
  2. `Pending Reminder`
  3. `Pending Approval`
  4. `Submission of MRF`
  5. `Letter Preparation`
  6. `Completed`
- **CSV Data Export**: Export filtered or full directory datasets into formatted CSV spreadsheets.

### 8. 🛡️ Audit Logging & Activity Trail
- Tracks every administrative action (status updates, MRF submissions, letter issuances, email dispatches, bulk imports) with timestamps synchronized to Firestore.

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vite.dev/)
- **Database & Auth**: [Firebase Firestore](https://firebase.google.com/docs/firestore) + [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Document Generation**: `jspdf`, `html2canvas` (with custom `oklch` color sanitizer), and Word HTML schema
- **Spreadsheet Parsing**: `xlsx` (SheetJS)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 20 or 22+
- **Package Manager**: `npm`

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/aizazafirah/HRFLOW360.git
   cd HRFLOW360
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

### Production Build & Linting

- To type-check the project:
  ```bash
  npm run lint
  ```

- To create an optimized production build:
  ```bash
  npm run build
  ```

---

## 📁 Project Structure

```text
├── firebase-applet-config.json  # Firebase cloud project configuration
├── firebase-blueprint.json      # Firebase data models and Firestore collection blueprint
├── firestore.rules              # Zero-trust Firestore security rules
├── index.html                   # HTML entry point with metadata & web fonts
├── package.json                 # Project configuration & npm dependencies
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS
└── src/
    ├── App.tsx                  # Global state, Firestore subscriptions, deep-link handling & orchestrator
    ├── main.tsx                 # React DOM mount entry point wrapped with AuthProvider
    ├── index.css                # Tailwind CSS v4 directives & exact A4 print media queries
    ├── context/
    │   └── AuthContext.tsx      # Firebase Auth provider (Google, Email/Password, profile)
    ├── firebase/
    │   ├── config.ts            # Firebase app, Firestore db instance, and Auth initialization
    │   ├── error.ts             # Safe Firestore error handler with structured notice logging
    │   └── firestoreService.ts  # Real-time Firestore sync & CRUD for employees and audit logs
    ├── components/
    │   ├── Header.tsx           # Corporate navigation bar with Auth indicator & quick actions
    │   ├── AuthModal.tsx        # Login & Sign Up modal (Google + Email/Password)
    │   ├── ImportModal.tsx      # Bulk import from Excel (.xlsx/.xls), Google Sheets, and PDF
    │   ├── ExecutiveKPIs.tsx    # Executive status summary cards
    │   ├── FilterBar.tsx        # Search, department filters, and action type toggles
    │   ├── EmployeeTable.tsx    # High-density employee directory with row actions (Letter PDF/Print, MRF)
    │   ├── DepartmentSummaryView.tsx # Departmental breakdown & batch email trigger
    │   ├── HODEmailModal.tsx    # Modal for composing and dispatching HOD notifications with MRF links
    │   ├── MRFFormModal.tsx     # Manpower Requisition Form appraisal modal
    │   ├── CorporateLetterModal.tsx # Verbatim corporate letter generator with direct PDF & Word export & Print A4
    │   ├── EmployeeEditModal.tsx# Add/edit employee record modal
    │   └── ActivityLogModal.tsx # Administrative activity & audit history modal
    ├── data/
    │   └── mockEmployees.ts     # Initial Malaysian corporate records for instant seeding
    ├── types/
    │   └── hr.ts                # TypeScript interfaces for employees, MRF, and letters
    └── utils/
        ├── dateUtils.ts         # Days-to-due calculations & localized date formatting
        ├── letterTemplates.ts   # Formal Malaysian corporate letter templates (verbatim PDF match)
        └── storage.ts           # Resilient storage fallback and audit logger
```

---

## 📋 Malaysian Corporate HR Compliance Notes

- **Identity Verification**: Fields adhere to the Malaysian National Registration Identity Card (NRIC) standard format (`YYMMDD-PB-###G`).
- **Currency Standards**: Compensation benchmarks are structured in Malaysian Ringgit (`MYR`).
- **Probation & Renewal Notice Periods**: Adheres to Malaysian Employment Act guidelines and corporate 30/60/90-day evaluation milestones.
