// src/context/AdviceContext.js
import React, { createContext, useContext, useState } from 'react';

const AdviceContext = createContext(null);

export function AdviceProvider({ children }) {
  const [unreadCount] = useState(0);

  return (
    <AdviceContext.Provider value={{ unreadCount }}>
      {children}
    </AdviceContext.Provider>
  );
}

export function useAdvice() {
  const ctx = useContext(AdviceContext);
  if (!ctx) return { unreadCount: 0 };
  return ctx;
}
