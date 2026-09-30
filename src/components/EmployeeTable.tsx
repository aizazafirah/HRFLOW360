import React from 'react';
import { Employee, WorkflowStatus, SortField, SortOrder } from '../types/hr';
import { calculateDaysToDue, formatDate } from '../utils/dateUtils';
import {
  FileText,
  FileCheck2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onOpenMRF: (employee: Employee) => void;
  onOpenLetter: (employee: Employee) => void;
  onDownloadLetter?: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string, name: string) => void;
  onStatusChange: (id: string, newStatus: WorkflowStatus) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  sortField,
  sortOrder,
  onSort,
  onOpenMRF,
  onOpenLetter,
  onDownloadLetter,
  onEditEmployee,
  onDeleteEmployee,
  onStatusChange,
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-slate-900" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-slate-900" />
    );
  };

  const getUrgencyBadge = (expiryDate: string, status: WorkflowStatus) => {
    if (status === 'Completed') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">Completed</span>
        </div>
      );
    }

    const days = calculateDaysToDue(expiryDate);

    if (days < 0) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600 animate-pulse" />
          <span className="text-[11px] font-bold font-mono tabular-nums">
            Overdue by {Math.abs(days)}d
          </span>
        </div>
      );
    }

    if (days <= 30) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          <span className="text-[11px] font-bold font-mono tabular-nums">
            {days}d left (&lt;30d)
          </span>
        </div>
      );
    }

    if (days <= 60) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span className="text-[11px] font-semibold font-mono tabular-nums">
            {days}d left (&lt;60d)
          </span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-400" />
        <span className="text-[11px] font-mono tabular-nums">
          {days}d left (&gt;60d)
        </span>
      </div>
    );
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'Pending Email':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'Pending Reminder':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Pending Approval':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Submission of MRF':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Letter Preparation':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Completed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No employee records found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          No records match your active search and filter criteria. Adjust your filters or reset to view all employees.
        </p>
      </div>
    );
  }

  return (
    <div className="directory-table bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <th
                onClick={() => onSort('employeeCode')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Employee / NRIC</span>
                  {getSortIcon('employeeCode')}
                </div>
              </th>

              <th
                onClick={() => onSort('department')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Department & BU</span>
                  {getSortIcon('department')}
                </div>
              </th>

              <th className="py-3 px-3 whitespace-nowrap">
                <span>Position & Grade</span>
              </th>

              <th className="py-3 px-3 whitespace-nowrap">
                <span>Action Type</span>
              </th>

              <th
                onClick={() => onSort('contractExpiryDate')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Expiry & Urgency</span>
                  {getSortIcon('contractExpiryDate')}
                </div>
              </th>

              <th
                onClick={() => onSort('status')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Workflow Status</span>
                  {getSortIcon('status')}
                </div>
              </th>

              <th className="py-3 px-4 text-right whitespace-nowrap">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const days = calculateDaysToDue(emp.contractExpiryDate);
              const isOverdue = days < 0 && emp.status !== 'Completed';

              return (
                <tr
                  key={emp.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isOverdue ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Employee Name & Staff ID */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 leading-tight">
                      {emp.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-700 font-medium">
                        {emp.employeeCode}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-slate-500">{emp.nric}</span>
                    </div>
                  </td>

                  {/* Department & BU */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800 truncate max-w-[160px]">
                      {emp.department}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                      {emp.businessUnit}
                    </div>
                  </td>

                  {/* Position & Grade */}
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium truncate max-w-[170px]" title={emp.positionTitle}>
                      {emp.positionTitle}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Grade: <span className="font-mono font-medium text-slate-700">{emp.jobGrade}</span>
                    </div>
                  </td>

                  {/* Action Type */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-medium ${
                        emp.actionType === 'Contract Renewal'
                          ? 'text-indigo-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {emp.actionType}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Joined: {formatDate(emp.dateJoined)}
                    </div>
                  </td>

                  {/* Expiry Date & Urgency badge */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-medium font-mono text-slate-900 tabular-nums">
                      {formatDate(emp.contractExpiryDate)}
                    </div>
                    <div className="mt-1">
                      {getUrgencyBadge(emp.contractExpiryDate, emp.status)}
                    </div>
                  </td>

                  {/* Workflow Status Dropdown */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="relative inline-block">
                      <select
                        value={emp.status}
                        onChange={(e) => onStatusChange(emp.id, e.target.value as WorkflowStatus)}
                        className={`text-[11px] font-medium px-2 py-1 rounded-md border appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors ${getStatusColor(
                          emp.status
                        )}`}
                      >
                        <option value="Pending Email">Pending Email</option>
                        <option value="Pending Reminder">Pending Reminder</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Submission of MRF">Submission of MRF</option>
                        <option value="Letter Preparation">Letter Preparation</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500">
                        ▼
                      </div>
                    </div>
                    {emp.emailSentDate && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Notified: {formatDate(emp.emailSentDate)}
                      </div>
                    )}
                  </td>

                  {/* Quick Actions: MRF & Corporate Letter */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View / Fill MRF Form */}
                      <button
                        onClick={() => onOpenMRF(emp)}
                        title="View / Fill Manpower Requisition Form (MRF)"
                        className="px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>MRF Form</span>
                      </button>

                      {/* Generate Corporate Letter */}
                      <button
                        onClick={() => onOpenLetter(emp)}
                        title="Generate Official Corporate HR Letter (4 Templates)"
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate Letter</span>
                      </button>

                      {/* Quick Download Letter */}
                      {onDownloadLetter && (
                        <button
                          onClick={() => onDownloadLetter(emp)}
                          title="Quick Download Letter (.doc)"
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 rounded-md transition-colors shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Quick Edit */}
                      <button
                        onClick={() => onEditEmployee(emp)}
                        title="Edit Employee Details"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteEmployee(emp.id, emp.name)}
                        title="Delete Record"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
