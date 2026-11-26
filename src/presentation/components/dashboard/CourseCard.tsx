import { Link } from 'react-router-dom';
import type { Grupo } from '../../../domain/entities/Grupo';
import {
  agruparPorBloque,
  describirAvance,
  describirBloque,
  porcentajeAvance,
  semanaSugerida,
} from '../../../domain/rules/semanas';
import { APP_TEXTS } from '../../constants/textos';
import { useUsuarioActual } from '../../providers/SesionContext';
import { rutas } from '../../routes/rutas';
import { formatearFecha } from '../../utils/fechas';
import { estilos } from '../common/estilos';
import { CalificacionAcumulada } from './CalificacionAcumulada';
import { WeekSelector } from './WeekSelector';

/** El grupo con su calendario: el alumno entra a una semana; el maestro consulta calificaciones. */
export const CourseCard = ({ grupo }: { grupo: Grupo }) => {
  const total = grupo.semanas.length;
  const avance = porcentajeAvance(grupo.semanaActual, total);
  const esAlumno = useUsuarioActual().rol === 'alumno';

  return (
    <article
      aria-label={`Grupo ${grupo.nombre}`}
      className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-surface-container-high"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-title-md font-headline-lg text-on-surface">{grupo.plan.nombre || `Grupo ${grupo.nombre}`}</h3>
            {esAlumno && <CalificacionAcumulada grupoId={grupo.id} />}
          </div>
          <p className="text-body-sm text-outline">
            Grupo {grupo.nombre} · Inicia {formatearFecha(grupo.fechaInicio)}
          </p>
        </div>
        {esAlumno && total > 0 && (
          <Link
            to={rutas.semana(grupo.id, semanaSugerida(grupo.semanaActual, total))}
            className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 self-start shrink-0"
          >
            {APP_TEXTS.dashboard.goToCourse}
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="text-label-caps font-bold text-on-surface uppercase">{APP_TEXTS.dashboard.weeklyProgress}</h4>
          <span className="text-title-md font-bold text-primary">{describirAvance(grupo.semanaActual, total)}</span>
        </div>
        <div
          className="h-2 w-full bg-surface-container rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={avance}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avance del curso"
        >
          <div className="h-full bg-primary-container rounded-full" style={{ width: `${avance}%` }}></div>
        </div>

        {esAlumno && <WeekSelector semanas={grupo.semanas} rutaSemana={(n) => rutas.semana(grupo.id, n)} />}

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2" aria-label="Materias por bloque">
          {agruparPorBloque(grupo.materias).map(({ bloque, materias }) => (
            <li key={bloque} className="bg-surface-container-low rounded-lg px-4 py-3">
              <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">{describirBloque(bloque)}</p>
              <p className="text-body-sm text-on-surface">{materias.map((m) => m.nombre).join(' · ')}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-6 border-t border-outline-variant">
        <Link to={rutas.calificaciones(grupo.id)} className={`${estilos.botonSecundario} self-start`}>
          <span className="material-symbols-outlined text-[20px]">grading</span>
          {APP_TEXTS.dashboard.calificaciones}
        </Link>
      </div>
    </article>
  );
};
