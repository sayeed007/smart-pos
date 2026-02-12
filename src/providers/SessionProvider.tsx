"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LockScreen } from "@/components/auth/LockScreen";

interface SessionContextType {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);

  // Timeout settings
  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      // Don't reset if already locked
      if (isLocked) return;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsLocked(true);
      }, TIMEOUT_MS);
    };

    // Listen for events
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Initial start
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLocked]);

  const lock = () => setIsLocked(true);
  const unlock = () => setIsLocked(false);

  return (
    <SessionContext.Provider value={{ isLocked, lock, unlock }}>
      {children}
      {isLocked && <LockScreen onUnlock={unlock} />}
    </SessionContext.Provider>
  );
}

export const useSessionLock = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionLock must be used within a SessionProvider");
  }
  return context;
};
