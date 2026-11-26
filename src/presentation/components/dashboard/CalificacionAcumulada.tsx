import { ESCALA_CALIFICACION } from '../../../domain/entities/Examen';
import { formatearNota } from '../../../domain/rules/calificaciones';
import { APP_TEXTS } from '../../constants/textos';
import { useCalificaciones } from '../../hooks/consultas';

/** Promedio general que lleva el alumno en el grupo; el servidor lo calcula, aquí solo se muestra. */
export const CalificacionAcumulada = ({ grupoId }: { grupoId: string }) => {
  const calificaciones = useCalificaciones(grupoId);
  const promedio = calificaciones.data?.boletas[0]?.promedioGeneral;
  if (promedio === undefined) return null;

  const texto = formatearNota(promedio);
  return (
    <span
      className="shrink-0 inline-flex items-baseline gap-1 px-3 py-1 rounded-full bg-secondary-container/50 text-primary"
      title={APP_TEXTS.dashboard.ayudaCalificacion}
      aria-label={`${APP_TEXTS.dashboard.calificacionAcumulada}: ${texto} de ${ESCALA_CALIFICACION}`}
    >
      <span className="text-title-md font-bold">{texto}</span>
      <span className="text-body-sm text-on-surface-variant">/ {ESCALA_CALIFICACION}</span>
    </span>
  );
};
