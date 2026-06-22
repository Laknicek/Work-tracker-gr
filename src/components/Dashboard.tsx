import { differenceInMonths, differenceInYears, addDays, isAfter } from 'date-fns';
import { motion } from 'motion/react';
import { UserProfile, Language } from '../types';
import { useTranslation } from '../i18n';
import { Settings, LogOut, Code, Euro, Sun, Calendar, PlusCircle, Sparkles, CheckCircle2, Gift } from 'lucide-react';
import { useState } from 'react';
import { AnimatedCalendar } from './AnimatedCalendar';
import { getOrthodoxEaster } from '../lib/holidays';
import { cn } from '../lib/utils';
import { formatDateWithWords, parseLocalDate } from '../lib/dateFormatter';

interface DashboardProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onReset: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export function Dashboard({ user, onUpdateUser, onReset, lang, setLang }: DashboardProps) {
  const t = useTranslation(lang);
  const [showSettings, setShowSettings] = useState(false);

  // Math Setup
  const now = new Date();
  const start = new Date(user.startDate);
  const monthsWorked = differenceInMonths(now, start);
  const yearsWorked = differenceInYears(now, start);

  // Greek private sector roughly allows 20-22 days. User asked for 21.
  // Full allocation available if you worked 1 full year, otherwise pro-rated ~1.75/mo
  const allowedDays = yearsWorked >= 1 ? 21 : Math.min(21, Math.floor(monthsWorked * 1.75));
  const remainingDays = Math.max(0, allowedDays - user.vacationDaysUsed);
  const canTakeSummerVacation = monthsWorked >= 12;

  const oneYearAnniversary = new Date(start);
  oneYearAnniversary.setFullYear(start.getFullYear() + 1);
  const minVacationDateStr = oneYearAnniversary.toISOString().split('T')[0];
  const isSummerApproaching = now.getMonth() >= 4; // May (4) or later

  // Bonuses (with 4.166% vacation increment typical in Greece)
  const salary = user.monthlySalary;
  const factor = 1.04166;
  const christmasBonus = salary * factor;
  const easterBonus = (salary / 2) * factor;
  const summerBonus = salary / 2;

  const adjustDateForWeekends = (d: Date): Date => {
    const day = d.getDay();
    if (day === 0) return addDays(d, -2);
    if (day === 6) return addDays(d, -1);
    return d;
  };

  const currentYear = now.getFullYear();
  const easterDate = getOrthodoxEaster(currentYear);
  const easterBonusDate = adjustDateForWeekends(addDays(easterDate, -4)); // Holy Wednesday
  const baseSummerDate = user.plannedVacationDate ? addDays(parseLocalDate(user.plannedVacationDate), -1) : new Date(currentYear, 6, 15);
  const summerBonusDate = adjustDateForWeekends(baseSummerDate); 
  const christmasBonusDate = adjustDateForWeekends(new Date(currentYear, 11, 21)); // Dec 21st

  const isEasterBonusPaid = isAfter(now, easterBonusDate);
  const isSummerBonusPaid = isAfter(now, summerBonusDate);
  const isChristmasBonusPaid = isAfter(now, christmasBonusDate);

  // Regular Pay
  let regularPayAmount = user.monthlySalary;
  if (user.paymentFrequency === 'weekly') {
    regularPayAmount = (user.monthlySalary * 12) / 52;
  } else if (user.paymentFrequency === 'biweekly') {
    regularPayAmount = (user.monthlySalary * 12) / 26;
  } else if (user.paymentFrequency === 'semimonthly') {
    regularPayAmount = user.monthlySalary / 2;
  }

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(num);

  const handleAddVacaDay = () => {
    if (remainingDays > 0) {
      onUpdateUser({ vacationDaysUsed: user.vacationDaysUsed + 1 });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans selection:bg-neon-gr selection:text-neutral-950">
      
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 md:mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-xl font-display font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
              <Code className="w-4 h-4 text-neutral-300" />
            </span>
            Tracker<span className="text-neutral-500">GR</span>
          </h1>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-neutral-900 border border-neutral-800 rounded-full p-1">
            {(['en', 'el', 'tr'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs font-medium uppercase px-3 py-1.5 rounded-full transition-colors ${
                  lang === l ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
          
          {/* Greeting Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-8 md:p-10"
          >
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <h2 className="text-2xl md:text-4xl font-display text-neutral-400 mb-2">{t.greeting}</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              {user.fullName}
            </h3>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {user.isOaed && user.oaedStartDate && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-700 font-mono text-xs text-neutral-300">
                  <Calendar className="w-3 h-3" />
                  {t.totalSinceDypa}: {differenceInYears(now, new Date(user.oaedStartDate))} {t.yrs}, {differenceInMonths(now, new Date(user.oaedStartDate)) % 12} {t.mo}
                </div>
              )}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-700 font-mono text-xs text-neutral-300">
                <Calendar className="w-3 h-3" />
                {t.official} ({formatDateWithWords(user.startDate, user.language)}): {yearsWorked} {t.yrs}, {monthsWorked % 12} {t.mo}
              </div>
            </div>
          </motion.div>

          {/* Vacation Stats Bento Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-neutral-900/40 backdrop-blur border border-neutral-800/50 p-6 rounded-3xl relative overflow-hidden"
            >
              {remainingDays > 0 && remainingDays <= 5 && (
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
              )}
              {remainingDays === 0 && (
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-lg font-medium text-neutral-300">{t.vacationLabel}</h3>
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <Sun className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2 relative z-10">
                <span className="text-5xl font-display font-bold">{remainingDays}</span>
                <span className="text-neutral-500 pb-1">{t.totalDaysAllowedStr}</span>
              </div>
              
              <p className="text-xs text-neutral-400 mb-6 flex items-center gap-1">
                {remainingDays > 10 ? <><Sparkles className="w-3 h-3 text-green-400"/> {t.relaxDays}</> :
                 remainingDays > 0 ? <><Sparkles className="w-3 h-3 text-amber-400"/> {t.lowDays}</> :
                 <>{t.noDays}</>}
              </p>
              
              <div className="space-y-4 relative z-10">
                <div className="relative w-full bg-neutral-950 rounded-full h-3 overflow-hidden border border-neutral-800 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(remainingDays / 21) * 100}%` }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-[#00ffcc] shadow-[0_0_10px_#00ffcc]"
                  />
                  {/* Subtle particle effect over the bar */}
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjEiIC8+Cjwvc3ZnPg==')] pointer-events-none"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">{t.used}: <span className="text-white">{user.vacationDaysUsed}</span></span>
                  <span className="text-neutral-500">{t.accrued}: <span className="text-white">{allowedDays}</span></span>
                </div>
                
                <button
                  onClick={handleAddVacaDay}
                  disabled={remainingDays <= 0}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4 text-[#00ffcc]" />
                  {t.logDays}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-neutral-900/40 backdrop-blur border border-neutral-800/50 p-6 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-neutral-300">{t.summerVacationUnlock}</h3>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  {canTakeSummerVacation ? (
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Sun className="w-8 h-8 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0">
                      <Sun className="w-8 h-8 text-neutral-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-display text-xl">{canTakeSummerVacation ? t.unlocked : t.locked}</h4>
                    <p className="text-neutral-400 text-sm mt-1">{t.summerVacationStatus} {formatDateWithWords(user.startDate, user.language)}</p>
                    {user.plannedVacationDate && (
                      <div className="mt-2 text-xs font-mono bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/20 px-2 py-1 rounded inline-block">
                        {t.plannedVacation}: {formatDateWithWords(user.plannedVacationDate, user.language)}
                      </div>
                    )}
                  </div>
                </div>
                {isSummerApproaching && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 flex flex-col gap-3 p-4 bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[#00ffcc] text-sm font-mono rounded-xl"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                       <Sparkles className="w-4 h-4 flex-shrink-0" />
                       {t.planSummerVacation} {canTakeSummerVacation ? "" : `(${t.availableFrom} ${formatDateWithWords(oneYearAnniversary, user.language)})`}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">Start Date</span>
                        <input
                           type="date"
                           min={minVacationDateStr}
                           value={user.plannedVacationDate || ''}
                           onChange={(e) => onUpdateUser({ plannedVacationDate: e.target.value })}
                           className="w-full bg-neutral-900 border border-neutral-700/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ffcc] transition-all font-sans [color-scheme:dark]"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">Duration (Days)</span>
                        <input
                           type="number"
                           placeholder={`${allowedDays} ${lang === 'el' ? 'ημέρες' : lang === 'tr' ? 'gün' : 'days'}`}
                           min={1}
                           max={allowedDays}
                           value={user.plannedVacationDuration || ''}
                           onChange={(e) => onUpdateUser({ plannedVacationDuration: parseInt(e.target.value, 10) || undefined })}
                           className="w-full bg-neutral-900 border border-neutral-700/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ffcc] transition-all font-sans [color-scheme:dark] placeholder:text-neutral-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Financials & Calendar */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatedCalendar 
              user={user} 
              bonusDates={[
                { date: easterBonusDate, type: 'easter' },
                { date: summerBonusDate, type: 'summer' },
                { date: christmasBonusDate, type: 'christmas' }
              ]}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="bg-neutral-900/40 backdrop-blur border border-neutral-800/50 p-6 rounded-3xl flex-1"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Euro className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-neutral-300">{t.financials}</h3>
            </div>

            <div className="space-y-6">
              {/* Paycheck */}
              <div className="pb-6 border-b border-neutral-800">
                <p className="text-sm text-neutral-500 mb-2">{t.paycheck} ({t[user.paymentFrequency as keyof typeof t]})</p>
                {user.paymentFrequency === 'semimonthly' && user.firstHalfAmount ? (
                   <div className="space-y-3">
                     <div className="flex justify-between items-end bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-800">
                       <span className="text-sm text-neutral-400">15th:</span>
                       <span className="text-xl font-display font-medium tracking-tight text-white">{formatCurrency(user.firstHalfAmount)}</span>
                     </div>
                     <div className="flex justify-between items-end bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-800">
                       <span className="text-sm text-neutral-400">{t.restOfMonth}:</span>
                       <span className="text-xl font-display font-medium tracking-tight text-white">{formatCurrency(user.monthlySalary - user.firstHalfAmount)}</span>
                     </div>
                   </div>
                ) : (
                  <div className="text-3xl font-display font-medium tracking-tight">
                    {formatCurrency(regularPayAmount)}
                  </div>
                )}
                
                {user.isOaed && user.oaedActive && (
                  <div className="mt-4 space-y-2 text-sm text-neutral-400 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                    <div className="flex justify-between items-center">
                      <span>{t.oaedAmount}:</span>
                      <span className="font-mono text-white">{formatCurrency(user.oaedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t.employerAmount}:</span>
                      <span className="font-mono text-white">{formatCurrency(user.employerAmount)}</span>
                    </div>
                  </div>
                )}
                {user.isOaed && !user.oaedActive && (
                  <div className="mt-4 text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded inline-block">
                    ✓ {t.dypaCompleted}
                  </div>
                )}
                
                <div className="mt-4">
                  <button 
                    onClick={() => {
                      const todayStr = new Date().toISOString();
                      const hasToday = user.paymentHistory.some(d => new Date(d).toDateString() === new Date().toDateString());
                      if (!hasToday) {
                        onUpdateUser({ paymentHistory: [...user.paymentHistory, todayStr] });
                      }
                    }}
                    className="w-full text-sm font-medium py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {t.markPaidToday}
                  </button>
                </div>
              </div>

              {/* Bonuses */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-neutral-400">{t.bonuses}</h4>
                
                <div className={cn(
                  "border border-neutral-800 rounded-xl p-4 flex justify-between items-center transition-colors relative overflow-hidden",
                  isEasterBonusPaid ? "bg-green-500/5 border-green-500/20" : "bg-neutral-950 hover:border-neutral-700 group"
                )}>
                  {isEasterBonusPaid && <div className="absolute top-0 right-0 p-1 rounded-bl-lg bg-green-500/20 text-green-400 text-[10px] uppercase font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {t.alreadyPaid}</div>}
                  <div>
                    <p className={cn("text-sm font-medium transition-colors flex items-center gap-1.5", isEasterBonusPaid ? "text-green-400" : "text-white group-hover:text-amber-400")}>
                      <Gift className="w-4 h-4 text-amber-500/80" /> {t.easterBonus}
                    </p>
                    <p className="text-xs text-neutral-500">{t.paidOn} {formatDateWithWords(easterBonusDate, user.language)}</p>
                  </div>
                  <span className={cn("font-mono text-sm", isEasterBonusPaid ? "text-green-400 opacity-80" : "text-white")}>{formatCurrency(easterBonus)}</span>
                </div>

                <div className={cn(
                  "border border-neutral-800 rounded-xl p-4 flex justify-between items-center transition-colors relative overflow-hidden",
                  isSummerBonusPaid ? "bg-green-500/5 border-green-500/20" : "bg-neutral-950 hover:border-neutral-700 group"
                )}>
                  {isSummerBonusPaid && <div className="absolute top-0 right-0 p-1 rounded-bl-lg bg-green-500/20 text-green-400 text-[10px] uppercase font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {t.alreadyPaid}</div>}
                  <div className="max-w-[200px]">
                    <p className={cn("text-sm font-medium transition-colors flex items-center gap-1.5", isSummerBonusPaid ? "text-green-400" : "text-white group-hover:text-blue-400")}>
                      <Gift className="w-4 h-4 text-blue-500/80" /> {t.summerBonus}
                    </p>
                    <p className="text-xs text-neutral-500">{t.paidOn} {formatDateWithWords(summerBonusDate, user.language)}</p>
                    <p className="text-xs text-blue-400/80 mt-0.5">{t.summerVacationDays}: {allowedDays}</p>
                  </div>
                  <span className={cn("font-mono text-sm", isSummerBonusPaid ? "text-green-400 opacity-80" : "text-white")}>{formatCurrency(summerBonus)}</span>
                </div>

                <div className={cn(
                  "border border-neutral-800 rounded-xl p-4 flex justify-between items-center transition-colors relative overflow-hidden",
                  isChristmasBonusPaid ? "bg-green-500/5 border-green-500/20" : "bg-neutral-950 hover:border-neutral-700 group"
                )}>
                  {isChristmasBonusPaid && <div className="absolute top-0 right-0 p-1 rounded-bl-lg bg-green-500/20 text-green-400 text-[10px] uppercase font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {t.alreadyPaid}</div>}
                  <div>
                    <p className={cn("text-sm font-medium transition-colors flex items-center gap-1.5", isChristmasBonusPaid ? "text-green-400" : "text-white group-hover:text-red-400")}>
                      <Gift className="w-4 h-4 text-rose-500/80" /> {t.christmasBonus}
                    </p>
                    <p className="text-xs text-neutral-500">{t.paidOn} {formatDateWithWords(christmasBonusDate, user.language)}</p>
                  </div>
                  <span className={cn("font-mono text-sm", isChristmasBonusPaid ? "text-green-400 opacity-80" : "text-white")}>{formatCurrency(christmasBonus)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Settings Modal (Simple) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl w-full max-w-sm"
          >
            <h3 className="text-xl font-display font-medium mb-6">{t.settings}</h3>
            
            <div className="space-y-4 mb-6">
               <div className="flex flex-col gap-2">
                 <label className="text-sm text-neutral-400">{t.language}</label>
                 <div className="flex bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                   {(['en', 'el', 'tr'] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`flex-1 text-xs font-medium uppercase py-2 rounded-md transition-colors ${
                          lang === l ? "bg-white text-black" : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="flex flex-col gap-2 pt-4 border-t border-neutral-800">
                 <label className="text-sm text-neutral-400">{t.setSummerVacation}</label>
                 <input
                    type="date"
                    value={user.plannedVacationDate || ''}
                    onChange={(e) => onUpdateUser({ plannedVacationDate: e.target.value })}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#00ffcc] transition-all font-sans [color-scheme:dark]"
                 />
                 {user.plannedVacationDate && (
                    <button 
                      onClick={() => onUpdateUser({ plannedVacationDate: null })}
                      className="text-xs text-red-400 hover:text-red-300 self-start"
                    >
                      {t.clearDate}
                    </button>
                 )}
               </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors font-medium text-sm"
              >
                {t.settingsClose}
              </button>
              <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t.resetData}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
