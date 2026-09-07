import { useEffect, useState } from 'react';

export const AVAILABLE_PERIODS = ['Aug 2026', 'Jul 2026', 'Jun 2026'] as const;
export type Period = (typeof AVAILABLE_PERIODS)[number];

const STORAGE_KEY = 'finpilot_selected_period';
const DEFAULT_PERIOD: Period = 'Aug 2026';

let currentPeriod: Period = (() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Period | null;
    if (saved && AVAILABLE_PERIODS.includes(saved)) {
      return saved;
    }
  }
  return DEFAULT_PERIOD;
})();

const listeners = new Set<(period: Period) => void>();

export function setGlobalPeriod(nextPeriod: Period) {
  if (currentPeriod === nextPeriod) return;
  currentPeriod = nextPeriod;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, nextPeriod);
  }
  listeners.forEach((listener) => listener(currentPeriod));
}

export function getGlobalPeriod(): Period {
  return currentPeriod;
}

export function usePeriod(): [Period, (period: Period) => void] {
  const [period, setPeriodState] = useState<Period>(currentPeriod);

  useEffect(() => {
    const handler = (newPeriod: Period) => setPeriodState(newPeriod);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return [period, setGlobalPeriod];
}
