import { CALIFICACION_APROBATORIA, type BoletaAlumno, type CalificacionesGrupo } from '../../../domain/entities/Calificaciones';
import { boletaDeMateria, formatearNota, situacionDeMateria } from '../../../domain/rules/calificaciones';
import { casillasDeExamen } from '../../../domain/rules/examen';

const SITUACION = {
  aprobada: { texto: 'Aprobada', clase: 'bg-exito-container text-exito' },
  reprobada: { texto: 'Reprobada', clase: 'bg-error-container text-error' },
  'en-curso': { texto: 'En curso', clase: 'bg-surface-container-highest text-on-surface-variant' },
} as const;

interface TablaCalificacionesAlumnoProps {
  materias: CalificacionesGrupo['materias'];
  boleta: BoletaAlumno;
}

/** Boleta del alumno: una fila por materia con sus 4 exámenes, el promedio y si ya aprobó. */
export const TablaCalificacionesAlumno = ({ materias, boleta }: TablaCalificacionesAlumnoProps) => {
  const casillas = casillasDeExamen();
  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Calificaciones por materia</caption>
          <thead className="bg-surface-container-low text-label-caps font-label-caps text-on-surface-variant">
            <tr>
              <th scope="col" className="px-4 py-4">Materia</th>
              {casillas.map(({ semana, numero }) => (
                <th key={`${semana}-${numero}`} scope="col" className="px-3 py-4 whitespace-nowrap">
                  S{semana} · E{numero}
                </th>
              ))}
              <th scope="col" className="px-4 py-4">Promedio</th>
              <th scope="col" className="px-4 py-4">Situación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {materias.map((materia) => {
              const deMateria = boletaDeMateria(boleta, materia.id);
              const situacion = deMateria ? SITUACION[situacionDeMateria(deMateria)] : null;
              return (
                <tr key={materia.id} className="hover:bg-surface-bright transition-colors">
                  <th scope="row" className="px-4 py-3 text-body-sm font-semibold text-on-surface">
                    {materia.nombre}
                    <span className="block text-[12px] font-normal text-on-surface-variant">Bloque {materia.bloque}</span>
                  </th>
                  {casillas.map(({ semana, numero }) => (
                    <td key={`${semana}-${numero}`} className="px-3 py-3 text-body-sm text-on-surface-variant">
                      {formatearNota(deMateria?.notas.find((n) => n.semana === semana && n.numero === numero)?.calificacion)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-body-sm font-bold text-primary">{formatearNota(deMateria?.promedio)}</td>
                  <td className="px-4 py-3">
                    {situacion && (
                      <span className={`px-2 py-1 rounded-full text-[12px] font-bold whitespace-nowrap ${situacion.clase}`}>
                        {situacion.texto}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="bg-secondary-container/30 border-l-4 border-primary p-4 rounded-r-xl text-body-lg text-on-surface">
        Promedio general: <span className="font-bold text-primary">{formatearNota(boleta.promedioGeneral)}</span>
      </p>
      <p className="text-body-sm text-on-surface-variant">
        S1 · E1 es el examen 1 de la semana 1 de la materia. Cada materia se califica con el promedio de sus 4 exámenes y se
        aprueba con {CALIFICACION_APROBATORIA}; un examen que no presentaste cuenta 0. «—» indica que aún no hay calificación.
      </p>
    </div>
  );
};
