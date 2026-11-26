import { Link } from 'react-router-dom';
import type { MateriaEnPlan } from '../../../domain/entities/Materia';
import { nombreDePlan } from '../../../domain/entities/Plan';
import { describirBloque } from '../../../domain/rules/semanas';
import { useUsuarioActual } from '../../providers/SesionContext';
import { rutas } from '../../routes/rutas';
import { EtiquetaEstadoPlan } from '../planes/EtiquetaEstadoPlan';

/** Materia con su versión del plan; el admin puede volver al plan desde aquí. */
export const EncabezadoMateria = ({ materia }: { materia: MateriaEnPlan }) => {
  const esAdmin = useUsuarioActual().rol === 'admin';
  return (
    <div className="space-y-1">
      <p className="text-title-md text-primary flex flex-wrap items-center gap-2">
        {esAdmin ? (
          <Link to={rutas.plan(materia.plan.id)} className="hover:underline">
            {nombreDePlan(materia.plan)}
          </Link>
        ) : (
          nombreDePlan(materia.plan)
        )}
        <EtiquetaEstadoPlan estado={materia.plan.estado} />
      </p>
      <p className="text-body-sm text-on-surface-variant">
        {materia.nombre} · Bloque {materia.bloque} ({describirBloque(materia.bloque)} de cada grupo)
      </p>
    </div>
  );
};

/** Aviso de que un plan publicado solo admite correcciones. */
export const AvisoPlanPublicado = () => (
  <p role="note" className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
    Este plan ya está publicado y lo usan grupos: puedes corregir textos, recursos, ligas y la redacción de las preguntas.
    Para agregar o quitar contenido o exámenes, el admin debe crear una nueva versión del plan.
  </p>
);
