# HR Renewal, Probation & Letter Management System (HR-RPM / HRFLOW360)

An enterprise-grade HR operations management platform designed for Malaysian corporate environments to streamline fixed-term contract renewals, probation appraisals, Head of Department (HOD) email notifications, Manpower Requisition Form (MRF) tracking, and official corporate letter generation.

---

## 🌟 Key Features

### 1. Executive Dashboard & Real-Time KPIs
- **Dynamic KPI Tiles**: Quick breakdown of total active records, overdue expiries, pending HOD emails, pending approvals, MRF submissions, and completed renewals.
- **Urgency Classification**: Color-coded indicators based on contract/probation due dates (Overdue `< 0 days`, Urgent `≤ 30 days`, Warning `31–60 days`, Normal `> 60 days`).
- **One-Click Filtering**: Click any KPI card to instantly filter the employee directory.

### 2. High-Density Employee Directory
- **Comprehensive Search & Multi-Filters**: Filter across business units, departments, action types (Contract Renewal vs. Probation Review), workflow statuses, and urgency tiers.
- **Full Employee Profiling**: Tracks Employee Code, NRIC, Job Title, Grade, Current Salary (MYR), Direct Superior, and HOD.
- **Workflow State Management**: Seamless progression through stages:
  1. `Pending Email`
  2. `Pending Approval`
  3. `Submission of MRF`
  4. `Completed`
- **CSV Data Export**: Export filtered or full directory datasets into formatted CSV spreadsheets.

### 3. Department Summary & Batch Operations
- **Departmental Rollup**: Aggregated metrics across business units (e.g., Group Finance, Engineering, Digital Media, Human Capital, News & Editorial).
- **Group HOD Notification**: Launch targeted email drafts grouped by department to alert relevant HODs with all upcoming expiries in their purview.

### 4. Head of Department (HOD) Notification Email Composer
- **Corporate Email Templating**: Pre-populated corporate templates with employee details, renewal review deadlines, and instructions.
- **Recipient Management**: Pre-fills HOD contact and CC distribution lists.
- **Status Auto-Progression**: Automatically transitions notified employees to `Pending Approval` upon dispatch.

### 5. Manpower Requisition Form (MRF) & Appraisal
- **Digital MRF System**: Formatted digital form supporting:
  - Recommendation type (Renewal, Confirmation, Extension, Cessation).
  - Proposed contract duration or effective confirmation date.
  - Justification and performance appraisal notes.
  - Remuneration adjustments and headcount budget verification.
- **A4 Print Layout**: Dedicated print stylesheet formatted for physical sign-offs and filing.

### 6. Corporate Letter Generator & A4 Printing
- **Standardized Malaysian HR Letter Templates**:
  - Fixed-Term Contract Renewal Letter
  - Confirmation of Employment Letter (Probation Completed)
  - Probation Period Extension Letter
  - Notice of Contract Non-Renewal / Cessation
- **Customizable Letterhead**: Corporate headers, reference numbers (`MPB/HC/RPM/...`), salary terms, and signature authorizations.
- **Direct A4 Print & PDF Export**: Optimized browser print styles formatted specifically for A4 portrait printing without UI artifacts.

### 7. Audit Logging & Local Persistence
- **Activity Log**: Tracks every administrative action (status updates, MRF submissions, letter issuances, email dispatches) with timestamps.
- **Browser-Safe Storage**: Instant local storage persistence with fallback to 30 synthetic Malaysian corporate employee records.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Motion & Transitions**: [Motion](https://motion.dev/)
- **Persistence**: LocalStorage with automatic schema hydration

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

- To preview the production build locally:
  ```bash
  npm run preview
  ```

---

## 📁 Project Structure

```text
├── index.html                   # HTML entry point with metadata & web fonts
├── metadata.json                # AI Studio application metadata
├── package.json                 # Project configuration & npm dependencies
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS & server setup
├── .env.example                 # Environment configuration template
└── src/
    ├── App.tsx                  # Root application component & global state orchestrator
    ├── main.tsx                 # React DOM mount entry point
    ├── index.css                # Tailwind CSS v4 directives & A4 print media queries
    ├── components/
    │   ├── Header.tsx           # Corporate navigation bar with audit log & export triggers
    │   ├── ExecutiveKPIs.tsx    # Executive status summary cards
    │   ├── FilterBar.tsx        # Search input, department filters, and action type toggles
    │   ├── EmployeeTable.tsx    # High-density employee directory with row actions
    │   ├── DepartmentSummaryView.tsx # Departmental breakdown & batch email trigger
    │   ├── HODEmailModal.tsx    # Modal for composing and dispatching HOD notifications
    │   ├── MRFFormModal.tsx     # Manpower Requisition Form appraisal modal
    │   ├── CorporateLetterModal.tsx # Corporate letter generator with A4 print preview
    │   ├── EmployeeEditModal.tsx# Add/edit employee record modal
    │   └── ActivityLogModal.tsx # Administrative activity & audit history modal
    ├── data/
    │   └── mockEmployees.ts     # 30 synthetic Malaysian corporate records for testing
    ├── types/
    │   └── hr.ts                # TypeScript interfaces for employees, MRF, and letters
    └── utils/
        ├── dateUtils.ts         # Days-to-due calculations & localized date formatting
        ├── letterTemplates.ts   # Formal Malaysian corporate letter templates
        └── storage.ts           # LocalStorage helpers and audit logger
```

---

## 📋 Malaysian Corporate HR Compliance Notes

- **Identity Verification**: Fields adhere to the Malaysian National Registration Identity Card (NRIC) standard format (`YYMMDD-PB-###G`).
- **Currency Standards**: Compensation benchmarks are structured in Malaysian Ringgit (`MYR`).
- **Probation & Renewal Notice Periods**: Adheres to typical Malaysian Employment Act guidelines and corporate 30/60/90-day evaluation milestones.
