import React, { useState, useMemo, useEffect } from 'react';
import {
  Employee,
  FilterState,
  SortField,
  SortOrder,
  WorkflowStatus,
  MRFRecord,
  LetterRecord,
  ActivityLog,
} from './types/hr';
import {
  loadEmployees,
  saveEmployees,
  resetEmployees,
  loadActivityLogs,
  saveActivityLogs,
  logActivity,
} from './utils/storage';
import { calculateDaysToDue, formatDate } from './utils/dateUtils';
import { Header } from './components/Header';
import { ExecutiveKPIs } from './components/ExecutiveKPIs';
import { FilterBar } from './components/FilterBar';
import { EmployeeTable } from './components/EmployeeTable';
import { HODEmailModal } from './components/HODEmailModal';
import { MRFFormModal } from './components/MRFFormModal';
import { CorporateLetterModal } from './components/CorporateLetterModal';
import { EmployeeEditModal } from './components/EmployeeEditModal';
import { ActivityLogModal } from './components/ActivityLogModal';
import { DepartmentSummaryView } from './components/DepartmentSummaryView';
import { ImportModal } from './components/ImportModal';
import { AuthModal } from './components/AuthModal';
import {
  subscribeToEmployees,
  saveEmployeeToFirestore,
  bulkSyncEmployeesToFirestore,
  deleteEmployeeFromFirestore,
  subscribeToActivityLogs,
  addActivityLogToFirestore,
} from './firebase/firestoreService';
import { generateLetterContent } from './utils/letterTemplates';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Load data from localStorage
  const [employees, setEmployees] = useState<Employee[]>(() => loadEmployees());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadActivityLogs());

  // Active view tab: 'directory' | 'departments'
  const [activeTab, setActiveTab] = useState<string>('directory');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: '',
    actionType: '',
    urgency: '',
    status: '',
  });

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('contractExpiryDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailInitialDept, setEmailInitialDept] = useState<string>('Group Finance');

  const [isMRFModalOpen, setIsMRFModalOpen] = useState<boolean>(false);
  const [selectedMRFEmployee, setSelectedMRFEmployee] = useState<Employee | null>(null);

  const [isLetterModalOpen, setIsLetterModalOpen] = useState<boolean>(false);
  const [selectedLetterEmployee, setSelectedLetterEmployee] = useState<Employee | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedEditEmployee, setSelectedEditEmployee] = useState<Employee | null>(null);

  const [isActivityLogOpen, setIsActivityLogOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Real-time Firestore sync with resilient local fallback
  useEffect(() => {
    let isSeeding = false;
    const unsubEmployees = subscribeToEmployees(
      (remoteEmployees) => {
        if (remoteEmployees.length > 0) {
          setEmployees(remoteEmployees);
          saveEmployees(remoteEmployees);
        } else if (!isSeeding) {
          isSeeding = true;
          // Fresh Firestore: seed initial Malaysian sample records
          const initial = loadEmployees();
          bulkSyncEmployeesToFirestore(initial).catch((err) => {
            console.warn('Initial Firestore seed notice:', err);
          });
        }
      },
      (err) => console.warn('Using local employee cache:', err)
    );

    const unsubLogs = subscribeToActivityLogs(
      (remoteLogs) => {
        if (remoteLogs.length > 0) {
          setActivityLogs(remoteLogs);
        }
      },
      (err) => console.warn('Using local activity log cache:', err)
    );

    return () => {
      unsubEmployees();
      unsubLogs();
    };
  }, []);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Support direct MRF deep link from notification email (?action=mrf&department=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const empId = params.get('employeeId');
    const dept = params.get('department');

    if (action === 'mrf' || action === 'blank-mrf') {
      if (empId && employees.length > 0) {
        const target = employees.find((e) => e.id === empId || e.employeeCode === empId);
        setSelectedMRFEmployee(target || null);
      } else {
        setSelectedMRFEmployee(null);
      }
      setIsMRFModalOpen(true);
      if (dept) {
        setFilters((prev) => ({ ...prev, department: dept }));
      }
    } else if (dept) {
      setFilters((prev) => ({ ...prev, department: dept }));
      setActiveTab('directory');
    }
  }, [employees]);

  // Distinct list of departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Persist employee modifications
  const updateAndSaveEmployees = (updated: Employee[]) => {
    setEmployees(updated);
    saveEmployees(updated);
  };

  // Filtered & Sorted Employee list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search term
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(query);
        const matchesCode = emp.employeeCode.toLowerCase().includes(query);
        const matchesDept = emp.department.toLowerCase().includes(query);
        const matchesPos = emp.positionTitle.toLowerCase().includes(query);
        const matchesNric = emp.nric.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesDept && !matchesPos && !matchesNric) {
          return false;
        }
      }

      // Department filter
      if (filters.department && emp.department !== filters.department) {
        return false;
      }

      // Action type filter
      if (filters.actionType && emp.actionType !== filters.actionType) {
        return false;
      }

      // Urgency filter
      if (filters.urgency) {
        const days = calculateDaysToDue(emp.contractExpiryDate);
        if (filters.urgency === 'overdue' && (days >= 0 || emp.status === 'Completed')) {
          return false;
        }
        if (filters.urgency === 'urgent' && (days < 0 || days > 30 || emp.status === 'Completed')) {
          return false;
        }
        if (filters.urgency === 'warning' && (days <= 30 || days > 60 || emp.status === 'Completed')) {
          return false;
        }
        if (filters.urgency === 'normal' && (days <= 60 && emp.status !== 'Completed')) {
          return false;
        }
      }

      // Status filter
      if (filters.status && emp.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [employees, filters]);

  // Sorted list
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let valA: any = a[sortField as keyof Employee];
      let valB: any = b[sortField as keyof Employee];

      if (sortField === 'daysToDue' || sortField === 'contractExpiryDate') {
        valA = new Date(a.contractExpiryDate).getTime();
        valB = new Date(b.contractExpiryDate).getTime();
      }

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB as string);
        return sortOrder === 'asc' ? comp : -comp;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredEmployees, sortField, sortOrder]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Status Change Handler
  const handleStatusChange = (id: string, newStatus: WorkflowStatus) => {
    let changedEmp: Employee | undefined;
    const updated = employees.map((e) => {
      if (e.id === id) {
        changedEmp = { ...e, status: newStatus };
        return changedEmp;
      }
      return e;
    });
    updateAndSaveEmployees(updated);

    if (changedEmp) {
      saveEmployeeToFirestore(changedEmp).catch((err) => console.warn('Firestore update sync error:', err));
      const newLog = logActivity({
        action: 'Status Updated',
        details: `Status of ${changedEmp.name} (${changedEmp.employeeCode}) changed to "${newStatus}"`,
        employeeId: changedEmp.id,
        employeeName: changedEmp.name,
        type: 'status',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      addActivityLogToFirestore(newLog).catch((err) => console.warn('Firestore log sync error:', err));
      showToast(`Status updated to "${newStatus}" for ${changedEmp.name}`, 'info');
    }
  };

  // Compose Email Trigger
  const handleOpenComposeEmail = (department?: string) => {
    setEmailInitialDept(department || departments[0] || 'Group Finance');
    setIsEmailModalOpen(true);
  };

  // Mark Email Sent
  const handleMarkEmailSent = (employeeIds: string[], department: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const changedEmps: Employee[] = [];
    const updated = employees.map((emp) => {
      if (employeeIds.includes(emp.id)) {
        const u = {
          ...emp,
          status: 'Pending Approval' as WorkflowStatus,
          emailSentDate: nowStr,
        };
        changedEmps.push(u);
        return u;
      }
      return emp;
    });

    updateAndSaveEmployees(updated);
    changedEmps.forEach((ce) => saveEmployeeToFirestore(ce).catch(console.warn));

    const newLog = logActivity({
      action: 'HOD Notification Sent',
      details: `Dispatched renewal notification email to Head of Department for ${department} containing ${employeeIds.length} employee records.`,
      type: 'email',
    });
    setActivityLogs((prev) => [newLog, ...prev]);
    addActivityLogToFirestore(newLog).catch(console.warn);

    showToast(
      `Email dispatched! ${employeeIds.length} employee(s) in ${department} transitioned to "Pending Approval".`,
      'success'
    );
  };

  // MRF Form Open & Save
  const handleOpenMRF = (emp: Employee) => {
    setSelectedMRFEmployee(emp);
    setIsMRFModalOpen(true);
  };

  const handleSaveMRF = (employeeId: string, mrfData: MRFRecord, submitStatus?: boolean) => {
    let updatedEmp: Employee | undefined;
    const updated = employees.map((e) => {
      if (e.id === employeeId) {
        updatedEmp = {
          ...e,
          mrfData,
          status: submitStatus ? ('Submission of MRF' as WorkflowStatus) : e.status,
        };
        return updatedEmp;
      }
      return e;
    });

    updateAndSaveEmployees(updated);
    if (updatedEmp) {
      saveEmployeeToFirestore(updatedEmp).catch(console.warn);
      const newLog = logActivity({
        action: submitStatus ? 'MRF Form Submitted' : 'MRF Draft Saved',
        details: `MRF record for ${updatedEmp.name} (${updatedEmp.employeeCode}): Decision "${mrfData.recommendationType}", Proposed: ${mrfData.proposedPeriod}`,
        employeeId: updatedEmp.id,
        employeeName: updatedEmp.name,
        type: 'mrf',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      addActivityLogToFirestore(newLog).catch(console.warn);
    }

    showToast(
      submitStatus
        ? `MRF Form submitted! Status moved to "Submission of MRF".`
        : `MRF draft saved successfully.`,
      'success'
    );
  };

  // Letter Open & Issue
  const handleOpenLetter = (emp: Employee) => {
    setSelectedLetterEmployee(emp);
    setIsLetterModalOpen(true);
  };

  const handleIssueLetter = (employeeId: string, letterData: LetterRecord) => {
    let updatedEmp: Employee | undefined;
    const updated = employees.map((e) => {
      if (e.id === employeeId) {
        updatedEmp = {
          ...e,
          letterData,
          status: 'Completed' as WorkflowStatus,
        };
        return updatedEmp;
      }
      return e;
    });

    updateAndSaveEmployees(updated);
    if (updatedEmp) {
      saveEmployeeToFirestore(updatedEmp).catch(console.warn);
      const newLog = logActivity({
        action: 'Corporate Letter Issued',
        details: `Official letter (${letterData.templateType}) issued for ${updatedEmp.name} (${updatedEmp.employeeCode}). Ref: ${letterData.letterRef}`,
        employeeId: updatedEmp.id,
        employeeName: updatedEmp.name,
        type: 'letter',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      addActivityLogToFirestore(newLog).catch(console.warn);
    }

    showToast(`Official letter issued! Status transitioned to "Completed".`, 'success');
  };

  // Quick Download Letter (.doc) directly from table row
  const handleQuickDownloadLetter = (emp: Employee) => {
    try {
      const template = emp.letterData?.templateType || (emp.actionType === 'Probation Confirmation' ? 'confirmation_work' : 'extension_contract');
      const letter = generateLetterContent(emp, template);
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
      const filename = `${emp.employeeCode}_${template}.doc`;
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

      showToast(`Downloaded letter for ${emp.name} (${filename}).`, 'success');
    } catch (err) {
      console.error('Download letter error:', err);
      showToast('Could not download letter automatically.', 'warning');
    }
  };

  // Add / Edit Employee
  const handleOpenAddEmployee = () => {
    setSelectedEditEmployee(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setSelectedEditEmployee(emp);
    setIsEditModalOpen(true);
  };

  const handleSaveEmployee = (emp: Employee, isNew: boolean) => {
    let updated: Employee[];
    if (isNew) {
      updated = [emp, ...employees];
      const newLog = logActivity({
        action: 'Employee Added',
        details: `Enrolled ${emp.name} (${emp.employeeCode}) in ${emp.department} (${emp.actionType})`,
        employeeId: emp.id,
        employeeName: emp.name,
        type: 'system',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      addActivityLogToFirestore(newLog).catch(console.warn);
      showToast(`Employee ${emp.name} added successfully.`, 'success');
    } else {
      updated = employees.map((e) => (e.id === emp.id ? emp : e));
      const newLog = logActivity({
        action: 'Employee Details Updated',
        details: `Updated details for ${emp.name} (${emp.employeeCode})`,
        employeeId: emp.id,
        employeeName: emp.name,
        type: 'system',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      addActivityLogToFirestore(newLog).catch(console.warn);
      showToast(`Updated details for ${emp.name}.`, 'success');
    }
    updateAndSaveEmployees(updated);
    saveEmployeeToFirestore(emp).catch(console.warn);
  };

  // Import Employees from Excel / CSV / PDF
  const handleImportEmployees = (newEmployees: Employee[], mode: 'append' | 'replace') => {
    let updated: Employee[];
    if (mode === 'replace') {
      updated = newEmployees;
    } else {
      // Append mode: merge new employees with existing, updating matching employee codes
      const existingMap = new Map(employees.map((e) => [e.employeeCode, e]));
      newEmployees.forEach((e) => {
        existingMap.set(e.employeeCode, e);
      });
      updated = Array.from(existingMap.values());
    }

    updateAndSaveEmployees(updated);
    bulkSyncEmployeesToFirestore(updated).catch(console.warn);

    const newLog = logActivity({
      action: 'Data Imported',
      details: `Bulk imported ${newEmployees.length} employees (${mode === 'append' ? 'Appended' : 'Replaced directory'}) to Firestore Cloud`,
      type: 'status',
    });
    setActivityLogs((prev) => [newLog, ...prev]);
    addActivityLogToFirestore(newLog).catch(console.warn);

    showToast(`Successfully imported ${newEmployees.length} employee records!`, 'success');
  };

  // Delete Employee
  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the management directory?`)) {
      const updated = employees.filter((e) => e.id !== id);
      updateAndSaveEmployees(updated);
      deleteEmployeeFromFirestore(id).catch(console.warn);
      const newLog = logActivity({
        action: 'Employee Removed',
        details: `Deleted employee record for ${name} (ID: ${id})`,
        type: 'system',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      addActivityLogToFirestore(newLog).catch(console.warn);
      showToast(`Record for ${name} removed.`, 'warning');
    }
  };

  // Reset to 30 Sample Data
  const handleResetData = () => {
    if (
      confirm(
        'Reset directory to initial 30 Malaysian corporate sample records? Any unsaved edits will be refreshed.'
      )
    ) {
      const fresh = resetEmployees();
      setEmployees(fresh);
      bulkSyncEmployeesToFirestore(fresh).catch(console.warn);
      setActivityLogs(loadActivityLogs());
      setFilters({
        search: '',
        department: '',
        actionType: '',
        urgency: '',
        status: '',
      });
      showToast('Database reset to 30 synthetic Malaysian corporate records synced with Firestore.', 'info');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'Employee Code',
        'Full Name',
        'NRIC',
        'Business Unit',
        'Department',
        'Position Title',
        'Grade',
        'Action Type',
        'Date Joined',
        'Expiry / Review Date',
        'Days to Due',
        'Workflow Status',
        'Salary (MYR)',
        'Superior Name',
        'HOD Name',
        'Remarks',
      ];

      const rows = sortedEmployees.map((e) => {
        const days = calculateDaysToDue(e.contractExpiryDate);
        return [
          `"${e.employeeCode}"`,
          `"${e.name}"`,
          `"${e.nric}"`,
          `"${e.businessUnit}"`,
          `"${e.department}"`,
          `"${e.positionTitle}"`,
          `"${e.jobGrade}"`,
          `"${e.actionType}"`,
          `"${e.dateJoined}"`,
          `"${e.contractExpiryDate}"`,
          days,
          `"${e.status}"`,
          e.currentSalary,
          `"${e.superiorName}"`,
          `"${e.hodName}"`,
          `"${(e.remarks || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = `MPB_HR_Renewal_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 300);

      showToast(`Exported ${sortedEmployees.length} records to ${filename}.`, 'success');
    } catch (err) {
      console.error('Export CSV failed:', err);
      showToast('Could not download file. Please check browser permissions.', 'warning');
    }
  };

  // Clear Activity Logs
  const handleClearLogs = () => {
    if (confirm('Clear all audit logs?')) {
      saveActivityLogs([]);
      setActivityLogs([]);
      showToast('Audit log history cleared.', 'info');
    }
  };

  // KPI Card Filter Quick Click
  const handleSelectKPIFilter = (type: 'status' | 'urgency' | 'clear', value?: string) => {
    if (type === 'clear') {
      setFilters((prev) => ({ ...prev, status: '', urgency: '' }));
    } else if (type === 'status') {
      setFilters((prev) => ({ ...prev, status: value || '', urgency: '' }));
    } else if (type === 'urgency') {
      setFilters((prev) => ({ ...prev, urgency: value || '', status: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenComposeEmail={() => handleOpenComposeEmail()}
        onOpenActivityLogs={() => setIsActivityLogOpen(true)}
        onExportCsv={handleExportCSV}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetData={handleResetData}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenBlankMRF={() => {
          setSelectedMRFEmployee(null);
          setIsMRFModalOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Executive KPI Summary Cards */}
        <ExecutiveKPIs
          employees={employees}
          activeFilterStatus={filters.status}
          activeFilterUrgency={filters.urgency}
          onSelectFilter={handleSelectKPIFilter}
        />

        {/* Tab View Switching */}
        {activeTab === 'directory' ? (
          <div>
            {/* Filter Bar with search and dropdowns */}
            <FilterBar
              filters={filters}
              onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
              onResetFilters={() =>
                setFilters({
                  search: '',
                  department: '',
                  actionType: '',
                  urgency: '',
                  status: '',
                })
              }
              departments={departments}
              totalResults={sortedEmployees.length}
              totalRecords={employees.length}
              onOpenAddEmployee={handleOpenAddEmployee}
              onOpenImport={() => setIsImportModalOpen(true)}
            />

            {/* High-density Employee Directory Table */}
            <EmployeeTable
              employees={sortedEmployees}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onOpenMRF={handleOpenMRF}
              onOpenLetter={handleOpenLetter}
              onDownloadLetter={handleQuickDownloadLetter}
              onEditEmployee={handleOpenEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : (
          <DepartmentSummaryView
            employees={employees}
            departments={departments}
            onComposeDepartmentEmail={(dept) => handleOpenComposeEmail(dept)}
            onFilterByDepartment={(dept) => {
              setFilters((prev) => ({ ...prev, department: dept }));
              setActiveTab('directory');
            }}
          />
        )}
      </main>

      {/* Modals */}
      {isEmailModalOpen && (
        <HODEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          employees={employees}
          initialDepartment={emailInitialDept}
          onMarkEmailSent={handleMarkEmailSent}
          departments={departments}
          onOpenMRF={(emp) => {
            setSelectedMRFEmployee(emp || null);
            setIsMRFModalOpen(true);
          }}
        />
      )}

      {isMRFModalOpen && (
        <MRFFormModal
          isOpen={isMRFModalOpen}
          onClose={() => {
            setIsMRFModalOpen(false);
            setSelectedMRFEmployee(null);
          }}
          employee={selectedMRFEmployee}
          onSaveMRF={handleSaveMRF}
        />
      )}

      {isLetterModalOpen && selectedLetterEmployee && (
        <CorporateLetterModal
          isOpen={isLetterModalOpen}
          onClose={() => {
            setIsLetterModalOpen(false);
            setSelectedLetterEmployee(null);
          }}
          employee={selectedLetterEmployee}
          onIssueLetter={handleIssueLetter}
        />
      )}

      {isEditModalOpen && (
        <EmployeeEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEditEmployee(null);
          }}
          employee={selectedEditEmployee}
          onSave={handleSaveEmployee}
          departments={departments}
        />
      )}

      {isActivityLogOpen && (
        <ActivityLogModal
          isOpen={isActivityLogOpen}
          onClose={() => setIsActivityLogOpen(false)}
          logs={activityLogs}
          onClearLogs={handleClearLogs}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportEmployees={handleImportEmployees}
          departments={departments}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toastMessage.type === 'warning'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 py-4 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Media Prima Berhad · Group Human Capital · HRFLOW360
          </div>
          <div className="text-[11px] text-slate-400">
            Media Prima Berhad · Group Human Capital Division · Bangsar, Kuala Lumpur
          </div>
        </div>
      </footer>
    </div>
  );
}
