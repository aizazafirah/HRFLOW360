import React from 'react';
import { ActivityLog } from '../types/hr';
import { X, History, Mail, FileCheck2, FileText, Settings, Clock } from 'lucide-react';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'mrf':
        return <FileCheck2 className="w-4 h-4 text-indigo-600" />;
      case 'letter':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'status':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <Settings className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">HR Operational Audit Log</h2>
              <p className="text-xs text-slate-500">
                Immutable trace of emails sent, MRFs lodged, letters issued, and status updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs list */}
        <div className="p-6 overflow-y-auto space-y-3 text-xs flex-1 divide-y divide-slate-100">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No activity logs recorded yet.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="pt-3 first:pt-0 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-xs">{log.action}</span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  {log.employeeName && (
                    <div className="text-[11px] font-medium text-slate-700">
                      Target: {log.employeeName}
                    </div>
                  )}
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {logs.length} audit event{logs.length !== 1 ? 's' : ''} stored in localStorage
          </span>
          <button
            onClick={onClearLogs}
            className="text-slate-500 hover:text-rose-600 transition-colors text-xs font-medium"
          >
            Clear Activity History
          </button>
        </div>
      </div>
    </div>
  );
};
