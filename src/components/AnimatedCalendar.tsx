import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Gift, Sun, Calendar as CalendarIcon, Coffee, Info, X, DollarSign, Palmtree } from 'lucide-react';
import { 
  format, 
  addMonths, 
  addDays,
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { el, enUS, tr } from 'date-fns/locale';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { getGreekHolidays } from '../lib/holidays';
import { useTranslation } from '../i18n';
import { predictPaymentDays } from '../lib/predictions';
import { differenceInMonths, differenceInYears } from 'date-fns';

import { formatDateWithWords, parseLocalDate } from '../lib/dateFormatter';

interface AnimatedCalendarProps {
  user: UserProfile;
  bonusDates?: { date: Date, type: string }[];
}

const locales = {
  el,
  en: enUS,
  tr
};

export function AnimatedCalendar({ user, bonusDates }: AnimatedCalendarProps) {
  const t = useTranslation(user.language);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const holidays = getGreekHolidays(currentDate.getFullYear(), t);

  const nextMonth = () => {
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const currentMonthNum = currentDate.getMonth();
  const currentYearNum = currentDate.getFullYear();
  const predictedDays = predictPaymentDays(user.paymentHistory, currentYearNum, currentMonthNum, user.paymentFrequency);

  const now = new Date();
  const getDayInfo = (date: Date) => {
    const isHoliday = holidays.find(h => isSameDay(h.date, date));
    const isWorkingDay = (user.workingDays || [1, 2, 3, 4, 5]).includes(date.getDay());
    const predictedPayment = predictedDays.find(d => d.day === date.getDate());
    const bonusInfo = bonusDates?.find(b => isSameDay(b.date, date));
    
    let icon = null;
    let isOffDay = !isWorkingDay || !!isHoliday;
    
    // Check vacation days
    let isVacationDay = false;
    if (user.plannedVacationDate) {
      const start = parseLocalDate(user.startDate);
      const monthsWorked = differenceInMonths(now, start);
      const yearsWorked = differenceInYears(now, start);
      const allowedDays = yearsWorked >= 1 ? 21 : Math.min(21, Math.floor(monthsWorked * 1.75));
      const duration = user.plannedVacationDuration || allowedDays;
      
      const vStart = parseLocalDate(user.plannedVacationDate);
      const vEnd = addDays(vStart, duration - 1);
      
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const checkStart = new Date(vStart.getFullYear(), vStart.getMonth(), vStart.getDate());
      const checkEnd = new Date(vEnd.getFullYear(), vEnd.getMonth(), vEnd.getDate());
      
      if (checkDate >= checkStart && checkDate <= checkEnd && isWorkingDay && !isHoliday) {
        isVacationDay = true;
        isOffDay = true;
      }
    }
    
    if (bonusInfo) {
      icon = <Gift className="w-3.5 h-3.5 text-amber-400" />;
    } else if (isVacationDay) {
      icon = <Palmtree className="w-3.5 h-3.5 text-sky-400" />;
    } else if (isHoliday) {
      if (isHoliday.name === t.christmas || isHoliday.name === t.boxingDay || isHoliday.name === t.easterSunday || isHoliday.name === t.easterMonday || isHoliday.name === t.goodFriday || isHoliday.name === t.cleanMonday || isHoliday.name === t.holySpirit) {
        icon = <Coffee className="w-3 h-3 text-pink-400" />;
      } else {
        icon = <Sun className="w-3 h-3 text-yellow-400" />;
      }
    } else if (!isWorkingDay) {
      icon = <Coffee className="w-3 h-3 text-neutral-500" />;
    } else if (predictedPayment) {
      icon = <DollarSign className="w-3 h-3 text-emerald-400" />;
    }

    return { isHoliday, isWorkingDay, isOffDay, isVacationDay, icon, predictedPayment, bonusInfo };
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 30 : -30, opacity: 0, scale: 0.95 })
  };

  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800/80 rounded-3xl p-6 relative overflow-hidden">
      {currentMonthNum === 11 && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] pointer-events-none" />}
      {currentMonthNum === 3 && <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[50px] pointer-events-none" />}
      {currentMonthNum === 7 && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] pointer-events-none" />}

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-display font-medium text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-neutral-400" />
          {format(currentDate, 'MMMM yyyy', { locale: locales[user.language] })}
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4 text-neutral-300" />
          </button>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 relative z-10">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
            {t[day.toLowerCase() as keyof typeof t] || day}
          </div>
        ))}
      </div>

      <div className="relative h-[240px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentDate.getTime()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="grid grid-cols-7 gap-1 absolute inset-0"
          >
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {daysInMonth.map(date => {
              const { isHoliday, isOffDay, isVacationDay, icon, predictedPayment, bonusInfo } = getDayInfo(date);
              const today = isToday(date);
              const isSelected = selectedDate && isSameDay(selectedDate, date);
              
              return (
                <motion.div 
                  key={date.toISOString()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "relative p-2 h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer group",
                    today ? "bg-[#00ffcc] text-black shadow-[0_0_15px_rgba(0,255,204,0.4)]" : 
                    isSelected ? "bg-white text-black" :
                    bonusInfo ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-semibold" :
                    isVacationDay ? "bg-sky-500/20 text-sky-300 border border-sky-500/35 shadow-[0_0_10px_rgba(14,165,233,0.25)] font-semibold" :
                    isHoliday ? "bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold shadow-[0_0_8px_rgba(244,63,94,0.15)]" :
                    predictedPayment ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] border border-emerald-500/30 font-semibold" :
                    isOffDay ? "bg-neutral-800/30 text-neutral-500 hover:bg-neutral-800/50 border border-dotted border-neutral-800/40" : 
                    "text-neutral-200 hover:bg-neutral-800"
                  )}
                >
                  {format(date, 'd')}
                  {icon && (
                    <div className="absolute -bottom-1 right-0">
                      {icon}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Date Details Modal/Popup */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute inset-x-4 bottom-4 bg-neutral-800/95 backdrop-blur-xl border border-neutral-700 p-4 rounded-2xl shadow-2xl z-20"
          >
            <button 
              onClick={() => setSelectedDate(null)}
              className="absolute top-3 right-3 w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center text-neutral-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0 border border-neutral-700 font-display text-lg text-white">
                {format(selectedDate, 'd')}
              </div>
              <div className="pr-4">
                <h4 className="font-medium text-white mb-1">
                  {format(selectedDate, 'EEEE', { locale: locales[user.language] })} - {formatDateWithWords(selectedDate, user.language)}
                </h4>
                {(() => {
                  const info = getDayInfo(selectedDate);
                  
                  if (info.bonusInfo) {
                    return (
                      <div className="text-sm">
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <Gift className="w-3 h-3" /> {info.bonusInfo.type === 'easter' ? t.easterBonus : info.bonusInfo.type === 'summer' ? t.summerBonus : t.christmasBonus}
                        </span>
                        <span className="text-neutral-400 block mt-1">{t.bonuses}</span>
                      </div>
                    );
                  }
                  
                  if (info.isVacationDay) {
                    return (
                      <div className="text-sm">
                        <span className="text-sky-400 font-medium flex items-center gap-1">
                          <Palmtree className="w-3" /> {t.summerVacationDays}
                        </span>
                        <span className="text-neutral-400 block mt-1">{t.offDay}</span>
                      </div>
                    );
                  }

                  if (info.predictedPayment) {
                    return (
                      <div className="text-sm">
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {t.predictedPayment}
                        </span>
                        <span className="text-neutral-400 block mt-1">{info.predictedPayment.chance}% {t.chance}</span>
                      </div>
                    );
                  }
                  if (info.isHoliday) {
                    return (
                      <div className="text-sm">
                        <span className="text-pink-400 font-medium flex items-center gap-1">
                          <Gift className="w-3 h-3" /> {info.isHoliday.name}
                        </span>
                        <span className="text-neutral-400 block mt-1">{t.holidayOff}</span>
                      </div>
                    );
                  }
                  if (info.isOffDay) {
                    return <span className="text-neutral-400 text-sm flex items-center gap-1"><Palmtree className="w-3 h-3" /> {t.offDay}</span>;
                  }
                  return <span className="text-[#00ffcc] text-sm flex items-center gap-1"><Info className="w-3 h-3" /> {t.workingDay}</span>;
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
