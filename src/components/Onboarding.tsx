import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Language } from '../types';
import { useTranslation } from '../i18n';
import { Globe, ArrowRight, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

// Animated Input component for character-by-character typing effect
const AnimatedInput = ({ value, onChange, placeholder, type = "text", autoFocus = false }: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  type?: string;
  autoFocus?: boolean;
}) => {
  const stringValue = String(value);
  return (
    <div className="relative w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full bg-neutral-950/50 px-4 py-3 outline-none border border-neutral-800 rounded-xl transition-shadow font-sans text-transparent caret-white placeholder:text-transparent relative z-10 focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc]"
      />
      <div className="absolute inset-0 z-0 bg-neutral-950 px-4 py-3 rounded-xl flex items-center overflow-hidden pointer-events-none whitespace-pre font-sans text-base">
        {stringValue === '' ? (
          <span className="text-neutral-500">{placeholder}</span>
        ) : (
          stringValue.split('').map((char, i) => (
            <motion.span
              key={`${i}`} 
              initial={{ opacity: 0, filter: 'blur(8px)', x: 15 }}
              animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
              transition={{ ease: "easeOut", duration: 0.3 }}
              className="inline-block text-white"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))
        )}
      </div>
    </div>
  );
};

interface OnboardingProps {
  onComplete: (profile: Omit<UserProfile, 'onboardingComplete'>) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export function Onboarding({ onComplete, lang, setLang }: OnboardingProps) {
  const t = useTranslation(lang);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    monthlySalary: '',
    paymentFrequency: 'monthly' as UserProfile['paymentFrequency'],
    startDate: '',
    isPrivateSector: true,
    workingDays: [1, 2, 3, 4, 5] as number[],
    isOaed: false,
    oaedActive: false,
    oaedStartDate: '',
    oaedAmount: '',
    employerAmount: '',
    firstHalfAmount: '',
  });

  const nextStep = () => {
    if (step === 4) {
      onComplete({
        fullName: formData.fullName,
        monthlySalary: Number(formData.monthlySalary) || 0,
        paymentFrequency: formData.paymentFrequency,
        startDate: formData.startDate,
        isPrivateSector: formData.isPrivateSector,
        workingDays: formData.workingDays,
        language: lang,
        vacationDaysUsed: 0,
        plannedVacationDate: null,
        isOaed: formData.isOaed,
        oaedActive: formData.oaedActive,
        oaedStartDate: formData.oaedStartDate || null,
        oaedAmount: Number(formData.oaedAmount) || 0,
        employerAmount: Number(formData.employerAmount) || 0,
        firstHalfAmount: formData.paymentFrequency === 'semimonthly' ? Number(formData.firstHalfAmount) || 0 : null,
        paymentHistory: [],
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  const isStepValid = () => {
    if (step === 0) return formData.fullName.trim().length > 0;
    if (step === 1) {
      if (Number(formData.monthlySalary) <= 0) return false;
      if (formData.paymentFrequency === 'semimonthly' && Number(formData.firstHalfAmount) <= 0) return false;
      return true;
    }
    if (step === 2) return formData.startDate !== '';
    if (step === 3) return formData.workingDays.length > 0;
    if (step === 4) {
      if (formData.isOaed) {
        if (!formData.oaedStartDate) return false;
        if (formData.oaedActive) {
          return Number(formData.oaedAmount) > 0;
        }
      }
      return true;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-gr/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Language Selector */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-full px-3 py-1.5 z-10">
        <Globe className="w-4 h-4 text-neutral-400" />
        {(['en', 'el', 'tr'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "text-xs font-medium uppercase px-2 py-1 rounded-full transition-colors",
              lang === l ? "bg-white text-black" : "text-neutral-500 hover:text-white"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 shadow-2xl rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-neutral-300" />
          </div>
          <h1 className="text-3xl font-display tracking-tight text-white mb-2">{t.welcome}</h1>
          <p className="text-neutral-400">{t.setup}</p>
        </motion.div>

        <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-8 rounded-3xl shadow-2xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30, filter: "blur(12px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -30, filter: "blur(12px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-neutral-300">{t.fullName}</label>
                  <AnimatedInput
                    autoFocus
                    value={formData.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Maria Papadopoulou"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">{t.monthlySalary}</label>
                    <AnimatedInput
                      type="number"
                      autoFocus
                      value={formData.monthlySalary}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, monthlySalary: e.target.value })}
                      placeholder="1200"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">{t.paymentFreq}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['monthly', 'semimonthly', 'biweekly', 'weekly'] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setFormData({ ...formData, paymentFrequency: freq })}
                          className={cn(
                            "py-3 px-2 rounded-xl text-sm font-medium transition-all border",
                            formData.paymentFrequency === freq 
                              ? "bg-[#00ffcc]/10 text-[#00ffcc] border-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.15)]" 
                              : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-600"
                          )}
                        >
                          {t[freq as keyof typeof t]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.paymentFrequency === 'semimonthly' && (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className="block text-sm font-medium text-neutral-300">{t.firstHalfAmount}</label>
                      <AnimatedInput
                        type="number"
                        value={formData.firstHalfAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstHalfAmount: e.target.value })}
                        placeholder="600"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">{t.startDate}</label>
                    <div className="text-xs text-neutral-500 mb-2">{t.dypaHint}</div>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ffcc] transition-all font-sans [color-scheme:dark] focus:ring-1 focus:ring-[#00ffcc]"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-neutral-800">
                    <label className="block text-sm font-medium text-neutral-300">{t.privateSectorQuestion}</label>
                    <div className="font-mono text-xs text-neutral-500 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/50">
                      {t.privateSectorWarn}
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ps"
                          checked={formData.isPrivateSector}
                          onChange={() => setFormData({ ...formData, isPrivateSector: true })}
                          className="accent-[#00ffcc]"
                        />
                        <span className="text-sm text-neutral-300">{t.yes}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ps"
                          checked={!formData.isPrivateSector}
                          onChange={() => setFormData({ ...formData, isPrivateSector: false })}
                          className="accent-[#00ffcc]"
                        />
                        <span className="text-sm text-neutral-300">{t.no}</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">{t.workDaysStr}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[{d: 1, l: 'mon'}, {d: 2, l: 'tue'}, {d: 3, l: 'wed'}, {d: 4, l: 'thu'}, {d: 5, l: 'fri'}, {d: 6, l: 'sat'}, {d: 0, l: 'sun'}].map((day) => (
                        <button
                          key={day.d}
                          onClick={() => {
                            const isSelected = formData.workingDays.includes(day.d);
                            if (isSelected) {
                              setFormData({ ...formData, workingDays: formData.workingDays.filter(d => d !== day.d) });
                            } else {
                              setFormData({ ...formData, workingDays: [...formData.workingDays, day.d] });
                            }
                          }}
                          className={cn(
                            "py-3 px-2 rounded-xl text-sm font-medium transition-all border",
                            formData.workingDays.includes(day.d)
                              ? "bg-[#00ffcc]/10 text-[#00ffcc] border-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.15)]" 
                              : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-600"
                          )}
                        >
                          {t[day.l as keyof typeof t]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">{t.oaedQuestion}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="oaed"
                          checked={formData.isOaed}
                          onChange={() => setFormData({ ...formData, isOaed: true })}
                          className="accent-[#00ffcc]"
                        />
                        <span className="text-sm text-neutral-300">{t.yes}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="oaed"
                          checked={!formData.isOaed}
                          onChange={() => setFormData({ ...formData, isOaed: false })}
                          className="accent-[#00ffcc]"
                        />
                        <span className="text-sm text-neutral-300">{t.no}</span>
                      </label>
                    </div>
                  </div>

                  {formData.isOaed && (
                    <>
                      <div className="space-y-4 pt-4 border-t border-neutral-800">
                        <label className="block text-sm font-medium text-neutral-300">{t.oaedStartDate}</label>
                        <input
                          type="date"
                          value={formData.oaedStartDate}
                          onChange={(e) => setFormData({ ...formData, oaedStartDate: e.target.value })}
                          className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ffcc] transition-all font-sans [color-scheme:dark] focus:ring-1 focus:ring-[#00ffcc]"
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-neutral-800">
                        <label className="block text-sm font-medium text-neutral-300">{t.oaedActiveQuestion}</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="oaedActive"
                              checked={formData.oaedActive}
                              onChange={() => setFormData({ ...formData, oaedActive: true })}
                              className="accent-[#00ffcc]"
                            />
                            <span className="text-sm text-neutral-300">{t.yes}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="oaedActive"
                              checked={!formData.oaedActive}
                              onChange={() => setFormData({ ...formData, oaedActive: false })}
                              className="accent-[#00ffcc]"
                            />
                            <span className="text-sm text-neutral-300">{t.no}</span>
                          </label>
                        </div>
                      </div>

                      {formData.oaedActive && (
                        <div className="space-y-4 pt-4 border-t border-neutral-800">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-300">{t.oaedAmount}</label>
                            <AnimatedInput
                              type="number"
                              value={formData.oaedAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, oaedAmount: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-300">{t.employerAmount}</label>
                            <AnimatedInput
                              type="number"
                              value={formData.employerAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, employerAmount: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step ? "w-8 bg-white" : "w-2 bg-neutral-800"
                  )} 
                />
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-full font-medium text-white hover:bg-neutral-800 transition-colors"
                >
                  {t.back}
                </button>
              )}
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 4 ? t.start : 'Next'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
