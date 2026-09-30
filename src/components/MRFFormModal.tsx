import React, { useState, useEffect } from 'react';
import { Employee, MRFRecord } from '../types/hr';
import { formatDate, formatCurrency, addMonths } from '../utils/dateUtils';
import {
  X,
  Printer,
  Save,
  CheckCircle,
  FileCheck2,
  Building,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
} from 'lucide-react';

interface MRFFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSaveMRF: (employeeId: string, mrfData: MRFRecord, submitStatus?: boolean) => void;
}

export const MRFFormModal: React.FC<MRFFormModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSaveMRF,
}) => {
  if (!isOpen || !employee) return null;

  // Initialize or hydrate MRF state from employee's current data or intelligent defaults
  const [formData, setFormData] = useState<MRFRecord>(() => {
    const existing = employee.mrfData;
    const defaultStartDate = employee.contractExpiryDate;
    const defaultEndDate = addMonths(defaultStartDate, 12);

    return {
      recommendationType: existing?.recommendationType || (employee.actionType === 'Probation Confirmation' ? 'Confirm' : 'Renew'),
      proposedPeriod: existing?.proposedPeriod || (employee.actionType === 'Probation Confirmation' ? 'Permanent Confirmation' : '12 Months (1 Year Extension)'),
      proposedStartDate: existing?.proposedStartDate || defaultStartDate,
      proposedEndDate: existing?.proposedEndDate || defaultEndDate,
      proposedSalary: existing?.proposedSalary || formatCurrency(employee.currentSalary * 1.05),
      justification: existing?.justification || `Employee has demonstrated strong performance, meeting all key quarterly deliverables in the ${employee.department}. Retaining this talent is critical for ongoing strategic business objectives.`,
      superiorRemarks: existing?.superiorRemarks || `Consistently exhibits professionalism, operational agility, and high teamwork standards. Strongly recommended for approval.`,
      headcountBudget: existing?.headcountBudget || 'Budgeted in AOP',
      superiorRecommendedDate: existing?.superiorRecommendedDate || '2026-09-20',
      hrVerifiedDate: existing?.hrVerifiedDate || '2026-09-25',
      hodApprovedDate: existing?.hodApprovedDate || null,
      status: existing?.status || 'Draft',
    };
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Update form if employee changes
  useEffect(() => {
    if (employee.mrfData) {
      setFormData(employee.mrfData);
    }
  }, [employee]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = (submit: boolean = false) => {
    const updatedMRF: MRFRecord = {
      ...formData,
      status: submit ? 'Submitted' : formData.status,
      hodApprovedDate: submit ? new Date().toISOString().split('T')[0] : formData.hodApprovedDate,
    };
    onSaveMRF(employee.id, updatedMRF, submit);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (submit) onClose();
    }, 1500);
  };

  const formRefNo = `MRF/MPB/2026/${employee.employeeCode}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print-document-container">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[95vh] a4-print-sheet">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Manpower Requisition Form (MRF)
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Ref: {formRefNo} · {employee.name} ({employee.employeeCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark MRF Submitted</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>MRF Form details successfully updated and saved to local storage!</span>
          </div>
        )}

        {/* Printable Official Form Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-900 flex-1">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              MEDIA PRIMA BERHAD (GROUP HUMAN CAPITAL DIVISION)
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              MANPOWER REQUISITION FORM (MRF)
            </h1>
            <div className="text-xs font-semibold text-slate-700 tracking-wide mt-0.5">
              CONTRACT RENEWAL & PROBATION CONFIRMATION RECOMMENDATION
            </div>
            <div className="absolute right-0 top-0 text-right hidden sm:block">
              <span className="font-mono text-[10px] text-slate-500 block">FORM REF:</span>
              <span className="font-mono text-xs font-bold text-slate-900">{formRefNo}</span>
            </div>
          </div>

          {/* SECTION A: EMPLOYEE PARTICULARS */}
          <div className="space-y-2">
            <div className="bg-slate-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-sm uppercase tracking-wider flex items-center justify-between">
              <span>Section A: Employee Particulars (Pre-filled)</span>
              <span className="text-[10px] font-normal text-slate-300">Confidential HR Record</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Staff Code</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{employee.employeeCode}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Employee Full Name</span>
                <span className="font-bold text-slate-900 text-xs">{employee.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">NRIC / Passport No</span>
                <span className="font-mono text-slate-800 text-xs">{employee.nric}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Business Unit</span>
                <span className="font-medium text-slate-800 text-xs">{employee.businessUnit}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Department</span>
                <span className="font-medium text-slate-800 text-xs">{employee.department}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Position & Grade</span>
                <span className="font-semibold text-slate-900 text-xs">
                  {employee.positionTitle} (Grade {employee.jobGrade})
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Date Joined</span>
                <span className="font-mono text-slate-800 text-xs">{formatDate(employee.dateJoined)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Current Expiry / Review Date
                </span>
                <span className="font-mono font-bold text-rose-700 text-xs">
                  {formatDate(employee.contractExpiryDate)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Basic Salary</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {formatCurrency(employee.currentSalary)}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION B: PROPOSED RENEWAL / EXTENSION DETAILS */}
          <div className="space-y-2">
            <div className="bg-slate-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-sm uppercase tracking-wider">
              Section B: Proposed Renewal & Employment Recommendation
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
              {/* Recommendation Type Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase">
                  Superior Recommendation Decision:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'Renew', label: 'Contract Renewal' },
                    { value: 'Confirm', label: 'Permanent Confirmation' },
                    { value: 'Extend Probation', label: 'Extend Probation (PIP)' },
                    { value: 'Non-Renew', label: 'Non-Renewal / Expiry' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs ${
                        formData.recommendationType === option.value
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recommendationType"
                        value={option.value}
                        checked={formData.recommendationType === option.value}
                        onChange={(e) =>
                          setFormData({ ...formData, recommendationType: e.target.value as any })
                        }
                        className="hidden"
                      />
                      <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px]">
                        {formData.recommendationType === option.value && '✓'}
                      </span>
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Proposed Period & Salary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Proposed Contract Period / Duration:
                  </label>
                  <input
                    type="text"
                    value={formData.proposedPeriod}
                    onChange={(e) => setFormData({ ...formData, proposedPeriod: e.target.value })}
                    placeholder="e.g. 12 Months (01 Oct 2026 - 30 Sep 2027)"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Proposed Effective Start Date:
                  </label>
                  <input
                    type="date"
                    value={formData.proposedStartDate}
                    onChange={(e) => setFormData({ ...formData, proposedStartDate: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Proposed Recommended Remuneration:
                  </label>
                  <input
                    type="text"
                    value={formData.proposedSalary}
                    onChange={(e) => setFormData({ ...formData, proposedSalary: e.target.value })}
                    placeholder="e.g. RM 6,500 (Increment: RM 300)"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Headcount Budget Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  AOP Headcount Budget Status:
                </label>
                <div className="flex flex-wrap gap-4 text-xs">
                  {['Budgeted in AOP', 'Non-Budgeted', 'Replacement'].map((budget) => (
                    <label key={budget} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="headcountBudget"
                        value={budget}
                        checked={formData.headcountBudget === budget}
                        onChange={(e) => setFormData({ ...formData, headcountBudget: e.target.value as any })}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-slate-800">{budget}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: PERFORMANCE EVALUATION & JUSTIFICATION */}
          <div className="space-y-2">
            <div className="bg-slate-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-sm uppercase tracking-wider">
              Section C: Performance Evaluation & Recommendation Justification
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Key Operational Accomplishments & Justification:
                </label>
                <textarea
                  rows={3}
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Detail key accomplishments, KPIs delivered, and impact on business unit operations..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Superior Performance Appraisal Remarks:
                </label>
                <textarea
                  rows={2}
                  value={formData.superiorRemarks}
                  onChange={(e) => setFormData({ ...formData, superiorRemarks: e.target.value })}
                  placeholder="Provide supervisor appraisal remarks regarding leadership, discipline, attendance, and work quality..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION D: SIGN-OFF & APPROVAL BLOCKS */}
          <div className="space-y-2 print-avoid-break">
            <div className="bg-slate-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-sm uppercase tracking-wider">
              Section D: Corporate Sign-Off & Approvals
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Recommended by Superior */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    1. Recommended By Superior
                  </div>
                  <div className="font-semibold text-slate-900 text-xs mt-1">
                    {employee.superiorName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {employee.superiorDesignation}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Digitally Endorsed</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Date: {formatDate(formData.superiorRecommendedDate || '2026-09-20')}
                  </div>
                </div>
              </div>

              {/* 2. Verified by HR */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    2. Verified By Human Capital
                  </div>
                  <div className="font-semibold text-slate-900 text-xs mt-1">
                    Aiza Zafirah binti Rosli
                  </div>
                  <div className="text-[10px] text-slate-500">
                    HR Operations Officer, Media Prima
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified & Vetted</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Date: {formatDate(formData.hrVerifiedDate || '2026-09-25')}
                  </div>
                </div>
              </div>

              {/* 3. Approved by HOD */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    3. Approved By Head of Dept (HOD)
                  </div>
                  <div className="font-semibold text-slate-900 text-xs mt-1">
                    {employee.hodName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Head of Department / Division
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  {formData.hodApprovedDate ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Formally Approved</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Date: {formatDate(formData.hodApprovedDate)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Final Sign-off</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer Note */}
          <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-3">
            Media Prima Berhad · Confidential HR Operations Document · Retain in Employee Master File
          </div>
        </div>
      </div>
    </div>
  );
};
