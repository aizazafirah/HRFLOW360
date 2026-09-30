import { Employee, ActivityLog } from '../types/hr';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';

const EMPLOYEES_STORAGE_KEY = 'hr_rpm_employees_v1';
const LOGS_STORAGE_KEY = 'hr_rpm_activity_logs_v1';

export const loadEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (!raw) {
      saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse employees from localStorage, falling back to initial data:', err);
    return INITIAL_EMPLOYEES;
  }
};

export const saveEmployees = (employees: Employee[]): void => {
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  } catch (err) {
    console.error('Failed to save employees to localStorage:', err);
  }
};

export const resetEmployees = (): Employee[] => {
  saveEmployees(INITIAL_EMPLOYEES);
  logActivity({
    action: 'System Reset',
    details: 'Database restored to initial 30 Malaysian corporate sample records.',
    type: 'system',
  });
  return INITIAL_EMPLOYEES;
};

export const loadActivityLogs = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      const initialLogs: ActivityLog[] = [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          action: 'System Initialized',
          details: 'HR-RPM System initialized with 30 employee records across 8 departments.',
          type: 'system',
        },
      ];
      saveActivityLogs(initialLogs);
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load activity logs:', err);
    return [];
  }
};

export const saveActivityLogs = (logs: ActivityLog[]): void => {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100 logs
  } catch (err) {
    console.error('Failed to save activity logs:', err);
  }
};

export const logActivity = (
  entry: Omit<ActivityLog, 'id' | 'timestamp'>
): ActivityLog => {
  const currentLogs = loadActivityLogs();
  const newLog: ActivityLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const updatedLogs = [newLog, ...currentLogs];
  saveActivityLogs(updatedLogs);
  return newLog;
};
