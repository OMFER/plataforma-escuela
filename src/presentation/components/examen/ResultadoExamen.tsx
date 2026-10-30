import type { ResultadoIntento } from '../../../domain/entities/Examen';
import { formatearCalificacion } from '../../../domain/rules/examen';
import { formatearFechaHora } from '../../utils/fechas';

interface ResultadoExamenProps {
  resultado: ResultadoIntento;
  puntajeMaximo: number;
}

export const ResultadoExamen = ({ resultado, puntajeMaximo }: ResultadoExamenProps) => (
  <section
    aria-label="Resultado del examen"
    className="bg-secondary-container/30 border border-secondary-container rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6"
  >
    <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
      task_alt
    </span>
    <div className="flex-1 text-center sm:text-left space-y-1">
      <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">Examen enviado</p>
      <p className="text-headline-lg-mobile font-headline-lg text-primary">
        Calificación: {formatearCalificacion(resultado.calificacion, puntajeMaximo)}
      </p>
      <p className="text-body-lg text-on-surface">
        Aciertos: {resultado.aciertos} de {resultado.totalPreguntas}
      </p>
      {resultado.fecha && (
        <p className="text-body-sm text-on-surface-variant">Respondido el {formatearFechaHora(resultado.fecha)}</p>
      )}
    </div>
  </section>
);
