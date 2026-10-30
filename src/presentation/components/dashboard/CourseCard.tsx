import { Link } from 'react-router-dom';
import type { Materia } from '../../../domain/entities/Materia';
import { describirAvance, porcentajeAvance, semanaSugerida } from '../../../domain/rules/semanas';
import { APP_TEXTS } from '../../constants/textos';
import { rutas } from '../../routes/rutas';
import { WeekSelector } from './WeekSelector';

interface CourseCardProps {
  materia: Materia;
}

const detalleMateria = (materia: Materia): string =>
  [materia.aula && `Aula ${materia.aula}`, materia.grupo && `Grupo ${materia.grupo}`].filter(Boolean).join(' | ');

export const CourseCard = ({ materia }: CourseCardProps) => {
  const avance = porcentajeAvance(materia.semanaActual, materia.totalSemanas);
  const detalle = detalleMateria(materia);

  return (
    <article className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-surface-container-high">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
        <div>
          <h3 className="text-title-md font-headline-lg text-on-surface mb-1">{materia.nombre}</h3>
          {detalle && <p className="text-body-sm text-outline">{detalle}</p>}
          {materia.maestro.nombre && (
            <p className="mt-3 flex items-center gap-1 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">person</span>
              {materia.maestro.nombre}
            </p>
          )}
        </div>
        <Link
          to={rutas.semana(materia.id, semanaSugerida(materia))}
          className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 self-start shrink-0"
        >
          {APP_TEXTS.dashboard.goToCourse}
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="text-label-caps font-bold text-on-surface uppercase">{APP_TEXTS.dashboard.weeklyProgress}</h4>
          <span className="text-title-md font-bold text-primary">{describirAvance(materia.semanaActual, materia.totalSemanas)}</span>
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

        <WeekSelector semanas={materia.semanas} rutaSemana={(n) => rutas.semana(materia.id, n)} />
      </div>
    </article>
  );
};
