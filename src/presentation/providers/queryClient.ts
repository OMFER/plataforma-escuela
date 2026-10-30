import { QueryClient } from '@tanstack/react-query';
import { esErrorAplicacion } from '../../domain/errors/ErrorAplicacion';

/** No se reintentan errores del cliente (4xx): repetirlos no cambia el resultado. */
const debeReintentar = (intentos: number, error: unknown): boolean => {
  if (esErrorAplicacion(error) && error.estado !== null && error.estado >= 400 && error.estado < 500) return false;
  return intentos < 1;
};

export const crearQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: debeReintentar, staleTime: 30_000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
