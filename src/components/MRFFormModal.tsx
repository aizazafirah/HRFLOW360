import React, { useState, useEffect } from 'react';
import { Employee, MRFRecord } from '../types/hr';
import { formatDate, formatCurrency, addMonths } from '../utils/dateUtils';
import {
  X,
  Printer,
  Download,
  Save,
  CheckCircle,
  FileCheck2,
  Check,
  Edit3,
  Eye,
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
  // View mode: 'preview' (Official Template matching PDF 2) vs 'edit' (Interactive form inputs)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  // Initialize or hydrate MRF state from employee's current data or intelligent defaults
  const [formData, setFormData] = useState<MRFRecord>(() => {
    const existing = employee?.mrfData;
    const defaultStartDate = employee?.contractExpiryDate || new Date().toISOString().split('T')[0];
    const defaultEndDate = addMonths(defaultStartDate, 12);

    return {
      position: existing?.position || employee?.positionTitle || '',
      noOfPeopleRequired: existing?.noOfPeopleRequired || '1',
      companyDivision: existing?.companyDivision || `${employee?.businessUnit || 'Media Prima Berhad'} / ${employee?.department || 'Operations'}`,
      dateRequired: existing?.dateRequired || employee?.contractExpiryDate || '',
      estimatedBudget: existing?.estimatedBudget || `RM ${(employee?.currentSalary || 5000).toLocaleString()} / month (Budgeted in AOP)`,
      requisitionFor: existing?.requisitionFor || 'RENEWAL',
      statusOfEmployee: existing?.statusOfEmployee || (employee?.actionType === 'Probation Confirmation' ? 'PERMANENT' : 'CONTRACT'),

      name: existing?.name || employee?.name || '',
      staffNo: existing?.staffNo || employee?.employeeCode || '',
      pmsRating: existing?.pmsRating || '4.2 / Exceeds Expectations',
      lengthOfService: existing?.lengthOfService || '2 Years 4 Months',
      overallComments: existing?.overallComments || `Consistently displays high professionalism, meets all project milestones and departmental deadlines. Highly recommended for renewal.`,

      benefitsToCompany: existing?.benefitsToCompany || `Ensures continuous operation and service reliability for ${employee?.department || 'department'} deliverables without disruption.`,
      impactIfNotApproved: existing?.impactIfNotApproved || `Critical operational workflows and key project delivery timelines will experience substantial delays.`,
      distributionOfWorkload: existing?.distributionOfWorkload || `Workload would need to be absorbed by existing team members, causing operational bottleneck and potential burnout.`,

      jobDescription: existing?.jobDescription || `Responsible for day-to-day ${employee?.positionTitle || 'operations'}, reporting, inter-departmental liaisons, and compliance with Media Prima corporate governance standards.`,
      qualificationsAndSkills: existing?.qualificationsAndSkills || `Relevant tertiary qualification / professional degree, minimum 3 years industry experience, strong technical capability in ${employee?.department || 'department'} systems.`,

      requestedByName: existing?.requestedByName || employee?.superiorName || '',
      requestedByDesignation: existing?.requestedByDesignation || employee?.superiorDesignation || '',
      requestedByDate: existing?.requestedByDate || '2026-09-20',
      recommendedByName: existing?.recommendedByName || employee?.hodName || '',
      recommendedByDesignation: existing?.recommendedByDesignation || `Head of ${employee?.department || 'Department'}`,
      recommendedByDate: existing?.recommendedByDate || '2026-09-22',

      isPositionBudgeted: existing?.isPositionBudgeted ?? true,
      totalHeadcount: existing?.totalHeadcount || '1',
      hrRemarks: existing?.hrRemarks || 'RECOMMENDED - Position is budgeted within approved headcount quota.',
      hrSignatureName: existing?.hrSignatureName || 'Sylvia Singaraim',
      hrSignatureDate: existing?.hrSignatureDate || '2026-09-24',

      gmHrPermanent: existing?.gmHrPermanent || false,
      gmHrContract: existing?.gmHrContract ?? true,
      gmHrKiv: existing?.gmHrKiv || false,
      gmHrKivUntil: existing?.gmHrKivUntil || '',
      gmHrNotApproved: existing?.gmHrNotApproved || false,
      gmHrContractPeriod: existing?.gmHrContractPeriod || '12 MONTHS (1 YEAR)',
      gmHrSignatureDate: existing?.gmHrSignatureDate || '2026-09-25',

      ceoPermanent: existing?.ceoPermanent || false,
      ceoContract: existing?.ceoContract ?? true,
      ceoKiv: existing?.ceoKiv || false,
      ceoKivUntil: existing?.ceoKivUntil || '',
      ceoNotApproved: existing?.ceoNotApproved || false,
      ceoContractPeriod: existing?.ceoContractPeriod || '12 MONTHS (1 YEAR)',
      ceoSignatureDate: existing?.ceoSignatureDate || '2026-09-26',

      recommendationType: existing?.recommendationType || (employee?.actionType === 'Probation Confirmation' ? 'Confirm' : 'Renew'),
      proposedPeriod: existing?.proposedPeriod || '12 Months (1 Year Extension)',
      proposedStartDate: existing?.proposedStartDate || defaultStartDate,
      proposedEndDate: existing?.proposedEndDate || defaultEndDate,
      proposedSalary: existing?.proposedSalary || formatCurrency((employee?.currentSalary || 5000) * 1.05),
      justification: existing?.justification || `Employee has demonstrated strong performance, meeting all key quarterly deliverables.`,
      superiorRemarks: existing?.superiorRemarks || `Consistently exhibits professionalism, operational agility, and high teamwork standards. Strongly recommended for approval.`,
      headcountBudget: existing?.headcountBudget || 'Budgeted in AOP',
      superiorRecommendedDate: existing?.superiorRecommendedDate || '2026-09-20',
      hrVerifiedDate: existing?.hrVerifiedDate || '2026-09-25',
      hodApprovedDate: existing?.hodApprovedDate || null,
      status: existing?.status || 'Draft',
    };
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Update form if employee changes
  useEffect(() => {
    if (employee?.mrfData) {
      setFormData(employee.mrfData);
    }
  }, [employee]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    if (!employee) return;
    try {
      const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Manpower Requisition Form - ${employee.name}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; line-height: 1.25; color: #000; }
    .border-cyan { border: 2px solid #00e5ff; padding: 8px; }
    .header-bar { background-color: #00e5ff; font-weight: bold; font-size: 8.5pt; color: #000; padding: 2px 4px; margin-top: 4px; border: 1px solid #00e5ff; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2px; }
    td { padding: 2px 4px; font-size: 8pt; vertical-align: top; }
    .underline { border-bottom: 1px solid #000; }
    .box { border: 1px solid #000; width: 10px; height: 10px; display: inline-block; text-align: center; line-height: 10px; font-size: 8pt; margin-right: 4px; }
    .note-box { background-color: #00e5ff; padding: 3px 6px; font-size: 7pt; font-weight: bold; margin-top: 4px; border: 1px solid #00e5ff; }
  </style>
</head>
<body>
  <div class="border-cyan">
    <!-- Header -->
    <table style="margin-bottom: 6px;">
      <tr>
        <td style="width: 50%;">
          <span style="background-color: #e11d48; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 2px; font-size: 11pt;">media</span>
          <span style="font-weight: bold; font-size: 11pt; margin-left: 2px;">prima</span>
        </td>
        <td style="text-align: right; width: 50%;">
          <div style="font-weight: bold; font-size: 10pt;">GROUP HUMAN RESOURCES DEPARTMENT</div>
          <div style="font-weight: bold; font-style: italic; font-size: 10pt;">MANPOWER REQUISITION FORM</div>
        </td>
      </tr>
    </table>

    <!-- Section A -->
    <div class="header-bar">A. REQUISITION DETAILS</div>
    <table>
      <tr>
        <td style="width: 15%; font-weight: bold;">POSITION</td>
        <td style="width: 35%;" class="underline">${formData.position || employee.positionTitle}</td>
        <td style="width: 25%; font-weight: bold;">NO OF PEOPLE REQUIRED</td>
        <td style="width: 25%;" class="underline">${formData.noOfPeopleRequired || '1'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">COMPANY/DIVISION</td>
        <td class="underline">${formData.companyDivision || `${employee.businessUnit} / ${employee.department}`}</td>
        <td style="font-weight: bold;">DATE REQUIRED</td>
        <td class="underline">${formData.dateRequired || formatDate(employee.contractExpiryDate)}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">ESTIMATED BUDGET</td>
        <td colspan="3" class="underline">${formData.estimatedBudget || `RM ${employee.currentSalary.toLocaleString()}`}</td>
      </tr>
      <tr>
        <td colspan="4" style="padding-top: 4px;">
          <div style="font-size: 7.5pt; font-style: italic; margin-bottom: 2px;">(Please tick at relevant box)</div>
          <table style="width: 100%;">
            <tr>
              <td style="width: 50%;">
                <div style="font-weight: bold; margin-bottom: 2px;">REQUISITION FOR</div>
                <div><span class="box">${formData.requisitionFor === 'ADDITIONAL' ? '✓' : ''}</span> ADDITIONAL</div>
                <div><span class="box">${formData.requisitionFor === 'REPLACEMENT' ? '✓' : ''}</span> REPLACEMENT</div>
                <div><span class="box">${formData.requisitionFor === 'RENEWAL' ? '✓' : ''}</span> RENEWAL (Please fill Section B)</div>
              </td>
              <td style="width: 50%;">
                <div style="font-weight: bold; margin-bottom: 2px;">STATUS OF EMPLOYEE</div>
                <div><span class="box">${formData.statusOfEmployee === 'PERMANENT' ? '✓' : ''}</span> PERMANENT</div>
                <div><span class="box">${formData.statusOfEmployee === 'CONTRACT' ? '✓' : ''}</span> CONTRACT</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Section B -->
    <div class="header-bar">B. DETAIL OF PERSON TO BE RENEWED (FOR RENEWAL AND CONVERSION OF EMPLOYMENT STATUS ONLY)</div>
    <table>
      <tr>
        <td style="width: 15%; font-weight: bold;">NAME</td>
        <td style="width: 35%;" class="underline">${formData.name || employee.name}</td>
        <td style="width: 20%; font-weight: bold;">STAFF NO</td>
        <td style="width: 30%;" class="underline">${formData.staffNo || employee.employeeCode}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">PMS RATING (TO DATE)</td>
        <td class="underline">${formData.pmsRating || '4.2 / Exceeds Expectations'}</td>
        <td style="font-weight: bold;">LENGTH OF SERVICE</td>
        <td class="underline">${formData.lengthOfService || '2 Years 4 Months'}</td>
      </tr>
      <tr>
        <td colspan="4" style="font-weight: bold; padding-top: 4px;">OVERALL COMMENTS ON STAFF PERFORMANCE</td>
      </tr>
      <tr>
        <td colspan="4" class="underline" style="min-height: 24pt;">${formData.overallComments || 'Consistently delivers high quality output.'}</td>
      </tr>
    </table>

    <!-- Section C -->
    <div class="header-bar">C. JUSTIFICATION FOR REQUISITION (If space is insufficient, please include attachments)</div>
    <table>
      <tr><td style="font-weight: bold;">BENEFITS TO DEPARTMENT/COMPANY</td></tr>
      <tr><td class="underline">${formData.benefitsToCompany || 'Ensures continuity of operations and key projects.'}</td></tr>
      <tr><td style="font-weight: bold; padding-top: 2px;">IMPACT ON OPERATIONS IF REQUISITION IS NOT APPROVED</td></tr>
      <tr><td class="underline">${formData.impactIfNotApproved || 'Key project timelines will be delayed, impacting business performance.'}</td></tr>
      <tr><td style="font-weight: bold; padding-top: 2px;">DISTRIBUTION OF THE WORKLOAD IF REQUISITION IS NOT APPROVED</td></tr>
      <tr><td class="underline">${formData.distributionOfWorkload || 'Workload would burden existing team, reducing overall team output.'}</td></tr>
    </table>

    <!-- Section D -->
    <div class="header-bar">D. JOB DESCRIPTION OF REQUESTED POSITION (If space is insufficient, please include attachments)</div>
    <table>
      <tr><td class="underline">${formData.jobDescription || `Responsible for ${employee.positionTitle} operations and compliance.`}</td></tr>
    </table>

    <!-- Section E -->
    <div class="header-bar">E. QUALIFICATIONS AND SPECIAL SKILLS (If space is insufficient, please include attachments)</div>
    <table>
      <tr><td class="underline">${formData.qualificationsAndSkills || 'Relevant degree and minimum 3 years experience in relevant sector.'}</td></tr>
    </table>

    <!-- Section F -->
    <div class="header-bar">F. REQUISITIONER</div>
    <table>
      <tr>
        <td style="width: 50%; font-weight: bold;">REQUESTED BY :</td>
        <td style="width: 50%; font-weight: bold;">RECOMMENDED BY HEAD OF DIVISION:</td>
      </tr>
      <tr>
        <td>NAME: <span class="underline">${formData.requestedByName || employee.superiorName}</span></td>
        <td>NAME: <span class="underline">${formData.recommendedByName || employee.hodName}</span></td>
      </tr>
      <tr>
        <td>DESIGNATION: <span class="underline">${formData.requestedByDesignation || employee.superiorDesignation}</span></td>
        <td>DESIGNATION: <span class="underline">${formData.recommendedByDesignation || `Head of ${employee.department}`}</span></td>
      </tr>
      <tr>
        <td style="padding-top: 14pt;">(Signature) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (Date: ${formData.requestedByDate || '2026-09-20'})</td>
        <td style="padding-top: 14pt;">(Signature) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (Date: ${formData.recommendedByDate || '2026-09-22'})</td>
      </tr>
    </table>

    <!-- Section G -->
    <div class="header-bar">G. FOR HUMAN RESOURCES DEPARTMENT USE</div>
    <table>
      <tr>
        <td style="width: 35%; font-weight: bold;">IS POSITION BUDGETTED FOR ?</td>
        <td style="width: 65%;">
          <span class="box">${formData.isPositionBudgeted ? '✓' : ''}</span> YES &nbsp;&nbsp;&nbsp;
          <span class="box">${!formData.isPositionBudgeted ? '✓' : ''}</span> NO
        </td>
      </tr>
      <tr>
        <td style="font-weight: bold;">TOTAL HEADCOUNT FOR THE ABOVE POSITION</td>
        <td class="underline">${formData.totalHeadcount || '1'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">REMARKS :</td>
        <td class="underline">${formData.hrRemarks || 'RECOMMENDED - Position is budgeted in AOP.'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">SIGNATURE / DATE :</td>
        <td class="underline">${formData.hrSignatureName || 'Sylvia Singaraim'} &nbsp;&nbsp; (${formData.hrSignatureDate || '2026-09-24'})</td>
      </tr>
    </table>

    <!-- Section H -->
    <div class="header-bar">H. APPROVAL BY GENERAL MANAGER, HUMAN RESOURCES (EXECUTIVE & BELOW)</div>
    <table>
      <tr>
        <td style="width: 45%;">
          <div><span class="box">${formData.gmHrPermanent ? '✓' : ''}</span> RECOMMENDED ON PERMANENT BASIS</div>
          <div><span class="box">${formData.gmHrKiv ? '✓' : ''}</span> KIV UNTIL <span class="underline">${formData.gmHrKivUntil || '____________'}</span></div>
          <div><span class="box">${formData.gmHrNotApproved ? '✓' : ''}</span> NOT APPROVED</div>
        </td>
        <td style="width: 55%;">
          <div><span class="box">${formData.gmHrContract ? '✓' : ''}</span> APPROVED ON CONTRACT BASIS ( ONE YEAR AND ABOVE)</div>
          <div>PERIOD (MTHS / YRS) : <span class="underline">${formData.gmHrContractPeriod || '12 MONTHS (1 YEAR)'}</span></div>
          <div style="margin-top: 8pt;">SIGNATURE / DATE : <span class="underline">Sylvia Singaraim (${formData.gmHrSignatureDate || '2026-09-25'})</span></div>
        </td>
      </tr>
    </table>

    <!-- Section I -->
    <div class="header-bar">I. APPROVAL BY GROUP MANAGING DIRECTOR / CHIEF EXECUTIVE OFFICER (MANAGER & ABOVE)</div>
    <table>
      <tr>
        <td style="width: 45%;">
          <div><span class="box">${formData.ceoPermanent ? '✓' : ''}</span> APPROVED ON PERMANENT BASIS</div>
          <div><span class="box">${formData.ceoKiv ? '✓' : ''}</span> KIV UNTIL <span class="underline">${formData.ceoKivUntil || '____________'}</span></div>
          <div><span class="box">${formData.ceoNotApproved ? '✓' : ''}</span> NOT APPROVED</div>
        </td>
        <td style="width: 55%;">
          <div><span class="box">${formData.ceoContract ? '✓' : ''}</span> APPROVED ON CONTRACT BASIS ( ONE YEAR AND ABOVE)</div>
          <div>PERIOD (MTHS / YRS) : <span class="underline">${formData.ceoContractPeriod || '12 MONTHS (1 YEAR)'}</span></div>
          <div style="margin-top: 8pt;">SIGNATURE / DATE : <span class="underline">__________________ (${formData.ceoSignatureDate || '2026-09-26'})</span></div>
        </td>
      </tr>
    </table>

    <!-- Bottom Note -->
    <div class="note-box">
      NOTE : - Kindly submit this form to Human Resources Department for all requests for manpower.<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- All requests for NON-BUDGETED MANPOWER must be APPROVED by the Chief Executive Officer prior to recruitment.<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Recruitment of FORMER EMPLOYEES of TV3 must be APPROVED by Chief Executive Officer prior to the recruitment.<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Approval of the recruitment for budgetted and unbudgetted positions shall be according to the authorised Limits of Authority (LOA).
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
      const filename = `${employee.employeeCode}_MRF_Form.doc`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 300);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Download MRF failed:', err);
    }
  };

  const handleSave = (submit: boolean = false) => {
    if (!employee) return;
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

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print-document-container">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[95vh] a4-print-sheet">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Manpower Requisition Form (MRF)
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Official Template · {employee.name} ({employee.employeeCode})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 font-semibold rounded-md flex items-center gap-1 transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Template View</span>
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 font-semibold rounded-md flex items-center gap-1 transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Fields</span>
              </button>
            </div>

            {/* DOWNLOAD MRF AS WORD (.doc) BUTTON */}
            <button
              onClick={handleDownloadWord}
              title="Download MRF form as Microsoft Word (.doc) document"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Form (.doc)</span>
            </button>

            {/* PRINT / SAVE PDF BUTTON */}
            <button
              onClick={handlePrint}
              title="Print document or Save as PDF"
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print A4 / PDF</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Submit MRF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="no-print bg-cyan-50 border-b border-cyan-200 px-6 py-2 text-xs font-medium text-cyan-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-600" />
            <span>MRF Word document (.doc) downloaded successfully!</span>
          </div>
        )}

        {savedSuccess && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>MRF Form details successfully updated and saved!</span>
          </div>
        )}

        {/* Form Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          {viewMode === 'preview' ? (
            /* OFFICIAL TEMPLATE VIEW - EXACTLY MATCHES PDF 2 */
            <div className="bg-white border-2 border-cyan-400 p-4 sm:p-6 shadow-sm mx-auto max-w-3xl text-[11px] leading-tight text-black font-sans">
              {/* Header with Media Prima logo and Document Title */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="bg-rose-600 text-white font-black text-sm px-2 py-0.5 rounded-sm tracking-tight">
                    media
                  </div>
                  <div className="text-black font-black text-base tracking-tight">
                    prima
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs uppercase tracking-wide text-black">
                    GROUP HUMAN RESOURCES DEPARTMENT
                  </div>
                  <div className="font-bold italic text-xs tracking-wider text-black">
                    MANPOWER REQUISITION FORM
                  </div>
                </div>
              </div>

              {/* SECTION A. REQUISITION DETAILS */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  A. REQUISITION DETAILS
                </div>
                <div className="border-x border-b border-cyan-200 p-2 space-y-1.5 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-24 shrink-0">POSITION</span>
                      <span className="flex-1 border-b border-black font-semibold text-[11px] truncate pb-0.5">
                        {formData.position || employee.positionTitle}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-36 shrink-0">NO OF PEOPLE REQUIRED</span>
                      <span className="flex-1 border-b border-black font-semibold text-[11px] pb-0.5">
                        {formData.noOfPeopleRequired || '1'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-24 shrink-0">COMPANY/DIVISION</span>
                      <span className="flex-1 border-b border-black font-medium text-[11px] truncate pb-0.5">
                        {formData.companyDivision || `${employee.businessUnit} / ${employee.department}`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-36 shrink-0">DATE REQUIRED</span>
                      <span className="flex-1 border-b border-black font-medium text-[11px] pb-0.5">
                        {formData.dateRequired || formatDate(employee.contractExpiryDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[10px] w-28 shrink-0">ESTIMATED BUDGET</span>
                    <span className="flex-1 border-b border-black font-medium text-[11px] pb-0.5">
                      {formData.estimatedBudget || `RM ${employee.currentSalary.toLocaleString()} / month (Budgeted in AOP)`}
                    </span>
                  </div>

                  <div className="pt-1.5">
                    <div className="text-[9px] italic text-slate-600 mb-1">(Please tick at relevant box)</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-bold text-[10px] mb-1">REQUISITION FOR</div>
                        <div className="space-y-1">
                          <label className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.requisitionFor === 'ADDITIONAL' ? 'bg-black text-white' : ''}`}>
                              {formData.requisitionFor === 'ADDITIONAL' ? '✓' : ''}
                            </span>
                            <span className="text-[10px]">ADDITIONAL</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.requisitionFor === 'REPLACEMENT' ? 'bg-black text-white' : ''}`}>
                              {formData.requisitionFor === 'REPLACEMENT' ? '✓' : ''}
                            </span>
                            <span className="text-[10px]">REPLACEMENT</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.requisitionFor === 'RENEWAL' ? 'bg-black text-white' : ''}`}>
                              {formData.requisitionFor === 'RENEWAL' ? '✓' : ''}
                            </span>
                            <span className="text-[10px] font-semibold">RENEWAL (Please fill Section B)</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-[10px] mb-1">STATUS OF EMPLOYEE</div>
                        <div className="space-y-1">
                          <label className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.statusOfEmployee === 'PERMANENT' ? 'bg-black text-white' : ''}`}>
                              {formData.statusOfEmployee === 'PERMANENT' ? '✓' : ''}
                            </span>
                            <span className="text-[10px]">PERMANENT</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.statusOfEmployee === 'CONTRACT' ? 'bg-black text-white' : ''}`}>
                              {formData.statusOfEmployee === 'CONTRACT' ? '✓' : ''}
                            </span>
                            <span className="text-[10px]">CONTRACT</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B. DETAIL OF PERSON TO BE RENEWED */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  B. DETAIL OF PERSON TO BE RENEWED (FOR RENEWAL AND CONVERSION OF EMPLOYMENT STATUS ONLY)
                </div>
                <div className="border-x border-b border-cyan-200 p-2 space-y-1.5 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-24 shrink-0">NAME</span>
                      <span className="flex-1 border-b border-black font-bold text-[11px] truncate pb-0.5">
                        {formData.name || employee.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-24 shrink-0">STAFF NO</span>
                      <span className="flex-1 border-b border-black font-mono font-bold text-[11px] pb-0.5">
                        {formData.staffNo || employee.employeeCode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-28 shrink-0">PMS RATING (TO DATE)</span>
                      <span className="flex-1 border-b border-black font-semibold text-[11px] pb-0.5">
                        {formData.pmsRating || '4.2 / Exceeds Expectations'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] w-28 shrink-0">LENGTH OF SERVICE</span>
                      <span className="flex-1 border-b border-black font-medium text-[11px] pb-0.5">
                        {formData.lengthOfService || '2 Years 4 Months'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="font-bold text-[10px] mb-1">OVERALL COMMENTS ON STAFF PERFORMANCE</div>
                    <div className="border-b border-black pb-1 text-[10.5px] leading-relaxed">
                      {formData.overallComments || 'Consistently delivers high quality work with great dedication.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C. JUSTIFICATION FOR REQUISITION */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  C. JUSTIFICATION FOR REQUISITION (If space is insufficient, please include attachments)
                </div>
                <div className="border-x border-b border-cyan-200 p-2 space-y-1.5 bg-white">
                  <div>
                    <div className="font-bold text-[10px]">BENEFITS TO DEPARTMENT/COMPANY</div>
                    <div className="border-b border-black pb-1 text-[10.5px] leading-relaxed">
                      {formData.benefitsToCompany || 'Ensures continuity of operations and key projects.'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[10px]">IMPACT ON OPERATIONS IF REQUISITION IS NOT APPROVED</div>
                    <div className="border-b border-black pb-1 text-[10.5px] leading-relaxed">
                      {formData.impactIfNotApproved || 'Key project timelines will be delayed, impacting business performance.'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[10px]">DISTRIBUTION OF THE WORKLOAD IF REQUISITION IS NOT APPROVED</div>
                    <div className="border-b border-black pb-1 text-[10.5px] leading-relaxed">
                      {formData.distributionOfWorkload || 'Workload would burden existing team, reducing overall team output.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION D. JOB DESCRIPTION */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  D. JOB DESCRIPTION OF REQUESTED POSITION (If space is insufficient, please include attachments)
                </div>
                <div className="border-x border-b border-cyan-200 p-2 bg-white">
                  <div className="border-b border-black pb-1 text-[10.5px] leading-relaxed">
                    {formData.jobDescription || `Responsible for ${employee.positionTitle} operations and compliance.`}
                  </div>
                </div>
              </div>

              {/* SECTION E. QUALIFICATIONS AND SPECIAL SKILLS */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  E. QUALIFICATIONS AND SPECIAL SKILLS (If space is insufficient, please include attachments)
                </div>
                <div className="border-x border-b border-cyan-200 p-2 bg-white">
                  <div className="border-b border-black pb-1 text-[10.5px] leading-relaxed">
                    {formData.qualificationsAndSkills || 'Relevant degree and minimum 3 years experience in relevant sector.'}
                  </div>
                </div>
              </div>

              {/* SECTION F. REQUISITIONER */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  F. REQUISITIONER
                </div>
                <div className="border-x border-b border-cyan-200 p-2 bg-white grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-[10px]">REQUESTED BY :</div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-[9px] w-14">NAME</span>
                      <span className="flex-1 border-b border-black font-semibold text-[10px] pb-0.5">
                        {formData.requestedByName || employee.superiorName}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-[9px] w-14">DESIGNATION</span>
                      <span className="flex-1 border-b border-black text-[10px] pb-0.5 truncate">
                        {formData.requestedByDesignation || employee.superiorDesignation}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-3 text-[9px]">
                      <span>(Signature)</span>
                      <span>(Date: {formData.requestedByDate || '2026-09-20'})</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-[10px]">RECOMMENDED BY HEAD OF DIVISION:</div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-[9px] w-14">NAME</span>
                      <span className="flex-1 border-b border-black font-semibold text-[10px] pb-0.5">
                        {formData.recommendedByName || employee.hodName}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-[9px] w-14">DESIGNATION</span>
                      <span className="flex-1 border-b border-black text-[10px] pb-0.5 truncate">
                        {formData.recommendedByDesignation || `Head of ${employee.department}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-3 text-[9px]">
                      <span>(Signature)</span>
                      <span>(Date: {formData.recommendedByDate || '2026-09-22'})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION G. FOR HR DEPARTMENT USE */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  G. FOR HUMAN RESOURCES DEPARTMENT USE
                </div>
                <div className="border-x border-b border-cyan-200 p-2 space-y-1 bg-white">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[10px]">IS POSITION BUDGETTED FOR ?</span>
                    <label className="flex items-center gap-1">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.isPositionBudgeted ? 'bg-black text-white' : ''}`}>
                        {formData.isPositionBudgeted ? '✓' : ''}
                      </span>
                      <span className="text-[10px] font-semibold">YES</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${!formData.isPositionBudgeted ? 'bg-black text-white' : ''}`}>
                        {!formData.isPositionBudgeted ? '✓' : ''}
                      </span>
                      <span className="text-[10px]">NO</span>
                    </label>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[10px]">TOTAL HEADCOUNT FOR THE ABOVE POSITION</span>
                    <span className="flex-1 border-b border-black font-semibold text-[10px] pb-0.5">
                      {formData.totalHeadcount || '1'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[10px]">REMARKS :</span>
                    <span className="flex-1 border-b border-black text-[10px] pb-0.5 font-medium">
                      {formData.hrRemarks || 'RECOMMENDED - Position is budgeted within approved headcount quota.'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px]">SIGNATURE:</span>
                      <span className="border-b border-black font-semibold text-[10px] px-4 pb-0.5">
                        {formData.hrSignatureName || 'Sylvia Singaraim'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px]">DATE:</span>
                      <span className="border-b border-black font-mono text-[10px] px-4 pb-0.5">
                        {formData.hrSignatureDate || '2026-09-24'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION H. APPROVAL BY GM HR */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  H. APPROVAL BY GENERAL MANAGER, HUMAN RESOURCES (EXECUTIVE & BELOW)
                </div>
                <div className="border-x border-b border-cyan-200 p-2 bg-white grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.gmHrPermanent ? 'bg-black text-white' : ''}`}>
                        {formData.gmHrPermanent ? '✓' : ''}
                      </span>
                      <span className="text-[10px]">RECOMMENDED ON PERMANENT BASIS</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.gmHrKiv ? 'bg-black text-white' : ''}`}>
                        {formData.gmHrKiv ? '✓' : ''}
                      </span>
                      <span className="text-[10px]">KIV UNTIL {formData.gmHrKivUntil || '____________'}</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.gmHrNotApproved ? 'bg-black text-white' : ''}`}>
                        {formData.gmHrNotApproved ? '✓' : ''}
                      </span>
                      <span className="text-[10px]">NOT APPROVED</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.gmHrContract ? 'bg-black text-white' : ''}`}>
                        {formData.gmHrContract ? '✓' : ''}
                      </span>
                      <span className="text-[10px] font-bold">APPROVED ON CONTRACT BASIS ( ONE YEAR AND ABOVE)</span>
                    </label>
                    <div className="flex items-baseline gap-1 text-[10px]">
                      <span>PERIOD (MTHS / YRS) :</span>
                      <span className="border-b border-black font-semibold flex-1 pb-0.5">
                        {formData.gmHrContractPeriod || '12 MONTHS (1 YEAR)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-2 text-[9px]">
                      <span>SIGNATURE: Sylvia Singaraim</span>
                      <span>DATE: {formData.gmHrSignatureDate || '2026-09-25'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION I. APPROVAL BY GMD / CEO */}
              <div className="mt-2.5">
                <div className="bg-cyan-400 font-bold px-2 py-1 text-[11px] uppercase tracking-wide text-black border border-cyan-400">
                  I. APPROVAL BY GROUP MANAGING DIRECTOR / CHIEF EXECUTIVE OFFICER (MANAGER & ABOVE)
                </div>
                <div className="border-x border-b border-cyan-200 p-2 bg-white grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.ceoPermanent ? 'bg-black text-white' : ''}`}>
                        {formData.ceoPermanent ? '✓' : ''}
                      </span>
                      <span className="text-[10px]">APPROVED ON PERMANENT BASIS</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.ceoKiv ? 'bg-black text-white' : ''}`}>
                        {formData.ceoKiv ? '✓' : ''}
                      </span>
                      <span className="text-[10px]">KIV UNTIL {formData.ceoKivUntil || '____________'}</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.ceoNotApproved ? 'bg-black text-white' : ''}`}>
                        {formData.ceoNotApproved ? '✓' : ''}
                      </span>
                      <span className="text-[10px]">NOT APPROVED</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[10px] font-bold ${formData.ceoContract ? 'bg-black text-white' : ''}`}>
                        {formData.ceoContract ? '✓' : ''}
                      </span>
                      <span className="text-[10px] font-bold">APPROVED ON CONTRACT BASIS ( ONE YEAR AND ABOVE)</span>
                    </label>
                    <div className="flex items-baseline gap-1 text-[10px]">
                      <span>PERIOD (MTHS / YRS) :</span>
                      <span className="border-b border-black font-semibold flex-1 pb-0.5">
                        {formData.ceoContractPeriod || '12 MONTHS (1 YEAR)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-2 text-[9px]">
                      <span>SIGNATURE: __________________</span>
                      <span>DATE: {formData.ceoSignatureDate || '2026-09-26'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Note exactly matching PDF 2 */}
              <div className="mt-2.5 bg-cyan-400 text-black font-bold p-2 text-[8.5px] leading-tight border border-cyan-400">
                <div>NOTE : - Kindly submit this form to Human Resources Department for all requests for manpower.</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- All requests for NON-BUDGETED MANPOWER must be APPROVED by the Chief Executive Officer prior to recruitment.</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Recruitment of FORMER EMPLOYEES of TV3 must be APPROVED by Chief Executive Officer prior to the recruitment.</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Approval of the recruitment for budgetted and unbudgetted positions shall be according to the authorised Limits of Authority (LOA).</div>
              </div>
            </div>
          ) : (
            /* INTERACTIVE EDIT MODE */
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-3xl mx-auto text-xs">
              <div className="border-b pb-2">
                <h3 className="text-sm font-bold text-slate-900">Edit MRF Data Fields</h3>
                <p className="text-[11px] text-slate-500">
                  Update any field values below. Changes instantly reflect in the official template view, printout, and downloaded Word document.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PMS Rating (To Date):</label>
                  <input
                    type="text"
                    value={formData.pmsRating}
                    onChange={(e) => setFormData({ ...formData, pmsRating: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Length of Service:</label>
                  <input
                    type="text"
                    value={formData.lengthOfService}
                    onChange={(e) => setFormData({ ...formData, lengthOfService: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Overall Comments on Staff Performance:</label>
                <textarea
                  rows={3}
                  value={formData.overallComments}
                  onChange={(e) => setFormData({ ...formData, overallComments: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Benefits to Department / Company:</label>
                <textarea
                  rows={2}
                  value={formData.benefitsToCompany}
                  onChange={(e) => setFormData({ ...formData, benefitsToCompany: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Impact on Operations if Not Approved:</label>
                <textarea
                  rows={2}
                  value={formData.impactIfNotApproved}
                  onChange={(e) => setFormData({ ...formData, impactIfNotApproved: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Distribution of Workload if Not Approved:</label>
                <textarea
                  rows={2}
                  value={formData.distributionOfWorkload}
                  onChange={(e) => setFormData({ ...formData, distributionOfWorkload: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Description Summary:</label>
                  <textarea
                    rows={2}
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qualifications & Special Skills:</label>
                  <textarea
                    rows={2}
                    value={formData.qualificationsAndSkills}
                    onChange={(e) => setFormData({ ...formData, qualificationsAndSkills: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewMode('preview')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Return to Template Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
