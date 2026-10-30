import { useId } from 'react';
import { Link } from 'react-router-dom';
import type { ResumenExamen } from '../../../domain/entities/Examen';
import { formatearCalificacion } from '../../../domain/rules/examen';
import { estadoDeVentana } from '../../../domain/rules/ventana';
import { rutas } from '../../routes/rutas';
import { describirVentana } from '../../utils/ventana';
import { estilos } from '../common/estilos';

interface BotonExamenProps {
  grupoId: string;
  examen: ResumenExamen | null | undefined;
  cargando?: boolean;
  /** Nombre del examen para mostrar junto a la calificación, p. ej. "Examen semanal". */
  nombre: string;
  /** Texto del botón cuando el examen se puede responder, p. ej. "Hacer examen". */
  accion: string;
  /** Texto cuando no existe el examen, p. ej. "Sin examen esta semana". */
  textoSinExamen: string;
  icono?: string;
}

/** Acceso del alumno a un examen: refleja la ventana (próxima / abierta / cerrada) o su calificación. */
export const BotonExamen = ({ grupoId, examen, cargando = false, nombre, accion, textoSinExamen, icono = 'quiz' }: BotonExamenProps) => {
  const idDetalle = useId();

  if (cargando) {
    return (
      <button type="button" disabled className={estilos.botonPrimario}>
        Cargando examen…
      </button>
    );
  }
  if (!examen) {
    return (
      <button type="button" disabled className={estilos.botonSecundario}>
        <span className="material-symbols-outlined text-[20px]">block</span>
        {textoSinExamen}
      </button>
    );
  }

  const detalle = (texto: string) => (
    <p id={idDetalle} className="text-[12px] text-on-surface-variant">
      {texto}
    </p>
  );

  if (examen.miIntento) {
    return (
      <div className="flex flex-col gap-1">
        <Link
          to={rutas.examen(grupoId, examen.id)}
          aria-describedby={idDetalle}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container font-bold hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {nombre} · Calificación: {formatearCalificacion(examen.miIntento.calificacion, examen.puntajeMaximo)}
        </Link>
        {detalle('Ya lo respondiste. Toca para ver tu revisión.')}
      </div>
    );
  }

  const estado = estadoDeVentana(examen.ventana);
  if (estado === 'abierta') {
    return (
      <div className="flex flex-col gap-1">
        <Link to={rutas.examen(grupoId, examen.id)} aria-describedby={idDetalle} className={estilos.botonPrimario}>
          <span className="material-symbols-outlined text-[20px]">{icono}</span>
          {accion}
        </Link>
        {detalle(describirVentana(examen.ventana))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" disabled aria-describedby={idDetalle} className={estilos.botonSecundario}>
        <span className="material-symbols-outlined text-[20px]">{estado === 'proxima' ? 'schedule' : 'lock'}</span>
        {accion}
      </button>
      {detalle(describirVentana(examen.ventana))}
    </div>
  );
};
