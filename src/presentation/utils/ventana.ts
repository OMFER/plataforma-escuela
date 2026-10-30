import type { Ventana } from '../../domain/entities/Examen';
import { estadoDeVentana } from '../../domain/rules/ventana';
import { formatearFechaHora } from './fechas';

/** "Abre el …", "Disponible hasta el …" o "Cerrado". */
export const describirVentana = (ventana: Ventana, ahora: Date = new Date()): string => {
  switch (estadoDeVentana(ventana, ahora)) {
    case 'proxima':
      return `Abre el ${formatearFechaHora(ventana.abre)}`;
    case 'abierta':
      return `Disponible hasta el ${formatearFechaHora(ventana.cierra)}`;
    default:
      return 'Cerrado';
  }
};

