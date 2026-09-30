import React from 'react';
import { Mail, Download, Upload, History, RotateCcw, UserCheck, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenComposeEmail: () => void;
  onOpenActivityLogs: () => void;
  onExportCsv: () => void;
  onOpenImport: () => void;
  onResetData: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenComposeEmail,
  onOpenActivityLogs,
  onExportCsv,
  onOpenImport,
  onResetData,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: 3-zone Top Bar Contract */}
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              RPM
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                HR Renewal, Probation & Letter Management
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Media Prima Group · Human Capital Operations
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation tabs / views */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Employee Directory
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'departments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Department Summary
            </button>
          </nav>

          {/* Zone 3: Primary actions & HR Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenActivityLogs}
              title="View Audit Activity Log"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">Audit Log</span>
            </button>

            <button
              onClick={onExportCsv}
              title="Download Employee Directory to CSV spreadsheet"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={onOpenImport}
              title="Import employees from Excel (.xlsx/.xls), Google Sheets (.csv), or PDF"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Data</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset to 30 sample Malaysian employee records"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Reset Data</span>
            </button>

            <button
              onClick={onOpenComposeEmail}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Compose HOD Email</span>
            </button>

            {/* Admin identity indicator */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                AZ
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-semibold text-slate-800">Aiza Zafirah</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>HR Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
