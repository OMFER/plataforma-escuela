import { createContext, useContext, useEffect } from 'react';

/** A dónde lleva el botón "Volver" del header y qué texto muestra. */
export interface DestinoVolver {
  ruta: string;
  texto: string;
}

export interface ValorBotonVolver {
  destino: DestinoVolver | null;
  cambiarDestino(destino: DestinoVolver | null): void;
}

export const BotonVolverContext = createContext<ValorBotonVolver | null>(null);

const useValorBotonVolver = (): ValorBotonVolver => {
  const valor = useContext(BotonVolverContext);
  if (!valor) throw new Error('El botón volver debe usarse dentro de <BotonVolverProvider>.');
  return valor;
};

/** Para el header: el destino que declaró la pantalla actual (o null si no tiene botón volver). */
export const useDestinoVolver = (): DestinoVolver | null => useValorBotonVolver().destino;

/** Para las pantallas: declara el botón "Volver" que el header muestra mientras la pantalla está abierta. */
export const useBotonVolver = ({ ruta, texto }: DestinoVolver): void => {
  const { cambiarDestino } = useValorBotonVolver();
  useEffect(() => {
    cambiarDestino({ ruta, texto });
    return () => cambiarDestino(null);
  }, [cambiarDestino, ruta, texto]);
};
