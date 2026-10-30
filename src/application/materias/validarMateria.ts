import { MAX_SEMANAS, MIN_SEMANAS, type CambiosMateria } from '../../domain/entities/Materia';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';

/** Limpia espacios y valida los campos presentes; lanza ErrorAplicacion con todos los problemas. */
export const limpiarMateria = (datos: CambiosMateria): CambiosMateria => {
  const limpio: CambiosMateria = { ...datos };
  const errores: string[] = [];
  if (limpio.nombre !== undefined) {
    limpio.nombre = limpio.nombre.trim();
    if (!limpio.nombre) errores.push('El nombre es obligatorio.');
  }
  if (limpio.descripcion !== undefined) limpio.descripcion = limpio.descripcion.trim();
  if (
    limpio.totalSemanas !== undefined &&
    (!Number.isInteger(limpio.totalSemanas) || limpio.totalSemanas < MIN_SEMANAS || limpio.totalSemanas > MAX_SEMANAS)
  ) {
    errores.push(`El total de semanas debe ser un entero entre ${MIN_SEMANAS} y ${MAX_SEMANAS}.`);
  }
  if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
  return limpio;
};
