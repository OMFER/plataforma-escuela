import type { CalificacionesAlumno } from '../../../domain/entities/Calificaciones';
import { formatearNota, semanasCalificadas } from '../../../domain/rules/calificaciones';

/** Tabla del maestro: una fila por alumno y una columna por semana (mejor nota), más el final. */
export const TablaCalificacionesGrupo = ({ calificaciones }: { calificaciones: CalificacionesAlumno[] }) => {
  if (calificaciones.length === 0) {
    return <p className="text-body-sm text-on-surface-variant">Aún no hay alumnos inscritos en este grupo.</p>;
  }
  const semanas = semanasCalificadas(calificaciones);

  return (
    <div className="space-y-3">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Calificaciones del grupo</caption>
          <thead className="bg-surface-container-low text-label-caps font-label-caps text-on-surface-variant">
            <tr>
              <th scope="col" className="px-4 py-4">Alumno</th>
              {semanas.map((n) => (
                <th key={n} scope="col" className="px-4 py-4 whitespace-nowrap">
                  Sem. {n}
                </th>
              ))}
              <th scope="col" className="px-4 py-4">Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {calificaciones.map((c) => (
              <tr key={c.alumno.id} className="hover:bg-surface-bright transition-colors">
                <th scope="row" className="px-4 py-3 font-normal">
                  <p className="text-body-sm font-semibold text-on-surface">{c.alumno.nombre}</p>
                  {c.alumno.correo && <p className="text-[12px] text-on-surface-variant">{c.alumno.correo}</p>}
                </th>
                {semanas.map((n) => (
                  <td key={n} className="px-4 py-3 text-body-sm text-on-surface-variant whitespace-nowrap">
                    {formatearNota(c.semanas.find((s) => s.semana === n)?.mejor ?? null)}
                  </td>
                ))}
                <td className="px-4 py-3 text-body-sm font-bold text-primary whitespace-nowrap">{formatearNota(c.final)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        Cada semana muestra la mejor calificación entre el examen semanal y la reposición. «—» indica que aún no hay calificación.
      </p>
    </div>
  );
};
