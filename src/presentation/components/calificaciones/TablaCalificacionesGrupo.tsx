import { CALIFICACION_APROBATORIA, type CalificacionesGrupo } from '../../../domain/entities/Calificaciones';
import { boletaDeMateria, formatearNota } from '../../../domain/rules/calificaciones';

/** Tabla del maestro y del admin: una fila por alumno y una columna por materia (su promedio). */
export const TablaCalificacionesGrupo = ({ calificaciones }: { calificaciones: CalificacionesGrupo }) => {
  const { materias, boletas } = calificaciones;
  if (boletas.length === 0) {
    return <p className="text-body-sm text-on-surface-variant">Aún no hay alumnos inscritos en este grupo.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Calificaciones del grupo</caption>
          <thead className="bg-surface-container-low text-label-caps font-label-caps text-on-surface-variant">
            <tr>
              <th scope="col" className="px-4 py-4">Alumno</th>
              {materias.map((m) => (
                <th key={m.id} scope="col" className="px-4 py-4">
                  {m.nombre}
                </th>
              ))}
              <th scope="col" className="px-4 py-4">General</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {boletas.map((b) => (
              <tr key={b.alumno.id} className="hover:bg-surface-bright transition-colors">
                <th scope="row" className="px-4 py-3 font-normal">
                  <p className="text-body-sm font-semibold text-on-surface">{b.alumno.nombre}</p>
                  {b.alumno.correo && <p className="text-[12px] text-on-surface-variant">{b.alumno.correo}</p>}
                </th>
                {materias.map((m) => {
                  const deMateria = boletaDeMateria(b, m.id);
                  const reprobando = deMateria?.completa && !deMateria.aprobada;
                  return (
                    <td
                      key={m.id}
                      className={`px-4 py-3 text-body-sm whitespace-nowrap ${reprobando ? 'text-error font-bold' : 'text-on-surface-variant'}`}
                    >
                      {formatearNota(deMateria?.promedio)}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-body-sm font-bold text-primary whitespace-nowrap">{formatearNota(b.promedioGeneral)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        Cada columna es el promedio de los 4 exámenes de la materia (lo no presentado cuenta 0). Se aprueba con{' '}
        {CALIFICACION_APROBATORIA}; en rojo, las materias terminadas sin aprobar.
      </p>
    </div>
  );
};
