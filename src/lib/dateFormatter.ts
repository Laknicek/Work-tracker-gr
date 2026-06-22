import { format } from 'date-fns';

export function formatDateWithWords(date: Date | string, language?: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return format(d, 'dd/MM/yyyy');
}

export function parseLocalDate(dateStr: string | Date | null): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  // Format: YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return new Date(dateStr);
}
