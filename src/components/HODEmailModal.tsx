import React, { useState, useMemo } from 'react';
import { Employee } from '../types/hr';
import { formatDate } from '../utils/dateUtils';
import {
  X,
  Copy,
  Check,
  Send,
  Mail,
  Building2,
  Calendar,
  AlertCircle,
  Link,
  ExternalLink,
  AtSign,
  FileCheck2,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

interface HODEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  initialDepartment?: string;
  onMarkEmailSent: (employeeIds: string[], department: string) => void;
  departments: string[];
  onOpenMRF?: (employee?: Employee | null) => void;
}

export const HODEmailModal: React.FC<HODEmailModalProps> = ({
  isOpen,
  onClose,
  employees,
  initialDepartment,
  onMarkEmailSent,
  departments,
  onOpenMRF,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(
    initialDepartment || departments[0] || 'Group Finance'
  );
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('October 2026');
  const [copied, setCopied] = useState<boolean>(false);
  const [includeMrfLinks, setIncludeMrfLinks] = useState<boolean>(true);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  // Filter employees belonging to the selected department
  const departmentEmployees = useMemo(() => {
    return employees.filter((e) => e.department === selectedDept);
  }, [employees, selectedDept]);

  // Target department HOD name
  const defaultHod = departmentEmployees[0]?.hodName || 'Head of Department';
  const [hodName, setHodName] = useState<string>(defaultHod);

  // Recipient Email addresses
  const defaultDeptEmail = `${selectedDept.toLowerCase().replace(/[^a-z0-9]/g, '')}.hod@mediaprima.com.my`;
  const [toEmail, setToEmail] = useState<string>(defaultDeptEmail);
  const [ccEmail, setCcEmail] = useState<string>(
    'humancapital.contracts@mediaprima.com.my, database.mgmt@mediaprima.com.my'
  );

  // Update recipient email whenever department changes
  const handleDepartmentChange = (dept: string) => {
    setSelectedDept(dept);
    const newDeptEmployees = employees.filter((e) => e.department === dept);
    const newHod = newDeptEmployees[0]?.hodName || 'Head of Department';
    setHodName(newHod);
    setToEmail(`${dept.toLowerCase().replace(/[^a-z0-9]/g, '')}.hod@mediaprima.com.my`);
  };

  const currentYear = '2026';
  const emailSubject = `[${selectedDept}] : Notification of Contract Renewal & MRF Appraisal Request for ${currentYear} - ${selectedMonthYear}`;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mediaprima-hrflow360.web.app';
  const deptPortalLink = `${baseUrl}/?action=mrf&department=${encodeURIComponent(selectedDept)}`;

  const getEmployeeMRFLink = (emp: Employee) => {
    return `${baseUrl}/?action=mrf&employeeId=${emp.id}`;
  };

  if (!isOpen) return null;

  // Build raw HTML table string for clipboard and email clients
  const generateTableHtml = () => {
    const rows = departmentEmployees
      .map(
        (emp) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 12px; color: #1e293b;">${emp.businessUnit}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #1e293b;">${emp.department}</td>
        <td style="padding: 8px 12px; font-size: 12px; font-family: monospace; font-weight: bold; color: #0f172a;">${emp.employeeCode}</td>
        <td style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: #0f172a;">${emp.name}</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #334155;">${emp.positionTitle} (Grade ${emp.jobGrade})</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #475569;">${formatDate(emp.dateJoined)}</td>
        <td style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: #b91c1c;">${formatDate(emp.contractExpiryDate)}</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #64748b;">${emp.remarks || '-'}</td>
      </tr>
    `
      )
      .join('');

    return `
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; text-align: left; border: 1px solid #cbd5e1; margin: 12px 0;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Business Unit</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Department</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Employee Code</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Employee Name</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Position Title</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">DATE JOINED</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">CONTRACT EXPIRY</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">REMARKS</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  };

  const generateMRFAttachmentsHtml = () => {
    if (!includeMrfLinks) return '';

    return `
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
          📎 Lampiran & Pautan Borang MRF (Manpower Requisition Form):
        </h4>
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #475569;">
          Pihak jabatan boleh melengkapkan borang perakuan secara terus melalui pautan digital di bawah atau menggunakan lampiran borang kosong yang disertakan:
        </p>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
          <div style="font-size: 12px; margin-bottom: 8px;">
            <strong>🌐 Pautan Borang MRF Digital Jabatan:</strong><br/>
            <a href="${deptPortalLink}" style="color: #4338ca; text-decoration: underline; font-weight: bold;" target="_blank">
              ${deptPortalLink}
            </a>
          </div>
          <div style="font-size: 12px; color: #334155;">
            <strong>📎 Lampiran:</strong> Borang Kosong Manpower Requisition Form (MRF Form - Format Rasmi Media Prima Berhad)
          </div>
        </div>
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          * Sila lengkapkan borang bagi setiap kakitangan yang terlibat untuk melancarkan urusan pembaharuan / pengesahan jawatan.
        </p>
      </div>
    `;
  };

  const emailBodyIntro = `Dear ${hodName} / Head of Department,\n\nPlease refer to the names list of employees in your department, who are due for End of Contract or Probationary Review by ${selectedMonthYear}.`;

  const getPlainMRFText = () => {
    if (!includeMrfLinks) return '';
    return `\n\n=======================================================\nLAMPIRAN & PAUTAN BORANG MRF (MANPOWER REQUISITION FORM):\n=======================================================\n1. Pautan Borang MRF Digital Jabatan:\n   ${deptPortalLink}\n\n2. Lampiran Fail: Borang Kosong MRF (Blank Manpower Requisition Form)\n   Pihak jabatan boleh melengkapkan borang perakuan secara terus melalui pautan digital di atas atau menggunakan borang kosong yang dilampirkan.\n=======================================================\n`;
  };

  const emailBodyClosing = `Please submit the completed Manpower Requisition Form (MRF) for the employee(s) with expired or upcoming contract end dates so that Group Human Capital can finalize the renewal and contract preparation process without operational disruption.\n\nShould you require any clarification regarding the evaluation rubric or compensation benchmarks, please do not hesitate to reach out to the undersigned.\n\nThank you.\n\nBest regards,\nGroup Human Capital Division\nMedia Prima Berhad\nBalai Berita, 31 Jalan Riong, Bangsar, 59100 Kuala Lumpur`;

  // Build full plain text for mailto and clipboard
  const getFullPlainText = () => {
    const plainTable = departmentEmployees
      .map(
        (e) =>
          `[${e.businessUnit}] | ${e.department} | ${e.employeeCode} | ${e.name} | ${e.positionTitle} | Joined: ${formatDate(
            e.dateJoined
          )} | Expiry: ${formatDate(e.contractExpiryDate)} | Remarks: ${e.remarks}`
      )
      .join('\n');

    return `To: ${toEmail}\nCc: ${ccEmail}\nSubject: ${emailSubject}\n\n${emailBodyIntro}\n\n${plainTable}${getPlainMRFText()}\n\n${emailBodyClosing}`;
  };

  // Copy Formatted Rich-Text Email
  const handleCopyFullEmail = async () => {
    const fullPlainText = getFullPlainText();
    const fullHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b;">
        <p><strong>To:</strong> ${toEmail}</p>
        <p><strong>Cc:</strong> ${ccEmail}</p>
        <p><strong>Subject:</strong> ${emailSubject}</p>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 12px 0;"/>
        <p>${emailBodyIntro.replace(/\n\n/g, '</p><p>')}</p>
        ${generateTableHtml()}
        ${generateMRFAttachmentsHtml()}
        <p>${emailBodyClosing.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>
      </div>
    `;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([fullPlainText], { type: 'text/plain' });
        const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(fullPlainText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy formatted email:', err);
      navigator.clipboard.writeText(fullPlainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 1. Direct Dispatch via default email client (mailto:)
  const handleSendViaEmailClient = () => {
    const ids = departmentEmployees.map((e) => e.id);
    const plainBody = `${emailBodyIntro}\n\n${departmentEmployees
      .map(
        (e) =>
          `• ${e.employeeCode} - ${e.name} (${e.positionTitle}) | Expiry: ${formatDate(
            e.contractExpiryDate
          )}`
      )
      .join('\n')}${getPlainMRFText()}\n\n${emailBodyClosing}`;

    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?cc=${encodeURIComponent(
      ccEmail
    )}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(plainBody)}`;

    // Open mail client
    window.location.href = mailtoUrl;

    // Transition workflow state in database
    onMarkEmailSent(ids, selectedDept);
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1500);
  };

  // 2. Direct In-App Dispatch
  const handleDirectDispatch = () => {
    const ids = departmentEmployees.map((e) => e.id);
    onMarkEmailSent(ids, selectedDept);
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Compose Email to Department HOD
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  MRF Link Included
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direct HOD email dispatch with online Manpower Requisition Form (MRF) access links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Row: Dept + Month Picker + Recipient Info */}
        <div className="px-6 py-3.5 bg-slate-100/80 border-b border-slate-200 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Department:
              </span>
              <select
                value={selectedDept}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} ({employees.filter((e) => e.department === dept).length} staff)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Target Cycle:
              </span>
              <select
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              >
                <option value="September 2026">September 2026 (Overdue)</option>
                <option value="October 2026">October 2026 (&lt;30 Days)</option>
                <option value="November 2026">November 2026 (&lt;60 Days)</option>
                <option value="December 2026">December 2026</option>
                <option value="Q4 2026 / Q1 2027">All Upcoming Cycles</option>
              </select>
            </div>

            {/* Toggle: Include MRF Links */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs select-none">
              <input
                type="checkbox"
                checked={includeMrfLinks}
                onChange={(e) => setIncludeMrfLinks(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-indigo-600" />
                <span>Attach MRF Access Links</span>
              </span>
            </label>
          </div>

          {/* Email Addressing (To & CC) Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] w-8">To:</span>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="hod.email@mediaprima.com.my"
                className="w-full text-xs font-mono text-slate-900 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] w-8">Cc:</span>
              <input
                type="text"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="cc emails..."
                className="w-full text-xs font-mono text-slate-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {isDispatched && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Notification email dispatched to {toEmail}! All {departmentEmployees.length} staff
              records updated to "Pending Approval".
            </span>
          </div>
        )}

        {/* Email Preview Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1 bg-slate-50/50">
          {/* Email Subject Field */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Subject
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
              {emailSubject}
            </div>
          </div>

          {/* Salutation & Intro */}
          <div className="space-y-3 text-slate-700 leading-relaxed bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
            <p className="font-semibold text-slate-900 text-sm">
              Dear {hodName} / Head of {selectedDept},
            </p>
            <p>
              Please refer to the names list of employees in your department, who are due for End of
              Contract or Probationary Review by <strong className="text-slate-900">{selectedMonthYear}</strong>.
            </p>

            {/* 8-Column Embedded Table */}
            <div className="my-4 overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold text-[11px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">Business Unit</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Department</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Staff ID</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Employee Name</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Position Title</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Date Joined</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Contract Expiry</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {departmentEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No employees found under {selectedDept}
                      </td>
                    </tr>
                  ) : (
                    departmentEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                          {emp.businessUnit}
                        </td>
                        <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                          {emp.department}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {emp.employeeCode}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {emp.name}
                        </td>
                        <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                          {emp.positionTitle} ({emp.jobGrade})
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(emp.dateJoined)}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-700 whitespace-nowrap">
                          {formatDate(emp.contractExpiryDate)}
                        </td>
                        <td
                          className="py-2 px-3 text-slate-600 text-[11px] max-w-[180px] truncate"
                          title={emp.remarks}
                        >
                          {emp.remarks || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* DIRECT MRF ACCESS LINKS (ATTACHMENT) */}
            {includeMrfLinks && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      📎 Lampiran Borang Kosong & Pautan MRF Digital Jabatan
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded">
                    Borang Kosong Dilampirkan
                  </span>
                </div>

                <p className="text-slate-600 text-xs">
                  Pihak jabatan boleh melengkapkan borang perakuan pembaharuan / pengesahan jawatan secara terus
                  melalui pautan digital jabatan di bawah atau mencetak / memuat turun lampiran borang kosong yang disediakan:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Digital Portal Link Box */}
                  <div className="bg-white border border-indigo-200 rounded-lg p-3 shadow-2xs flex flex-col justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pautan Borang MRF Digital ({selectedDept})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 break-all font-mono">
                        {deptPortalLink}
                      </div>
                    </div>
                    {onOpenMRF && (
                      <button
                        type="button"
                        onClick={() => onOpenMRF(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center justify-center gap-1.5 w-full cursor-pointer"
                      >
                        <span>Buka Borang MRF Digital (Borang Kosong)</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Blank MRF Form Attachment Box */}
                  <div className="bg-white border border-indigo-200 rounded-lg p-3 shadow-2xs flex flex-col justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Borang Kosong MRF (Blank Attachment)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Format rasmi Media Prima Berhad (MPB) tanpa butiran kakitangan. Sedia untuk diisi oleh jabatan / HOD.
                      </div>
                    </div>
                    {onOpenMRF && (
                      <button
                        type="button"
                        onClick={() => onOpenMRF(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center justify-center gap-1.5 w-full cursor-pointer"
                      >
                        <span>Buka / Cetak Borang Kosong (A4)</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-0.5">
                  * Borang kosong dilampirkan bersama pautan langsung bagi memudahkan pengisian kendiri oleh jabatan.
                </div>
              </div>
            )}

            {/* Action Required Callout */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 text-amber-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Action Required: Submission of MRF</span>
              </p>
              <p className="leading-relaxed">
                Please complete and confirm the recommendations in the Manpower Requisition Form (MRF)
                for all staff with expiring contracts to enable Group Human Capital to proceed with
                letter issuance and contract finalization.
              </p>
            </div>

            <div className="pt-2 text-slate-600 space-y-1 text-xs">
              <p>Thank you for your prompt attention and cooperation.</p>
              <p className="font-bold text-slate-900 pt-2">Group Human Capital Division</p>
              <p className="text-slate-500 text-[11px]">
                Media Prima Berhad · Balai Berita, 31 Jalan Riong, Bangsar, 59100 Kuala Lumpur
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Sending to <strong>{toEmail}</strong> ({departmentEmployees.length} staff)
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Email Button */}
            <button
              onClick={handleCopyFullEmail}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Email & MRF Links Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Full Email Content</span>
                </>
              )}
            </button>

            {/* Send via Default Email Client (mailto:) */}
            <button
              onClick={handleSendViaEmailClient}
              disabled={departmentEmployees.length === 0}
              title="Launch Outlook / Gmail client with recipient, subject, and MRF links pre-filled"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send via Email Client (mailto:)</span>
            </button>

            {/* Direct In-App Dispatch */}
            <button
              onClick={handleDirectDispatch}
              disabled={departmentEmployees.length === 0}
              title="Dispatch notification inside portal and mark workflow as 'Pending Approval'"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Direct Dispatch & Mark Sent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
