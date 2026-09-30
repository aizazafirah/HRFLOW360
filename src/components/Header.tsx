import React from 'react';
import { Mail, Download, Upload, History, RotateCcw, ShieldCheck, LogIn, Cloud, User, FileCheck2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MediaPrimaLogo } from './MediaPrimaLogo';

interface HeaderProps {
  onOpenComposeEmail: () => void;
  onOpenActivityLogs: () => void;
  onExportCsv: () => void;
  onOpenImport: () => void;
  onResetData: () => void;
  onOpenAuth: () => void;
  onOpenBlankMRF?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenComposeEmail,
  onOpenActivityLogs,
  onExportCsv,
  onOpenImport,
  onResetData,
  onOpenAuth,
  onOpenBlankMRF,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: 3-zone Top Bar Contract */}
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark & Firebase Cloud indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <MediaPrimaLogo height={32} showBadge={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap block">
                  HR Renewal, Probation & Letter Management
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  <span>Firestore Cloud</span>
                </span>
              </div>
              <span className="text-xs text-slate-500 font-normal whitespace-nowrap hidden sm:block">
                Media Prima Berhad (MPB) · Group Human Capital
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

          {/* Zone 3: Primary actions & HR Admin Profile / Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
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
              <span className="hidden sm:inline">Download CSV</span>
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
              <span className="hidden xl:inline">Reset</span>
            </button>

            {onOpenBlankMRF && (
              <button
                onClick={onOpenBlankMRF}
                title="Buka / Muat Turun Borang Kosong MRF (Blank Manpower Requisition Form)"
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden sm:inline">Borang Kosong MRF</span>
              </button>
            )}

            <button
              onClick={onOpenComposeEmail}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Compose Email</span>
            </button>

            {/* Auth Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenAuth}
                title="Account Settings & Sign Out"
                className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity text-left cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'HR User'}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                    {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'HR'}
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Firebase Active</span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ml-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
