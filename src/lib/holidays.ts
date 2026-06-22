import { addDays, startOfDay } from 'date-fns';

export function getOrthodoxEaster(year: number): Date {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const d = (19 * a + 15) % 30;
  const e = (2 * b + 4 * c + 6 * d + 6) % 7;
  const f = d + e;
  
  const julianDate = new Date(year, 2, 22 + f);
  const gregorianDate = new Date(julianDate.getTime() + 13 * 24 * 60 * 60 * 1000);
  return startOfDay(gregorianDate);
}

export function getGreekHolidays(year: number, t: any) {
  const easter = getOrthodoxEaster(year);
  
  return [
    { date: new Date(year, 0, 1), name: t.newYear },
    { date: new Date(year, 0, 6), name: t.epiphany },
    { date: addDays(easter, -48), name: t.cleanMonday },
    { date: new Date(year, 2, 25), name: t.independenceDay },
    { date: addDays(easter, -2), name: t.goodFriday },
    { date: easter, name: t.easterSunday },
    { date: addDays(easter, 1), name: t.easterMonday },
    { date: new Date(year, 4, 1), name: t.labourDay },
    { date: addDays(easter, 50), name: t.holySpirit },
    { date: new Date(year, 7, 15), name: t.assumption },
    { date: new Date(year, 9, 28), name: t.ohiDay },
    { date: new Date(year, 11, 25), name: t.christmas },
    { date: new Date(year, 11, 26), name: t.boxingDay },
  ];
}
