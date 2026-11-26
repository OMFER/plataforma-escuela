import { Link } from 'react-router-dom';
import type { MateriaEnPlan } from '../../../domain/entities/Materia';
import { nombreDePlan } from '../../../domain/entities/Plan';
import { describirBloque } from '../../../domain/rules/semanas';
import { APP_TEXTS } from '../../constants/textos';
import { useMisMaterias } from '../../hooks/consultas';
import { rutas } from '../../routes/rutas';
import { Cargando } from '../common/Cargando';
import { EstadoVacio } from '../common/EstadoVacio';
import { MensajeError } from '../common/MensajeError';
import { EtiquetaEstadoPlan } from '../planes/EtiquetaEstadoPlan';

/** Agrupa las materias por versión del plan, de la más nueva a la más antigua. */
const porPlan = (materias: MateriaEnPlan[]) => {
  const planes = new Map<string, MateriaEnPlan[]>();
  for (const m of materias) planes.set(m.plan.id, [...(planes.get(m.plan.id) ?? []), m]);
  return [...planes.values()].sort(
    (a, b) => a[0].plan.nombre.localeCompare(b[0].plan.nombre, 'es') || b[0].plan.version - a[0].plan.version,
  );
};

/** Lo que ve un maestro al entrar: sus materias, para corregir su contenido y sus exámenes. */
export const MisMaterias = () => {
  const { data: materias, isPending, error, refetch } = useMisMaterias();

  if (isPending) return <Cargando texto="Cargando tus materias…" />;
  if (error) return <MensajeError error={error} alReintentar={() => void refetch()} />;
  if (materias.length === 0) return <EstadoVacio icono="menu_book" titulo={APP_TEXTS.dashboard.sinMaterias} />;

  return (
    <div className="space-y-6">
      {porPlan(materias).map((delPlan) => {
        const { plan } = delPlan[0];
        return (
          <section key={plan.id} aria-label={nombreDePlan(plan)} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-title-md font-headline-lg text-on-surface">{nombreDePlan(plan)}</h3>
              <EtiquetaEstadoPlan estado={plan.estado} />
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {delPlan.map((m) => (
                <li key={m.id}>
                  <Link
                    to={rutas.materia(m.id)}
                    className="flex items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
                  >
                    <span>
                      <span className="block text-body-lg font-bold text-on-surface">{m.nombre}</span>
                      <span className="block text-body-sm text-on-surface-variant">
                        Bloque {m.bloque} · {describirBloque(m.bloque)}
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">
                      chevron_right
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
