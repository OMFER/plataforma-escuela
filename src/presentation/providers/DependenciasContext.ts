import { createContext, useContext } from 'react';
import type { CasosDeUso, Dependencias } from '../../application/CasosDeUso';

export const DependenciasContext = createContext<Dependencias | null>(null);

export const useDependencias = (): Dependencias => {
  const dependencias = useContext(DependenciasContext);
  if (!dependencias) throw new Error('useDependencias debe usarse dentro de <DependenciasProvider>.');
  return dependencias;
};

export const useCasosDeUso = (): CasosDeUso => useDependencias().casosDeUso;
