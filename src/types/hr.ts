export type WorkflowStatus =
  | 'Pending Email'
  | 'Pending Reminder'
  | 'Pending Approval'
  | 'Submission of MRF'
  | 'Letter Preparation'
  | 'Completed';

export type ActionType = 'Contract Renewal' | 'Probation Confirmation';

export type UrgencyLevel = 'overdue' | 'urgent' | 'warning' | 'normal';

export interface MRFRecord {
  recommendationType: 'Renew' | 'Confirm' | 'Extend Probation' | 'Non-Renew';
  proposedPeriod: string;
  proposedStartDate: string;
  proposedEndDate: string;
  proposedSalary: string;
  justification: string;
  superiorRemarks: string;
  headcountBudget: 'Budgeted in AOP' | 'Non-Budgeted' | 'Replacement';
  superiorRecommendedDate: string | null;
  hrVerifiedDate: string | null;
  hodApprovedDate: string | null;
  status: 'Draft' | 'Submitted' | 'Approved';
}

export type LetterTemplateType =
  | 'extension_contract'
  | 'confirmation_work'
  | 'extension_probation'
  | 'performance_review';

export interface LetterRecord {
  templateType: LetterTemplateType;
  letterRef: string;
  issueDate: string;
  effectiveDate: string;
  reviewDate?: string;
  customNotes?: string;
  status: 'Not Generated' | 'Draft' | 'Issued';
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  nric: string;
  businessUnit: string;
  department: string;
  positionTitle: string;
  jobGrade: string;
  dateJoined: string;
  contractExpiryDate: string;
  actionType: ActionType;
  currentSalary: number;
  superiorName: string;
  superiorDesignation: string;
  hodName: string;
  status: WorkflowStatus;
  remarks: string;
  emailSentDate: string | null;
  mrfData?: MRFRecord;
  letterData?: LetterRecord;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  employeeId?: string;
  employeeName?: string;
  action: string;
  details: string;
  type: 'email' | 'mrf' | 'letter' | 'status' | 'system';
}

export interface FilterState {
  search: string;
  department: string;
  actionType: string;
  urgency: string;
  status: string;
}

export type SortField =
  | 'name'
  | 'employeeCode'
  | 'department'
  | 'contractExpiryDate'
  | 'status'
  | 'daysToDue';

export type SortOrder = 'asc' | 'desc';
