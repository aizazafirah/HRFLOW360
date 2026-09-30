import React from 'react';
import { Employee } from '../types/hr';
import { calculateDaysToDue } from '../utils/dateUtils';
import { Building2, Mail, Users, ArrowRight, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface DepartmentSummaryViewProps {
  employees: Employee[];
  departments: string[];
  onComposeDepartmentEmail: (department: string) => void;
  onFilterByDepartment: (department: string) => void;
}

export const DepartmentSummaryView: React.FC<DepartmentSummaryViewProps> = ({
  employees,
  departments,
  onComposeDepartmentEmail,
  onFilterByDepartment,
}) => {
  const departmentStats = departments.map((dept) => {
    const deptEmployees = employees.filter((e) => e.department === dept);
    const hod = deptEmployees[0]?.hodName || 'Head of Department';
    const bu = deptEmployees[0]?.businessUnit || 'Media Prima Berhad';

    const overdue = deptEmployees.filter((e) => {
      const d = calculateDaysToDue(e.contractExpiryDate);
      return d < 0 && e.status !== 'Completed';
    }).length;

    const urgent = deptEmployees.filter((e) => {
      const d = calculateDaysToDue(e.contractExpiryDate);
      return d >= 0 && d <= 30 && e.status !== 'Completed';
    }).length;

    const pendingEmail = deptEmployees.filter((e) => e.status === 'Pending Email').length;
    const pendingApproval = deptEmployees.filter((e) => e.status === 'Pending Approval').length;
    const completed = deptEmployees.filter((e) => e.status === 'Completed').length;

    return {
      department: dept,
      businessUnit: bu,
      hod,
      total: deptEmployees.length,
      overdue,
      urgent,
      pendingEmail,
      pendingApproval,
      completed,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Department-Level Renewal & Probation Overview
          </h2>
          <p className="text-xs text-slate-500">
            Monitor pipeline urgency across Media Prima business divisions and trigger HOD notifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentStats.map((stat) => (
          <div
            key={stat.department}
            className={`bg-white rounded-xl border transition-all p-5 shadow-2xs flex flex-col justify-between ${
              stat.overdue > 0
                ? 'border-rose-300 ring-1 ring-rose-200'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {stat.total} Staff
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug">
                {stat.department}
              </h3>
              <div className="text-[11px] text-slate-500 mb-1">
                {stat.businessUnit}
              </div>
              <div className="text-[11px] text-slate-600 mb-4">
                HOD: <span className="font-semibold text-slate-800">{stat.hod}</span>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center mb-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Overdue</div>
                  <div
                    className={`font-mono font-bold text-sm tabular-nums ${
                      stat.overdue > 0 ? 'text-rose-600 font-black' : 'text-slate-700'
                    }`}
                  >
                    {stat.overdue}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">&lt;30 Days</div>
                  <div
                    className={`font-mono font-bold text-sm tabular-nums ${
                      stat.urgent > 0 ? 'text-amber-600' : 'text-slate-700'
                    }`}
                  >
                    {stat.urgent}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Mail</div>
                  <div className="font-mono font-bold text-sm text-sky-600 tabular-nums">
                    {stat.pendingEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onComposeDepartmentEmail(stat.department)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Compose Email</span>
              </button>

              <button
                onClick={() => onFilterByDepartment(stat.department)}
                title="View in directory table"
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
