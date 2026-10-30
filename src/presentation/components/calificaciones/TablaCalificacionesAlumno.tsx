import type { CalificacionesAlumno } from '../../../domain/entities/Calificaciones';
import { formatearNota } from '../../../domain/rules/calificaciones';

const ENCABEZADOS = ['Semana', 'Semanal', 'Reposición', 'Mejor'];

/** Calificaciones de un alumno: una fila por semana con examen y el examen final aparte. */
export const TablaCalificacionesAlumno = ({ calificaciones }: { calificaciones: CalificacionesAlumno }) => (
  <div className="space-y-6">
    {calificaciones.semanas.length === 0 ? (
      <p className="text-body-sm text-on-surface-variant">Esta materia aún no tiene exámenes semanales.</p>
    ) : (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Calificaciones por semana</caption>
          <thead className="bg-surface-container-low text-label-caps font-label-caps text-on-surface-variant">
            <tr>
              {ENCABEZADOS.map((h) => (
                <th key={h} scope="col" className="px-6 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {calificaciones.semanas.map((s) => (
              <tr key={s.semana} className="hover:bg-surface-bright transition-colors">
                <th scope="row" className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                  Semana {s.semana}
                </th>
                <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatearNota(s.semanal)}</td>
                <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatearNota(s.reposicion)}</td>
                <td className="px-6 py-4 text-body-sm font-bold text-primary">{formatearNota(s.mejor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    <p className="bg-secondary-container/30 border-l-4 border-primary p-4 rounded-r-xl text-body-lg text-on-surface">
      Examen final: <span className="font-bold text-primary">{formatearNota(calificaciones.final)}</span>
    </p>
    <p className="text-body-sm text-on-surface-variant">
      «Mejor» es la calificación que cuenta en cada semana: la más alta entre el examen semanal y la reposición. «—» indica
      que aún no hay calificación.
    </p>
  </div>
);
