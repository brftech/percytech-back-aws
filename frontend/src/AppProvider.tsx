import React, { ReactNode } from 'react';
import { useAuthStore } from './stores/authStore';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { initialize } = useAuthStore();

  // Initialize app state
  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
