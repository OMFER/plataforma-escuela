import type { EstadoVentana, ResumenExamen, Ventana } from '../entities/Examen';

/** Estado de la ventana en `ahora`; si las fechas no son válidas se usa el que envió el backend. */
export const estadoDeVentana = (ventana: Ventana, ahora: Date = new Date()): EstadoVentana => {
  const abre = new Date(ventana.abre).getTime();
  const cierra = new Date(ventana.cierra).getTime();
  if (Number.isNaN(abre) || Number.isNaN(cierra)) return ventana.estado;
  const t = ahora.getTime();
  if (t < abre) return 'proxima';
  if (t > cierra) return 'cerrada';
  return 'abierta';
};

/** true si el alumno todavía puede responder el examen. */
export const puedeResponder = (
  examen: Pick<ResumenExamen, 'ventana' | 'miIntento'>,
  ahora: Date = new Date(),
): boolean => !examen.miIntento && estadoDeVentana(examen.ventana, ahora) === 'abierta';
