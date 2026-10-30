import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { describirAvance } from '../../../domain/rules/semanas';
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
            Cada semestre se abre un grupo por materia: maestro, fecha de inicio y alumnos inscritos.
          </p>
        </div>
        {isPending && <Cargando />}
        {error && <MensajeError error={error} alReintentar={() => void refetch()} />}
        {grupos?.length === 0 && <p className="text-body-sm text-on-surface-variant">Aún no hay grupos.</p>}
        {grupos?.map((g) => {
          const expandido = abierto === g.id;
          return (
            <article key={g.id} aria-label={`${g.materia.nombre}, grupo ${g.nombre}`} className={`${estilos.tarjeta} space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-title-md font-headline-lg text-on-surface">{g.materia.nombre}</h3>
                  <p className="text-body-sm text-outline">
                    {[`Grupo ${g.nombre}`, g.periodo, g.aula && `Aula ${g.aula}`, g.maestro.nombre && `Maestro: ${g.maestro.nombre}`]
                      .filter(Boolean)
                      .join(' | ')}
                  </p>
                  <p className="text-[12px] text-on-surface-variant mt-1">
                    Inicia {formatearFecha(g.fechaInicio)} · {describirAvance(g.semanaActual, g.materia.totalSemanas)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
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
                    titulo={`¿Eliminar el grupo ${g.nombre} de ${g.materia.nombre}?`}
                    alEliminar={() => eliminarGrupo.ejecutar(g.id)}
                    alEliminado={() => void queryClient.invalidateQueries({ queryKey: claves.grupos })}
                  >
                    <p>Se borrarán las inscripciones de los alumnos y todas las calificaciones de este grupo.</p>
                    <p>La materia, su contenido semanal y sus exámenes no se borran: podrás usarlos en otro grupo.</p>
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
