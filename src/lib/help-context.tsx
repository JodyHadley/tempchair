"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface HelpContextValue {
  helpMode: boolean;
  toggleHelp: () => void;
}

const HelpContext = createContext<HelpContextValue | null>(null);

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [helpMode, setHelpMode] = useState(false);

  const toggleHelp = useCallback(() => {
    setHelpMode((prev) => !prev);
  }, []);

  return (
    <HelpContext.Provider value={{ helpMode, toggleHelp }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error("useHelp must be used within HelpProvider");
  return ctx;
}
