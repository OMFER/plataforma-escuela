import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nombreDePlan } from '../../../domain/entities/Plan';
import { describirAvance } from '../../../domain/rules/semanas';
import { rutas } from '../../routes/rutas';
import { claves, useGrupos } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { formatearFecha } from '../../utils/fechas';
import { AccionEliminar } from '../common/AccionEliminar';
import { Cargando } from '../common/Cargando';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { FormularioGrupo } from './FormularioGrupo';
import { GestionAlumnos } from './GestionAlumnos';

export const PanelGrupos = () => {
  const { eliminarGrupo } = useCasosDeUso();
  const queryClient = useQueryClient();
  const { data: grupos, isPending, error, refetch } = useGrupos();
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <section className="lg:col-span-2 space-y-4" aria-labelledby="titulo-grupos">
        <div className="space-y-1">
          <h2 id="titulo-grupos" className="text-title-md font-headline-lg text-on-surface">
            Grupos
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Cada grupo es una generación que cursa una versión publicada del plan desde su fecha de inicio. Pueden coexistir
            varios grupos, cada uno con sus alumnos y sus fechas.
          </p>
        </div>
        {isPending && <Cargando />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {grupos?.length === 0 && <p className="text-body-sm text-on-surface-variant">Aún no hay grupos.</p>}
        {grupos?.map((g) => {
          const expandido = abierto === g.id;
          return (
            <article key={g.id} aria-label={`Grupo ${g.nombre}`} className={`${estilos.tarjeta} space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-title-md font-headline-lg text-on-surface">{g.nombre}</h3>
                  <p className="text-body-sm text-outline">{nombreDePlan(g.plan)}</p>
                  <p className="text-[12px] text-on-surface-variant mt-1">
                    Inicia {formatearFecha(g.fechaInicio)} · {describirAvance(g.semanaActual, g.semanas.length)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={rutas.calificaciones(g.id)} className={estilos.botonSecundario}>
                    <span className="material-symbols-outlined text-[20px]">grading</span>
                    Calificaciones
                  </Link>
                  <button
                    type="button"
                    className={estilos.botonSecundario}
                    aria-expanded={expandido}
                    onClick={() => setAbierto(expandido ? null : g.id)}
                  >
                    <span className="material-symbols-outlined text-[20px]">group</span>
                    {expandido ? 'Ocultar alumnos' : 'Alumnos'}
                  </button>
                  <AccionEliminar
                    etiqueta="Eliminar"
                    titulo={`¿Eliminar el grupo ${g.nombre}?`}
                    alEliminar={() => eliminarGrupo.ejecutar(g.id)}
                    alEliminado={() => void queryClient.invalidateQueries({ queryKey: claves.grupos })}
                  >
                    <p>Se borrarán las inscripciones de los alumnos y todas las calificaciones de este grupo.</p>
                    <p>El plan de estudios, su contenido y sus exámenes no se borran: los usan los demás grupos.</p>
                  </AccionEliminar>
                </div>
              </div>
              {expandido && <GestionAlumnos grupoId={g.id} />}
            </article>
          );
        })}
      </section>
      <FormularioGrupo />
    </div>
  );
};
