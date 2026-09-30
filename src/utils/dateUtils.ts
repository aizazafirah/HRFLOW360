import { UrgencyLevel } from '../types/hr';

// Current reference date (Sept 29, 2026 / runtime date)
export const getReferenceDate = (): Date => {
  return new Date('2026-09-29T00:00:00');
};

export const calculateDaysToDue = (targetDateStr: string, refDate: Date = getReferenceDate()): number => {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const ref = new Date(refDate);
  ref.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - ref.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getUrgencyLevel = (daysToDue: number): UrgencyLevel => {
  if (daysToDue < 0) return 'overdue';
  if (daysToDue <= 30) return 'urgent';
  if (daysToDue <= 60) return 'warning';
  return 'normal';
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatLongDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatMonthYear = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });
};

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
  if (isNaN(num)) return 'RM 0.00';
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
