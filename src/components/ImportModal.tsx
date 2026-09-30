import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Employee, ActionType, WorkflowStatus } from '../types/hr';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  ClipboardPaste,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportEmployees: (newEmployees: Employee[], mode: 'append' | 'replace') => void;
  departments: string[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportEmployees,
  departments,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'template'>('upload');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);
  const [rawPastedText, setRawPastedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper to normalize header keys
  const normalizeKey = (key: string): string => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Maps an untrusted row object into a validated Employee record
  const mapRowToEmployee = (row: Record<string, any>, index: number): Employee => {
    const keys = Object.keys(row);
    const getVal = (...aliases: string[]): string => {
      for (const alias of aliases) {
        const target = normalizeKey(alias);
        for (const k of keys) {
          if (normalizeKey(k) === target || normalizeKey(k).includes(target)) {
            const v = row[k];
            return v !== undefined && v !== null ? String(v).trim() : '';
          }
        }
      }
      return '';
    };

    // Employee Code
    let code = getVal('employeecode', 'staffno', 'staffid', 'empcode', 'id', 'no', 'pekerja');
    if (!code) {
      code = `MP${10000 + index + Math.floor(Math.random() * 900)}`;
    }

    // Name
    let name = getVal('name', 'fullname', 'employeename', 'nama', 'pekerja');
    if (!name) {
      name = `Staff Member ${code}`;
    }

    // NRIC
    let nric = getVal('nric', 'ic', 'icno', 'passport', 'nokp');
    if (!nric) {
      const year = 85 + (index % 15);
      nric = `${year}0101-14-${1000 + (index % 9000)}`;
    }

    // Business Unit
    let businessUnit = getVal('businessunit', 'company', 'syarikat', 'bu');
    if (!businessUnit) {
      businessUnit = 'Media Prima Berhad';
    }

    // Department
    let department = getVal('department', 'dept', 'bahagian', 'jabatan');
    if (!department) {
      department = departments[0] || 'Group Finance';
    }

    // Position
    let positionTitle = getVal('positiontitle', 'position', 'jawatan', 'designation', 'role', 'title');
    if (!positionTitle) {
      positionTitle = 'Executive';
    }

    // Grade
    let jobGrade = getVal('jobgrade', 'grade', 'gred');
    if (!jobGrade) {
      jobGrade = 'E2';
    }

    // Action Type
    let actionRaw = getVal('actiontype', 'action', 'type', 'jenis');
    let actionType: ActionType = 'Contract Renewal';
    if (actionRaw.toLowerCase().includes('probation') || actionRaw.toLowerCase().includes('confirm')) {
      actionType = 'Probation Confirmation';
    }

    // Date Joined
    let dateJoined = getVal('datejoined', 'joined', 'joindate', 'tarikhmasuk', 'startdate');
    if (!dateJoined || !dateJoined.includes('-')) {
      dateJoined = '2024-10-01';
    }

    // Contract Expiry Date
    let contractExpiryDate = getVal('contractexpirydate', 'expirydate', 'enddate', 'duedate', 'tarikhtamat');
    if (!contractExpiryDate || !contractExpiryDate.includes('-')) {
      contractExpiryDate = '2026-11-30';
    }

    // Salary
    let salaryRaw = getVal('currentsalary', 'salary', 'gaji', 'basic', 'remuneration');
    let currentSalary = parseFloat(salaryRaw.replace(/[^0-9.]/g, '')) || 4500;

    // Superior / HOD
    let superiorName = getVal('superiorname', 'supervisor', 'superior', 'penyelia') || 'Dato\' Kamarul Ariffin bin Isa';
    let superiorDesignation = getVal('superiordesignation', 'superiortitle') || 'Head of Department';
    let hodName = getVal('hodname', 'hod', 'head') || superiorName;

    // Status
    let statusRaw = getVal('status', 'workflowstatus', 'state').toLowerCase();
    let status: WorkflowStatus = 'Pending Email';
    if (statusRaw.includes('mrf')) {
      status = 'Submission of MRF';
    } else if (statusRaw.includes('approval') || statusRaw.includes('review')) {
      status = 'Pending Approval';
    } else if (statusRaw.includes('letter') || statusRaw.includes('prep') || statusRaw.includes('ready')) {
      status = 'Letter Preparation';
    } else if (statusRaw.includes('complete') || statusRaw.includes('issued')) {
      status = 'Completed';
    } else if (statusRaw.includes('remind')) {
      status = 'Pending Reminder';
    }

    return {
      id: `emp-imp-${Date.now()}-${index}`,
      employeeCode: code,
      name,
      nric,
      businessUnit,
      department,
      positionTitle,
      jobGrade,
      actionType,
      dateJoined,
      contractExpiryDate,
      currentSalary,
      superiorName,
      superiorDesignation,
      hodName,
      status,
      remarks: getVal('remarks', 'notes', 'catatan') || 'Imported via bulk upload tool',
      emailSentDate: null,
      mrfData: undefined,
      letterData: undefined,
    };
  };

  // Process raw binary file (Excel / CSV / PDF)
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setParseError('');
    setFileName(file.name);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'xlsx' || extension === 'xls' || extension === 'csv' || extension === 'tsv') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        if (!rawJson || rawJson.length === 0) {
          throw new Error('The uploaded file does not contain any readable data rows.');
        }

        const employees = rawJson.map((row, idx) => mapRowToEmployee(row, idx));
        setParsedEmployees(employees);
      } else if (extension === 'pdf') {
        // For PDF files: extract textual streams or lines
        const text = await file.text();
        // Fallback: check if text has employee pattern
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        const rows: Record<string, string>[] = [];

        for (const line of lines) {
          const parts = line.split(/[,\t|]/).map((p) => p.trim());
          if (parts.length >= 3) {
            rows.push({
              code: parts[0] || '',
              name: parts[1] || '',
              department: parts[2] || '',
              position: parts[3] || '',
              expiry: parts[4] || '',
            });
          }
        }

        if (rows.length === 0) {
          throw new Error(
            'Could not automatically parse tabular lines from PDF. You can also paste the text directly into the "Paste Data" tab!'
          );
        }

        const employees = rows.map((row, idx) => mapRowToEmployee(row, idx));
        setParsedEmployees(employees);
      } else {
        throw new Error('Unsupported file format. Please upload .xlsx, .xls, .csv, .tsv, or .pdf files.');
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setParseError(err.message || 'Failed to read or parse file. Please check format.');
      setParsedEmployees([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse pasted table text (from Google Sheets or Excel copy-paste)
  const handleParsePastedText = () => {
    if (!rawPastedText.trim()) {
      setParseError('Please paste some tabular data or CSV rows first.');
      return;
    }

    setIsProcessing(true);
    setParseError('');

    try {
      const lines = rawPastedText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('Pasted content must have at least a header row and one data row.');
      }

      // Detect separator: Tab (Google Sheet/Excel copy) or Comma (CSV)
      const firstLine = lines[0];
      const separator = firstLine.includes('\t') ? '\t' : ',';

      const headers = firstLine.split(separator).map((h) => h.replace(/^["']|["']$/g, '').trim());

      const dataRows = lines.slice(1).map((line) => {
        const values = line.split(separator).map((v) => v.replace(/^["']|["']$/g, '').trim());
        const rowObj: Record<string, string> = {};
        headers.forEach((h, i) => {
          rowObj[h] = values[i] || '';
        });
        return rowObj;
      });

      const employees = dataRows.filter((r) => Object.values(r).some((v) => v)).map((r, idx) => mapRowToEmployee(r, idx));

      if (employees.length === 0) {
        throw new Error('No valid employee records could be identified.');
      }

      setParsedEmployees(employees);
      setFileName('Pasted Clipboard Table');
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse pasted data.');
      setParsedEmployees([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download official CSV template
  const handleDownloadSampleTemplate = (format: 'csv' | 'xlsx') => {
    const templateData = [
      {
        'Employee Code': 'MP10401',
        'Full Name': 'Muhammad Faiz bin Razak',
        'NRIC': '930412-14-5541',
        'Business Unit': 'Media Prima Berhad',
        'Department': 'Group Corporate Communications',
        'Position Title': 'Senior Communications Executive',
        'Grade': 'E2',
        'Action Type': 'Contract Renewal',
        'Date Joined': '2023-11-01',
        'Contract Expiry Date': '2026-10-31',
        'Salary (MYR)': 5400,
        'Superior Name': 'Dato\' Kamarul Ariffin bin Isa',
        'HOD Name': 'Dato\' Kamarul Ariffin bin Isa',
        'Remarks': 'Strong performer, recommended for renewal',
      },
      {
        'Employee Code': 'MP10402',
        'Full Name': 'Nurul Syafiqah binti Aziz',
        'NRIC': '950821-10-5892',
        'Business Unit': 'Media Prima Berhad',
        'Department': 'Group Finance',
        'Position Title': 'Finance Executive',
        'Grade': 'E1',
        'Action Type': 'Probation Confirmation',
        'Date Joined': '2026-04-01',
        'Contract Expiry Date': '2026-10-01',
        'Salary (MYR)': 4200,
        'Superior Name': 'Pn. Sharifah Zubaidah',
        'HOD Name': 'Dato\' Kamarul Ariffin bin Isa',
        'Remarks': 'Satisfactory probation completion',
      },
    ];

    if (format === 'csv') {
      const headers = Object.keys(templateData[0]);
      const rows = templateData.map((d) => Object.values(d).map((v) => `"${v}"`).join(','));
      const csv = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'MediaPrima_Employee_Import_Template.csv';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 300);
    } else {
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');
      XLSX.writeFile(wb, 'MediaPrima_Employee_Import_Template.xlsx');
    }
  };

  // Submit and save records
  const handleConfirmImport = () => {
    if (parsedEmployees.length === 0) return;
    onImportEmployees(parsedEmployees, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Import Employee Records
              </h2>
              <p className="text-[11px] text-slate-500">
                Bulk upload from Excel (.xlsx/.xls), Google Sheets, CSV, or PDF
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

        {/* Tab Selection */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Upload File (.xlsx / .csv / .pdf)</span>
            </button>

            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'paste'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paste from Google Sheets / Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('template')}
              className={`px-3 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'template'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Template</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            Auto-detects columns and formats
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.tsv,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Click to browse or drag & drop file here
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>), Google Sheets export (<strong>.csv</strong>), or <strong>.pdf</strong> documents
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">.XLSX</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">.CSV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">.PDF</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Paste from Google Sheets / Excel */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                Copy cells directly from Google Sheets or Excel (including headers) and paste them here:
              </div>
              <textarea
                rows={6}
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                placeholder="Employee Code	Full Name	Department	Position Title	Expiry Date
MP10401	Ahmad Daniel	Group IT	Senior Software Engineer	2026-11-30
MP10402	Nurul Iman	Group Finance	Accountant	2026-10-31"
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParsePastedText}
                  disabled={isProcessing || !rawPastedText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Parse Pasted Content</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Download Template */}
          {activeTab === 'template' && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Standard Media Prima Bulk Import Templates
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download pre-formatted templates with exact column headers matching Media Prima's Human Capital HR format:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDownloadSampleTemplate('xlsx')}
                  className="p-4 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl transition-all text-left flex items-start gap-3 shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Excel Format (.xlsx)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Ready for Microsoft Excel and Office 365
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDownloadSampleTemplate('csv')}
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl transition-all text-left flex items-start gap-3 shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                      CSV / Google Sheet (.csv)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Universal UTF-8 format for Google Sheets & databases
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Parsing Error Notice */}
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Results Preview */}
          {parsedEmployees.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Successfully parsed <strong className="text-indigo-600">{parsedEmployees.length}</strong> employee records from {fileName}
                  </span>
                </div>

                {/* Import Mode selection */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Mode:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Append / Update</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer ml-2">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Replace Directory</span>
                  </label>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Code</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3">Position</th>
                      <th className="py-2 px-3">Action Type</th>
                      <th className="py-2 px-3">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedEmployees.slice(0, 10).map((emp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">{emp.employeeCode}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{emp.name}</td>
                        <td className="py-2 px-3 text-slate-600">{emp.department}</td>
                        <td className="py-2 px-3 text-slate-600">{emp.positionTitle}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              emp.actionType === 'Contract Renewal'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {emp.actionType}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700">{emp.contractExpiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedEmployees.length > 10 && (
                <div className="px-4 py-1.5 bg-slate-50 text-[11px] text-slate-500 border-t border-slate-100 text-center">
                  + {parsedEmployees.length - 10} more rows will be imported
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedEmployees.length > 0 ? (
              <span>Ready to import {parsedEmployees.length} employees</span>
            ) : (
              <span>Upload or paste data above to preview records</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={parsedEmployees.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirm & Import ({parsedEmployees.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
