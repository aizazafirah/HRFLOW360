import React from 'react';
import { FilterState } from '../types/hr';
import { Search, X, Filter, UserPlus, Upload } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  departments: string[];
  totalResults: number;
  totalRecords: number;
  onOpenAddEmployee: () => void;
  onOpenImport?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  departments,
  totalResults,
  totalRecords,
  onOpenAddEmployee,
  onOpenImport,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.department !== '' ||
    filters.actionType !== '' ||
    filters.urgency !== '' ||
    filters.status !== '';

  return (
    <div className="filter-bar bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by Employee Name, Staff Code (MP...), Dept, or Position..."
            className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="relative">
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ department: e.target.value })}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Action Type Filter */}
          <div className="relative">
            <select
              value={filters.actionType}
              onChange={(e) => onFilterChange({ actionType: e.target.value })}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Action Types</option>
              <option value="Contract Renewal">Contract Renewal</option>
              <option value="Probation Confirmation">Probation Confirmation</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Urgency Filter */}
          <div className="relative">
            <select
              value={filters.urgency}
              onChange={(e) => onFilterChange({ urgency: e.target.value })}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Urgencies</option>
              <option value="overdue">Overdue (&lt; 0 Days)</option>
              <option value="urgent">Urgent (&lt; 30 Days)</option>
              <option value="warning">Attention (&lt; 60 Days)</option>
              <option value="normal">Normal (&gt; 60 Days)</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending Email">Pending Email</option>
              <option value="Pending Reminder">Pending Reminder</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Submission of MRF">Submission of MRF</option>
              <option value="Letter Preparation">Letter Preparation</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Import Data Button */}
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              title="Import employees from Excel (.xlsx/.xls), Google Sheets, or PDF"
              className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border border-indigo-200 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Data</span>
            </button>
          )}

          {/* Add Employee Button */}
          <button
            onClick={onOpenAddEmployee}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border border-slate-300"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Results counter and active state note */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold font-mono text-slate-800">{totalResults}</span> of{' '}
          <span className="font-semibold font-mono text-slate-800">{totalRecords}</span> employee records
          {hasActiveFilters && <span className="ml-1 text-slate-400">(filtered)</span>}
        </div>
        <div className="text-[11px] text-slate-400">
          Thresholds: <span className="text-rose-600 font-medium">Red &lt;30d</span> · <span className="text-amber-600 font-medium">Amber &lt;60d</span> · <span className="text-slate-600 font-medium">Normal &gt;60d</span>
        </div>
      </div>
    </div>
  );
};
