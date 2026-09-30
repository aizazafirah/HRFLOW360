import React, { useState } from 'react';
import { Employee, LetterTemplateType, LetterRecord } from '../types/hr';
import {
  LETTER_TEMPLATES,
  generateLetterContent,
} from '../utils/letterTemplates';
import {
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface CorporateLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onIssueLetter: (employeeId: string, letterData: LetterRecord) => void;
}

export const CorporateLetterModal: React.FC<CorporateLetterModalProps> = ({
  isOpen,
  onClose,
  employee,
  onIssueLetter,
}) => {
  if (!isOpen || !employee) return null;

  // Initial template selection based on employee action type or existing letterData
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplateType>(() => {
    if (employee.letterData?.templateType) return employee.letterData.templateType;
    if (employee.actionType === 'Probation Confirmation') {
      return employee.mrfData?.recommendationType === 'Extend Probation'
        ? 'extension_probation'
        : 'confirmation_work';
    }
    return 'extension_contract';
  });

  const [customOverrides, setCustomOverrides] = useState<Partial<LetterRecord>>({
    letterRef: employee.letterData?.letterRef || '',
    effectiveDate: employee.letterData?.effectiveDate || employee.contractExpiryDate || '',
    reviewDate: employee.letterData?.reviewDate || '',
    customNotes: employee.letterData?.customNotes || '',
  });

  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [issuedSuccess, setIssuedSuccess] = useState<boolean>(false);

  // Generate the live content based on current template and overrides
  const letter = generateLetterContent(employee, selectedTemplate, customOverrides);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    const text = `
MEDIA PRIMA BERHAD (173295-P)
Balai Berita, 31 Jalan Riong, Bangsar, 59100 Kuala Lumpur

Ref: ${letter.referenceNumber}
Date: ${letter.date}

STRICTLY PRIVATE & CONFIDENTIAL

To:
${letter.recipient.name}
Staff ID: ${letter.recipient.staffId}
Position: ${letter.recipient.position} (Grade ${letter.recipient.grade})
Department: ${letter.recipient.department}
Business Unit: ${letter.recipient.businessUnit}

${letter.title}

${letter.paragraphs.join('\n\n')}

${letter.bulletPoints ? letter.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join('\n') : ''}

Yours sincerely,
MEDIA PRIMA BERHAD

${letter.signatory.name}
${letter.signatory.title}
${letter.signatory.division}

-------------------------------------------------------------
${letter.hasAcceptanceSlip ? `ACCEPTANCE SLIP:\n${letter.acceptanceText}\n\nSignature: __________________\nName: ${letter.recipient.name}\nNRIC: ${letter.recipient.nric}\nDate: __________________` : ''}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkIssued = () => {
    const finalLetterData: LetterRecord = {
      templateType: selectedTemplate,
      letterRef: letter.referenceNumber,
      issueDate: new Date().toISOString().split('T')[0],
      effectiveDate: customOverrides.effectiveDate || employee.contractExpiryDate,
      reviewDate: customOverrides.reviewDate || undefined,
      customNotes: customOverrides.customNotes || undefined,
      status: 'Issued',
    };

    onIssueLetter(employee.id, finalLetterData);
    setIssuedSuccess(true);
    setTimeout(() => {
      setIssuedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print-document-container">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[95vh] a4-print-sheet">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Corporate HR Letter Generator
              </h2>
              <p className="text-[11px] text-slate-500">
                A4 Print-Ready Document · {employee.name} ({employee.employeeCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>{showCustomizer ? 'Hide Variables' : 'Edit Variables'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleMarkIssued}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Issued & Complete</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selector Bar (Hidden on print) */}
        <div className="no-print px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Select Template (4 Options):</span>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as LetterTemplateType)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 pr-7 appearance-none cursor-pointer shadow-2xs"
              >
                {LETTER_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    [{tmpl.category}] {tmpl.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            {LETTER_TEMPLATES.find((t) => t.id === selectedTemplate)?.description}
          </div>
        </div>

        {/* Customization Variables Panel (Collapsible) */}
        {showCustomizer && (
          <div className="no-print bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Letter Reference No:
              </label>
              <input
                type="text"
                value={customOverrides.letterRef || letter.referenceNumber}
                onChange={(e) => setCustomOverrides({ ...customOverrides, letterRef: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Effective Commencement Date:
              </label>
              <input
                type="date"
                value={customOverrides.effectiveDate}
                onChange={(e) => setCustomOverrides({ ...customOverrides, effectiveDate: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Future Review / PIP Date (if applicable):
              </label>
              <input
                type="date"
                value={customOverrides.reviewDate}
                onChange={(e) => setCustomOverrides({ ...customOverrides, reviewDate: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>
          </div>
        )}

        {issuedSuccess && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Letter marked as issued! Workflow status updated to "Completed".</span>
          </div>
        )}

        {/* Realistic A4 Paper Letter Layout */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-xs text-slate-900 flex-1 leading-relaxed bg-white">
          {/* Corporate Letterhead */}
          <div className="border-b border-slate-900/80 pb-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-black tracking-tight text-slate-900 font-serif">
                  MEDIA PRIMA BERHAD
                </div>
                <div className="text-[10px] text-slate-500 font-mono tracking-wider">
                  Registration No: 173295-P · Incorporated in Malaysia
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Balai Berita, 31 Jalan Riong, Bangsar, 59100 Kuala Lumpur, Malaysia
                </div>
                <div className="text-[10px] text-slate-500">
                  Tel: +603-2724 8888 · Fax: +603-2282 0152 · Web: www.mediaprima.com.my
                </div>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 border-2 border-slate-900 rounded flex items-center justify-center font-bold text-slate-900 font-serif text-sm">
                  MPB
                </div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-semibold">
                  Human Capital
                </div>
              </div>
            </div>
          </div>

          {/* Reference & Date Bar */}
          <div className="flex justify-between items-start text-xs font-mono text-slate-700">
            <div>
              <span className="text-slate-400">Ref: </span>
              <strong className="text-slate-900">{letter.referenceNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400">Date: </span>
              <strong className="text-slate-900">{letter.date}</strong>
            </div>
          </div>

          {/* Confidential Notice */}
          <div className="text-[11px] font-bold text-slate-800 tracking-wider">
            STRICTLY PRIVATE & CONFIDENTIAL
          </div>

          {/* Recipient Details */}
          <div className="text-xs space-y-0.5 text-slate-800 font-medium">
            <div className="font-bold text-slate-900 text-sm">{letter.recipient.name}</div>
            <div>Staff ID: <span className="font-mono">{letter.recipient.staffId}</span></div>
            <div>NRIC No: <span className="font-mono">{letter.recipient.nric}</span></div>
            <div>Position: {letter.recipient.position} (Grade {letter.recipient.grade})</div>
            <div>Department: {letter.recipient.department}</div>
            <div>{letter.recipient.businessUnit}</div>
          </div>

          {/* Letter Title */}
          <div className="pt-2 pb-1 border-b border-slate-300">
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900">
              {letter.title}
            </h1>
          </div>

          {/* Body Paragraphs */}
          <div className="space-y-3.5 text-slate-800 text-justify text-xs leading-relaxed">
            {letter.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}

            {/* Optional PIP or Development Bullets */}
            {letter.bulletPoints && (
              <div className="pl-4 space-y-1.5 text-slate-800 my-2">
                {letter.bulletPoints.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold font-mono text-slate-600">{idx + 1}.</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signatory Section */}
          <div className="pt-6 space-y-1 text-xs print-avoid-break">
            <div>Yours sincerely,</div>
            <div className="font-bold text-slate-900 uppercase">
              FOR AND ON BEHALF OF {letter.signatory.company}
            </div>

            {/* Official Signature Mark */}
            <div className="py-4">
              <div className="font-serif italic text-slate-700 text-sm">
                ~ Norazlina Hashim ~
              </div>
              <div className="w-48 h-px bg-slate-900 mt-2"></div>
            </div>

            <div className="font-bold text-slate-900">{letter.signatory.name}</div>
            <div className="text-slate-600">{letter.signatory.title}</div>
            <div className="text-slate-500 text-[11px]">{letter.signatory.division}</div>
          </div>

          {/* Candidate Acceptance Slip (for contract extension & PIP extension) */}
          {letter.hasAcceptanceSlip && (
            <div className="mt-8 pt-5 border-t-2 border-dashed border-slate-300 space-y-4 print-avoid-break">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                EMPLOYEE ACCEPTANCE SLIP (Please return duplicate copy within 14 days)
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{letter.acceptanceText}"
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <div className="h-10 border-b border-slate-400"></div>
                  <div className="text-[11px] font-semibold text-slate-900 mt-1">
                    Employee Signature
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Name: {letter.recipient.name}
                  </div>
                </div>

                <div>
                  <div className="h-10 border-b border-slate-400"></div>
                  <div className="text-[11px] font-semibold text-slate-900 mt-1">
                    NRIC / Passport No: {letter.recipient.nric}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Date of Acceptance: __________________
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
