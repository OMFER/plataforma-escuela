import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MateriaConMaestro } from '../../domain/entities/Materia';
import { nombreDePlan, type PlanDetallado } from '../../domain/entities/Plan';
import { agruparPorBloque, describirBloque } from '../../domain/rules/semanas';
import { FormularioMateria } from '../components/admin/FormularioMateria';
import { AccionConfirmada } from '../components/common/AccionConfirmada';
import { AccionEliminar } from '../components/common/AccionEliminar';
import { Cargando } from '../components/common/Cargando';
import { EstadoVacio } from '../components/common/EstadoVacio';
import { MensajeError } from '../components/common/MensajeError';
import { estilos } from '../components/common/estilos';
import { BitacoraPlan } from '../components/planes/BitacoraPlan';
import { EtiquetaEstadoPlan } from '../components/planes/EtiquetaEstadoPlan';
import { claves, usePlan, useRevisionPlan } from '../hooks/consultas';
import { useCasosDeUso } from '../providers/DependenciasContext';
import { rutas } from '../routes/rutas';
import { formatearFecha } from '../utils/fechas';

const TarjetaMateria = ({ plan, materia }: { plan: PlanDetallado; materia: MateriaConMaestro }) => {
  const { eliminarMateria } = useCasosDeUso();
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(false);
  const enBorrador = plan.estado === 'borrador';

  return (
    <article aria-label={materia.nombre} className={`${estilos.tarjeta} space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h4 className="text-title-md font-headline-lg text-on-surface">{materia.nombre}</h4>
          {materia.descripcion && <p className="text-body-sm text-on-surface-variant">{materia.descripcion}</p>}
          <p className="text-[12px] text-outline mt-1">
            {materia.maestro?.nombre ? `Maestro: ${materia.maestro.nombre}` : 'Sin maestro asignado'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={rutas.materia(materia.id)} className={estilos.botonSecundario}>
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            Contenido y exámenes
          </Link>
          <button
            type="button"
            className={estilos.botonSecundario}
            aria-expanded={editando}
            onClick={() => setEditando(!editando)}
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Editar
          </button>
          {enBorrador && (
            <AccionEliminar
              etiqueta="Quitar"
              titulo={`¿Quitar la materia «${materia.nombre}» del plan?`}
              alEliminar={() => eliminarMateria.ejecutar(materia.id)}
              alEliminado={() => void queryClient.invalidateQueries({ queryKey: claves.datosPlan(plan.id) })}
            >
              <p>Se borrará la materia junto con el contenido de sus semanas y sus exámenes.</p>
            </AccionEliminar>
          )}
        </div>
      </div>
      {editando && (
        <FormularioMateria planId={plan.id} materia={materia} bloqueFijo={!enBorrador} alTerminar={() => setEditando(false)} />
      )}
    </article>
  );
};

/** Lo que le falta al plan para publicarse; si está completo, el botón para publicarlo. */
const Publicacion = ({ plan }: { plan: PlanDetallado }) => {
  const { publicarPlan } = useCasosDeUso();
  const queryClient = useQueryClient();
  const revision = useRevisionPlan(plan.id);

  return (
    <section aria-labelledby="titulo-publicacion" className={`${estilos.tarjeta} space-y-4`}>
      <h3 id="titulo-publicacion" className="text-title-md font-headline-lg text-on-surface">
        Publicación
      </h3>
      {revision.isPending && <Cargando texto="Revisando el plan…" />}
      {revision.error && <MensajeError error={revision.error} alReintentar={() => void revision.refetch()} />}
      {revision.data && !revision.data.listo && (
        <div className="space-y-2">
          <p className="text-body-sm text-on-surface-variant">Para publicarlo, falta:</p>
          <ul className="list-disc pl-5 space-y-1 text-body-sm text-on-surface" aria-label="Pendientes">
            {revision.data.pendientes.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {revision.data?.listo && (
        <p className="text-body-sm text-primary font-bold">El plan está completo y listo para publicarse.</p>
      )}
      <AccionConfirmada
        etiqueta="Publicar plan"
        icono="publish"
        principal
        deshabilitado={!revision.data?.listo}
        titulo={`¿Publicar ${nombreDePlan(plan)}?`}
        textoConfirmar="Sí, publicar"
        textoOcupado="Publicando…"
        alConfirmar={() => publicarPlan.ejecutar(plan.id)}
        alTerminar={() => void queryClient.invalidateQueries({ queryKey: claves.planes })}
      >
        <p>Ya podrás abrir grupos con este plan.</p>
        <p>
          Después solo se podrán corregir textos, ligas y la redacción de preguntas. Para agregar o quitar materias, contenido o
          exámenes tendrás que crear una nueva versión.
        </p>
      </AccionConfirmada>
    </section>
  );
};

export const PlanPage = () => {
  const { planId = '' } = useParams<{ planId: string }>();
  const plan = usePlan(planId);
  const { crearNuevaVersion, eliminarPlan } = useCasosDeUso();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [verHistorial, setVerHistorial] = useState(false);

  return (
    <main className="min-h-screen">
      <div className="max-w-[1100px] mx-auto p-gutter py-8 space-y-8">
        <Link to={rutas.admin} className="text-primary text-body-sm flex items-center gap-1 hover:underline w-fit">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
          Administración
        </Link>
        {plan.isPending && <Cargando />}
        {plan.error && <MensajeError error={plan.error} alReintentar={() => void plan.refetch()} />}
        {plan.data === null && <EstadoVacio icono="search_off" titulo="No encontramos este plan." />}

        {plan.data && (
          <>
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">{plan.data.nombre}</h1>
                  <EtiquetaEstadoPlan estado={plan.data.estado} />
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Versión {plan.data.version}
                  {plan.data.publicadoEn ? ` · Publicado el ${formatearFecha(plan.data.publicadoEn)}` : ''}
                </p>
                {plan.data.descripcion && <p className="text-body-lg text-on-surface-variant">{plan.data.descripcion}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <AccionConfirmada
                  etiqueta="Crear nueva versión"
                  icono="content_copy"
                  titulo="¿Crear una nueva versión?"
                  textoConfirmar="Sí, crear"
                  textoOcupado="Copiando…"
                  alConfirmar={() => crearNuevaVersion.ejecutar(planId)}
                  alTerminar={(nueva) => {
                    void queryClient.invalidateQueries({ queryKey: claves.planes });
                    navigate(rutas.plan(nueva.id));
                  }}
                >
                  <p>
                    Se copiarán las materias, su contenido y sus exámenes a un borrador nuevo. Los grupos que ya usan esta versión
                    no cambian; los nuevos podrán usar la nueva cuando la publiques.
                  </p>
                </AccionConfirmada>
                <AccionEliminar
                  etiqueta="Eliminar plan"
                  titulo={`¿Eliminar ${nombreDePlan(plan.data)}?`}
                  alEliminar={() => eliminarPlan.ejecutar(planId)}
                  alEliminado={() => {
                    void queryClient.invalidateQueries({ queryKey: claves.planes });
                    navigate(rutas.admin);
                  }}
                >
                  <p>Se borrarán sus materias con todo su contenido y exámenes.</p>
                  <p>Si algún grupo usa este plan, primero hay que eliminar esos grupos.</p>
                </AccionEliminar>
              </div>
            </header>

            {plan.data.estado === 'publicado' && (
              <p role="note" className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
                Este plan está publicado: se pueden corregir nombres, maestros, textos, ligas y la redacción de preguntas, pero no
                agregar ni quitar materias, contenido o exámenes. Para eso crea una nueva versión.
              </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <section className="lg:col-span-2 space-y-6" aria-labelledby="titulo-materias">
                <h2 id="titulo-materias" className="text-title-md font-headline-lg text-on-surface">
                  Materias
                </h2>
                {plan.data.materias.length === 0 && (
                  <p className="text-body-sm text-on-surface-variant">Aún no tiene materias. Agrega la primera.</p>
                )}
                {agruparPorBloque(plan.data.materias).map(({ bloque, materias }) => (
                  <div key={bloque} className="space-y-3">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                      Bloque {bloque} · {describirBloque(bloque)}
                    </h3>
                    {materias.map((m) => (
                      <TarjetaMateria key={m.id} plan={plan.data!} materia={m} />
                    ))}
                  </div>
                ))}
              </section>
              <div className="space-y-6">
                {plan.data.estado === 'borrador' && (
                  <>
                    <Publicacion plan={plan.data} />
                    <FormularioMateria planId={planId} />
                  </>
                )}
              </div>
            </div>

            <section aria-labelledby="titulo-historial" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 id="titulo-historial" className="text-title-md font-headline-lg text-on-surface">
                  Historial de cambios
                </h2>
                <button
                  type="button"
                  className={estilos.botonSecundario}
                  aria-expanded={verHistorial}
                  onClick={() => setVerHistorial(!verHistorial)}
                >
                  <span className="material-symbols-outlined text-[20px]">history</span>
                  {verHistorial ? 'Ocultar' : 'Ver historial'}
                </button>
              </div>
              {verHistorial && <BitacoraPlan planId={planId} />}
            </section>
          </>
        )}
      </div>
    </main>
  );
};
