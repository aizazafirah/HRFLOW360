import { Employee, LetterTemplateType, LetterRecord } from '../types/hr';
import { formatCorporateDate, addMonths } from './dateUtils';

export interface LetterTemplateMetadata {
  id: LetterTemplateType;
  name: string;
  category: 'Contract' | 'Probation';
  description: string;
}

export const LETTER_TEMPLATES: LetterTemplateMetadata[] = [
  {
    id: 'extension_contract',
    name: 'Renewal (Extension of Fixed-Term Contract)',
    category: 'Contract',
    description: 'Exact corporate Renewal template with HOD reporting, tenure period, Sylvia Singaraim sign-off, and Acceptance Slip.',
  },
  {
    id: 'confirmation_work',
    name: 'Confirmation (Confirmation of Work Performance)',
    category: 'Probation',
    description: 'Exact corporate Confirmation template with work review, congratulations, Sylvia Singaraim sign-off, and cc: Database Management.',
  },
  {
    id: 'extension_probation',
    name: 'Extension of Probationary Period',
    category: 'Probation',
    description: 'Exact corporate 3-month probation extension template with PIP session, review date, Sylvia Singaraim sign-off, and cc: Database Mgmnt.',
  },
];

export interface GeneratedLetterContent {
  title: string;
  referenceNumber: string;
  date: string;
  confidentialNotice?: string; // Only for Renewal
  salutation: string;
  recipient: {
    name: string;
    staffId: string;
    position: string;
    grade: string;
    department: string;
    businessUnit: string;
    nric: string;
    throughLine: string;
  };
  hodName: string;
  superiorName: string;
  effectiveDate: string;
  endDate?: string;
  reviewDate?: string;
  paragraphs: string[];
  hasAcceptanceSlip: boolean;
  acceptanceText?: string;
  signatory: {
    name: string;
    title: string;
    company: string;
    initials?: string;
  };
  ccNotice?: string;
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

  // For probation extension: 3 months from effective date
  const defaultReviewDate = overrides?.reviewDate || addMonths(effectiveDate, 3);
  const reviewFormatted = formatCorporateDate(defaultReviewDate);

  const referenceNumber = overrides?.letterRef || `MPB/HC/2026/${employee.employeeCode}`;

  switch (templateType) {
    // --------------------------------------------------------------------------------
    // TEMPLATE 1: RENEWAL (EXTENSION OF FIXED-TERM CONTRACT) - EXACT MATCH PDF 3
    // --------------------------------------------------------------------------------
    case 'extension_contract':
      return {
        title: 'EXTENSION OF FIXED-TERM CONTRACT',
        referenceNumber,
        date: todayFormatted,
        confidentialNotice: 'PRIVATE AND CONFIDENTIAL',
        salutation: 'Dear Sir / Madam,',
        recipient: {
          name: employee.name.toUpperCase(),
          staffId: employee.employeeCode,
          position: employee.positionTitle,
          grade: employee.jobGrade,
          department: employee.department.toUpperCase(),
          businessUnit: employee.businessUnit || 'MEDIA PRIMA BERHAD',
          nric: employee.nric,
          throughLine: `Through the <${employee.hodName}>`,
        },
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        endDate: endFormatted,
        hasAcceptanceSlip: true,
        paragraphs: [
          `Reference is made to our fixed-term contract dated ${formatCorporateDate(employee.dateJoined)}.`,
          `This is to inform you that your contract period shall be for a term of ${effectiveFormatted} until ${endFormatted} and unless otherwise specified, the fixed-term contract will automatically expire thereafter if the stipulated term of service is not further extended.`,
          `Your position shall remain as an <${employee.positionTitle}> at the Grade <${employee.jobGrade}> based at the <${employee.department}> Department. You will report to the Head of <${employee.department}> Department.`,
          `Except for the above, your other terms and conditions shall remain unchanged.`,
          `Kindly sign and return the duplicate of this letter to the undersigned not later than 14 days from the date of this letter.`,
          `Thank you and best regards.`,
        ],
        acceptanceText: `I have read and understood the above stated terms and conditions and hereby accept the offer of fixed-term contract and agree to abide by the terms and conditions.`,
        signatory: {
          name: 'SYLVIA SINGARAIM',
          title: 'General Manager, Human Resources',
          company: employee.businessUnit || 'MEDIA PRIMA BERHAD',
          initials: 'syl/aiz',
        },
      };

    // --------------------------------------------------------------------------------
    // TEMPLATE 2: CONFIRMATION (CONFIRMATION OF WORK PERFORMANCE) - EXACT MATCH PDF 2
    // --------------------------------------------------------------------------------
    case 'confirmation_work':
      return {
        title: 'CONFIRMATION OF WORK PERFORMANCE',
        referenceNumber,
        date: todayFormatted,
        salutation: 'Dear Sir/Madam,',
        recipient: {
          name: employee.name.toUpperCase(),
          staffId: employee.employeeCode,
          position: employee.positionTitle,
          grade: employee.jobGrade,
          department: employee.department.toUpperCase(),
          businessUnit: employee.businessUnit || 'Media Prima Berhad',
          nric: employee.nric,
          throughLine: `Through the <Position Head of Department>`,
        },
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        hasAcceptanceSlip: false,
        paragraphs: [
          `We refer to our letter of Extension of Probationary Period dated ${formatCorporateDate(employee.dateJoined)}, offering you the position of <${employee.positionTitle}> placed at the Grade of <${employee.jobGrade}>, based at the <${employee.department}> of <${employee.businessUnit || 'Company'}>, on a contract basis in our Company.`,
          `We have carefully reviewed your work performance during your probationary period and are pleased to inform that you are now confirmed in your position with effect from <${effectiveFormatted}>.`,
          `We would like to take this opportunity to congratulate you on your confirmation and trust you will continue with your good work for the betterment of the company.`,
          `Except for the above, your other terms and conditions of the contract shall remain unchanged.`,
        ],
        signatory: {
          name: 'SYLVIA SINGARAIM',
          title: 'General Manager, Human Resources Operations',
          company: employee.businessUnit || 'Company',
          initials: 'aiz/.',
        },
        ccNotice: 'cc : Database Management',
      };

    // --------------------------------------------------------------------------------
    // TEMPLATE 3: EXTENSION OF PROBATIONARY PERIOD - EXACT MATCH PDF 1
    // --------------------------------------------------------------------------------
    case 'extension_probation':
    default:
      return {
        title: 'EXTENSION OF PROBATIONARY PERIOD',
        referenceNumber,
        date: todayFormatted,
        salutation: 'Dear Sir/Madam,',
        recipient: {
          name: employee.name.toUpperCase(),
          staffId: employee.employeeCode,
          position: employee.positionTitle,
          grade: employee.jobGrade,
          department: employee.department.toUpperCase(),
          businessUnit: employee.businessUnit || 'Company',
          nric: employee.nric,
          throughLine: `Through the <Head of Department>`,
        },
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        reviewDate: reviewFormatted,
        hasAcceptanceSlip: false,
        paragraphs: [
          `We refer to our fixed term contract dated ${formatCorporateDate(employee.dateJoined)}, offering you the position of an <${employee.positionTitle}> placed at the Grade of <${employee.jobGrade}>, based at the <${employee.department}> of <${employee.businessUnit || 'Company'}>.`,
          `We have carefully reviewed your performance during your probationary period and regret to inform that your probationary period has been extended for another three (3) months effective <${effectiveFormatted}>.`,
          `You are required to undergo ‘Performance Improvement Plan’ Session with your immediate superior to lay out your tasks and targets. Your performance shall be continued to be monitored to ensure that you will put in a more serious effort to achieve the objective and goals of the Company.`,
          `Your performance will be reviewed on <${reviewFormatted}>. We hope you will make efforts to improve your all round performance and conduct.`,
          `Except for the above, your other terms and conditions of the contract shall remain unchanged.`,
        ],
        signatory: {
          name: 'SYLVIA SINGARAIM',
          title: 'General Manager, Human Resources Operations',
          company: employee.businessUnit || 'COMPANY',
          initials: 'syl/aiz',
        },
        ccNotice: 'cc : Database Mgmnt',
      };
  }
};
