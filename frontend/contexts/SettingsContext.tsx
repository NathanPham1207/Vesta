import React, { createContext, useCallback, useContext, useState } from 'react';

const EXPIRY_WARNING_MIN = 1;
const EXPIRY_WARNING_MAX = 14;
const EXPIRY_WARNING_DEFAULT = 3;

const LOW_STOCK_MIN = 1;
const LOW_STOCK_MAX = 10;
const LOW_STOCK_DEFAULT = 2;

interface SettingsContextType {
  expiryWarningDays: number;
  lowStockThreshold: number;
  setExpiryWarningDays: (days: number) => void;
  setLowStockThreshold: (threshold: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [expiryWarningDays, setExpiryWarningDaysState] = useState(EXPIRY_WARNING_DEFAULT);
  const [lowStockThreshold, setLowStockThresholdState] = useState(LOW_STOCK_DEFAULT);

  const setExpiryWarningDays = useCallback((days: number) => {
    const clamped = Math.min(Math.max(days, EXPIRY_WARNING_MIN), EXPIRY_WARNING_MAX);
    setExpiryWarningDaysState(clamped);
  }, []);

  const setLowStockThreshold = useCallback((threshold: number) => {
    const clamped = Math.min(Math.max(threshold, LOW_STOCK_MIN), LOW_STOCK_MAX);
    setLowStockThresholdState(clamped);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ expiryWarningDays, lowStockThreshold, setExpiryWarningDays, setLowStockThreshold }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export { EXPIRY_WARNING_MIN, EXPIRY_WARNING_MAX, LOW_STOCK_MIN, LOW_STOCK_MAX };
