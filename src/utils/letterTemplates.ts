import { Employee, LetterTemplateType, LetterRecord } from '../types/hr';
import { formatCorporateDate, addMonths, formatDate } from './dateUtils';

export interface LetterTemplateMetadata {
  id: LetterTemplateType;
  name: string;
  category: 'Contract' | 'Probation' | 'Appraisal';
  description: string;
}

export const LETTER_TEMPLATES: LetterTemplateMetadata[] = [
  {
    id: 'extension_contract',
    name: 'Extension of Fixed-Term Contract (Renewal Letter)',
    category: 'Contract',
    description: 'Official corporate renewal letter with reporting HOD, tenure period, terms & acceptance table.',
  },
  {
    id: 'confirmation_work',
    name: 'Confirmation of Employment',
    category: 'Probation',
    description: 'Official confirmation letter upon successful completion of probation with permanent status.',
  },
  {
    id: 'extension_probation',
    name: 'Extension of Probationary Period',
    category: 'Probation',
    description: 'Pre-fills extension clause (3-6 months), Performance Improvement Plan (PIP), and review date.',
  },
  {
    id: 'performance_review',
    name: 'Performance Review Letter',
    category: 'Appraisal',
    description: 'Documents official appraisal score, development feedback milestones, and next cycle targets.',
  },
];

export interface GeneratedLetterContent {
  title: string;
  referenceNumber: string;
  date: string;
  confidentialNotice: string;
  salutation: string;
  recipient: {
    name: string;
    staffId: string;
    position: string;
    grade: string;
    department: string;
    businessUnit: string;
    nric: string;
  };
  hodName: string;
  superiorName: string;
  effectiveDate: string;
  endDate?: string;
  reviewDate?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  hasAcceptanceSlip: boolean;
  acceptanceText?: string;
  signatory: {
    name: string;
    title: string;
    division?: string;
    company: string;
    initials?: string;
  };
}

export const generateLetterContent = (
  employee: Employee,
  templateType: LetterTemplateType,
  overrides?: Partial<LetterRecord>
): GeneratedLetterContent => {
  const todayFormatted = formatCorporateDate(overrides?.issueDate || new Date().toISOString());
  const effectiveDate = overrides?.effectiveDate || employee.contractExpiryDate || new Date().toISOString().split('T')[0];
  const effectiveFormatted = formatCorporateDate(effectiveDate);

  const defaultEndDate = employee.mrfData?.proposedEndDate || addMonths(effectiveDate, 12);
  const endFormatted = formatCorporateDate(defaultEndDate);

  const defaultReviewDate = overrides?.reviewDate || addMonths(effectiveDate, 6);
  const reviewFormatted = formatCorporateDate(defaultReviewDate);

  const refPrefix = templateType === 'extension_contract'
    ? 'MPB/HC/CON'
    : templateType === 'confirmation_work'
    ? 'MPB/HC/CONF'
    : templateType === 'extension_probation'
    ? 'MPB/HC/PROB-EXT'
    : 'MPB/HC/PERF';

  const referenceNumber = overrides?.letterRef || `${refPrefix}/2026/${employee.employeeCode}`;

  const recipient = {
    name: employee.name,
    staffId: employee.employeeCode,
    position: employee.positionTitle,
    grade: employee.jobGrade,
    department: employee.department,
    businessUnit: employee.businessUnit,
    nric: employee.nric,
  };

  const signatory = {
    name: 'SYLVIA SINGARAIM',
    title: 'General Manager, Human Resources',
    division: 'Group Human Resources Department',
    company: employee.businessUnit || 'MEDIA PRIMA BERHAD',
    initials: 'syl/aiz',
  };

  switch (templateType) {
    case 'extension_contract':
      return {
        title: 'EXTENSION OF FIXED-TERM CONTRACT',
        referenceNumber,
        date: todayFormatted,
        confidentialNotice: 'PRIVATE AND CONFIDENTIAL',
        salutation: 'Dear Sir / Madam,',
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        endDate: endFormatted,
        hasAcceptanceSlip: true,
        paragraphs: [
          `Reference is made to our fixed-term contract dated ${formatCorporateDate(employee.dateJoined)}.`,
          `This is to inform you that your contract period shall be for a term of ${effectiveFormatted} until ${endFormatted} and unless otherwise specified, the fixed-term contract will automatically expire thereafter if the stipulated term of service is not further extended.`,
          `Your position shall remain as an ${employee.positionTitle} at the Grade ${employee.jobGrade} based at the ${employee.department} Department. You will report to the Head of ${employee.department} Department.`,
          `Except for the above, your other terms and conditions shall remain unchanged.`,
          `Kindly sign and return the duplicate of this letter to the undersigned not later than 14 days from the date of this letter.`,
          `Thank you and best regards.`,
        ],
        acceptanceText: `I have read and understood the above stated terms and conditions and hereby accept the offer of fixed-term contract and agree to abide by the terms and conditions.`,
        signatory,
      };

    case 'confirmation_work':
      return {
        title: 'CONFIRMATION OF EMPLOYMENT',
        referenceNumber,
        date: todayFormatted,
        confidentialNotice: 'PRIVATE AND CONFIDENTIAL',
        salutation: 'Dear Sir / Madam,',
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        hasAcceptanceSlip: false,
        paragraphs: [
          `Reference is made to your appointment as ${employee.positionTitle} at the Grade ${employee.jobGrade} in the ${employee.department} Department.`,
          `We are pleased to inform you that having satisfactorily completed your probationary period, your appointment as ${employee.positionTitle} in the ${employee.department} Department is hereby confirmed with effect from ${effectiveFormatted}.`,
          `Your position shall remain based at the ${employee.department} Department, reporting to the Head of ${employee.department} Department. All other terms and conditions of your employment contract shall remain unchanged.`,
          `Kindly sign and return the duplicate of this letter to the undersigned not later than 14 days from the date of this letter.`,
          `Thank you and best regards.`,
        ],
        signatory,
      };

    case 'extension_probation':
      return {
        title: 'EXTENSION OF PROBATIONARY PERIOD',
        referenceNumber,
        date: todayFormatted,
        confidentialNotice: 'PRIVATE AND CONFIDENTIAL',
        salutation: 'Dear Sir / Madam,',
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        reviewDate: reviewFormatted,
        hasAcceptanceSlip: true,
        paragraphs: [
          `Reference is made to your employment contract dated ${formatCorporateDate(employee.dateJoined)} as ${employee.positionTitle}, Grade ${employee.jobGrade} in the ${employee.department} Department.`,
          `We wish to inform you that the Management has resolved to extend your probationary period until ${reviewFormatted} to afford you additional opportunity to meet the expected performance deliverables.`,
          `Your position shall remain as an ${employee.positionTitle} at the Grade ${employee.jobGrade} based at the ${employee.department} Department, reporting to the Head of ${employee.department} Department.`,
          `Except for the above, your other terms and conditions shall remain unchanged.`,
          `Kindly sign and return the duplicate of this letter to the undersigned not later than 14 days from the date of this letter.`,
          `Thank you and best regards.`,
        ],
        acceptanceText: `I have read and understood the above stated terms and conditions and hereby accept the extension of probationary period and agree to abide by the terms and conditions.`,
        signatory,
      };

    case 'performance_review':
      return {
        title: 'ANNUAL PERFORMANCE APPRAISAL REVIEW',
        referenceNumber,
        date: todayFormatted,
        confidentialNotice: 'PRIVATE AND CONFIDENTIAL',
        salutation: 'Dear Sir / Madam,',
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        reviewDate: reviewFormatted,
        hasAcceptanceSlip: false,
        paragraphs: [
          `Reference is made to the annual performance appraisal evaluation conducted for your role as ${employee.positionTitle}, Grade ${employee.jobGrade} in the ${employee.department} Department.`,
          `Your appraisal has been duly evaluated by ${employee.superiorName} and endorsed by your Head of Department, ${employee.hodName}.`,
          `Except for the above, your other terms and conditions of employment shall remain unchanged.`,
          `Thank you and best regards.`,
        ],
        signatory,
      };
  }
};
