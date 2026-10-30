import { Link } from 'react-router-dom';
import type { Materia } from '../../../domain/entities/Materia';
import { buscarSemana, formatearRangoSemana } from '../../../domain/rules/semanas';
import { rutas } from '../../routes/rutas';
import { estilos } from '../common/estilos';

const ETIQUETA_ESTADO = { completada: 'Completada', actual: 'Semana actual', futura: 'Próxima' } as const;

interface EncabezadoSemanaProps {
  materiaId: string;
  semana: number;
  materia?: Materia;
  volverA?: { ruta: string; texto: string };
}

export const EncabezadoSemana = ({ materiaId, semana, materia, volverA }: EncabezadoSemanaProps) => {
  const info = materia ? buscarSemana(materia.semanas, semana) : undefined;
  const total = materia?.totalSemanas;
  const destino = volverA ?? { ruta: rutas.inicio, texto: 'Volver al inicio' };

  return (
    <section className="space-y-4">
      <Link to={destino.ruta} className={estilos.enlaceVolver}>
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        {destino.texto}
      </Link>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          {materia && <p className="text-title-md text-primary">{materia.nombre}</p>}
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
            Semana {semana}
            {total ? <span className="text-on-surface-variant font-normal"> de {total}</span> : null}
          </h1>
          {info && (
            <p className="text-body-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">date_range</span>
              {formatearRangoSemana(info.inicio, info.fin)}
              <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded uppercase">
                {ETIQUETA_ESTADO[info.estado]}
              </span>
            </p>
          )}
        </div>
        {!volverA && total ? (
          <nav className="flex gap-2" aria-label="Cambiar de semana">
            {semana > 1 && (
              <Link to={rutas.semana(materiaId, semana - 1)} className={estilos.botonSecundario}>
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Anterior
              </Link>
            )}
            {semana < total && (
              <Link to={rutas.semana(materiaId, semana + 1)} className={estilos.botonSecundario}>
                Siguiente
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Link>
            )}
          </nav>
        ) : null}
      </div>
    </section>
  );
};
