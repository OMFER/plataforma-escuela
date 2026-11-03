import { APP_TEXTS } from '../../constants/textos';
import { useCalificaciones } from '../../hooks/consultas';

/** Escala en la que el servidor entrega la calificación del semestre. */
const ESCALA = 10;

/** Calificación que lleva el alumno en el grupo; el servidor la calcula, aquí solo se muestra. */
export const CalificacionAcumulada = ({ grupoId }: { grupoId: string }) => {
  const calificaciones = useCalificaciones(grupoId);
  const semestre = calificaciones.data?.[0]?.semestre;
  if (semestre === null || semestre === undefined) return null;

  const texto = semestre.toFixed(1);
  return (
    <span
      className="shrink-0 inline-flex items-baseline gap-1 px-3 py-1 rounded-full bg-secondary-container/50 text-primary"
      title={APP_TEXTS.dashboard.ayudaCalificacion}
      aria-label={`${APP_TEXTS.dashboard.calificacionAcumulada}: ${texto} de ${ESCALA}`}
    >
      <span className="text-title-md font-bold">{texto}</span>
      <span className="text-body-sm text-on-surface-variant">/ {ESCALA}</span>
    </span>
  );
};
