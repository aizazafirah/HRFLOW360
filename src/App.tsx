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
    const updated = employees.map((e) => {
      if (e.id === id) {
        return { ...e, status: newStatus };
      }
      return e;
    });
    updateAndSaveEmployees(updated);

    const emp = employees.find((e) => e.id === id);
    if (emp) {
      const newLog = logActivity({
        action: 'Status Updated',
        details: `Status of ${emp.name} (${emp.employeeCode}) changed to "${newStatus}"`,
        employeeId: emp.id,
        employeeName: emp.name,
        type: 'status',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
      showToast(`Status updated to "${newStatus}" for ${emp.name}`, 'info');
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
    const updated = employees.map((emp) => {
      if (employeeIds.includes(emp.id)) {
        return {
          ...emp,
          status: 'Pending Approval' as WorkflowStatus,
          emailSentDate: nowStr,
        };
      }
      return emp;
    });

    updateAndSaveEmployees(updated);

    const newLog = logActivity({
      action: 'HOD Notification Sent',
      details: `Dispatched renewal notification email to Head of Department for ${department} containing ${employeeIds.length} employee records.`,
      type: 'email',
    });
    setActivityLogs((prev) => [newLog, ...prev]);

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
    const updated = employees.map((e) => {
      if (e.id === employeeId) {
        return {
          ...e,
          mrfData,
          status: submitStatus ? ('Submission of MRF' as WorkflowStatus) : e.status,
        };
      }
      return e;
    });

    updateAndSaveEmployees(updated);

    const targetEmp = employees.find((e) => e.id === employeeId);
    if (targetEmp) {
      const newLog = logActivity({
        action: submitStatus ? 'MRF Form Submitted' : 'MRF Draft Saved',
        details: `MRF record for ${targetEmp.name} (${targetEmp.employeeCode}): Decision "${mrfData.recommendationType}", Proposed: ${mrfData.proposedPeriod}`,
        employeeId: targetEmp.id,
        employeeName: targetEmp.name,
        type: 'mrf',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
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
    const updated = employees.map((e) => {
      if (e.id === employeeId) {
        return {
          ...e,
          letterData,
          status: 'Completed' as WorkflowStatus,
        };
      }
      return e;
    });

    updateAndSaveEmployees(updated);

    const targetEmp = employees.find((e) => e.id === employeeId);
    if (targetEmp) {
      const newLog = logActivity({
        action: 'Corporate Letter Issued',
        details: `Official letter (${letterData.templateType}) issued for ${targetEmp.name} (${targetEmp.employeeCode}). Ref: ${letterData.letterRef}`,
        employeeId: targetEmp.id,
        employeeName: targetEmp.name,
        type: 'letter',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
    }

    showToast(`Official letter issued! Status transitioned to "Completed".`, 'success');
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
      showToast(`Updated details for ${emp.name}.`, 'success');
    }
    updateAndSaveEmployees(updated);
  };

  // Delete Employee
  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the management directory?`)) {
      const updated = employees.filter((e) => e.id !== id);
      updateAndSaveEmployees(updated);
      const newLog = logActivity({
        action: 'Employee Removed',
        details: `Deleted employee record for ${name} (ID: ${id})`,
        type: 'system',
      });
      setActivityLogs((prev) => [newLog, ...prev]);
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
      setActivityLogs(loadActivityLogs());
      setFilters({
        search: '',
        department: '',
        actionType: '',
        urgency: '',
        status: '',
      });
      showToast('Database reset to 30 synthetic Malaysian corporate records.', 'info');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `HR_RPM_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${sortedEmployees.length} records to CSV file.`, 'info');
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
        onResetData={handleResetData}
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
            />

            {/* High-density Employee Directory Table */}
            <EmployeeTable
              employees={sortedEmployees}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onOpenMRF={handleOpenMRF}
              onOpenLetter={handleOpenLetter}
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
      <HODEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        employees={employees}
        initialDepartment={emailInitialDept}
        onMarkEmailSent={handleMarkEmailSent}
        departments={departments}
      />

      <MRFFormModal
        isOpen={isMRFModalOpen}
        onClose={() => {
          setIsMRFModalOpen(false);
          setSelectedMRFEmployee(null);
        }}
        employee={selectedMRFEmployee}
        onSaveMRF={handleSaveMRF}
      />

      <CorporateLetterModal
        isOpen={isLetterModalOpen}
        onClose={() => {
          setIsLetterModalOpen(false);
          setSelectedLetterEmployee(null);
        }}
        employee={selectedLetterEmployee}
        onIssueLetter={handleIssueLetter}
      />

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

      <ActivityLogModal
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
        logs={activityLogs}
        onClearLogs={handleClearLogs}
      />

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
            HR-RPM System v1.3 · Single HR Admin Edition · LocalStorage Persistent
          </div>
          <div className="text-[11px] text-slate-400">
            Media Prima Berhad · Group Human Capital Division · Bangsar, Kuala Lumpur
          </div>
        </div>
      </footer>
    </div>
  );
}
