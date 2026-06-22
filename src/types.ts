export type Language = 'en' | 'el' | 'tr';
export type PaymentFrequency = 'monthly' | 'semimonthly' | 'biweekly' | 'weekly';

export interface UserProfile {
  fullName: string;
  monthlySalary: number;
  paymentFrequency: PaymentFrequency;
  startDate: string; // ISO date string (YYYY-MM-DD)
  isPrivateSector: boolean;
  workingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  language: Language;
  onboardingComplete: boolean;
  vacationDaysUsed: number;
  plannedVacationDate: string | null;
  isOaed: boolean;
  oaedActive: boolean;
  oaedAmount: number;
  employerAmount: number;
  oaedStartDate: string | null;
  firstHalfAmount: number | null;
  paymentHistory: string[];
  plannedVacationDuration?: number;
}

export interface CalculationResults {
  monthsWorked: number;
  yearsWorked: number;
  accruedVacationDays: number;
  remainingVacationDays: number;
  canTakeSummerVacation: boolean;
  regularPayAmount: number;
  easterBonus: number;
  christmasBonus: number;
  summerBonus: number;
}
