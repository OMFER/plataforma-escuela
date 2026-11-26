import type { CambiosMateria } from '../../domain/entities/Materia';
import { MAX_BLOQUES } from '../../domain/entities/Plan';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';

/** Limpia espacios y valida los campos presentes; lanza ErrorAplicacion con todos los problemas. */
export const limpiarMateria = <T extends CambiosMateria>(datos: T): T => {
  const limpio: T = { ...datos };
  const errores: string[] = [];
  if (limpio.nombre !== undefined) {
    limpio.nombre = limpio.nombre.trim();
    if (!limpio.nombre) errores.push('El nombre es obligatorio.');
  }
  if (limpio.descripcion !== undefined) limpio.descripcion = limpio.descripcion.trim();
  if (limpio.bloque !== undefined && (!Number.isInteger(limpio.bloque) || limpio.bloque < 1 || limpio.bloque > MAX_BLOQUES)) {
    errores.push(`El bloque debe ser un número entre 1 y ${MAX_BLOQUES}.`);
  }
  if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
  return limpio;
};
