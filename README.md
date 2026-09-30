# Media Prima Berhad (MPB) - HR Renewal, Probation & Letter Management System

[![AI Studio Applet](https://img.shields.io/badge/AI%20Studio-Applet%20Live-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Test%20App-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b)
[![Branding](https://img.shields.io/badge/Media%20Prima%20Berhad-MPB-ED1D24?style=for-the-badge)](https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b)

---

## 🚀 Pautan Langsung & Ujian (Live Demo & Testing)

Untuk memudahkan mana-mana pengguna lain mengakses, mencuba dan menguji sistem ini secara langsung tanpa perlu memasang sebarang perisian:

🔗 **Pautan Rasmi Aplikasi (Live AI Studio Applet)**:  
👉 **[https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b](https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b)**

```
https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b
```

### 🧪 Panduan Cepat Ujian (Quick Testing Guide for Users):
1. **Akses Terus**: Buka pautan di atas pada mana-mana pelayar web (Chrome, Edge, Safari, Firefox).
2. **Borang Kosong MRF**: Klik butang **"Borang Kosong MRF"** di bar navigasi atas untuk melihat format rasmi borang kosong tanpa butiran staf, serta pilihan muat turun Word (.doc), PDF resolusi tinggi, atau cetak A4.
3. **Notifikasi Emel Jabatan**: Klik butang **"Notify HOD"** pada senarai pekerja untuk mencuba jana draf emel rasmi bersama pautan pengisian digital bagi jabatan (`?action=mrf&department=...`).
4. **Penjanaan Surat Rasmi**: Klik **"Letter (PDF / Print)"** pada mana-mana rekod untuk melihat surat rasmi (*Extension of Fixed-term Contract*, *Confirmation of Performance*, dll) dan muat turun PDF / cetak A4 terus.
5. **Pangkalan Data Awan**: Data diselaraskan secara langsung menggunakan Firebase Firestore & Google / Email Authentication.

---

An enterprise-grade HR operations management platform designed for Malaysian corporate environments (**Media Prima Berhad Group Human Capital - MPB**) to streamline fixed-term contract renewals, probation appraisals, Head of Department (HOD) notifications, blank Manpower Requisition Form (MRF) workflows, official corporate letter generation, and real-time cloud synchronization with Firebase Firestore & Authentication.

---

## 🌟 Key Features & Latest Updates

### 1. 🏢 Media Prima Berhad (MPB) Official Identity & Logo
- **Official Media Prima Vector Logo**:
  - Exact corporate vector logo featuring the iconic Media Prima Red (`#ED1D24`) box with white `media` wordmark alongside the solid black (`#111827`) `prima` wordmark directly beside it.
  - Accurate corporate identity adhering to official Media Prima brand guidelines.
  - Complete elimination of old "RPM" branding in favor of official **MPB** corporate identification across headers, document templates, table exports, and metadata.
  - Custom SVG favicon with official Media Prima logo styling.

### 2. 📋 Borang Kosong MRF (Blank Attachment & Department Digital Fill Link)
- **Zero Staff Details Requirement on Blank MRF**:
  - In accordance with corporate HR workflow, the Manpower Requisition Form (MRF) defaults to a pristine **Borang Kosong (Blank MRF Form)** without forced or pre-filled staff details.
  - Official template layout matching Media Prima Group Human Resources specifications with clean underline blanks (`___________`) across Sections A, B, C, D, E, and F.
- **Multiple Formats for Blank MRF Distribution**:
  - **Download Borang Kosong (.doc)**: Download official blank Microsoft Word document ready for physical or digital completion by departments.
  - **Download Borang Kosong (PDF)**: High-resolution (300dpi) clean printable blank PDF form with built-in `oklch` color sanitizer.
  - **Print A4 (Borang Kosong)**: Direct A4 portrait print dialog with automated removal of UI overlays, headers, and backgrounds.
- **Top Navigation "Borang Kosong MRF" Button**:
  - Instant one-click access button on the main navigation bar allowing HR officers and departments to immediately open, print, or download blank MRF forms.
- **Optional Auto-Fill Toggle**:
  - When opening MRF from a specific staff record, users have quick toggle buttons to switch between **Borang Kosong (Default)** and **Isi Butiran Staf (Auto-fill Staff Details)**.

### 3. 📧 Direct Department Email Dispatch & Digital MRF Link Attachment
- **Direct Department Addressing**:
  - `To:` and `Cc:` fields automatically pre-filled with the department HOD's email (`[department].hod@mediaprima.com.my`) and HR contract inboxes.
- **Embedded Digital MRF Access Link & Blank Form Attachment**:
  - Generates direct URL links for department self-service: `?action=mrf&department=[DepartmentName]`.
  - When opened by department heads, the link automatically launches the clean MRF appraisal form ready for department completion.
  - Email notification includes clear notice of the attached blank MRF form for departments to fill out either digitally or via the attached template.
- **Dual Send Mechanisms**:
  - **Send via Email Client (`mailto:`)**: Launches default email client (Outlook, Gmail, Apple Mail) with the formatted 8-column table, recipient, and MRF links pre-populated, simultaneously transitioning workflow status to `Pending Approval`.
  - **Direct Dispatch & Mark Sent**: Simulates instant in-portal dispatch and transitions all department staff to `Pending Approval` in Firestore.
  - **Copy Full Email (HTML & Table)**: One-click copy with preserved rich-text tables for pasting directly into webmail.

### 4. 📄 100% Exact Corporate HR Letter Templates, Direct PDF Export & Print A4
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
  - **Print A4 (Dedicated Print Engine)**: Direct browser print dialog tuned with pure `@media print` CSS for standard A4 portrait paper (15mm margins). Automatically isolates the letter on crisp white paper.
  - **Download Word (.doc)**: Formatted Microsoft Word document compatible with Microsoft Office and Google Docs.
  - **One-Click Quick Action**: **"Letter (PDF / Print)"** button directly on every row in the employee directory table.

### 5. 🔐 Firebase Cloud Integration & Authentication (Login & Sign Up)
- **Firebase Firestore Database**: Real-time cloud persistence for employee records (`employees`), compliance audit trails (`activity_logs`), and user profiles (`users`).
- **Resilient Multi-Layer Storage**: Automatically synchronizes data with Firestore in real-time while maintaining local storage caching for lightning-fast offline resilience.
- **Enterprise Security Rules**: Deployed zero-trust `firestore.rules` with public directory read access to prevent cold-boot permission issues, while protecting records and audit logs.
- **HR Authentication System**:
  - **Google Sign-In**: Seamless one-click authentication via Google popup.
  - **Email & Password Login & Sign-Up**: Register new HR officers or sign in to authorized portal accounts.
  - **User Profile Management**: Synchronizes officer display names, emails, avatars, and roles directly to Firestore.

### 6. 📥 Bulk Data Import (Excel, Google Sheets & PDF)
- **Universal File Upload**: Accepts Microsoft Excel (`.xlsx`, `.xls`), Google Sheets export (`.csv`, `.tsv`), and `.pdf` documents.
- **Direct Copy-Paste Table**: Copy rows directly from Google Sheets or Excel (Ctrl+C) and paste (Ctrl+V) for instant parsing.
- **Intelligent Header Normalizer**: Auto-maps varying column headers (Staff No, Full Name, NRIC, Department, Position, Expiry Date, Salary, HOD).
- **Interactive Pre-Import Preview**: View detected records, choose between *Append/Update* or *Replace Directory*, and verify before committing to Firestore.
- **Sample Template Downloads**: Built-in downloads for sample `.xlsx` and `.csv` templates.

### 7. 📊 Executive Dashboard & Real-Time KPIs
- **Dynamic KPI Tiles**: Quick breakdown of active records, overdue expiries, pending emails, pending approvals, MRF submissions, and completed renewals.
- **Filter Bar**: Real-time searching by employee name, staff code (`MP...`), department dropdown, urgency badges, and workflow status.
- **Department Summary View**: Aggregated department cards showing total headcount, renewal breakdowns, pending actions, and one-click bulk email compose.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons.
- **Document Generation**: `jspdf`, `html2canvas` (with oklch canvas color sanitizer), native HTML/Word document export.
- **Print Engine**: Pure `@media print` A4 portrait style isolation.
- **Backend / Database**: Google Firebase Firestore (persistent cloud database) + Firebase Auth (Google & Email/Password).
- **Build Tool**: Vite, Node.js.
- **Live Applet**: [https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b](https://ai.studio/apps/142826ab-625d-486a-8c9c-0ee56a57443b)

---

## 🚀 Getting Started Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
