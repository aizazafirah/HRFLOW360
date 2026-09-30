import { Employee, LetterTemplateType, LetterRecord } from '../types/hr';
import { formatLongDate, addMonths, formatDate } from './dateUtils';

export interface LetterTemplateMetadata {
  id: LetterTemplateType;
  name: string;
  category: 'Contract' | 'Probation' | 'Appraisal';
  description: string;
}

export const LETTER_TEMPLATES: LetterTemplateMetadata[] = [
  {
    id: 'extension_contract',
    name: 'Extension of Fixed-Term Contract',
    category: 'Contract',
    description: 'Pre-fills tenure extension period, reporting HOD, terms & employee acceptance slip (14 days).',
  },
  {
    id: 'confirmation_work',
    name: 'Confirmation of Work Performance',
    category: 'Probation',
    description: 'Official confirmation letter upon successful completion of probation with permanent terms.',
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
    division: string;
    company: string;
  };
}

export const generateLetterContent = (
  employee: Employee,
  templateType: LetterTemplateType,
  overrides?: Partial<LetterRecord>
): GeneratedLetterContent => {
  const todayFormatted = formatLongDate(overrides?.issueDate || new Date().toISOString());
  const effectiveDate = overrides?.effectiveDate || employee.contractExpiryDate || new Date().toISOString().split('T')[0];
  const effectiveFormatted = formatLongDate(effectiveDate);

  const defaultEndDate = employee.mrfData?.proposedEndDate || addMonths(effectiveDate, 12);
  const endFormatted = formatLongDate(defaultEndDate);

  const defaultReviewDate = overrides?.reviewDate || addMonths(effectiveDate, 6);
  const reviewFormatted = formatLongDate(defaultReviewDate);

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
    name: 'Datin Seri Norazlina binti Dato\' Hashim',
    title: 'Group Chief Human Capital Officer',
    division: 'Group Human Capital Division',
    company: employee.businessUnit || 'Media Prima Berhad',
  };

  switch (templateType) {
    case 'extension_contract':
      return {
        title: 'EXTENSION OF FIXED-TERM CONTRACT OF EMPLOYMENT',
        referenceNumber,
        date: todayFormatted,
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        endDate: endFormatted,
        hasAcceptanceSlip: true,
        paragraphs: [
          `Dear ${employee.name},`,
          `We are pleased to inform you that the Management of ${employee.businessUnit} has approved the extension of your Fixed-Term Contract of Employment as ${employee.positionTitle}, Grade ${employee.jobGrade}, attached to the ${employee.department}.`,
          `This extension shall take effect from ${effectiveFormatted} until ${endFormatted}. Throughout this tenure, you will continue to report to your Head of Department, ${employee.hodName}, or any other authorized officer designated by the Management from time to time.`,
          `Your monthly basic remuneration and designated allowances shall be maintained in accordance with company policy and your verified Manpower Requisition Form (MRF) endorsement.`,
          `All other terms and conditions of service as stipulated in your Principal Letter of Appointment and the Media Prima Group Employee Handbook shall remain unchanged and continue in full force and effect.`,
          `Kindly indicate your acceptance of this contract extension by signing and returning the duplicate copy of this letter to the Group Human Capital Division within fourteen (14) days from the date of this letter, failing which this offer shall automatically lapse.`,
        ],
        acceptanceText: `I, ${employee.name}, NRIC No. ${employee.nric}, hereby acknowledge receipt and accept the offer of Extension of Fixed-Term Contract of Employment subject to the terms and conditions stated herein.`,
        signatory,
      };

    case 'confirmation_work':
      return {
        title: 'CONFIRMATION OF EMPLOYMENT & WORK PERFORMANCE',
        referenceNumber,
        date: todayFormatted,
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        hasAcceptanceSlip: false,
        paragraphs: [
          `Dear ${employee.name},`,
          `On behalf of the Management of ${employee.businessUnit}, we are delighted to inform you that having satisfactorily completed your probationary period, your appointment as ${employee.positionTitle}, Grade ${employee.jobGrade} in the ${employee.department} is hereby confirmed with effect from ${effectiveFormatted}.`,
          `The Management and your Head of Department, ${employee.hodName}, commend your dedicated work performance, professionalism, and positive contributions to the team during your probationary tenure.`,
          `Following this confirmation, you shall be entitled to all benefits, leave entitlements, and medical schemes accorded to confirmed permanent employees of the Group, subject to the prevailing company policies and statutory guidelines.`,
          `We look forward to your continued commitment, exemplary conduct, and ongoing contribution toward achieving the strategic objectives of ${employee.businessUnit}.`,
          `Please accept our hearty congratulations on your confirmation!`,
        ],
        signatory,
      };

    case 'extension_probation':
      return {
        title: 'EXTENSION OF PROBATIONARY PERIOD & PERFORMANCE IMPROVEMENT PLAN',
        referenceNumber,
        date: todayFormatted,
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        reviewDate: reviewFormatted,
        hasAcceptanceSlip: true,
        paragraphs: [
          `Dear ${employee.name},`,
          `We refer to your appointment as ${employee.positionTitle}, Grade ${employee.jobGrade}, in the ${employee.department} and your recent probationary performance evaluation conducted with your supervisor, ${employee.superiorName}.`,
          `Please be advised that the Management has resolved to extend your probationary period for a further duration of six (6) months, commencing from ${effectiveFormatted} until ${reviewFormatted}.`,
          `This extension is granted to afford you adequate opportunity to enhance your work competencies, bridge identified performance gaps, and satisfy key departmental performance indicators (KPIs).`,
          `During this extended probationary tenure, you will be placed on a formal Performance Improvement Plan (PIP) supervised directly by ${employee.superiorName}. The primary target deliverables encompass:`,
        ],
        bulletPoints: [
          'Adherence to agreed project deadlines and operational turnaround timelines.',
          'Consistency in output accuracy, documentation rigor, and peer review standards.',
          'Proactive stakeholder communication and cross-functional collaboration within the team.',
          'Compliance with standard operating procedures and Group code of conduct.',
        ],
        acceptanceText: `I, ${employee.name}, NRIC No. ${employee.nric}, hereby acknowledge receipt of this letter and agree to comply with the Performance Improvement Plan (PIP) during my extended probationary period.`,
        signatory,
      };

    case 'performance_review':
      return {
        title: 'OFFICIAL PERFORMANCE EVALUATION & APPRAISAL REVIEW',
        referenceNumber,
        date: todayFormatted,
        recipient,
        hodName: employee.hodName,
        superiorName: employee.superiorName,
        effectiveDate: effectiveFormatted,
        reviewDate: reviewFormatted,
        hasAcceptanceSlip: false,
        paragraphs: [
          `Dear ${employee.name},`,
          `This official correspondence serves to record the results of your recent Performance Review for the operational cycle in your role as ${employee.positionTitle}, Grade ${employee.jobGrade}, in the ${employee.department}.`,
          `Your appraisal was evaluated by ${employee.superiorName} and formally endorsed by your Head of Department, ${employee.hodName}. The evaluation recognizes your consistent engagement and key achievements within the business unit.`,
          `To sustain high organizational impact and foster your ongoing career progression within ${employee.businessUnit}, the following key development priorities have been established for the next appraisal cycle:`,
        ],
        bulletPoints: [
          'Exceeding key performance milestones outlined in the Annual Operating Plan (AOP).',
          'Active participation in professional capability building and leadership developmental workshops.',
          'Mentoring junior team members and enhancing team knowledge-sharing repositories.',
          'Continuous enhancement of process efficiencies and workflow automation initiatives.',
        ],
        signatory,
      };
  }
};
