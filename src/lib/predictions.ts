import { getDate, getDaysInMonth, getDay } from 'date-fns';

function adjustForWeekends(year: number, month: number, day: number): number {
  const date = new Date(year, month, day);
  const weekday = getDay(date);
  if (weekday === 0) { // Sunday
    return Math.max(1, day - 2);
  } else if (weekday === 6) { // Saturday
    return Math.max(1, day - 1);
  }
  return day;
}

export function predictPaymentDays(
  history: string[],
  year: number,
  month: number, // 0-indexed
  frequency: string
): { day: number; chance: number }[] {
  const defaultChance = 50;
  const daysInCurrentMonth = getDaysInMonth(new Date(year, month, 1));
  let predictions: { day: number; chance: number }[] = [];
  
  if (!history || history.length === 0) {
    if (frequency === 'semimonthly') {
      predictions = [
        { day: 15, chance: defaultChance },
        { day: daysInCurrentMonth, chance: defaultChance }
      ];
    } else if (frequency === 'weekly') {
      predictions = []; 
    } else {
      predictions = [{ day: daysInCurrentMonth, chance: defaultChance }];
    }
  } else {
    const daysFromEnd: number[] = [];
    const daysFromStart: number[] = [];
    const midMonthDays: number[] = [];
    
    history.forEach(dStr => {
      const d = new Date(dStr);
      const day = getDate(d);
      const totalDays = getDaysInMonth(d);
      
      daysFromStart.push(day);
      daysFromEnd.push(totalDays - day);
      
      if (day >= 10 && day <= 20) {
        midMonthDays.push(day);
      }
    });

    if (frequency === 'semimonthly') {
      // Predict mid-month (e.g. the 15th)
      if (midMonthDays.length > 0) {
        const avgMid = midMonthDays.reduce((a, b) => a + b, 0) / midMonthDays.length;
        const variance = midMonthDays.reduce((a, b) => a + Math.pow(b - avgMid, 2), 0) / midMonthDays.length;
        const chance = Math.max(30, Math.min(98, 100 - variance * 8));
        predictions.push({ day: Math.round(avgMid), chance: Math.round(chance) });
      } else {
        predictions.push({ day: 15, chance: defaultChance });
      }
      
      // Predict end-month
      const endMonthRecords = daysFromEnd.filter(d => d <= 10);
      if (endMonthRecords.length > 0) {
        const avgEnd = endMonthRecords.reduce((a, b) => a + b, 0) / endMonthRecords.length;
        const variance = endMonthRecords.reduce((a, b) => a + Math.pow(b - avgEnd, 2), 0) / endMonthRecords.length;
        const chance = Math.max(30, Math.min(98, 100 - variance * 8));
        const predictedDay = Math.max(1, Math.min(daysInCurrentMonth, daysInCurrentMonth - Math.round(avgEnd)));
        predictions.push({ day: predictedDay, chance: Math.round(chance) });
      } else {
        predictions.push({ day: daysInCurrentMonth, chance: defaultChance });
      }
    } else if (frequency === 'monthly') {
      const avgEnd = daysFromEnd.reduce((a, b) => a + b, 0) / daysFromEnd.length;
      const avgStart = daysFromStart.reduce((a, b) => a + b, 0) / daysFromStart.length;
      
      // If average distance from end of month is smaller than from start, predict based on end of month
      if (avgEnd < 15) {
        const predictedEnd = Math.round(avgEnd);
        const varianceEnd = daysFromEnd.reduce((a, b) => a + Math.pow(b - avgEnd, 2), 0) / daysFromEnd.length;
        const chance = Math.max(30, Math.min(98, 100 - varianceEnd * 6));
        const predictedDay = Math.max(1, Math.min(daysInCurrentMonth, daysInCurrentMonth - predictedEnd));
        predictions.push({ day: predictedDay, chance: Math.round(chance) });
      } else {
        const predictedStart = Math.round(avgStart);
        const varianceStart = daysFromStart.reduce((a, b) => a + Math.pow(b - avgStart, 2), 0) / daysFromStart.length;
        const chance = Math.max(30, Math.min(98, 100 - varianceStart * 6));
        predictions.push({ day: predictedStart, chance: Math.round(chance) });
      }
    }
  }

  return predictions.map(p => ({
    ...p,
    day: adjustForWeekends(year, month, p.day)
  }));
}
