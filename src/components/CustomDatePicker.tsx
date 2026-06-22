import React, { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomDatePickerProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  lang?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  className,
  lang
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Temporal scroll picker state
  const [tempDay, setTempDay] = useState<number>(1);
  const [tempMonth, setTempMonth] = useState<number>(0); // 0-indexed
  const [tempYear, setTempYear] = useState<number>(2026);

  // Direction tracking for smooth sliding animations
  const [dayDirection, setDayDirection] = useState<'up' | 'down'>('up');
  const [monthDirection, setMonthDirection] = useState<'up' | 'down'>('up');
  const [yearDirection, setYearDirection] = useState<'up' | 'down'>('up');

  const activeLang = lang || (typeof window !== 'undefined' ? localStorage.getItem('language') || 'el' : 'el');

  const monthsByLang: Record<string, string[]> = {
    en: [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ],
    el: [
      "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
      "Ιούλιος", "Αύγουστος", "Σεπτεμβρίου", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
    ],
    tr: [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ]
  };

  const months = monthsByLang[activeLang] || monthsByLang['en'];
  const currentYear = new Date().getFullYear();

  // Load select option value or default to today on opening
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const parsed = parseISO(value);
        if (!isNaN(parsed.getTime())) {
          setTempDay(parsed.getDate());
          setTempMonth(parsed.getMonth());
          setTempYear(parsed.getFullYear());
          return;
        }
      }
      const today = new Date();
      setTempDay(today.getDate());
      setTempMonth(today.getMonth());
      setTempYear(today.getFullYear());
    }
  }, [isOpen, value]);

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInCurrentMonth = getDaysInMonth(tempMonth, tempYear);

  // Auto clamp Day logic if Month/Year changes (e.g. Feb 31st -> Feb 28th)
  useEffect(() => {
    const maxDays = getDaysInMonth(tempMonth, tempYear);
    if (tempDay > maxDays) {
      setTempDay(maxDays);
    }
  }, [tempMonth, tempYear, tempDay]);

  // Click & scroll actions helpers
  const handlePrevDay = () => {
    setDayDirection('up');
    setTempDay(d => d === 1 ? daysInCurrentMonth : d - 1);
  };
  const handleNextDay = () => {
    setDayDirection('down');
    setTempDay(d => d === daysInCurrentMonth ? 1 : d + 1);
  };

  const handlePrevMonthColumn = () => {
    setMonthDirection('up');
    setTempMonth(m => m === 0 ? 11 : m - 1);
  };
  const handleNextMonthColumn = () => {
    setMonthDirection('down');
    setTempMonth(m => m === 11 ? 0 : m + 1);
  };

  const handlePrevYearColumn = () => {
    if (tempYear > currentYear - 35) {
      setYearDirection('up');
      setTempYear(y => y - 1);
    }
  };
  const handleNextYearColumn = () => {
    if (tempYear < currentYear + 15) {
      setYearDirection('down');
      setTempYear(y => y + 1);
    }
  };

  const handleConfirm = () => {
    const maxDays = getDaysInMonth(tempMonth, tempYear);
    const finalDay = Math.min(tempDay, maxDays);
    const yyyy = tempYear;
    const mm = String(tempMonth + 1).padStart(2, '0');
    const dd = String(finalDay).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const selectedDate = value ? parseISO(value) : null;
  // Format as DD/MM/YYYY for human readability
  const displayValue = selectedDate && !isNaN(selectedDate.getTime())
    ? `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`
    : "";

  const modalTitles: Record<string, { title: string; cancel: string; confirm: string }> = {
    en: { title: "Select Date", cancel: "Cancel", confirm: "Confirm" },
    el: { title: "Επιλογή Ημερομηνίας", cancel: "Ακύρωση", confirm: "Επιβεβαίωση" },
    tr: { title: "Tarih Seç", cancel: "İptal", confirm: "Onayla" }
  };
  const tModal = modalTitles[activeLang] || modalTitles['en'];

  // Spring animations for the slots tumbler
  const slideVariants = {
    initial: (direction: 'up' | 'down') => ({
      y: direction === 'up' ? -35 : 35,
      opacity: 0,
      scale: 0.9,
    }),
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: "spring", stiffness: 450, damping: 28 },
        opacity: { duration: 0.15 },
        scale: { duration: 0.15 }
      }
    },
    exit: (direction: 'up' | 'down') => ({
      y: direction === 'up' ? 35 : -35,
      opacity: 0,
      scale: 0.9,
      transition: {
        y: { type: "spring", stiffness: 450, damping: 28 },
        opacity: { duration: 0.12 },
        scale: { duration: 0.12 }
      }
    })
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Clickable input display */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-neutral-950/50 hover:bg-neutral-900/60 border border-neutral-800 rounded-xl px-4 py-3 text-white focus-within:border-[#00ffcc] focus-within:ring-1 focus-within:ring-[#00ffcc] transition-all flex items-center justify-between cursor-pointer select-none group"
      >
        <span className={cn("text-sm font-medium font-mono text-neutral-200", !displayValue && "text-neutral-500 font-sans font-normal")}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-neutral-500 group-hover:text-[#00ffcc] transition-colors" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-[24px] shadow-2xl p-6 overflow-hidden select-none"
            >
              <h3 className="text-sm font-semibold text-neutral-300 font-sans text-center mb-6">
                {tModal.title}
              </h3>

              {/* Grid 3 Columns */}
              <div className="grid grid-cols-3 gap-3 my-4 bg-neutral-950/40 rounded-2xl p-4 border border-neutral-800/50">
                
                {/* 1. Day Column */}
                <div 
                  className="flex flex-col items-center"
                  onWheel={(e) => {
                    e.preventDefault();
                    if (e.deltaY < 0) {
                      handlePrevDay();
                    } else if (e.deltaY > 0) {
                      handleNextDay();
                    }
                  }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-2">
                    {activeLang === 'el' ? 'Ημέρα' : activeLang === 'tr' ? 'Gün' : 'Day'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="p-1.5 hover:bg-neutral-800/80 rounded-lg text-neutral-400 hover:text-[#00ffcc] active:scale-95 transition-all cursor-pointer z-10"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  
                  <div className="relative h-[110px] w-full overflow-hidden flex items-center justify-center">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.div
                        key={tempDay}
                        custom={dayDirection}
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-x-0 flex flex-col items-center justify-center"
                      >
                        {/* Prev Day item */}
                        <div className="text-center font-mono text-neutral-600 text-xs sm:text-sm opacity-40 select-none pointer-events-none py-1">
                          {String(tempDay === 1 ? daysInCurrentMonth : tempDay - 1).padStart(2, '0')}
                        </div>
                        
                        {/* Active Day Item */}
                        <div className="w-full py-1.5 text-center font-mono text-lg sm:text-xl font-bold bg-[#00ffcc]/10 border-y border-[#00ffcc]/30 text-[#00ffcc] rounded-xl shadow-inner relative z-10">
                          {String(tempDay).padStart(2, '0')}
                        </div>
                        
                        {/* Next Day item */}
                        <div className="text-center font-mono text-neutral-600 text-xs sm:text-sm opacity-40 select-none pointer-events-none py-1">
                          {String(tempDay === daysInCurrentMonth ? 1 : tempDay + 1).padStart(2, '0')}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="p-1.5 hover:bg-neutral-800/80 rounded-lg text-neutral-400 hover:text-[#00ffcc] active:scale-95 transition-all cursor-pointer z-10"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* 2. Month Column */}
                <div 
                  className="flex flex-col items-center"
                  onWheel={(e) => {
                    e.preventDefault();
                    if (e.deltaY < 0) {
                      handlePrevMonthColumn();
                    } else if (e.deltaY > 0) {
                      handleNextMonthColumn();
                    }
                  }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-2">
                    {activeLang === 'el' ? 'Μήνας' : activeLang === 'tr' ? 'Ay' : 'Month'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handlePrevMonthColumn}
                    className="p-1.5 hover:bg-neutral-800/80 rounded-lg text-neutral-400 hover:text-[#00ffcc] active:scale-95 transition-all cursor-pointer z-10"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  
                  <div className="relative h-[110px] w-full max-w-[100px] overflow-hidden flex items-center justify-center">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.div
                        key={tempMonth}
                        custom={monthDirection}
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-x-0 flex flex-col items-center justify-center"
                      >
                        {/* Prev Month item */}
                        <div className="text-center font-sans text-neutral-600 text-[10px] sm:text-xs opacity-40 select-none pointer-events-none py-1 truncate max-w-full">
                          {months[tempMonth === 0 ? 11 : tempMonth - 1]}
                        </div>
                        
                        {/* Active Month item */}
                        <div className="w-full py-1.5 px-1 text-center font-sans text-xs font-bold bg-[#00ffcc]/10 border-y border-[#00ffcc]/30 text-[#00ffcc] rounded-xl shadow-inner relative z-10 truncate">
                          {months[tempMonth]}
                        </div>
                        
                        {/* Next Month item */}
                        <div className="text-center font-sans text-neutral-600 text-[10px] sm:text-xs opacity-40 select-none pointer-events-none py-1 truncate max-w-full">
                          {months[tempMonth === 11 ? 0 : tempMonth + 1]}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleNextMonthColumn}
                    className="p-1.5 hover:bg-neutral-800/80 rounded-lg text-neutral-400 hover:text-[#00ffcc] active:scale-95 transition-all cursor-pointer z-10"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* 3. Year Column */}
                <div 
                  className="flex flex-col items-center"
                  onWheel={(e) => {
                    e.preventDefault();
                    if (e.deltaY < 0) {
                      handlePrevYearColumn();
                    } else if (e.deltaY > 0) {
                      handleNextYearColumn();
                    }
                  }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-2">
                    {activeLang === 'el' ? 'Έτος' : activeLang === 'tr' ? 'Yıl' : 'Year'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handlePrevYearColumn}
                    disabled={tempYear <= currentYear - 35}
                    className="p-1.5 hover:bg-neutral-800/80 rounded-lg text-neutral-400 hover:text-[#00ffcc] active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer z-10"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  
                  <div className="relative h-[110px] w-full overflow-hidden flex items-center justify-center">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.div
                        key={tempYear}
                        custom={yearDirection}
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-x-0 flex flex-col items-center justify-center"
                      >
                        {/* Prev Year item */}
                        <div className="text-center font-mono text-neutral-600 text-xs sm:text-sm opacity-40 select-none pointer-events-none py-1">
                          {tempYear - 1}
                        </div>
                        
                        {/* Active Year item */}
                        <div className="w-full py-1.5 text-center font-mono text-lg sm:text-xl font-bold bg-[#00ffcc]/10 border-y border-[#00ffcc]/30 text-[#00ffcc] rounded-xl shadow-inner relative z-10">
                          {tempYear}
                        </div>
                        
                        {/* Next Year item */}
                        <div className="text-center font-mono text-neutral-600 text-xs sm:text-sm opacity-40 select-none pointer-events-none py-1">
                          {tempYear + 1}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleNextYearColumn}
                    disabled={tempYear >= currentYear + 15}
                    className="p-1.5 hover:bg-neutral-800/80 rounded-lg text-neutral-400 hover:text-[#00ffcc] active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer z-10"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer select-none"
                >
                  {tModal.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#00ffcc] hover:bg-[#00ffcc]/80 text-black font-semibold text-xs transition-colors cursor-pointer select-none shadow-[0_0_15px_rgba(0,255,204,0.35)]"
                >
                  {tModal.confirm}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
