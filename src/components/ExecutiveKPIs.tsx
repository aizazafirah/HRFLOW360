import React from 'react';
import { Employee } from '../types/hr';
import { calculateDaysToDue } from '../utils/dateUtils';
import { Users, AlertOctagon, Mail, Clock, FileCheck2, CheckCircle2 } from 'lucide-react';

interface ExecutiveKPIsProps {
  employees: Employee[];
  activeFilterStatus: string;
  activeFilterUrgency: string;
  onSelectFilter: (type: 'status' | 'urgency' | 'clear', value?: string) => void;
}

export const ExecutiveKPIs: React.FC<ExecutiveKPIsProps> = ({
  employees,
  activeFilterStatus,
  activeFilterUrgency,
  onSelectFilter,
}) => {
  // Compute counts
  const totalActive = employees.length;

  const overdueCount = employees.filter((e) => {
    const days = calculateDaysToDue(e.contractExpiryDate);
    return days < 0 && e.status !== 'Completed';
  }).length;

  const pendingEmailCount = employees.filter((e) => e.status === 'Pending Email').length;
  const pendingApprovalCount = employees.filter((e) => e.status === 'Pending Approval').length;
  const submissionMrfCount = employees.filter((e) => e.status === 'Submission of MRF').length;
  const completedCount = employees.filter((e) => e.status === 'Completed').length;

  const cards = [
    {
      id: 'total',
      label: 'Total Active Records',
      count: totalActive,
      subtext: 'Synthetic Malaysian records',
      icon: Users,
      iconColor: 'text-slate-700 bg-slate-100',
      borderColor: 'border-slate-200',
      hoverBorder: 'hover:border-slate-400',
      isActive: activeFilterStatus === '' && activeFilterUrgency === '',
      onClick: () => onSelectFilter('clear'),
    },
    {
      id: 'overdue',
      label: 'Overdue Expiries',
      count: overdueCount,
      subtext: 'Action due date passed',
      icon: AlertOctagon,
      iconColor: 'text-rose-600 bg-rose-50',
      borderColor: overdueCount > 0 ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200',
      hoverBorder: 'hover:border-rose-400',
      isActive: activeFilterUrgency === 'overdue',
      onClick: () => onSelectFilter('urgency', 'overdue'),
      alert: overdueCount > 0,
    },
    {
      id: 'pending_email',
      label: 'Pending Email',
      count: pendingEmailCount,
      subtext: 'Awaiting HOD notification',
      icon: Mail,
      iconColor: 'text-sky-600 bg-sky-50',
      borderColor: 'border-slate-200',
      hoverBorder: 'hover:border-sky-400',
      isActive: activeFilterStatus === 'Pending Email',
      onClick: () => onSelectFilter('status', 'Pending Email'),
    },
    {
      id: 'pending_approval',
      label: 'Pending Approval',
      count: pendingApprovalCount,
      subtext: 'Awaiting HOD / Management',
      icon: Clock,
      iconColor: 'text-amber-600 bg-amber-50',
      borderColor: 'border-slate-200',
      hoverBorder: 'hover:border-amber-400',
      isActive: activeFilterStatus === 'Pending Approval',
      onClick: () => onSelectFilter('status', 'Pending Approval'),
    },
    {
      id: 'submission_mrf',
      label: 'Submission of MRF',
      count: submissionMrfCount,
      subtext: 'MRF lodged & verified',
      icon: FileCheck2,
      iconColor: 'text-indigo-600 bg-indigo-50',
      borderColor: 'border-slate-200',
      hoverBorder: 'hover:border-indigo-400',
      isActive: activeFilterStatus === 'Submission of MRF',
      onClick: () => onSelectFilter('status', 'Submission of MRF'),
    },
    {
      id: 'completed',
      label: 'Completed',
      count: completedCount,
      subtext: 'Letter issued & archived',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50',
      borderColor: 'border-slate-200',
      hoverBorder: 'hover:border-emerald-400',
      isActive: activeFilterStatus === 'Completed',
      onClick: () => onSelectFilter('status', 'Completed'),
    },
  ];

  return (
    <div className="kpi-container mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Executive KPI Summary</h2>
          <p className="text-xs text-slate-500">
            Real-time status overview across Malaysian corporate business units
          </p>
        </div>
        {(activeFilterStatus !== '' || activeFilterUrgency !== '') && (
          <button
            onClick={() => onSelectFilter('clear')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium underline underline-offset-2 transition-colors"
          >
            Clear active KPI filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.onClick}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden bg-white ${
                card.borderColor
              } ${card.hoverBorder} ${
                card.isActive
                  ? 'ring-2 ring-slate-900 shadow-sm border-transparent'
                  : 'shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 truncate pr-1">
                  {card.label}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                  {card.count}
                </span>
                {card.alert && (
                  <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                    Attention
                  </span>
                )}
              </div>

              <div className="mt-1 text-[11px] text-slate-500 truncate">
                {card.subtext}
              </div>

              {card.isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
