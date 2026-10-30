import { Link } from 'react-router-dom';
import type { Examen } from '../../../domain/entities/Examen';
import { formatearCalificacion } from '../../../domain/rules/examen';
import { APP_TEXTS } from '../../constants/textos';
import { rutas } from '../../routes/rutas';
import { estilos } from '../common/estilos';

interface AccionExamenAlumnoProps {
  examen: Examen | null | undefined;
  cargando: boolean;
}

export const AccionExamenAlumno = ({ examen, cargando }: AccionExamenAlumnoProps) => {
  if (cargando) {
    return (
      <button type="button" disabled className={estilos.botonPrimario}>
        Cargando examen…
      </button>
    );
  }
  if (!examen) {
    return (
      <button type="button" disabled className={estilos.botonPrimario}>
        <span className="material-symbols-outlined text-[20px]">block</span>
        {APP_TEXTS.semana.sinExamen}
      </button>
    );
  }
  if (examen.miIntento) {
    return (
      <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container font-bold">
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        Calificación: {formatearCalificacion(examen.miIntento.calificacion, examen.puntajeMaximo)}
      </span>
    );
  }
  return (
    <Link to={rutas.examen(examen.id)} className={estilos.botonPrimario}>
      <span className="material-symbols-outlined text-[20px]">quiz</span>
      {APP_TEXTS.semana.hacerExamen}
    </Link>
  );
};
