import { useMemo, useState, type ReactNode } from 'react';
import { BotonVolverContext, type DestinoVolver } from './BotonVolverContext';

/** Comparte el destino del botón "Volver" entre la pantalla actual y el header. */
export const BotonVolverProvider = ({ children }: { children: ReactNode }) => {
  const [destino, cambiarDestino] = useState<DestinoVolver | null>(null);
  const valor = useMemo(() => ({ destino, cambiarDestino }), [destino]);
  return <BotonVolverContext.Provider value={valor}>{children}</BotonVolverContext.Provider>;
};
