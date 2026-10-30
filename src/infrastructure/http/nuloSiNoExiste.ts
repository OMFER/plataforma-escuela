import { esErrorAplicacion } from '../../domain/errors/ErrorAplicacion';

/** Convierte un 404 en `null`; cualquier otro error se propaga. */
export const nuloSiNoExiste = async <T>(promesa: Promise<T>): Promise<T | null> => {
  try {
    return await promesa;
  } catch (e) {
    if (esErrorAplicacion(e) && e.esNoEncontrado) return null;
    throw e;
  }
};
