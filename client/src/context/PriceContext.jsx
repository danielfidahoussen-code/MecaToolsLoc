import { createContext, useContext, useState } from 'react';

// TVA taux réduit La Réunion
const TVA = 0.085;

const PriceContext = createContext();

export function PriceProvider({ children }) {
  const [isPro, setIsPro] = useState(() => localStorage.getItem('isPro') === 'true');

  const toggle = () => setIsPro(v => {
    localStorage.setItem('isPro', String(!v));
    return !v;
  });

  // Retourne le prix à afficher (HT si pro, TTC sinon)
  const display = (ttc) => isPro ? ttc / (1 + TVA) : ttc;

  // Formate avec label
  const fmt = (ttc) => {
    if (!ttc && ttc !== 0) return null;
    return `${display(ttc).toFixed(2)} €${isPro ? ' HT' : ' TTC'}`;
  };

  return (
    <PriceContext.Provider value={{ isPro, toggle, display, fmt, TVA }}>
      {children}
    </PriceContext.Provider>
  );
}

export const usePrice = () => useContext(PriceContext);
