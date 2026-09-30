import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Employee, LetterTemplateType, LetterRecord } from '../types/hr';
import {
  LETTER_TEMPLATES,
  generateLetterContent,
} from '../utils/letterTemplates';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  FileDown,
  Loader2,
} from 'lucide-react';

interface CorporateLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onIssueLetter: (employeeId: string, letterData: LetterRecord) => void;
}

// Helper to safely convert any oklch color string to sRGB using browser canvas 2d context
function safeConvertOklch(colorVal: string): string {
  if (!colorVal || typeof colorVal !== 'string') return '#000000';
  if (!colorVal.includes('oklch')) return colorVal;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#0f172a';
    ctx.fillStyle = colorVal;
    return ctx.fillStyle || '#0f172a';
  } catch {
    return '#0f172a';
  }
}

export const CorporateLetterModal: React.FC<CorporateLetterModalProps> = ({
  isOpen,
  onClose,
  employee,
  onIssueLetter,
}) => {
  // Initial template selection
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplateType>(() => {
    if (employee?.letterData?.templateType) return employee.letterData.templateType;
    if (employee?.actionType === 'Probation Confirmation') {
      return employee.mrfData?.recommendationType === 'Extend Probation'
        ? 'extension_probation'
        : 'confirmation_work';
    }
    return 'extension_contract';
  });

  const [customOverrides, setCustomOverrides] = useState<Partial<LetterRecord>>({
    letterRef: employee?.letterData?.letterRef || '',
    effectiveDate: employee?.letterData?.effectiveDate || employee?.contractExpiryDate || '',
    reviewDate: employee?.letterData?.reviewDate || '',
    customNotes: employee?.letterData?.customNotes || '',
  });

  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [issuedSuccess, setIssuedSuccess] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const letterRef = useRef<HTMLDivElement>(null);

  // Guard after all hooks to comply with React 19 static flags
  if (!isOpen || !employee) return null;

  // Generate the live content based on current template and overrides
  const letter = generateLetterContent(employee, selectedTemplate, customOverrides);

  // 1. Direct PDF Generation via jsPDF and html2canvas with oklch sanitization
  const handleGeneratePdf = async () => {
    if (!employee || !letterRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = letterRef.current;

      const canvas = await html2canvas(element, {
        scale: 2.2, // 300dpi-equivalent resolution for crystal-sharp typography
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 1. Sanitize all style tags in the cloned document replacing oklch with valid RGB
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((tag) => {
            if (tag.textContent && tag.textContent.includes('oklch')) {
              tag.textContent = tag.textContent.replace(/oklch\([^)]+\)/g, (match) => {
                return safeConvertOklch(match);
              });
            }
          });

          // 2. Inject an override style into cloned document head to guarantee RGB/Hex colors
          const overrideStyle = clonedDoc.createElement('style');
          overrideStyle.textContent = `
            * {
              border-color: #cbd5e1 !important;
              outline-color: #cbd5e1 !important;
            }
            #corporate-letter-content {
              background-color: #ffffff !important;
              color: #0f172a !important;
            }
          `;
          clonedDoc.head.appendChild(overrideStyle);

          // 3. Clean any lingering computed oklch on cloned elements
          const elements = clonedDoc.querySelectorAll('#corporate-letter-content, #corporate-letter-content *');
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            try {
              const comp = window.getComputedStyle(htmlEl);
              ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'].forEach((prop) => {
                const val = (comp as any)[prop];
                if (typeof val === 'string' && val.includes('oklch')) {
                  htmlEl.style.setProperty(prop, safeConvertOklch(val), 'important');
                }
              });
            } catch {
              // ignore
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Subsequent pages if content overflows single A4
      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const filename = `${employee.employeeCode}_${selectedTemplate}.pdf`;
      pdf.save(filename);

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } catch (err) {
      console.error('PDF generation error, falling back to print dialog:', err);
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Clean Print functionality: directly invokes native browser print
  // The @media print stylesheet isolates #corporate-letter-content on exact A4 portrait paper
  const handlePrint = () => {
    window.print();
  };

  // 3. Download Microsoft Word (.doc) document
  const handleDownloadWord = () => {
    if (!employee) return;
    try {
      const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${letter.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: A4 portrait; margin: 25mm 25mm 25mm 25mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.35; color: #000; margin: 0; }
    .top-header { width: 100%; margin-bottom: 24pt; }
    .top-header table { width: 100%; border: none; border-collapse: collapse; }
    .top-header td { border: none; padding: 0; font-size: 11pt; }
    .recipient { margin-bottom: 18pt; line-height: 1.35; font-size: 11pt; }
    .salutation { margin-bottom: 16pt; font-size: 11pt; }
    .title { font-weight: bold; font-size: 11pt; text-transform: uppercase; margin-bottom: 4pt; }
    .divider { border-top: 2px solid #000; margin: 4pt 0 16pt 0; height: 0; }
    p { margin: 0 0 12pt 0; text-align: justify; line-height: 1.35; }
    .signatory { margin-top: 22pt; line-height: 1.3; font-size: 11pt; }
    .signature-space { height: 45pt; }
    .signatory-name { font-weight: bold; }
    .cc-section { margin-top: 18pt; font-size: 10.5pt; line-height: 1.3; }
    .initials { color: #475569; font-size: 9pt; margin-top: 2pt; }
    .acceptance-section { margin-top: 24pt; page-break-inside: avoid; border-top: 1px solid #cbd5e1; padding-top: 14pt; }
    .acceptance-table { border-collapse: collapse; width: 65%; margin-top: 12pt; }
    .acceptance-table td { border: 1px solid #000; padding: 6pt 10pt; font-size: 10pt; }
    .acceptance-table .label-cell { background-color: #e2e8f0; font-weight: bold; width: 120pt; }
  </style>
</head>
<body>
  <div class="top-header">
    <table style="width: 100%;">
      <tr>
        <td style="text-align: left;">${letter.date}</td>
        <td style="text-align: right; font-weight: bold;">${letter.confidentialNotice || ''}</td>
      </tr>
    </table>
  </div>

  <div class="recipient">
    <div>&lt;${letter.recipient.staffId}&gt; &lt;${letter.recipient.name}&gt;</div>
    <div>${letter.recipient.throughLine}</div>
    <div>&lt;${letter.recipient.department}&gt;</div>
  </div>

  <div class="salutation">
    ${letter.salutation}
  </div>

  <div class="title">${letter.title}</div>
  <div class="divider"></div>

  ${letter.paragraphs.map((p) => `<p>${p}</p>`).join('\n  ')}

  <div class="signatory">
    <div>Yours faithfully</div>
    <div style="font-weight: bold;">&lt;${letter.signatory.company}&gt;</div>
    <div class="signature-space"></div>
    <div class="signatory-name">${letter.signatory.name}</div>
    <div>${letter.signatory.title}</div>
  </div>

  ${
    letter.ccNotice
      ? `
  <div class="cc-section">
    <div>${letter.ccNotice}</div>
    <div class="initials">${letter.signatory.initials || ''}</div>
  </div>
  `
      : letter.signatory.initials
      ? `
  <div class="initials" style="margin-top: 8pt;">${letter.signatory.initials}</div>
  `
      : ''
  }

  ${
    letter.hasAcceptanceSlip
      ? `
  <div class="acceptance-section">
    <p style="font-size: 10.5pt; text-align: justify;">${letter.acceptanceText}</p>
    <table class="acceptance-table">
      <tr>
        <td class="label-cell">SIGNATURE</td>
        <td style="height: 38pt;"></td>
      </tr>
      <tr>
        <td class="label-cell">NRIC</td>
        <td style="height: 24pt;"></td>
      </tr>
      <tr>
        <td class="label-cell">DATE</td>
        <td style="height: 24pt;"></td>
      </tr>
    </table>
  </div>
  `
      : ''
  }
</body>
</html>`;

      const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
      const filename = `${employee.employeeCode}_${selectedTemplate}.doc`;
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
      console.error('Download failed:', err);
    }
  };

  const handleCopyText = async () => {
    const text = `
${letter.date}${letter.confidentialNotice ? `                                     ${letter.confidentialNotice}` : ''}

<${letter.recipient.staffId}> <${letter.recipient.name}>
${letter.recipient.throughLine}
<${letter.recipient.department}>

${letter.salutation}

${letter.title}
--------------------------------------------------------------------------------

${letter.paragraphs.join('\n\n')}

Yours faithfully
<${letter.signatory.company}>



${letter.signatory.name}
${letter.signatory.title}

${letter.ccNotice ? `${letter.ccNotice}\n${letter.signatory.initials || ''}` : letter.signatory.initials || ''}
${
  letter.hasAcceptanceSlip
    ? `
--------------------------------------------------------------------------------
${letter.acceptanceText}

SIGNATURE: _____________________
NRIC:      _____________________
DATE:      _____________________`
    : ''
}
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
    if (!employee) return;
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
        <div className="no-print px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Official Corporate Letter
              </h2>
              <p className="text-[11px] text-slate-500">
                Template Preview · {employee.name} ({employee.employeeCode})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>{showCustomizer ? 'Hide Variables' : 'Edit Variables'}</span>
            </button>

            {/* 1. SAVE AS PDF (DIRECT DOWNLOAD) */}
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              title="Generate and download high-resolution PDF directly"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Save as PDF'}</span>
            </button>

            {/* 2. PRINT / PRINT DIALOGUE */}
            <button
              onClick={handlePrint}
              title="Print document or select 'Save as PDF' from browser print window"
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print A4</span>
            </button>

            {/* 3. DOWNLOAD WORD (.DOC) */}
            <button
              onClick={handleDownloadWord}
              title="Download editable Microsoft Word (.doc) document (compatible with Word and Google Docs)"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Word (.doc)</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleMarkIssued}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Issued</span>
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
        <div className="no-print px-4 sm:px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Select Template:</span>
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

        {/* Feedback banners */}
        {pdfSuccess && (
          <div className="no-print bg-rose-50 border-b border-rose-200 px-6 py-2 text-xs font-medium text-rose-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-rose-600" />
            <span>PDF letter generated and downloaded successfully!</span>
          </div>
        )}

        {downloadSuccess && (
          <div className="no-print bg-indigo-50 border-b border-indigo-200 px-6 py-2 text-xs font-medium text-indigo-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-indigo-600" />
            <span>Word document (.doc) downloaded successfully!</span>
          </div>
        )}

        {issuedSuccess && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Letter marked as issued! Workflow status updated to "Completed".</span>
          </div>
        )}

        {/* Realistic A4 Paper Letter Layout - Exactly matches PDF Templates 1, 2, and 3 */}
        <div
          ref={letterRef}
          id="corporate-letter-content"
          style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
          className="p-8 sm:p-14 overflow-y-auto space-y-4 text-xs sm:text-[13px] flex-1 leading-relaxed font-sans max-w-3xl mx-auto w-full"
        >
          {/* Top Line: Date and optional Private & Confidential (Only on Renewal) */}
          <div className="flex justify-between items-start pt-2" style={{ color: '#0f172a' }}>
            <div style={{ color: '#0f172a' }}>
              {letter.date}
            </div>
            {letter.confidentialNotice && (
              <div className="font-bold uppercase tracking-wide" style={{ color: '#0f172a' }}>
                {letter.confidentialNotice}
              </div>
            )}
          </div>

          {/* Recipient Details */}
          <div className="pt-4 space-y-0.5" style={{ color: '#0f172a' }}>
            <div className="font-bold tracking-tight" style={{ color: '#0f172a' }}>
              &lt;{letter.recipient.staffId}&gt; &lt;{letter.recipient.name}&gt;
            </div>
            <div style={{ color: '#0f172a' }}>{letter.recipient.throughLine}</div>
            <div style={{ color: '#0f172a' }}>&lt;{letter.recipient.department}&gt;</div>
          </div>

          {/* Salutation */}
          <div className="pt-3" style={{ color: '#0f172a' }}>
            {letter.salutation}
          </div>

          {/* Title with full-width horizontal black line */}
          <div className="pt-3">
            <h1 className="text-xs sm:text-[13px] font-bold uppercase tracking-tight" style={{ color: '#0f172a' }}>
              {letter.title}
            </h1>
            <div className="w-full h-[2px] mt-1.5 mb-3" style={{ backgroundColor: '#000000' }} />
          </div>

          {/* Paragraphs */}
          <div className="space-y-3.5 text-justify leading-normal" style={{ color: '#0f172a' }}>
            {letter.paragraphs.map((p, idx) => (
              <p key={idx} style={{ color: '#0f172a' }}>{p}</p>
            ))}
          </div>

          {/* Signatory Section */}
          <div className="pt-5 space-y-1 print-avoid-break" style={{ color: '#0f172a' }}>
            <div style={{ color: '#0f172a' }}>Yours faithfully</div>
            <div className="font-bold uppercase" style={{ color: '#0f172a' }}>
              &lt;{letter.signatory.company}&gt;
            </div>

            {/* Signature blank space */}
            <div className="h-14" />

            <div className="font-bold text-xs sm:text-[13px]" style={{ color: '#0f172a' }}>
              {letter.signatory.name}
            </div>
            <div className="text-xs sm:text-[12px]" style={{ color: '#1e293b' }}>
              {letter.signatory.title}
            </div>
          </div>

          {/* CC Notice & Initials (For Confirmation & Extension of Probation) */}
          {letter.ccNotice ? (
            <div className="pt-4 text-xs sm:text-[12px] print-avoid-break" style={{ color: '#0f172a' }}>
              <div style={{ color: '#0f172a' }}>{letter.ccNotice}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                {letter.signatory.initials}
              </div>
            </div>
          ) : (
            letter.signatory.initials && (
              <div className="text-[10px] lowercase pt-1 print-avoid-break" style={{ color: '#64748b' }}>
                {letter.signatory.initials}
              </div>
            )
          )}

          {/* Candidate Acceptance Section with Table (ONLY for Renewal) */}
          {letter.hasAcceptanceSlip && (
            <div className="pt-6 space-y-3 print-avoid-break" style={{ borderTop: '1px solid #cbd5e1' }}>
              <p className="text-justify text-xs sm:text-[12px] leading-relaxed" style={{ color: '#0f172a' }}>
                {letter.acceptanceText}
              </p>

              {/* Acceptance Table matching PDF 3 */}
              <div className="pt-1 max-w-md">
                <table className="w-full border-collapse text-xs" style={{ border: '1px solid #000000' }}>
                  <tbody>
                    <tr>
                      <td className="font-bold px-3 py-2 w-32 uppercase" style={{ border: '1px solid #000000', backgroundColor: '#e2e8f0', color: '#0f172a' }}>
                        SIGNATURE
                      </td>
                      <td className="px-3 py-3 h-10" style={{ border: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
                    </tr>
                    <tr>
                      <td className="font-bold px-3 py-2 uppercase" style={{ border: '1px solid #000000', backgroundColor: '#e2e8f0', color: '#0f172a' }}>
                        NRIC
                      </td>
                      <td className="px-3 py-2 h-7" style={{ border: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
                    </tr>
                    <tr>
                      <td className="font-bold px-3 py-2 uppercase" style={{ border: '1px solid #000000', backgroundColor: '#e2e8f0', color: '#0f172a' }}>
                        DATE
                      </td>
                      <td className="px-3 py-2 h-7" style={{ border: '1px solid #000000', backgroundColor: '#ffffff' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
