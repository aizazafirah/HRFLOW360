import React, { useState, useMemo } from 'react';
import { Employee, WorkflowStatus } from '../types/hr';
import { formatDate } from '../utils/dateUtils';
import { X, Copy, Check, Send, Mail, Building2, Calendar, AlertCircle } from 'lucide-react';

interface HODEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  initialDepartment?: string;
  onMarkEmailSent: (employeeIds: string[], department: string) => void;
  departments: string[];
}

export const HODEmailModal: React.FC<HODEmailModalProps> = ({
  isOpen,
  onClose,
  employees,
  initialDepartment,
  onMarkEmailSent,
  departments,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(
    initialDepartment || (departments[0] || 'Group Finance')
  );
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('October 2026');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Filter employees belonging to the selected department
  const departmentEmployees = useMemo(() => {
    return employees.filter((e) => e.department === selectedDept);
  }, [employees, selectedDept]);

  // Target department HOD name
  const hodName = departmentEmployees[0]?.hodName || 'Head of Department';

  // Current year & month for subject
  const currentYear = '2026';
  const emailSubject = `[${selectedDept}] : Notification of Renewal for ${currentYear} - ${selectedMonthYear}`;

  const emailBodyIntro = `Dear ${hodName} / Sir / Madam,\n\nPlease refer to the names list of employees in your department, who are due for End of Contract / Probationary Review by ${selectedMonthYear}.`;

  const emailBodyClosing = `Please share the complete Manpower Requisition Form (MRF) for the employee(s) with expired or upcoming contract end dates so we can finalize the renewal process.\n\nShould you require any clarification regarding the evaluation rubric or compensation benchmarks, please do not hesitate to reach out to the undersigned.\n\nThank you.\n\nBest regards,\nGroup Human Capital Division\nMedia Prima Berhad\nBalai Berita, 31 Jalan Riong, Bangsar, 59100 Kuala Lumpur`;

  if (!isOpen) return null;

  // Build raw HTML table string for clipboard
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
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; text-align: left; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Business Unit</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Department</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Employee Code</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Employee Name</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">Position Title</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">DATE JOINED</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">CONTRACT EXPIRY DATE</th>
            <th style="padding: 9px 12px; font-size: 11px; text-transform: uppercase;">REMARKS</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  };

  const handleCopyFullEmail = async () => {
    const plainTable = departmentEmployees
      .map(
        (e) =>
          `[${e.businessUnit}] | ${e.department} | ${e.employeeCode} | ${e.name} | ${e.positionTitle} | Joined: ${formatDate(
            e.dateJoined
          )} | Expiry: ${formatDate(e.contractExpiryDate)} | Remarks: ${e.remarks}`
      )
      .join('\n');

    const fullPlainText = `SUBJECT: ${emailSubject}\n\n${emailBodyIntro}\n\n${plainTable}\n\n${emailBodyClosing}`;
    const fullHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b;">
        <p><strong>Subject:</strong> ${emailSubject}</p>
        <p>${emailBodyIntro.replace(/\n\n/g, '</p><p>')}</p>
        <br/>
        ${generateTableHtml()}
        <br/>
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

  const handleMarkSent = () => {
    const ids = departmentEmployees.map((e) => e.id);
    onMarkEmailSent(ids, selectedDept);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                HOD Notification Email Composer
              </h2>
              <p className="text-xs text-slate-500">
                Itemized 8-column employee reminder table & MRF submission request
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

        {/* Configuration Row: Dept + Month Picker */}
        <div className="px-6 py-3.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Target Department:</span>
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} ({employees.filter((e) => e.department === dept).length} staff)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Target Cycle:</span>
            </div>
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
        </div>

        {/* Email Preview Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Email Subject Field */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Subject Line
            </div>
            <div className="text-sm font-semibold text-slate-900 font-mono">
              {emailSubject}
            </div>
          </div>

          {/* Salutation & Intro */}
          <div className="space-y-2 text-slate-700 leading-relaxed bg-white p-4 border border-slate-200 rounded-xl">
            <p className="font-semibold text-slate-900">
              Dear {hodName} / Head of Department,
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
                    <th className="py-2.5 px-3 whitespace-nowrap">Employee Code</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Employee Name</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Position Title</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">DATE JOINED</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">CONTRACT EXPIRY</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">REMARKS</th>
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
                        <td className="py-2 px-3 text-slate-600 text-[11px] max-w-[180px] truncate" title={emp.remarks}>
                          {emp.remarks || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Closing Requirement Text */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Action Required: Manpower Requisition Form (MRF) Submission</span>
              </p>
              <p>
                Please share the complete <strong>Manpower Requisition Form (MRF)</strong> for the
                employee(s) with expired or upcoming contract end dates so we can finalize the renewal
                and contract preparation process without operational disruption.
              </p>
            </div>

            <div className="pt-2 text-slate-600 space-y-1 text-xs">
              <p>Thank you for your prompt attention.</p>
              <p className="font-semibold text-slate-900 pt-2">Group Human Capital Division</p>
              <p className="text-slate-500 text-[11px]">
                Media Prima Berhad · Balai Berita, 31 Jalan Riong, Bangsar, 59100 Kuala Lumpur
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {departmentEmployees.length} employee(s) listed for <strong>{selectedDept}</strong>
          </div>

          <div className="flex items-center gap-2">
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
                  <span>Email & Table Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Email Content</span>
                </>
              )}
            </button>

            <button
              onClick={handleMarkSent}
              disabled={departmentEmployees.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Mark as Email Sent (Update to Pending Approval)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
