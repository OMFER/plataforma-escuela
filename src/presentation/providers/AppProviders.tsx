import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import type { Dependencias } from '../../application/CasosDeUso';
import { DependenciasContext } from './DependenciasContext';
import { crearQueryClient } from './queryClient';
import { SesionProvider } from './SesionProvider';

interface AppProvidersProps {
  dependencias: Dependencias;
  queryClient?: QueryClient;
  children: ReactNode;
}

export const AppProviders = ({ dependencias, queryClient, children }: AppProvidersProps) => {
  const [cliente] = useState(() => queryClient ?? crearQueryClient());
  return (
    <DependenciasContext.Provider value={dependencias}>
      <QueryClientProvider client={cliente}>
        <SesionProvider>{children}</SesionProvider>
      </QueryClientProvider>
    </DependenciasContext.Provider>
  );
};
