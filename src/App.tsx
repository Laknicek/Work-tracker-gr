import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { IntroAnimation } from './components/IntroAnimation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserProfile, Language } from './types';

const defaultProfile: UserProfile = {
  fullName: '',
  monthlySalary: 0,
  paymentFrequency: 'monthly',
  startDate: '',
  isPrivateSector: true,
  workingDays: [1, 2, 3, 4, 5],
  language: 'el',
  onboardingComplete: false,
  vacationDaysUsed: 0,
  plannedVacationDate: null,
  isOaed: false,
  oaedActive: false,
  oaedAmount: 0,
  employerAmount: 0,
  oaedStartDate: null,
  firstHalfAmount: null,
  paymentHistory: [],
};

export default function App() {
  const [user, setUser] = useLocalStorage<UserProfile>('tracker-gr-profile-v2', defaultProfile);
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-neutral-950" />;

  const handleCompleteOnboarding = (profileData: Omit<UserProfile, 'onboardingComplete'>) => {
    setUser({ ...profileData, onboardingComplete: true });
  };

  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    setUser({ ...user, ...updates });
  };

  const handleReset = () => {
    setUser(defaultProfile);
    window.localStorage.removeItem('tracker-gr-profile-v2');
  };

  const setLang = (lang: Language) => {
    setUser({ ...user, language: lang });
  };

  return (
    <div className="bg-neutral-950 min-h-screen selection:bg-neon-gr selection:text-neutral-950 fill-neutral-950">
      <AnimatePresence mode="wait">
        {showIntro && <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {!showIntro && (
        <motion.div
           initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
           animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
           transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {!user.onboardingComplete ? (
            <Onboarding onComplete={handleCompleteOnboarding} lang={user.language} setLang={setLang} />
          ) : (
            <Dashboard user={user} onUpdateUser={handleUpdateUser} onReset={handleReset} lang={user.language} setLang={setLang} />
          )}
        </motion.div>
      )}
    </div>
  );
}

