// components/client-only.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Supprime les attributs problématiques ajoutés par les extensions
    const removeProblematicAttributes = () => {
      document.body.removeAttribute('data-new-gr-c-s-check-loaded');
      document.body.removeAttribute('data-gr-ext-installed');
      document.body.removeAttribute('data-gramm');
      document.body.removeAttribute('data-gramm_id');
    };
    
    removeProblematicAttributes();
    
    // Nettoyage périodique au cas où les extensions les réajouteraient
    const interval = setInterval(removeProblematicAttributes, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}