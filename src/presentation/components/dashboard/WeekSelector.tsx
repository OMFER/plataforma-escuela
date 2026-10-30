import { Link } from 'react-router-dom';
import type { EstadoSemana, Semana } from '../../../domain/entities/Grupo';
import { formatearRangoSemana } from '../../../domain/rules/semanas';

interface WeekSelectorProps {
  semanas: Semana[];
  /** Construye la ruta de cada semana. */
  rutaSemana: (numero: number) => string;
  seleccionada?: number;
}

const ESTILOS: Record<EstadoSemana, { celda: string; cabecera: string; numero: string; fecha: string; franja: string; icono: string; texto: string }> = {
  completada: {
    celda: '',
    cabecera: 'bg-secondary-container/40',
    numero: 'text-primary',
    fecha: 'text-on-secondary-container',
    franja: 'bg-primary-container text-on-primary',
    icono: 'check_box',
    texto: 'completada',
  },
  actual: {
    celda: '',
    cabecera: 'bg-on-primary-fixed',
    numero: 'text-on-primary',
    fecha: 'text-on-primary/70',
    franja: 'bg-primary text-on-primary',
    icono: 'play_circle',
    texto: 'semana actual',
  },
  futura: {
    celda: 'opacity-60 hover:opacity-100',
    cabecera: 'bg-surface-container-low',
    numero: 'text-outline',
    fecha: 'text-outline',
    franja: 'bg-outline-variant/40 text-outline',
    icono: 'description',
    texto: 'próxima',
  },
};

export const WeekSelector = ({ semanas, rutaSemana, seleccionada }: WeekSelectorProps) => {
  if (semanas.length === 0) return null;
  return (
    <ol className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-px bg-outline-variant border border-outline-variant rounded-lg overflow-hidden mt-6">
      {semanas.map((semana) => {
        const estilo = ESTILOS[semana.estado];
        const rango = formatearRangoSemana(semana.inicio, semana.fin);
        const esSeleccionada = semana.numero === seleccionada;
        return (
          <li key={semana.numero} className={`flex bg-surface-container-lowest transition-opacity ${estilo.celda}`}>
            <Link
              to={rutaSemana(semana.numero)}
              aria-label={`Semana ${semana.numero}, ${rango}, ${estilo.texto}`}
              aria-current={semana.estado === 'actual' ? 'date' : undefined}
              data-estado={semana.estado}
              className={`flex flex-col w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${esSeleccionada ? 'ring-2 ring-inset ring-primary' : ''}`}
            >
              <div className={`p-3 flex-1 ${estilo.cabecera}`}>
                <p className={`text-title-md font-bold ${estilo.numero}`}>{semana.numero}</p>
                <p className={`text-[10px] font-medium whitespace-nowrap ${estilo.fecha}`}>{rango}</p>
              </div>
              <div className={`p-2 flex justify-center ${estilo.franja}`}>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  {estilo.icono}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};
